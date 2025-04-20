import os
import requests
from bs4 import BeautifulSoup
import time
def scrape_and_save_html(url, year):
    # Define the target directory
    directory = os.path.join("backend", "data", "awards")
    os.makedirs(directory, exist_ok=True)  # Create it if it doesn't exist

    # Define the full path to the file
    filename = os.path.join(directory, f"{year}.html")
    
    # Send a GET request to the URL
    response = requests.get(url)
    
    # Check if the request was successful
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        html_content = soup.prettify()

        # Save the HTML content to the file
        with open(filename, 'w', encoding='utf-8') as file:
            file.write(html_content)

        print(f"✅ Saved {year} HTML to {filename}")
    else:
        print(f"❌ Failed to retrieve {url}. Status code: {response.status_code}")

for year in range(2000, 2025):
    url = f"https://www.basketball-reference.com/awards/awards_{year}.html"
    scrape_and_save_html(url, year)
    time.sleep(2)
