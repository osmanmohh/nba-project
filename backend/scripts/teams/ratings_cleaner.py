from bs4 import BeautifulSoup
import pandas as pd
import os
from io import StringIO
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
division_mapping = {
    'A': 'Atlantic',
    'C': 'Central',
    'NW': 'Northwest',
    'P': 'Pacific',
    'SE': 'Southeast',
    'SW': 'Southwest',
    'M': 'Midwest',
    'W': 'West',
    'E': 'East',
}
conference_mapping = {
  'Atlantic': 'E',
  'Central': 'E',
  'Northwest': 'W',
  'Pacific': 'W',
  'Southeast': 'E',
  'Southwest': 'W',
  'Midwest': 'W',
  'West': 'W',
  'East': 'E',
  'W': 'W',
  'E': 'E',
}
# Directory containing the HTML files
data_folder = "backend/data/team_ratings"
output_file = "backend/data/team_ratings.csv"

# Read all HTML files
html_files = [f for f in os.listdir(data_folder) if f.endswith('.html')]  

# Initialize empty list to store dataframes
dataframes = []

# Process each file
for file in html_files:

    # Read the HTML file
    with open(os.path.join(data_folder, file), 'r', encoding='utf-8') as f: 
        soup = BeautifulSoup(f, 'html.parser')

    # Find the table with id "team_ratings"
    table = soup.find('table', {'id': 'ratings'})

    # Convert table to dataframe
    df = pd.read_html(StringIO(str(table)), header=1)[0]
    # Flatten multi-level columns (keep just the top level)
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    # Drop the first row which was misread as headers

    df['Team'] = df['Team'].map(historical_team_mapping).fillna(df['Team'])
    df.rename(columns={'Team': 'Tm'}, inplace=True)
    df['Div'] = df['Div'].map(division_mapping)
    df['Conf'] = df['Div'].map(conference_mapping)
    df['Year'] = file.split('.')[0]


    dataframes.append(df)

# Concatenate all dataframes
final_df = pd.concat(dataframes).sort_values(by=['Year', 'Rk'], ascending=[False, True])

# Save to CSV
final_df.to_csv(output_file, index=False)
print(final_df['Tm'].unique())

    # Add year column