import pandas as pd
import numpy as np
import psycopg2
import hashlib
from collections import Counter, defaultdict
import random

# === Database connection ===
conn = psycopg2.connect(
    dbname="nba_predictor",
    user="postgres",
    password="021306",
    host="localhost",
    port="5432"
)

# === Load playoff seeds from database (2025) ===
query = """
    SELECT "Tm" AS tm, "Team" AS team, "Conf" AS conference, "Rk" AS rank, "NRtg" AS nrtg
    FROM projected_team_stats
    WHERE "Year" = 2025
"""
predicted_seeds = pd.read_sql(query, conn)

# === Load historical playoff data from CSV ===
playoff_history_file = "../../playoff_series_stats_with_conf.csv"
playoff_history = pd.read_csv(playoff_history_file)

# === Output files ===
bracket_output_file = "../../frontend/public/nba_playoff_results2.csv"
odds_output_file = "../../frontend/public/title_odds.csv"

# === Historical adjustment based on net rating in past playoffs ===
def compute_historical_adjustments(playoff_history):
    adjustments = {}
    teams = set(playoff_history["Winner"].unique()).union(set(playoff_history["Loser"].unique()))
    for team in teams:
        ratings = []
        ratings += list(playoff_history[playoff_history["Winner"] == team]["Team_1_NRtg"])
        ratings += list(playoff_history[playoff_history["Loser"] == team]["Team_2_NRtg"])
        adjustments[team] = np.mean(ratings) if ratings else 0

    # === Boost the reigning champion (Boston Celtics) ===
    if "Boston Celtics" in adjustments:
        adjustments["Boston Celtics"] += 2.5

    return adjustments

historical_adjustments = compute_historical_adjustments(playoff_history)

def get_team_adjustment(team, hist_adjustments):
    return hist_adjustments.get(team["team"], 0)

def simulate_series(team1, team2, hist_adjustments, fatigue_boost=0):
    hist_diff = get_team_adjustment(team1, hist_adjustments) - get_team_adjustment(team2, hist_adjustments)
    rating_diff = team1["nrtg"] - team2["nrtg"]
    rating_diff = max(-6, min(6, rating_diff))

    t1_mean = 110 + 0.45 * rating_diff + 0.25 * hist_diff - fatigue_boost
    t2_mean = 110 - 0.45 * rating_diff - 0.25 * hist_diff

    wins_team1, wins_team2 = 0, 0
    game_scores = []

    for _ in range(7):
        pts1 = int(np.random.normal(t1_mean, 9))
        pts2 = int(np.random.normal(t2_mean, 9))
        pts1, pts2 = max(80, min(pts1, 150)), max(80, min(pts2, 150))

        while pts1 == pts2:
            pts2 = max(80, min(int(np.random.normal(t2_mean, 9)), 150))

        if pts1 > pts2:
            wins_team1 += 1
        else:
            wins_team2 += 1

        game_scores.append((pts1, pts2))

        if wins_team1 == 4 or wins_team2 == 4:
            break

    winner, loser = (team1, team2) if wins_team1 > wins_team2 else (team2, team1)
    return winner, loser, len(game_scores), game_scores

def play_round(matchups, round_name, hist_adjustments, results, round_index):
    winners = []
    for team1, team2 in matchups:
        # Apply fatigue penalty starting in round 2 for Cinderella teams (seed > 5)
        fatigue_boost = 0
        if round_index >= 2:
            fatigue_boost += 1.0 if team1["rank"] > 5 else 0
            fatigue_boost += 1.0 if team2["rank"] > 5 else 0
        fatigue_boost = fatigue_boost / 2  # average

        winner, loser, games_played, game_scores = simulate_series(team1, team2, hist_adjustments, fatigue_boost)
        game_scores += [(np.nan, np.nan)] * (7 - games_played)
        flat_scores = [pt for pair in game_scores for pt in pair]

        results.append([
            round_name,
            team1["tm"], team1["team"], team1["rank"],
            team2["tm"], team2["team"], team2["rank"],
            winner["tm"], winner["team"], winner["rank"],
            loser["tm"], loser["team"], loser["rank"],
            games_played,
            *flat_scores
        ])
        winners.append(winner)
    return winners

