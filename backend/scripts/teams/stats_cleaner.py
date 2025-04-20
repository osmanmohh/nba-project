import os
import pandas as pd
from bs4 import BeautifulSoup

# Directory containing the HTML files
data_folder = "backend/data/nba_summary"  # Change this to your folder name
output_file = "backend/data/team_data2.csv"

# Table IDs to find
table_ids = ["per_game-team", "totals-team", "per_poss-team"]

# Map historical team names to their current NBA franchise
historical_team_mapping = {
    'Milwaukee Bucks': 'MIL',
    'Brooklyn Nets': 'BKN',
    'Washington Wizards': 'WAS',
    'Utah Jazz': 'UTA',
    'Portland Trail Blazers': 'POR',
    'Phoenix Suns': 'PHX',
    'Indiana Pacers': 'IND',
    'Denver Nuggets': 'DEN',
    'New Orleans Pelicans': 'NOP',
    'Los Angeles Clippers': 'LAC',
    'Atlanta Hawks': 'ATL',
    'Sacramento Kings': 'SAC',
    'Golden State Warriors': 'GSW',
    'Philadelphia 76ers': 'PHI',
    'Memphis Grizzlies': 'MEM',
    'Boston Celtics': 'BOS',
    'Dallas Mavericks': 'DAL',
    'Minnesota Timberwolves': 'MIN',
    'Toronto Raptors': 'TOR',
    'San Antonio Spurs': 'SAS',
    'Chicago Bulls': 'CHI',
    'Los Angeles Lakers': 'LAL',
    'Charlotte Hornets': 'CHA',
    'Houston Rockets': 'HOU',
    'Miami Heat': 'MIA',
    'New York Knicks': 'NYK',
    'Detroit Pistons': 'DET',
    'Oklahoma City Thunder': 'OKC',
    'Orlando Magic': 'ORL',
    'Cleveland Cavaliers': 'CLE',
    'Cincinnati Royals': 'SAC',  # Merged with Sacramento Kings
    'Baltimore Bullets': 'WAS',   # Merged with Washington Wizards
    'St. Louis Hawks': 'ATL',     # Merged with Atlanta Hawks
    'San Francisco Warriors': 'GSW',
    'Kansas City-Omaha Kings': 'SAC',  # Merged with Sacramento Kings
    'Seattle SuperSonics': 'OKC',  # Merged with Oklahoma City Thunder
    'Buffalo Braves': 'LAC',    # Merged with Los Angeles Clippers
    'Rochester Royals': 'SAC',  # Merged with Sacramento Kings
    'Syracuse Nationals': 'PHI',  # Merged with Philadelphia 76ers
    'Minneapolis Lakers': 'LAL',  # Merged with Los Angeles Lakers
    'Fort Wayne Pistons': 'DET',  # Merged with Detroit Pistons
    'Philadelphia Warriors': 'GSW',
    'Milwaukee Hawks': 'ATL',  # Merged with Atlanta Hawks
    'Indianapolis Olympians': 'IND',  # Merged with Indiana Pacers
    'New Jersey Nets': 'BKN',  # Merged with Brooklyn Nets
    'Vancouver Grizzlies': 'MEM',  # Merged with Memphis Grizzlies
    'San Diego Rockets': 'HOU',  # Merged with Houston Rockets
    'Washington Bullets': 'WAS',  # Merged with Washington Wizards
    'New Orleans Hornets': 'NOP',  # Merged with New Orleans Pelicans
    'Charlotte Bobcats': 'CHA',  # Merged with Charlotte Hornets
    'New Orleans/Oklahoma City Hornets': 'NOP',  # Merged with New Orleans Pelicans
    'Kansas City Kings': 'SAC',  # Merged with Sacramento Kings
    'San Diego Clippers': 'LAC',  # Merged with Los Angeles Clippers
    'New Orleans Jazz': 'UTA',  # Merged with Utah Jazz
    'Chicago Zephyrs': 'CHI',  # Merged with Chicago Bulls
    'Capital Bullets': 'WAS',  # Merged with Washington Wizards
    'Chicago Packers': 'CHI',  # Merged with Chicago Bulls
    'New York Nets': 'BKN',  # Merged with Brooklyn Nets
    'Tri-Cities Blackhawks': 'CHI',  # Merged with Chicago Bulls
    'Washington Capitols': 'WAS',  # Merged with Washington Wizards
    'Anderson Packers': 'IND',  # Merged with Indiana Pacers
    'Sheboygan Red Skins': 'MIL',  # Merged with Milwaukee Bucks
    'Waterloo Hawks': 'ATL',  # Merged with Atlanta Hawks
    'Chicago Stags': 'CHI',  # Merged with Chicago Bulls
    'St. Louis Bombers': 'SAS',  # Merged with San Antonio Spurs
}


