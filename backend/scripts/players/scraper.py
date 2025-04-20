import requests
from lxml import html
import os
import time
import logging
from multiprocessing import Process, Manager, Value, Lock
from bs4 import BeautifulSoup
from tqdm import tqdm
import math

# ---------------- CONFIG ---------------- #
BASE_URL = "https://www.basketball-reference.com"
SAVE_PATH = "backend/data/players"
LOG_FILE = "scraped_files.log"
CHUNK_DIR = "proxy_chunks"

MAX_RETRIES = 3
REQUEST_DELAY = 2
TIMEOUT = 10
RETRY_DELAY = 1



PROXIES = [
    "http://ekvmreib:qomoqtsgv1ig@107.175.56.243:6516",
    "http://ekvmreib:qomoqtsgv1ig@166.88.83.113:6770",
    "http://ekvmreib:qomoqtsgv1ig@206.41.174.8:5963",
    "http://ekvmreib:qomoqtsgv1ig@103.101.88.215:5939",
    "http://ekvmreib:qomoqtsgv1ig@148.135.177.51:5585",
    "http://ekvmreib:qomoqtsgv1ig@194.106.206.195:7100",
    "http://ekvmreib:qomoqtsgv1ig@43.245.117.40:5624",
    "http://ekvmreib:qomoqtsgv1ig@45.41.169.207:6868",
    "http://ekvmreib:qomoqtsgv1ig@145.223.54.61:6026",
    "http://ekvmreib:qomoqtsgv1ig@154.6.8.210:5677",
    "http://ekvmreib:qomoqtsgv1ig@91.123.8.109:6649",
    "http://ekvmreib:qomoqtsgv1ig@146.103.3.31:7084",
    "http://ekvmreib:qomoqtsgv1ig@191.96.69.41:5554",
    "http://ekvmreib:qomoqtsgv1ig@207.244.219.220:6476",
    "http://ekvmreib:qomoqtsgv1ig@89.34.237.195:5939",
    "http://ekvmreib:qomoqtsgv1ig@31.59.20.151:6729",
    "http://ekvmreib:qomoqtsgv1ig@45.43.67.183:7933",
    "http://ekvmreib:qomoqtsgv1ig@82.22.217.166:5508"
]

# ---------------- LOGGING ---------------- #
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler(LOG_FILE, mode='a', encoding='utf-8')]
)

# ---------------- UTILS ---------------- #
def get_url(session, url):
    for attempt in range(MAX_RETRIES):
        try:
            res = session.get(url, timeout=TIMEOUT)
            res.raise_for_status()
            return res.text
        except Exception as e:
            logging.warning(f"Retry {attempt+1} failed for {url}: {e}")
            time.sleep(RETRY_DELAY)
    logging.error(f"❌ Failed to fetch after retries: {url}")
    return None

def log_scraped_file(path):
    logging.info(f"Saved: {path}")

def count_scraped_players():
    scraped = 0
    for letter in os.listdir(SAVE_PATH):
        letter_path = os.path.join(SAVE_PATH, letter)
        if not os.path.isdir(letter_path):
            continue
        for player_id in os.listdir(letter_path):
            profile_path = os.path.join(letter_path, player_id, "profile.html")
            if os.path.exists(profile_path):
                scraped += 1
    return scraped

# ---------------- SCRAPE PLAYER ---------------- #
def scrape_player(session, player_id):
    letter = player_id[0]
    base_dir = os.path.join(SAVE_PATH, letter, player_id)
    os.makedirs(base_dir, exist_ok=True)

    profile_url = f"{BASE_URL}/players/{letter}/{player_id}.html"
    html_text = get_url(session, profile_url)
    if not html_text:
        return False

    profile_path = os.path.join(base_dir, "profile.html")
    with open(profile_path, "w", encoding="utf-8") as f:
        f.write(html_text)
    log_scraped_file(profile_path)

    tree = html.fromstring(html_text)
    links = tree.xpath('//a[contains(@href, "/gamelog/")]/@href')
    seen = set()
    for href in links:
        if href in seen:
            continue
        seen.add(href)
        season = href.split("/")[-1].replace(".html", "")
        game_text = get_url(session, BASE_URL + href)
        if not game_text:
            return False
        game_path = os.path.join(base_dir, f"{season}.html")
        with open(game_path, "w", encoding="utf-8") as f:
            f.write(game_text)
        log_scraped_file(game_path)
        time.sleep(REQUEST_DELAY)

    return True

