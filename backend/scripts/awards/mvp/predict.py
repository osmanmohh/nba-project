import pandas as pd
import requests
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler

# Environment variables for API URLs
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5173')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5001')

# === 1. Load training data and retrain model ===
df = pd.read_csv("../../../data/mvp_training_data.csv")

features = [
    "Age", "G", "MP", "PTS", "AST", "REB", 
    "eFG%", "FT%", "TOV"
]
target = "Share"

df = df.dropna(subset=features + [target])
X = df[features]
y = df[target]

scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

model = RandomForestRegressor(n_estimators=100, random_state=None)
model.fit(X_scaled, y)

# === 2. Fetch 2025 player stats from API ===
print("📡 Fetching 2025 player stats...")
res = requests.get(f"{API_BASE_URL}/api/player/stats/all", params={"year": 2025, "stat_type": "Per Game"})
if res.status_code != 200:
    raise RuntimeError("❌ Failed to fetch 2025 data from API.")

df_2025 = pd.DataFrame(res.json())
df_2025 = df_2025[[
    "Name", "playerID", "Tm", "Age", "G", "MP", "PTS", "AST", "REB", "BLK",
    "eFG%", "FT%", "TOV"
]].dropna()

# === 3. Merge team stats ===
print("🏀 Fetching 2025 team stats...")
team_stats = []
teams = df_2025["Tm"].unique()

for team in teams:
    res = requests.get(f"{API_BASE_URL}/api/team/{team}", params={"year": 2025})
    if res.status_code == 200:
        team_data = res.json()
        if isinstance(team_data, list) and len(team_data) > 0:
            team_data = team_data[0]
    team_stats.append({
        "Tm": team,
        "W/L%": team_data.get("W/L%", 0),
        "NRtg": team_data.get("NRtg", 0)
    })


team_df = pd.DataFrame(team_stats)
df_2025 = pd.merge(df_2025, team_df, on="Tm", how="left")

# === 4. Predict MVP Share ===
X_2025 = df_2025[features].fillna(0)
X_2025_scaled = scaler.transform(X_2025)
df_2025["predicted_share"] = model.predict(X_2025_scaled)

# === 5. Filter minimums ===
df_2025 = df_2025[
    (df_2025["G"] >= 50) &
    (df_2025["MP"] >= 30) &
    (df_2025["PTS"] >= 18)
]

# === 6. Scoring Adjustments ===

# === 6. Scoring Adjustments ===

# Normalized MVP bonus
historical_shares = df[df["Year"] < 2025].groupby("Name")["Share"].sum()
max_share = historical_shares.max()
df_2025["mvp_bonus"] = df_2025["Name"].map(historical_shares).fillna(0) / max_share * 0.1


df_2025["stat_bonus"] = (
    df_2025["AST"] * 0.025 +     # increased from 0.02
    df_2025["REB"] * 0.01 +
    df_2025["PTS"] * 0.004 +     # increased from 0.003 (boost scoring)

    df_2025["eFG%"] * 0.225 +
    df_2025["FT%"] * 0.085 +
    df_2025["MP"] * 0.005 +
    df_2025["TOV"] * -0.0018 +
    df_2025["W/L%"] * 0.035 +    # increased from 0.025 (boost wins more than scoring)
    df_2025["NRtg"] * 0.01       # increased from 0.007
)







# Remove team_boost entirely
df_2025["adjusted_share"] = (
    df_2025["predicted_share"]
    + df_2025["mvp_bonus"]
    + df_2025["stat_bonus"]
)

# === 7. Show top 5 ===
df_2025 = df_2025.sort_values("adjusted_share", ascending=False)
top_5 = df_2025.head(5).copy()
top_3 = df_2025.head(3).copy()

print("\n🔥 Top 5 MVP Predictions for 2025:")
for i, row in enumerate(top_5.itertuples(), start=1):
    print(f"{i}. {row.Name} | {row.Tm} | Adjusted Share: {round(row.adjusted_share, 3)} | Predicted Share: {round(row.predicted_share, 3)}")

# === 8. Save for frontend
top_3_out = top_3[["playerID", "Tm"]]
top_3_out.to_csv("../../../../frontend/public/top_3_mvp.csv", index=False)
print("\n✅ Saved top 3 MVPs to 'Frontend/public/top_3_mvp.csv'")


