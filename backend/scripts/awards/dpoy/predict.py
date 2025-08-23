import pandas as pd
import requests
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler

# Environment variables for API URLs
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5173')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5001')

# === 1. Load historical DPOY voting data ===
df = pd.read_csv("../../../../Updated_Players_with_IDs.csv")

features = [
    "Age", "G", "MP", "STL", "BLK", "TRB", "TOV",
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

# === 2. Get top 3 DPOY candidates from historic data ===
print("\U0001F4E1 Getting top 3 DPOY candidates from historic data...")
# Get top 3 DPOY candidates by Share from 2024
top_3_candidates = df[df["Year"] == 2024].nlargest(3, "Share")[["Name", "Tm"]].copy()

# === 3. Search for BBRef IDs by name in API ===
print("🔍 Searching for BBRef IDs by name...")
res = requests.get(f"{API_BASE_URL}/api/player/stats/all", params={"year": 2024, "stat_type": "Totals"})
all_players = res.json()

# Map names to BBRef IDs
name_to_bbref = {}
for player in all_players:
    name_to_bbref[player["Name"]] = player["playerID"]

# Add BBRef IDs to candidates
top_3_candidates["playerID"] = top_3_candidates["Name"].map(name_to_bbref)

print("Top 3 DPOY Predictions for 2025:")
for i, row in top_3_candidates.iterrows():
    print(f"{i+1}. {row['Name']} | {row['Tm']} | BBRef ID: {row['playerID']}")

# === 4. Save to frontend ===
top_3_candidates[["playerID", "Tm"]].to_csv("../../../../frontend/public/top_3_dpoy.csv", index=False)
print("\n✅ Saved top 3 DPOYs to 'frontend/public/top_3_dpoy.csv'")
