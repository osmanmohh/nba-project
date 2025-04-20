import os
import pandas as pd
from bs4 import BeautifulSoup
from ftfy import fix_text
import multiprocessing
from tqdm import tqdm

# === Config ===
output_file = "combined_stats2.csv"
players_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "players"))

# === Column headers ===
final_columns = [
    "Year", "playerID", "Age", "Tm", "Pos", "G", "GS", "MP", "FG", "FGA", "FG%",
    "3P", "3PA", "3P%", "2P", "2PA", "2P%", "eFG%", "FT", "FTA", "FT%",
    "ORB", "DRB", "REB", "AST", "STL", "BLK", "TOV", "PF", "PTS",
    "Stat_Type", "Season_Type", "Name"
]

team_mapping = {
    "NJN": "BKN", "CHH": "CHA", "NOH": "NOP", "NOK": "NOP", "SEA": "OKC",
    "VAN": "MEM", "WSB": "WAS", "CIN": "SAC", "KCO": "SAC", "KCK": "SAC",
    "SDC": "LAC", "SDR": "HOU", "NOJ": "UTA", "STL": "ATL", "MLH": "ATL",
    "TRI": "ATL", "PHI": "PHI", "SFW": "GSW", "FTW": "DET", "ROC": "SAC",
    "NYA": "NYK", "NYN": "NYK", "BRK": "BKN", "CHP": "CHI", "MNL": "LAL",
    "BUF": "LAC", "PHW": "GSW", "CAP": "WAS", "SYR": "PHI", "LAS": "LAL",
    "PRO": "BOS", "BAL": "WAS"
}

excluded_tms = {"INJ", "2TM", "3TM", "4TM", "5TM", ""}
excluded_prefixes = {"Did not play"}

totals_mapping = {
    "year_id": "Year", "age": "Age", "team_name_abbr": "Tm", "pos": "Pos", "games": "G",
    "games_started": "GS", "mp": "MP", "fg": "FG", "fga": "FGA", "fg_pct": "FG%",
    "fg3": "3P", "fg3a": "3PA", "fg3_pct": "3P%", "fg2": "2P", "fg2a": "2PA", "fg2_pct": "2P%",
    "efg_pct": "eFG%", "ft": "FT", "fta": "FTA", "ft_pct": "FT%", "orb": "ORB",
    "drb": "DRB", "trb": "REB", "ast": "AST", "stl": "STL", "blk": "BLK", "tov": "TOV",
    "pf": "PF", "pts": "PTS"
}

per_game_mapping = {
    "year_id": "Year", "age": "Age", "team_name_abbr": "Tm", "pos": "Pos", "games": "G",
    "games_started": "GS", "mp_per_g": "MP", "fg_per_g": "FG", "fga_per_g": "FGA",
    "fg_pct": "FG%", "fg3_per_g": "3P", "fg3a_per_g": "3PA", "fg3_pct": "3P%",
    "fg2_per_g": "2P", "fg2a_per_g": "2PA", "fg2_pct": "2P%", "efg_pct": "eFG%",
    "ft_per_g": "FT", "fta_per_g": "FTA", "ft_pct": "FT%", "orb_per_g": "ORB",
    "drb_per_g": "DRB", "trb_per_g": "REB", "ast_per_g": "AST", "stl_per_g": "STL",
    "blk_per_g": "BLK", "tov_per_g": "TOV", "pf_per_g": "PF", "pts_per_g": "PTS"
}

per_minute_mapping = {
    "year_id": "Year", "age": "Age", "team_name_abbr": "Tm", "pos": "Pos", "games": "G",
    "games_started": "GS", "mp": "MP", "fg_per_minute_36": "FG", "fga_per_minute_36": "FGA",
    "fg_pct": "FG%", "fg3_per_minute_36": "3P", "fg3a_per_minute_36": "3PA", "fg3_pct": "3P%",
    "fg2_per_minute_36": "2P", "fg2a_per_minute_36": "2PA", "fg2_pct": "2P%",
    "efg_pct": "eFG%", "ft_per_minute_36": "FT", "fta_per_minute_36": "FTA", "ft_pct": "FT%",
    "orb_per_minute_36": "ORB", "drb_per_minute_36": "DRB", "trb_per_minute_36": "REB",
    "ast_per_minute_36": "AST", "stl_per_minute_36": "STL", "blk_per_minute_36": "BLK",
    "tov_per_minute_36": "TOV", "pf_per_minute_36": "PF", "pts_per_minute_36": "PTS"
}

