import pandas as pd
import requests
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler

# Environment variables for API URLs
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5173')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5001')

# === 1. Load historical DPOY voting data ===
df = pd.read_csv("backend/data/dpoy_training_data.csv")

features = [
    "Age", "G", "MP", "STL", "BLK", "REB", "TOV",
    "eFG%", "FT%", "DRtg",
]
target = "Share"

df = df.dropna(subset=features + [target])
X = df[features]
y = df[target]

scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_scaled, y)

# === 2. Fetch 2025 player stats ===
print("\U0001F4E1 Fetching 2025 player stats...")
res = requests.get(f"{API_BASE_URL}/api/player/stats/all", params={"year": 2025, "stat_type": "Totals"})
df_2025 = pd.DataFrame(res.json())
df_2025 = df_2025[[
    "Name", "playerID", "Tm", "Age", "G", "MP", "STL", "BLK", "REB",
    "TOV", "eFG%", "FT%"
]].dropna()

# === 3. Fetch team defensive stats ===
print("Fetching team defensive stats...")
team_stats = []
teams = df_2025["Tm"].unique()

for team in teams:
    res = requests.get(f"{API_BASE_URL}/api/team/{team}", params={"year": 2025})
    if res.status_code == 200:
        team_data = res.json()
        if isinstance(team_data, list):
            team_data = team_data[0]
        team_stats.append({
            "Tm": team,
            "DRtg": team_data.get("DRtg", 0),
            "NRtg": team_data.get("NRtg", 0),
            "W/L%": team_data.get("W/L%", 0)
        })

team_df = pd.DataFrame(team_stats)
df_2025 = pd.merge(df_2025, team_df, on="Tm", how="left")

# === 4. Predict DPOY Share ===
X_2025 = df_2025[features].fillna(0)
X_2025_scaled = scaler.transform(X_2025)
df_2025["predicted_share"] = model.predict(X_2025_scaled)

# === 5. Filter min games and minutes ===
df_2025 = df_2025[
    (df_2025["G"] >= 55) &
    (df_2025["MP"] >= 1300) &
    (df_2025["BLK"] >= 30)
]

# === 6. Bonus adjustments ===
historical = df[df["Year"] < 2025].groupby("Name")["Share"].sum()
df_2025["dpoy_bonus"] = df_2025["Name"].map(historical).fillna(0)
df_2025["dpoy_bonus"] = (df_2025["dpoy_bonus"] > 0).astype(int) * 0.25  # Huge boost if previously won DPOY

# === 7. Stat bonus inspired by elite defenders ===
df_2025["stat_bonus"] = (
    df_2025["STL"] * 0.01 +
    df_2025["BLK"] * 0.02 +
    df_2025["REB"] * 0.0015 +
    df_2025["MP"] * 0.0002 +
    df_2025["DRtg"] * -0.002 +
    df_2025["W/L%"] * 0.28


)

# === 8. Final DPOY Score ===
df_2025["adjusted_share"] = (
    df_2025["predicted_share"] +
    df_2025["dpoy_bonus"] +
    df_2025["stat_bonus"]
)

# === 9. Show Top 10 ===
df_2025 = df_2025.sort_values("adjusted_share", ascending=False)
top_3 = df_2025.head(3)

print(" Top 3 DPOY Predictions for 2025:")
for i, row in enumerate(top_3.itertuples(), start=1):
    print(f"{i}. {row.Name} | {row.Tm} | Adjusted Share: {round(row.adjusted_share, 3)} | Predicted: {round(row.predicted_share, 3)}")

# === 10. Save to frontend ===
top_3[["playerID", "Tm"]].to_csv("Frontend/public/top_3_dpoy.csv", index=False)
print("\n✅ Saved top 3 DPOYs to 'Frontend/public/top_3_dpoy.csv'")