# ---------------- SCRAPE IDS ---------------- #
def scrape_ids(proxy_url, player_ids, return_list, counter, total, lock, proxy_index):
    session = requests.Session()
    session.proxies = {"http": proxy_url, "https": proxy_url}
    session.headers.update({"User-Agent": "Mozilla/5.0"})

    progress_file = os.path.join(CHUNK_DIR, f"progress_{proxy_index}.txt")

    start_index = 0
    if os.path.exists(progress_file):
        with open(progress_file, "r", encoding="utf-8") as f:
            last_id = f.read().strip()
            if last_id in player_ids:
                index = player_ids.index(last_id)
                start_index = max(index - 4, 0)  # rescrape last 5
            else:
                start_index = 0
    else:
        start_index = 0

    failed = []

    for player_id in player_ids[start_index:]:
        try:
            success = scrape_player(session, player_id)
            if success:
                with open(progress_file, "w", encoding="utf-8") as f:
                    f.write(player_id)
                return_list.append(player_id)
                with lock:
                    counter.value += 1
            else:
                failed.append(player_id)
        except Exception as e:
            logging.error(f"Error scraping {player_id}: {e}")
            failed.append(player_id)
        time.sleep(REQUEST_DELAY)

    for player_id in failed:
        try:
            logging.warning(f"🔁 Retrying failed player: {player_id}")
            success = scrape_player(session, player_id)
            if success:
                with open(progress_file, "w", encoding="utf-8") as f:
                    f.write(player_id)
                return_list.append(player_id)
                with lock:
                    counter.value += 1
        except Exception as e:
            logging.error(f"Final retry failed for {player_id}: {e}")

# ---------------- COLLECT PLAYER IDS ---------------- #
def collect_all_player_ids():
    from bs4 import BeautifulSoup
    import requests

    BASE_URL = "https://www.basketball-reference.com"
    PROXY_URL = "http://ekvmreib:qomoqtsgv1ig@45.150.176.21:5894"  # rotate if needed

    session = requests.Session()
    session.proxies = {
        "http": PROXY_URL,
        "https": PROXY_URL
    }
    session.headers.update({"User-Agent": "Mozilla/5.0"})

    all_ids = []

    for letter in "abcdefghijklmnopqrstuvwxyz":
        url = f"{BASE_URL}/players/{letter}/"
        try:
            res = session.get(url, timeout=10)
            res.raise_for_status()
            soup = BeautifulSoup(res.text, "html.parser")
            ths = soup.select("th[data-append-csv]")
            all_ids += [th["data-append-csv"] for th in ths]
        except Exception as e:
            print(f"❌ Failed for {letter}: {e}")

    return all_ids

# ---------------- MAIN ---------------- #
def main():
    print("🔍 Collecting all player IDs...")
    player_ids = collect_all_player_ids()
    total_players = len(player_ids)
    print(f"✅ Total players found: {total_players}")

    os.makedirs(CHUNK_DIR, exist_ok=True)

    proxies_in_use = PROXIES
    chunk_size = math.ceil(total_players / len(proxies_in_use))

    chunks = [
        sorted(player_ids[i:i+chunk_size])
        for i in range(0, total_players, chunk_size)
    ]

    for i, chunk in enumerate(chunks):
        with open(os.path.join(CHUNK_DIR, f"chunk_{i}.txt"), "w", encoding="utf-8") as f:
            f.write("\n".join(chunk))

    with Manager() as manager:
        all_ids = manager.list()
        initial_count = count_scraped_players()
        counter = Value('i', initial_count)
        lock = Lock()
        pbar = tqdm(total=total_players, desc="📊 Progress", dynamic_ncols=True)

        processes = []
        for i, (proxy, chunk) in enumerate(zip(proxies_in_use, chunks)):
            p = Process(target=scrape_ids, args=(proxy, chunk, all_ids, counter, total_players, lock, i))
            p.start()
            processes.append(p)

        last_count = 0
        while any(p.is_alive() for p in processes):
            time.sleep(1)
            with lock:
                new_count = counter.value
                pbar.update(new_count - last_count)
                last_count = new_count

        for p in processes:
            p.join()

        with lock:
            pbar.update(counter.value - last_count)

        pbar.close()
        print(f"\n✅ All players scraped. Total players: {len(all_ids)}")

if __name__ == "__main__":
    main()
