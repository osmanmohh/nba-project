import pandas as pd
import numpy as np
import requests
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.preprocessing import StandardScaler

# ------------------------------------------------------------------
# 1) LOAD MIP HISTORY & PLAYER STATS
# ------------------------------------------------------------------
mip_votes = pd.read_csv("mips_cleaned.csv")
mip_votes["Player"] = mip_votes["Player"].str.strip()

print("📅 Loading historical player stats...")
all_stats = []
for year in range(2001, 2025):
    res = requests.get(
        "http://localhost:5173/api/player/stats/all", 
        params={"year": year,"stat_type":"Per Game"}
    )
    if res.status_code == 200:
        all_stats.extend(res.json())

df = pd.DataFrame(all_stats)
df = df[df["Stat_Type"]=="Per Game"]
df = df[["Name","playerID","Year","Tm","G","GS","MP","PTS","REB","AST","FG%","FGA"]].dropna()
df["got_vote"] = df["Name"].isin(mip_votes["Player"]).astype(int)

print("🏀 Fetching team stats...")
team_stats = []
for year in range(2000, 2026):
    for team in df["Tm"].unique():
        res = requests.get(f"http://localhost:5173/api/team/{team}", params={"year": year})
        if res.status_code == 200:
            team_data = res.json()
            if isinstance(team_data, list):
                team_data = team_data[0]
            team_stats.append({
                "Year": year,
                "Tm": team,
                "W": team_data.get("W", 0),
                "L": team_data.get("L", 0),
                "NRtg": team_data.get("NRtg", 0)
            })

team_df = pd.DataFrame(team_stats)

# ------------------------------------------------------------------
# 2) BUILD TRAINING DATA (Year N -> N+1) UNTIL 2024
# ------------------------------------------------------------------
df_next = df.copy()
df_next["Year"] += 1
merged = pd.merge(df_next, df, on="playerID", suffixes=("_curr","_prev"))
merged = merged[merged["Year_curr"] <= 2024]

team_df_curr = team_df.rename(columns={
    "Year":"Year_curr","Tm":"Tm_curr",
    "W":"W_curr","L":"L_curr","NRtg":"NRtg_curr"
})
team_df_prev = team_df.rename(columns={
    "Year":"Year_prev","Tm":"Tm_prev",
    "W":"W_prev","L":"L_prev","NRtg":"NRtg_prev"
})
merged = pd.merge(merged, team_df_curr, on=["Year_curr","Tm_curr"], how="left")
merged = pd.merge(merged, team_df_prev, on=["Year_prev","Tm_prev"], how="left")

# Keep rows with relevant data
merged = merged.dropna(subset=["G_curr","G_prev","PTS_curr","PTS_prev"])

# ------------------------------------------------------------------
# 3) FEATURE ENGINEERING
# ------------------------------------------------------------------
stats = ["PTS","REB","AST","MP","FG%","FGA","GS"]
for stat in stats:
    merged[f"{stat}_diff"] = merged[f"{stat}_curr"] - merged[f"{stat}_prev"]
    merged[f"{stat}_pct"] = np.where(
        merged[f"{stat}_prev"] != 0,
        merged[f"{stat}_diff"] / merged[f"{stat}_prev"],
        0
    )

# Give some extra weight to scoring
merged["PTS_pct"] *= 5

# Additional usage/time features
merged["starter_jump"] = (merged["GS_curr"]/merged["G_curr"]) - (merged["GS_prev"]/merged["G_prev"])
merged["mpg_diff"] = merged["MP_curr"] - merged["MP_prev"]

# Choose final features
feature_cols = [f"{stat}_pct" for stat in stats] + ["starter_jump","mpg_diff"]
X = merged[feature_cols].fillna(0)
y = merged["got_vote_curr"]

# Train/test split & scale
X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, random_state=42)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

# Fit a random forest
model = RandomForestClassifier(n_estimators=200, class_weight="balanced", random_state=42)
model.fit(X_train_scaled, y_train)

print("\n📊 Classification Report on Test Data:")
print(classification_report(y_test, model.predict(X_test_scaled)))

# ------------------------------------------------------------------
# 4) PREDICT FOR 2025
# ------------------------------------------------------------------
print("\n🔮 Fetching 2025 stats from API...")
res_2025 = requests.get(
    "http://localhost:5173/api/player/stats/all",
    params={"year":2025,"stat_type":"Per Game"}
)
df_2025 = pd.DataFrame(res_2025.json())
df_2025 = df_2025[["Name","playerID","Year","Tm","G","GS","MP","PTS","REB","AST","FG%","FGA"]].dropna()
df_2025 = df_2025.drop_duplicates(subset="playerID")

# Merge with 2024 data
df_2024 = df[df["Year"]==2024][["playerID","PTS","REB","AST","MP","FG%","FGA","GS","G"]]
merged_2025 = pd.merge(df_2025, df_2024, on="playerID", suffixes=("", "_prev"))

# Team data for completeness
team_df_25 = team_df[team_df["Year"]==2025].rename(columns={
    "W":"W_curr","L":"L_curr","NRtg":"NRtg_curr","Tm":"Tm"
})
team_df_24 = team_df[team_df["Year"]==2024].rename(columns={
    "W":"W_prev","L":"L_prev","NRtg":"NRtg_prev","Tm":"Tm"
})
merged_2025 = pd.merge(merged_2025, team_df_25, on="Tm", how="left")
merged_2025 = pd.merge(merged_2025, team_df_24, on="Tm", how="left")