def simulate_playoffs(predicted_seeds, hist_adjustments):
    east = predicted_seeds[predicted_seeds["conference"] == "E"].copy().sort_values("rank")
    west = predicted_seeds[predicted_seeds["conference"] == "W"].copy().sort_values("rank")

    results = []
    e_r1 = [(east.iloc[0], east.iloc[7]), (east.iloc[3], east.iloc[4]),
            (east.iloc[2], east.iloc[5]), (east.iloc[1], east.iloc[6])]
    w_r1 = [(west.iloc[0], west.iloc[7]), (west.iloc[3], west.iloc[4]),
            (west.iloc[2], west.iloc[5]), (west.iloc[1], west.iloc[6])]

    e_w1 = play_round(e_r1, "e-round-1", historical_adjustments, results, 1)
    w_w1 = play_round(w_r1, "w-round-1", historical_adjustments, results, 1)

    e_w2 = play_round([(e_w1[0], e_w1[1]), (e_w1[2], e_w1[3])], "e-round-2", historical_adjustments, results, 2)
    w_w2 = play_round([(w_w1[0], w_w1[1]), (w_w1[2], w_w1[3])], "w-round-2", historical_adjustments, results, 2)

    e_final = play_round([(e_w2[0], e_w2[1])], "e-round-3", historical_adjustments, results, 3)
    w_final = play_round([(w_w2[0], w_w2[1])], "w-round-3", historical_adjustments, results, 3)

    final_winner, final_loser, games_played, game_scores = simulate_series(w_final[0], e_final[0], historical_adjustments)
    game_scores += [(np.nan, np.nan)] * (7 - games_played)
    flat_finals = [pt for pair in game_scores for pt in pair]

    results.append([
        "nba-finals",
        w_final[0]["tm"], w_final[0]["team"], w_final[0]["rank"],
        e_final[0]["tm"], e_final[0]["team"], e_final[0]["rank"],
        final_winner["tm"], final_winner["team"], final_winner["rank"],
        final_loser["tm"], final_loser["team"], final_loser["rank"],
        games_played,
        *flat_finals
    ])

    return results, final_winner["tm"]

# === Simulate playoff brackets and compute odds ===
num_simulations = 10000
bracket_pool = []
championship_counter = Counter()

for _ in range(num_simulations):
    sim_results, winner_tm = simulate_playoffs(predicted_seeds, historical_adjustments)
    championship_counter[winner_tm] += 1
    bracket_pool.append((winner_tm, sim_results))

# === Choose a random bracket from top winning teams ===
top_winners = [tm for tm, count in championship_counter.items() if count / num_simulations >= 0.05]
eligible_brackets = [bracket for bracket in bracket_pool if bracket[0] in top_winners]
final_results = random.choice(eligible_brackets)[1]

# === Save bracket output ===
columns = [
    "Round",
    "Team 1 tm", "Team 1 Name", "Team 1 Rank",
    "Team 2 tm", "Team 2 Name", "Team 2 Rank",
    "Winner tm", "Winner Name", "Winner Rank",
    "Loser tm", "Loser Name", "Loser Rank",
    "Games Played",
    "Game 1 Team 1 Pts", "Game 1 Team 2 Pts",
    "Game 2 Team 1 Pts", "Game 2 Team 2 Pts",
    "Game 3 Team 1 Pts", "Game 3 Team 2 Pts",
    "Game 4 Team 1 Pts", "Game 4 Team 2 Pts",
    "Game 5 Team 1 Pts", "Game 5 Team 2 Pts",
    "Game 6 Team 1 Pts", "Game 6 Team 2 Pts",
    "Game 7 Team 1 Pts", "Game 7 Team 2 Pts"
]

pd.DataFrame(final_results, columns=columns).to_csv(bracket_output_file, index=False)

# === Save odds output ===
odds_df = pd.DataFrame([
    {"tm": tm, "win_odds": round(count / num_simulations, 4)}
    for tm, count in championship_counter.items()
]).sort_values(by="win_odds", ascending=False)

odds_df.to_csv(odds_output_file, index=False)
print(f"✅ Bracket + odds generated from {num_simulations} simulations.")
