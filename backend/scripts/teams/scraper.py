import os
import requests
import threading
from tqdm import tqdm
from dotenv import load_dotenv

# === Load environment variables ===
load_dotenv()
USERNAME = os.getenv("PROXY_USER")
PASSWORD = os.getenv("PROXY_PASS")
PROXY_FILE = os.getenv("PROXY_FILE")

if not USERNAME or not PASSWORD or not PROXY_FILE:
    raise ValueError("Missing proxy config in .env")

# === Load proxies from file ===
with open(PROXY_FILE, "r") as f:
    RAW_PROXIES = [line.strip() for line in f if line.strip()]

PROXY_LIST = [f"http://{USERNAME}:{PASSWORD}@{ip}" for ip in RAW_PROXIES]
SUMMARY_PROXIES = PROXY_LIST[:10]
RATINGS_PROXIES = PROXY_LIST[10:]

# === Scraper settings ===
SUMMARY_URL = "https://www.basketball-reference.com/leagues/NBA_{}.html"
RATINGS_URL = "https://www.basketball-reference.com/leagues/NBA_{}_ratings.html"
SUMMARY_FOLDER = "backend/data/nba_summary"
RATINGS_FOLDER = "backend/data/team_ratings"
os.makedirs(SUMMARY_FOLDER, exist_ok=True)
os.makedirs(RATINGS_FOLDER, exist_ok=True)

START_YEAR = 1950
END_YEAR = 2025
YEARS = list(range(START_YEAR, END_YEAR + 1))

# === Utilities ===
def chunkify(lst, n):
    avg = len(lst) // n
    chunks = [lst[i*avg:(i+1)*avg] for i in range(n)]
    if len(lst) % n != 0:
        chunks[-1].extend(lst[n*avg:])
    return chunks

def worker(years, proxy, folder, url_template, label, pbar):
    session = requests.Session()
    session.proxies = {"http": proxy, "https": proxy}
    for year in years:
        path = os.path.join(folder, f"{year}.html")
        if os.path.exists(path):
            pbar.update(1)
            continue
        url = url_template.format(year)
        try:
            res = session.get(url, timeout=15)
            if res.status_code == 200:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(res.text)
            else:
                print(f"[{label}] ❌ {year} Status {res.status_code}")
        except Exception as e:
            print(f"[{label}] ❌ {year} Error: {e}")
        pbar.update(1)

def start_scraping(proxies, url_template, folder, label_prefix, bar_position):
    chunks = chunkify(YEARS, len(proxies))
    pbar = tqdm(total=len(YEARS), desc=label_prefix, position=bar_position)
    threads = []
    for i, (proxy, years) in enumerate(zip(proxies, chunks)):
        label = f"{label_prefix}-{i+1}"
        t = threading.Thread(target=worker, args=(years, proxy, folder, url_template, label, pbar))
        threads.append(t)
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    pbar.close()

# === Run both jobs ===
start_scraping(SUMMARY_PROXIES, SUMMARY_URL, SUMMARY_FOLDER, "Summary", 0)
start_scraping(RATINGS_PROXIES, RATINGS_URL, RATINGS_FOLDER, "Ratings", 1)

print("🎉 All scraping complete!")