# List to store all data
all_data = []

# Process each HTML file in the folder
for filename in os.listdir(data_folder):
    if not filename.endswith(".html") :  # Skip non-HTML files
        continue

    # Extract the year from the filename (assuming format "YYYY.html")
    year = filename.split(".")[0]

    file_path = os.path.join(data_folder, filename)
    print(f"\n📂 Processing file: {filename} (Year: {year})")

    # Load and parse the HTML file
    with open(file_path, "r", encoding="utf-8") as file:
        html_content = file.read()

    soup = BeautifulSoup(html_content, "html.parser")

    # Process each table type
    for table_id in table_ids:
        # Extract stat type from table_id (e.g., "per_game" from "per_game-team")
        stat_type = table_id.split("-")[0]
        
        # Find the table
        table = soup.find("table", id=table_id)

        if not table:
            print(f"❌ No table found with ID '{table_id}' in {filename}")
            continue

        print(f"✅ Table Found: {table_id}")

        # Extract column headers
        headers = [th.text.strip() for th in table.find("thead").find_all("th")]
        headers.insert(1, "Tm")  # Add "Tm" column for mapped team abbreviation
        headers.insert(0, "Year")  # Add "Year" column
        headers.insert(1, "StatType")  # Add "StatType" column
        print(f"📌 Headers Detected ({len(headers)} columns): {headers}")

        rows = []
        for row in table.find("tbody").find_all("tr"):
            # Extract rank (Rk) from the <th> tag
            rank = row.find("th")
            rank_value = rank.text.strip() if rank else "N/A"

            # Extract all other data from <td> tags
            row_data = [td.text.strip() for td in row.find_all("td")]

            if row_data:
                # Insert "Year" at the start
                row_data.insert(0, year)
                
                # Insert "StatType" after Year
                row_data.insert(1, stat_type)

                # Insert "Rk" after StatType
                row_data.insert(2, rank_value)

                # Extract team name and remove asterisks (*)
                team_name = row_data[3].replace("*", "").strip()
                team_abbr = historical_team_mapping.get(team_name, "UNK")  # Default to "UNK" if missing

                # Insert "Tm" abbreviation
                row_data.insert(3, team_abbr)

                # Ensure row length matches headers
                while len(row_data) < len(headers):
                    row_data.append(None)  # Fill missing values

                rows.append(row_data)

        # Remove the "League Average" row (last row)
        if rows and "League Average" in rows[-1]:
            print("⚠️ Removing 'League Average' row...")
            rows.pop()

        # Convert to Pandas DataFrame for clean printing
        df = pd.DataFrame(rows, columns=headers)
        df['Team'] = df['Team'].str.replace("*", "")

        # Append data to all_data list
        all_data.append(df)

# Combine all team data into a single DataFrame
final_df = pd.concat(all_data, ignore_index=True)

# Save to CSV
final_df.to_csv(output_file, index=False)
print(f"\n✅ Data successfully saved to '{output_file}'")
