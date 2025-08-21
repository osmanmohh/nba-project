import os
import pandas as pd
from bs4 import BeautifulSoup
from io import StringIO
import requests

# Environment variables for API URLs
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5173')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5001')
# Show all rows and columns (disable truncation)
pd.set_option("display.max_rows", None)
pd.set_option("display.max_columns", None)
pd.set_option("display.width", None)
pd.set_option("display.max_colwidth", None)

all_dfs = []
awards_dir = "backend/data/awards"

# Loop through all HTML files in the awards directory
for filename in os.listdir(awards_dir):
    if filename.endswith(".html"):
        year = int(filename.replace(".html", ""))
        filepath = os.path.join(awards_dir, filename)

        # Read and parse the HTML
        with open(filepath, "r", encoding="utf-8") as file:
            html_content = file.read()
        soup = BeautifulSoup(html_content, "html.parser")
        table = soup.find("table", {"id": "mvp"})

        if not table:
            print(f"❌ No MVP table found in {filename}")
            continue

        # Convert table to DataFrame
        try:
            df = pd.read_html(StringIO(str(table)))[0]

            # Flatten multi-index columns
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(-1)

            # Drop any duplicate header row
            if df.iloc[0]["Player"] == "Player":
                df = df.drop(0)

            # Add year column
            df["Year"] = year

            # Drop unused columns
            df = df.drop(columns=["Rank", "WS", "WS/48"], errors="ignore")

            df = df.reset_index(drop=True)




            all_dfs.append(df)
            print(f"✅ Loaded {filename}")

        except Exception as e:
            print(f"⚠️ Error reading {filename}: {e}")

# Combine everything
combined_df = pd.concat(all_dfs, ignore_index=True)
combined_df = combined_df.rename(columns={"Player": "Name"})

combined_df["Pts Won"] = pd.to_numeric(combined_df["Pts Won"], errors="coerce")  # Ensure it's numeric
combined_df = combined_df.sort_values(by=["Year", "Pts Won"], ascending=[True, False])

# Display or save
print(f"\n🎉 Combined {len(all_dfs)} years of MVP data!")
print(combined_df)

# Optional: save as CSV
combined_df.to_csv("backend/data/mvp_votes_combined.csv", index=False)


# === STEP 1: Load MVP Share Data ===
mvp_df = pd.read_csv("backend/data/mvp_votes_combined.csv")
mvp_df["Name"] = mvp_df["Name"].str.strip()
mvp_df["Year"] = mvp_df["Year"].astype(int)
mvp_df["Share"] = pd.to_numeric(mvp_df["Share"], errors="coerce")

# === STEP 2: Load Player Stats from API ===
all_stats = []

print("📥 Pulling player stats from API...")
for year in range(2001, 2025):
    res = requests.get(f"{API_BASE_URL}/api/player/stats/all", params={"year": year, "stat_type": "Per Game"})
    if res.status_code == 200:
        for player in res.json():
            player["Year"] = year
            all_stats.append(player)
    else:
        print(f"⚠️ Failed to fetch {year} stats.")

player_df = pd.DataFrame(all_stats)
player_df["Name"] = player_df["Name"].str.strip()
player_df["Year"] = player_df["Year"].astype(int)

# === STEP 3: Merge Player Stats with MVP Share Data ===
print("🔁 Merging player stats with MVP shares...")
merged_df = pd.merge(
    player_df,
    mvp_df[["Name", "Year", "Share"]],
    left_on=["Name", "Year"],
    right_on=["Name", "Year"],
    how="left"
)

merged_df["Share"] = merged_df["Share"].fillna(0)

# === STEP 4: Add Team Stats (W, L, NRtg, W/L%) ===
print("🏀 Pulling team stats...")
team_stats = []

for year in range(2001, 2025):
    teams = merged_df[merged_df["Year"] == year]["Tm"].dropna().unique()
    for team in teams:
        res = requests.get(f"{API_BASE_URL}/api/team/{team}", params={"year": year})
        if res.status_code == 200:
            team_data = res.json()
            if isinstance(team_data, list):
                team_data = team_data[0]
            team_stats.append({
                "Year": year,
                "Tm": team,
                "W": team_data.get("W"),
                "L": team_data.get("L"),
                "NRtg": team_data.get("NRtg")
            })

team_df = pd.DataFrame(team_stats)
merged_df = pd.merge(merged_df, team_df, on=["Year", "Tm"], how="left")
merged_df["W/L%"] = merged_df["W"] / (merged_df["W"] + merged_df["L"])

# === STEP 5: Save Combined Data ===
merged_df.to_csv("backend/data/mvp_training_data.csv", index=False)
print("✅ Saved combined MVP training data to: backend/data/mvp_training_data.csv")

# Optional: Preview
print("\n📊 Sample rows:")
print(merged_df[["Name", "Year", "Tm", "PTS", "AST", "REB", "Share"]].head())
