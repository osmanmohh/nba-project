import os
import re
import csv
from datetime import datetime
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
from ftfy import fix_text

# === CONFIG ===
PLAYERS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "players"))
MAX_WORKERS = 12
OUTPUT_CSV = "player_bios.csv"

CSV_HEADERS = ["bbref_id", "name", "birthdate", "height", "weight", "pos", "shoots", "college", "draft"]

def parse_profile(profile_path, bbref_id):
    with open(profile_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    name_tag = soup.find("h1")
    raw_name = name_tag.find("span").text if name_tag and name_tag.find("span") else bbref_id
    player_name = fix_text(raw_name.strip())

    info = {
        "bbref_id": bbref_id,
        "name": player_name,
        "birthdate": "-", "height": "-", "weight": "-",
        "pos": "-", "shoots": "-", "college": "-", "draft": "-"
    }

    birth_tag = soup.find("span", {"id": "necro-birth"})
    if birth_tag and birth_tag.has_attr("data-birth"):
        try:
            date = birth_tag["data-birth"]
            info["birthdate"] = datetime.strptime(date, "%Y-%m-%d").strftime("%B %d, %Y")
        except:
            info["birthdate"] = date

    for p in soup.select("#meta p"):
        text = p.get_text(strip=True)

        if "Position:" in text and "Shoots:" in text:
            for part in text.split("▪"):
                if "Position:" in part:
                    pos = part.replace("Position:", "").strip()
                    info["pos"] = pos.split(",")[0].split(" and ")[0].strip()
                elif "Shoots:" in part:
                    info["shoots"] = part.replace("Shoots:", "").strip()

        elif "lb" in text and "cm" in text:
            spans = p.find_all("span")
            if len(spans) >= 2:
                ht_raw = spans[0].text.strip()
                if "-" in ht_raw:
                    ft, inch = ht_raw.split("-")
                    info["height"] = f"{ft}'{inch}\""
                wt_raw = spans[1].text.strip().replace("lb", "").strip()
                info["weight"] = f"{wt_raw} lbs"

        elif "College:" in text:
            link = p.find("a")
            info["college"] = link.text.strip() if link else "-"

        elif "Draft:" in text:
            raw = text.replace("Draft:", "").strip()
            parts = raw.split(", ", 1)
            if len(parts) > 1:
                draft_info = parts[1].replace("NBA Draft", "").strip()
                year = re.search(r"\d{4}", draft_info)
                rnd = re.search(r"(\d+)(st|nd|rd|th) round", draft_info, re.IGNORECASE)
                pick = re.search(r"\((\d+)", draft_info)
                if year and rnd and pick:
                    info["draft"] = f"{year.group()} {rnd.group(1)}st Round {pick.group(1)}th Pick"

    return info

def find_profile_paths():
    profile_paths = []
    for letter in os.listdir(PLAYERS_DIR):
        letter_dir = os.path.join(PLAYERS_DIR, letter)
        if not os.path.isdir(letter_dir):
            continue
        for player_folder in os.listdir(letter_dir):
            player_dir = os.path.join(letter_dir, player_folder)
            profile_path = os.path.join(player_dir, "profile.html")
            if os.path.exists(profile_path):
                profile_paths.append((profile_path, player_folder))
    return profile_paths

def main():
    profile_paths = find_profile_paths()
    bios = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(parse_profile, path, pid): (path, pid) for path, pid in profile_paths}

        for future in tqdm(as_completed(futures), total=len(futures), desc="Parsing player bios"):
            try:
                bio = future.result()
                bios.append(bio)
                print(f"✅ {bio['name']}")
            except Exception as e:
                path, pid = futures[future]
                print(f"❌ Error for {pid}: {e}")

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        writer.writeheader()
        for bio in bios:
            writer.writerow(bio)

    print(f"\n✅ Done. Saved {len(bios)} bios to {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