tables_to_process = [
    ("totals_stats", "Totals", totals_mapping, "Regular"),
    ("per_game_stats", "Per Game", per_game_mapping, "Regular"),
    ("per_minute_stats", "Per Minute", per_minute_mapping, "Regular"),
    ("totals_stats_post", "Totals", totals_mapping, "Playoffs"),
    ("per_game_stats_post", "Per Game", per_game_mapping, "Playoffs"),
    ("per_minute_stats_post", "Per Minute", per_minute_mapping, "Playoffs")
]

def process_player(args):
    letter_dir, player_folder = args
    folder_path = os.path.join(letter_dir, player_folder)
    if not os.path.isdir(folder_path):
        return [], [f"⚠️ Skipped folder: {folder_path}"]

    player_id = player_folder
    profile_path = os.path.join(folder_path, "profile.html")
    if not os.path.exists(profile_path):
        return [], [f"⚠️ Missing: {profile_path}"]

    with open(profile_path, "rb") as f:
        html_bytes = f.read()
        html_text = html_bytes.decode("latin1").encode("utf-8").decode("utf-8")

    soup = BeautifulSoup(html_text, "html.parser")
    name_tag = soup.find("h1")
    raw_name = name_tag.find("span").text if name_tag else player_id
    player_name = fix_text(raw_name.strip())
    logs = [f"🔍 {player_id} → {player_name}"]

    player_rows = []
    for table_id, stat_type, mapping, season_type in tables_to_process:
        table = soup.find(id=table_id)
        if not table:
            continue
        tbody = table.find("tbody")
        if not tbody:
            continue

        for row in tbody.find_all("tr", class_=lambda x: x != "thead"):
            if row.find("td", {"data-stat": "reason"}):
                continue

            row_data = {}
            for key, output_col in mapping.items():
                if key == "year_id":
                    th = row.find("th", {"data-stat": "year_id"})
                    row_data[output_col] = (
                        th.find("a").text.strip()[:4] if th and th.find("a") else th.text.strip()[:4]
                    ) if th else ""
                else:
                    cell = row.find("td", {"data-stat": key})
                    row_data[output_col] = cell.text.strip() if cell else ""

            row_data["Stat_Type"] = stat_type
            row_data["Season_Type"] = season_type

            if not row_data.get("Year", "").strip():
                continue

            team = row_data.get("Tm", "").strip()
            if team in excluded_tms or any(team.startswith(prefix) for prefix in excluded_prefixes):
                continue

            row_data["Tm"] = team_mapping.get(team, team)

            for col in final_columns:
                if col in row_data and row_data[col] == "":
                    if col not in ["playerID", "Name", "Pos", "Stat_Type", "Season_Type", "Tm"]:
                        row_data[col] = 0

            row_data["playerID"] = player_id
            row_data["Name"] = player_name
            row_data["Year"] = str(int(row_data["Year"]) + 1)
            player_rows.append(row_data)

    if player_rows:
        logs.append(f"✅ {len(player_rows)} rows written for {player_name}")
    else:
        logs.append(f"⚠️ No stats found for {player_name}")

    return player_rows, logs

if __name__ == "__main__":
    pd.DataFrame(columns=final_columns).to_csv(output_file, index=False)

    all_players = []
    for letter in sorted(os.listdir(players_root)):
        letter_dir = os.path.join(players_root, letter)
        if not os.path.isdir(letter_dir) or len(letter) != 1:
            continue
        for player_folder in os.listdir(letter_dir):
            all_players.append((letter_dir, player_folder))

    batch_rows = []
    with multiprocessing.Pool(processes=os.cpu_count()) as pool:
        for player_data, logs in tqdm(pool.imap_unordered(process_player, all_players), total=len(all_players)):
            for line in logs:
                print(line)
            batch_rows.extend(player_data)
            if len(batch_rows) >= 200:
                pd.DataFrame(batch_rows, columns=final_columns).to_csv(output_file, mode="a", index=False, header=False)
                batch_rows = []

    # flush any remaining
    if batch_rows:
        pd.DataFrame(batch_rows, columns=final_columns).to_csv(output_file, mode="a", index=False, header=False)
