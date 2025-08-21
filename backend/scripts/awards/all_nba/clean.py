import os
import pandas as pd
from bs4 import BeautifulSoup
from io import StringIO
import requests
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
        table = soup.find("table", {"id": "leading_all_nba"})

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

combined_df = combined_df.dropna(subset=["Player"])
combined_df = combined_df.rename(columns={"Player": "Name"})
combined_df = combined_df.rename(columns={"# Tm": "Selection"})

# Normalize all entries to string
combined_df["Selection"] = combined_df["Selection"].astype(str).str.upper()

# Fix common variants
combined_df["Selection"] = combined_df["Selection"].replace({
    "1T": "1", "1ST": "1", "FIRST": "1",
    "2T": "2", "2ND": "2", "SECOND": "2",
    "3T": "3", "3RD": "3", "THIRD": "3",
    "ORV": "0", "OVR": "0", "OTHER": "0",
    "—": "0", "-": "0", "": "0", "N/A": "0"
})

# Now remove anything that's still not a digit
combined_df = combined_df[combined_df["Selection"].str.match(r"^\d$")]

# Safe to convert now
combined_df["Selection"] = combined_df["Selection"].astype(int)

safe_fill_cols = [
    "Pts Won", "Pts Max", "Share",
    "1st Tm", "2nd Tm", "3rd Tm",
    "STL", "BLK", "3P%", "FT%"
]

combined_df[safe_fill_cols] = combined_df[safe_fill_cols].fillna(0)

combined_df["Pts Won"] = pd.to_numeric(combined_df["Pts Won"], errors="coerce")  # Ensure it's numeric
combined_df = combined_df.sort_values(by=["Year", "Pts Won"], ascending=[True, False])

# Display or save
print(f"\n🎉 Combined {len(all_dfs)} years of MVP data!")
print(combined_df)

combined_df.to_csv("backend/data/all_nba_votes_combined.csv", index=False)


import os
import pandas as pd
import requests

# Environment variables for API URLs
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5173')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5001')

# === STEP 1: Load All-NBA Selection Data ===
all_nba_df = pd.read_csv("backend/data/all_nba_votes_combined.csv")  # Your cleaned All-NBA file
all_nba_df["Name"] = all_nba_df["Name"].str.strip()
all_nba_df["Year"] = all_nba_df["Year"].astype(int)


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

# === STEP 3: Merge Player Stats with All-NBA Selection Data ===
print("🔁 Merging player stats with All-NBA selections...")
merged_df = pd.merge(
    player_df,
    all_nba_df[["Name", "Year", "Selection"]],
    on=["Name", "Year"],
    how="left"
)



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
merged_df.to_csv("backend/data/all_nba_training_data.csv", index=False)
print("✅ Saved combined All-NBA training data to: backend/data/all_nba_training_data.csv")

# Optional: Preview
print("\n📊 Sample rows:")
print(merged_df[["Name", "Year", "Tm", "PTS", "AST", "REB", "Selection"]].head())
