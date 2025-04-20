import os
import re
import time
import pandas as pd
from bs4 import BeautifulSoup
from concurrent.futures import ProcessPoolExecutor, as_completed
from ftfy import fix_text
from tqdm import tqdm

# === CONFIG ===
PLAYERS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "players"))
OUTPUT_CSV = "player_game_logs.csv2"
MAX_WORKERS = 12

schema = [
    "Player Name", "BBRef ID", "Year", "Date", "Team", "Location", "Opponent", "Result", "Minutes",
    "Points", "Rebounds", "Assists", "Steals", "Blocks", "FGM", "FGA", "FG%", "3PM", "3PA", "3P%", "TOV", "PlusMinus",
]

def parse_single_player(letter_dir, player_id):
    player_dir = os.path.join(letter_dir, player_id)
    profile_path = os.path.join(player_dir, "profile.html")
    if not os.path.exists(profile_path):
        return []

    try:
        with open(profile_path, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f.read(), "lxml")
        name_tag = soup.find("h1")
        raw_name = name_tag.find("span").text if name_tag and name_tag.find("span") else player_id
        player_name = fix_text(raw_name.strip()) 
    except:
        player_name = player_id

    player_rows = []

    for file in os.listdir(player_dir):
        if not re.fullmatch(r"\d{4}\.html", file):
            continue

        year = int(file.replace(".html", ""))
        path = os.path.join(player_dir, file)

        try:
            with open(path, "r", encoding="utf-8") as f:
                soup = BeautifulSoup(f.read(), "lxml")

            table = soup.find("table", id="player_game_log_reg")
            if not table:
                continue

            for tr in table.find("tbody").find_all("tr", class_=lambda x: x != "thead"):
                if tr.get("id") is None:
                    continue

                row = {td["data-stat"]: td.text.strip() for td in tr.find_all(["td", "th"])}

                game_data = {
                    "Player Name": player_name,
                    "BBRef ID": player_id,
                    "Year": year,
                    "Date": row.get("date"),
                    "Team": row.get("team_name_abbr"),
                    "Location": "Away" if row.get("game_location") == "@" else "Home",
                    "Opponent": row.get("opp_name_abbr"),
                    "Result": row.get("game_result"),
                    "Minutes": row.get("mp"),
                    "Points": int(row.get("pts", 0) or 0),
                    "Rebounds": int(row.get("trb", 0) or 0),
                    "Assists": int(row.get("ast", 0) or 0),
                    "Steals": int(row.get("stl", 0) or 0),
                    "Blocks": int(row.get("blk", 0) or 0),
                    "FGM": int(row.get("fg", 0) or 0),
                    "FGA": int(row.get("fga", 0) or 0),
                    "FG%": float(row.get("fg_pct", 0) or 0),
                    "3PM": int(row.get("fg3", 0) or 0),
                    "3PA": int(row.get("fg3a", 0) or 0),
                    "3P%": float(row.get("fg3_pct", 0) or 0),
                    "TOV": int(row.get("tov", 0) or 0),
                    "PlusMinus": int(row.get("plus_minus", "0").replace("+", "").replace("−", "-") or 0)
                }

                player_rows.append(game_data)
        except Exception as e:
            print(f"⚠️ Error in {player_id} ({year}): {e}")

    return player_rows

def get_all_players():
    player_list = []
    for letter in sorted(os.listdir(PLAYERS_DIR)):
        letter_dir = os.path.join(PLAYERS_DIR, letter)
        if not os.path.isdir(letter_dir): continue
        for player_id in os.listdir(letter_dir):
            player_dir = os.path.join(letter_dir, player_id)
            if os.path.isdir(player_dir):
                player_list.append((letter_dir, player_id))
    return player_list

def main():
    all_players = get_all_players()
    all_rows = []

    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [
            executor.submit(parse_single_player, letter_dir, player_id)
            for letter_dir, player_id in all_players
        ]

        for future in tqdm(as_completed(futures), total=len(futures), desc="Parsing all game logs"):
            try:
                all_rows.extend(future.result())
            except Exception as e:
                print(f"❌ Process error: {e}")

    elapsed = time.perf_counter() - start
    print(f"\n⏱ Parsing completed in {elapsed:.2f} seconds.")

    df = pd.DataFrame(all_rows, columns=schema)
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"✅ Saved {len(df)} total game logs to {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
