import requests
import pandas as pd
import os

# Environment variables for API URLs
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5173')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5001')

BASE_URL = f"{API_BASE_URL}/api/player"
BASE_PLAYER_URL = f"{BACKEND_URL}/api/player"
BASE_TEAM_URL = f"{BACKEND_URL}/api/team"
team_games_played_cache = {}

def fetch_stats_by_year(year):
    res = requests.get(f"{BASE_URL}/stats/all", params={
        "year": year,
        "stat_type": "Per Game"
    })
    res.raise_for_status()
    return res.json()

def fetch_all_seasons(start=2000, end=2025):
    all_stats = []
    for year in range(start, end + 1):
        res = requests.get(f"{BASE_URL}/stats/all", params={
            "year": year,
            "stat_type": "Per Game"
        })
        if res.status_code == 200:
            all_stats.extend(res.json())
        else:
            print(f"Failed to fetch {year}: {res.status_code}")
    return all_stats

def get_first_years(all_stats):
    first_season = {}
    for row in all_stats:
        pid = row["playerID"]
        year = int(row["Year"])
        if pid not in first_season or year < first_season[pid]:
            first_season[pid] = year
    return first_season

def get_rookies_for_year(stats_for_year, first_season, target_year):
    seen = set()
    rookies = []
    for player in stats_for_year:
        pid = player["playerID"]
        if first_season.get(pid) == target_year and pid not in seen:
            rookies.append(player)
            seen.add(pid)
    return rookies

def get_player_game_count(player_id, year):
    res = requests.get(f"{BASE_PLAYER_URL}/{player_id}/games")
    if res.status_code == 200:
        games = res.json()
        filtered = [g for g in games if g.get("Year") == year]
        return len(filtered)
    return 0

def get_team_games_played(team_abbr, year):
    key = f"{team_abbr}-{year}"
    if key in team_games_played_cache:
        return team_games_played_cache[key]

    res = requests.get(f"{BASE_TEAM_URL}/{team_abbr}")
    if res.status_code == 200:
        team_data = res.json()
        per_game_data = [entry for entry in team_data if entry.get("StatType") == "per_game" and entry.get("Year") == year]
        if per_game_data:
            games = per_game_data[0].get("G", 82)
            team_games_played_cache[key] = games
            return games
    return 82

def calculate_game_factor(projected_games):
    if projected_games >= 45:
        return 1.0
    return projected_games / 65


def score_rookies(rookies):
    scored = []
    for r in rookies:
        try:
            pts = float(r.get("PTS", 0) or 0)
            ast = float(r.get("AST", 0) or 0)
            reb = float(r.get("TRB", 0) or 0)
            blk = float(r.get("BLK", 0) or 0)

            player_id = r.get("playerID")
            team_abbr = r.get("Tm")
            year = int(r.get("Year"))

            player_games = get_player_game_count(player_id, year)
            team_games = get_team_games_played(team_abbr, year)

            if team_games == 0:
                continue

            projected = (player_games / team_games) * 82
            game_factor = calculate_game_factor(projected)

            raw_score = (
                pts * 3.8 +
                reb * 1.6 +
                ast * 0.9 +
                blk * 2.0
            )
            adjusted_score = raw_score * game_factor

            scored.append({
                **r,
                "G": player_games,
                "roy_score_raw": round(raw_score, 2),
                "roy_score": round(adjusted_score, 2),
                "game_factor": round(game_factor, 2),
                "projected_games": round(projected, 2),
                "team_games": team_games
            })
        except:
            continue
    return scored

if __name__ == "__main__":
    target_year = 2025

    print(f"\n🔄 Fetching player stats for {target_year}...")
    stats = fetch_stats_by_year(target_year)
    all_stats = fetch_all_seasons()
    first_season = get_first_years(all_stats)
    rookies = get_rookies_for_year(stats, first_season, target_year)

    print(f"🧼 Rookies in {target_year}: {len(rookies)}")

    scored_rookies = score_rookies(rookies)
    scored_rookies.sort(key=lambda x: x["roy_score"], reverse=True)

    print("\n🏆 Rookie of the Year Predictions:")
    for i, r in enumerate(scored_rookies[:3]):
        print(
            f"{i+1}. {r['Name']} | {r['Tm']} | {r['playerID']}"
        )
        
    scored_rookies_csv = pd.DataFrame(scored_rookies[:3])
    scored_rookies_csv = scored_rookies_csv[["playerID","Tm"]]
    scored_rookies_csv.to_csv("../../../../frontend/public/top_3_roy.csv", index=False)