# Compute diffs/pcts
for stat in stats:
    merged_2025[f"{stat}_diff"] = merged_2025[stat] - merged_2025[f"{stat}_prev"]
    merged_2025[f"{stat}_pct"] = np.where(
        merged_2025[f"{stat}_prev"] != 0,
        merged_2025[f"{stat}_diff"] / merged_2025[f"{stat}_prev"],
        0
    )
merged_2025["PTS_pct"] *= 5

merged_2025["starter_jump"] = (merged_2025["GS"]/merged_2025["G"]) - (merged_2025["GS_prev"]/merged_2025["G_prev"])
merged_2025["mpg_diff"] = merged_2025["MP"] - merged_2025["MP_prev"]

X_2025 = merged_2025[feature_cols].fillna(0)
X_2025_scaled = scaler.transform(X_2025)
merged_2025["mip_score"] = model.predict_proba(X_2025_scaled)[:,1]

# ------------------------------------------------------------------
# 5) EXPERIENCE + SIMPLE SCORE TWEAK
# ------------------------------------------------------------------
exp_df = df[df["Year"]<2025].groupby("playerID")["Year"].nunique().reset_index()
exp_df.columns = ["playerID","Experience"]
merged_2025 = pd.merge(merged_2025, exp_df, on="playerID", how="left")
merged_2025["Experience"] = merged_2025["Experience"].fillna(0).astype(int)

# a) Slight penalty if PTS_prev >= 25 => "already star"
merged_2025["already_star_penalty"] = np.where(
    merged_2025["PTS_prev"] >= 25,
    0.1,  # subtract 0.1
    0
)

# b) Slight penalty if rookie->soph
merged_2025["rookie_soph_penalty"] = np.where(
    merged_2025["Experience"] == 1,
    0.05,
    0
)

# c) Bonus if PTS_prev < 10 AND PTS_diff >= 5 => "low baseline big jump"
merged_2025["low_baseline_big_jump_bonus"] = np.where(
    (merged_2025["PTS_prev"] < 10) & (merged_2025["PTS_diff"] >= 5),
    0.15,
    0
)

# d) Bonus if (2 <= Experience <= 4) AND PTS_diff >= 3 => "young breakout"
merged_2025["young_breakout_bonus"] = np.where(
    (merged_2025["Experience"] >= 2) & (merged_2025["Experience"] <= 4)
    & (merged_2025["PTS_diff"] >= 3),
    0.1,
    0
)

# === NEW: Extra push for "super low baseline" < 6 PPG
# This is broad enough to help ANY sub-6 PPG player from last year who made a leap.
merged_2025["super_low_baseline_bonus"] = np.where(
    merged_2025["PTS_prev"] < 6,
    0.12,
    0
)

# Combine into final "adjusted_mip_score"
merged_2025["adjusted_mip_score"] = (
    merged_2025["mip_score"]
    + merged_2025["low_baseline_big_jump_bonus"]
    + merged_2025["young_breakout_bonus"]
    + merged_2025["super_low_baseline_bonus"]
    - merged_2025["rookie_soph_penalty"]
    - merged_2025["already_star_penalty"]
)

# ------------------------------------------------------------------
# 6) SORT + ELIGIBILITY
# ------------------------------------------------------------------
team_games_2025 = df_2025.groupby("Tm")["G"].max().reset_index()
team_games_2025.columns = ["Tm","team_games_played"]
merged_2025 = pd.merge(merged_2025, team_games_2025, on="Tm", how="left")

merged_2025["games_left"] = 82 - merged_2025["team_games_played"]
merged_2025["max_possible_player_games"] = merged_2025["G"] + merged_2025["games_left"]
merged_2025["can_reach_65"] = merged_2025["max_possible_player_games"] >= 65

merged_2025["Eligible"] = (
    (merged_2025["Experience"] < 6)
    & (merged_2025["can_reach_65"])
)

final_eligible = merged_2025[merged_2025["Eligible"]].copy()
final_eligible = final_eligible.sort_values("adjusted_mip_score", ascending=False)

print("\n🔥 2025 Most Improved Player Predictions:")
for i, row in enumerate(final_eligible.head(10).itertuples(), start=1):
    print(f"{i}. {row.Name} | {row.Tm} | Adjusted MIP Score: {round(row.adjusted_mip_score,3)}")
    print(f"   PTS: {row.PTS_prev} → {row.PTS} | REB: {row.REB_prev} → {row.REB} | AST: {row.AST_prev} → {row.AST}")
    print(f"   Games: {row.G} | Team Games: {row.team_games_played} | Exp: {row.Experience}\n")

# ------------------------------------------------------------------
# 7) SAVE TOP 3 TO CSV (playerID, Tm)
# ------------------------------------------------------------------
top_3 = final_eligible.head(3).copy()
top_3_csv = top_3[["playerID","Tm"]]  # only these two columns
top_3_csv.to_csv("Frontend/public/top_3_mip.csv", index=False)
print("\n✅ Saved top 3 players to 'public/top_3_mip.csv' (playerID, Tm).")
