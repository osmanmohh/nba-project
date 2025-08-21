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
    # === 1. Load training data (totals-based) ===
    df = pd.read_csv("backend/data/all_defense_training_data.csv")
    train_df = df[(df["Year"] >= 2000) & (df["Year"] <= 2024)].dropna(subset=["Selection"])
    train_df = train_df[train_df["G"] >= 30]
    train_df["Pos"] = train_df["Pos"].str.split("-").str[0]

    # === 2. Fetch 2025 player totals ===
    print("\U0001F4E1 Pulling 2025 player totals from API...")
    res = requests.get(f"{API_BASE_URL}/api/player/stats/all", params={"year": 2025, "stat_type": "Totals"})
    if res.status_code != 200:
        raise Exception("❌ Failed to fetch 2025 stats.")
    test_df = pd.DataFrame(res.json())
    test_df = test_df.drop_duplicates(subset=["playerID"])
    test_df["Year"] = 2025
    test_df["Name"] = test_df["Name"].str.strip()

    # === 3. Pull team stats ===
    print("\U0001F4E1 Pulling 2025 team stats...")
    team_stats = []
    for team in test_df["Tm"].dropna().unique():
        res = requests.get(f"{API_BASE_URL}/api/team/{team}", params={"year": 2025})
        if res.status_code == 200:
            team_data = res.json()[0] if isinstance(res.json(), list) else res.json()
            team_stats.append({
                "Tm": team,
                "W/L%": team_data.get("W/L%"),
                "NRtg": team_data.get("NRtg"),
                "DRtg": team_data.get("DRtg")
            })
    test_df = test_df.merge(pd.DataFrame(team_stats), on="Tm", how="left")

    # === 4. Define features and labels ===
    feature_cols = [
        "Pos", "Age", "Tm", "G", "MP", "STL", "BLK", "DRB", "REB", "TOV", "PF",
        "W/L%", "NRtg", "DRtg"
    ]
    feature_cols = [col for col in feature_cols if col in train_df.columns and col in test_df.columns]
    X_train = train_df[feature_cols].fillna(0)
    y_train = (train_df["Selection"] > 0).astype(int)
    X_test = test_df[feature_cols].fillna(0)

    # === 5. Preprocessing pipeline ===
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

    # === 6. Train model and predict ===
    model.fit(X_train, y_train)
    probs = model.predict_proba(X_test)
    test_df["AllDefense_Score"] = probs[:, 1:].sum(axis=1)

    # === 7. Add stat-based bonuses ===
    test_df["DefenseStatBonus"] = (
        test_df["STL"] * 0.015 +
        test_df["BLK"] * 0.015 +
        test_df["DRB"] * 0.001 +
        test_df["MP"] * 0.0001 +
        (115 - test_df["DRtg"]) * 0.02 +
        test_df["W/L%"] * 0.25
    )

    # === Defensive liability penalty (e.g. players like Jokic)
    test_df["LiabilityPenalty"] = (
        (test_df["DRtg"] - 110).clip(lower=0) * 0.008 +
        (test_df["TOV"] / (test_df["MP"] + 1)) * 5 +
        ((test_df["STL"] + test_df["BLK"]) < 100).astype(float) * 0.2
    )

    # === All-Defense Alumni Boost ===
    past_defenders = df[df["Selection"] > 0]["Name"].value_counts()
    test_df["AlumniBoost"] = test_df["Name"].map(past_defenders).fillna(0)
    test_df["AlumniBoost"] = (test_df["AlumniBoost"] > 0).astype(int) * 0.2

    test_df["AllDefense_Score"] += (test_df["DefenseStatBonus"] - test_df["LiabilityPenalty"] + test_df["AlumniBoost"])

    # === 8. Sort and display top 50 ===
    eligible_df = test_df[test_df["G"] >= 50].copy()
    eligible_df = eligible_df.sort_values("AllDefense_Score", ascending=False)
    top_50 = eligible_df.head(50)

    # === 9. Assign All-Defense Teams (2 guards, 3 forwards) ===
    guards = top_50[top_50["Pos"].isin(["PG", "SG"])]
    forwards = top_50[top_50["Pos"].isin(["SF", "PF", "C"])]
    first_team = pd.concat([guards.head(2), forwards.head(3)])
    second_team = pd.concat([guards.iloc[2:4], forwards.iloc[3:6]])

    # === 10. Save final All-Defense team output ===
    final_output = pd.concat([first_team, second_team])
    final_output["Selection"] = [1] * 5 + [2] * 5
    final_output[["playerID", "Tm", "Selection"]].to_csv("Frontend/public/all_defense_predictions.csv", index=False)
    print("\n✅ Saved All-Defense First and Second Teams to 'Frontend/public/all_defense_predictions.csv'")

if __name__ == "__main__":
    main()
