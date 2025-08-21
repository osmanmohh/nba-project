import pandas as pd
import numpy as np
import requests
import os

from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from tabulate import tabulate

# Environment variables for API URLs
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5173')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5001')

def main():
    df = pd.read_csv("backend/data/all_nba_training_data.csv")
    train_df = df[(df["Year"] >= 2000) & (df["Year"] <= 2024)].dropna(subset=["Selection"])

    print("📡 Pulling 2025 player stats from API...")
    res = requests.get(f"{API_BASE_URL}/api/player/stats/all", params={"year": 2025, "stat_type": "Per Game"})
    if res.status_code != 200:
        raise Exception("❌ Failed to fetch 2025 stats.")
    test_df = pd.DataFrame(res.json())
    test_df["Year"] = 2025
    test_df["Name"] = test_df["Name"].str.strip()

    def weighted_box_stats(group):
        result = {}
        total_games = group["G"].sum()
        unique_games = group["G"].unique().sum()

        for col in group.columns:
            if np.issubdtype(group[col].dtype, np.number):
                if col == "G":
                    result[col] = unique_games
                else:
                    result[col] = np.average(group[col], weights=group["G"]) if group["G"].sum() > 0 else np.nan

        result["playerID"] = group["playerID"].iloc[0]
        return pd.Series(result)

    stats_by_player = test_df.groupby("playerID").apply(weighted_box_stats).reset_index(drop=True)
    latest_info = test_df.drop_duplicates("playerID", keep="last")[["playerID", "Name", "Tm", "Pos"]]
    test_df = stats_by_player.merge(latest_info, on="playerID")
    
    print("📡 Pulling 2025 team stats...")
    team_stats = []
    for team in test_df["Tm"].dropna().unique():
        res = requests.get(f"{API_BASE_URL}/api/team/{team}", params={"year": 2025})
        if res.status_code == 200:
            team_data = res.json()[0] if isinstance(res.json(), list) else res.json()
            team_stats.append({
                "Tm": team,
                "W/L%": team_data.get("W/L%"),
                "NRtg": team_data.get("NRtg")
            })

    test_df = test_df.merge(pd.DataFrame(team_stats), on="Tm", how="left")

    feature_cols = [
        "Pos", "Age", "Tm", "G", "MP", "PTS", "REB", "AST", "STL", "BLK",
        "FG%", "3P%", "FT%", "NRtg", "W/L%"
    ]
    feature_cols = [col for col in feature_cols if col in train_df.columns and col in test_df.columns]
    X_train = train_df[feature_cols].fillna(0)
    y_train = train_df["Selection"].astype(int)
    X_test = test_df[feature_cols].fillna(0)

    numeric_cols = X_train.select_dtypes(include=[np.number]).columns
    categorical_cols = list(set(feature_cols) - set(numeric_cols))

    preprocessor = ColumnTransformer(
        [("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols)],
        remainder="passthrough"
    )

    model = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced"))
    ])

    model.fit(X_train, y_train)
    probs = model.predict_proba(X_test)
    test_df["AllNBA_Score"] = probs[:, 1:].sum(axis=1)
    test_df["AllNBA_Score"] = test_df["PTS"] * 0.2

    eligible_df = test_df[test_df["G"] >= 50].copy()
    eligible_df = eligible_df.sort_values("AllNBA_Score", ascending=False)

    def assign_team(df, taken_ids):
        guards, forwards = [], []
        for _, row in df.iterrows():
            if row["playerID"] in taken_ids:
                continue
            pos = row["Pos"]
            if "G" in pos and len(guards) < 2:
                guards.append(row)
            elif "F" in pos and len(forwards) < 3:
                forwards.append(row)
            elif "C" in pos and len(forwards) < 3:
                forwards.append(row)
            if len(guards) == 2 and len(forwards) == 3:
                break
        team = guards + forwards
        return pd.DataFrame(team), [p["playerID"] for p in team]

    taken = []

    first_team_df, first_ids = assign_team(eligible_df, taken)
    first_team_df["AllNBA_Team"] = "First Team"
    taken += first_ids

    remaining_df = eligible_df[~eligible_df["playerID"].isin(taken)]
    second_team_df, second_ids = assign_team(remaining_df, taken)
    second_team_df["AllNBA_Team"] = "Second Team"
    taken += second_ids

    remaining_df = eligible_df[~eligible_df["playerID"].isin(taken)]
    third_team_df, third_ids = assign_team(remaining_df, taken)
    third_team_df["AllNBA_Team"] = "Third Team"
    taken += third_ids

    top_15 = pd.concat([first_team_df, second_team_df, third_team_df])

    top_15["AllNBA_Score"] = top_15["AllNBA_Score"].round(4)
    top_15["PTS"] = top_15["PTS"].round(1)
    top_15["AST"] = top_15["AST"].round(1)
    top_15["REB"] = top_15["REB"].round(1)

    display_cols = ["AllNBA_Team", "Name", "Tm", "Pos", "G", "PTS", "AST", "REB", "AllNBA_Score"]
    print("\\n🏆 Predicted All-NBA Teams (2025):")
    print(tabulate(top_15[display_cols], headers="keys", tablefmt="fancy_grid", showindex=False))

    top_15["Selection"] = top_15["AllNBA_Team"].map({
        "First Team": 1,
        "Second Team": 2,
        "Third Team": 3
    })

    top_15[["playerID", "Tm", "Selection"]].to_csv("Frontend/public/all_nba_predictions.csv", index=False)
    print("\\n💾 Saved top 15 All-NBA predictions with selections to Frontend/public/all_nba_predictions.csv")

if __name__ == "__main__":
    main()