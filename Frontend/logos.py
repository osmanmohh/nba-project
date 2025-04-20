import os
import requests

# Create a folder to store team logos
output_folder = "nba_team_logos"
os.makedirs(output_folder, exist_ok=True)

# ESPN logo URL pattern (team abbreviations are used)
espn_logo_url = "https://a.espncdn.com/i/teamlogos/nba/500/{}.png"

# NBA teams with their ESPN abbreviations
nba_teams = {
    "Atlanta Hawks": "atl",
    "Boston Celtics": "bos",
    "Brooklyn Nets": "bkn",
    "Charlotte Hornets": "cha",
    "Chicago Bulls": "chi",
    "Cleveland Cavaliers": "cle",
    "Dallas Mavericks": "dal",
    "Denver Nuggets": "den",
    "Detroit Pistons": "det",
    "Golden State Warriors": "gsw",
    "Houston Rockets": "hou",
    "Indiana Pacers": "ind",
    "Los Angeles Clippers": "lac",
    "Los Angeles Lakers": "lal",
    "Memphis Grizzlies": "mem",
    "Miami Heat": "mia",
    "Milwaukee Bucks": "mil",
    "Minnesota Timberwolves": "min",
    "New Orleans Pelicans": "no",
    "New York Knicks": "ny",
    "Oklahoma City Thunder": "okc",
    "Orlando Magic": "orl",
    "Philadelphia 76ers": "phi",
    "Phoenix Suns": "phx",
    "Portland Trail Blazers": "por",
    "Sacramento Kings": "sac",
    "San Antonio Spurs": "sa",
    "Toronto Raptors": "tor",
    "Utah Jazz": "uth",  # ESPN uses "uth" instead of "uta"
    "Washington Wizards": "wsh"
}

# Download and save each team logo using abbreviations
for team_name, team_abbr in nba_teams.items():
    # Construct the logo URL
    logo_url = espn_logo_url.format(team_abbr)

    # Define file path
    filename = f"{team_abbr}.png"  # Saves as "lal.png", "bos.png", etc.
    filepath = os.path.join(output_folder, filename)

    try:
        # Fetch logo image
        img_data = requests.get(logo_url).content

        # Save image file
        with open(filepath, "wb") as f:
            f.write(img_data)

        print(f"Saved: {filename}")

    except Exception as e:
        print(f"Error saving logo for {team_name}: {e}")

print(" All NBA team logos downloaded!")
