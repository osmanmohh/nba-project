import json
import re

# File paths
players_2024_file = "players_2024.js"
all_players_file = "all_players.json"

# Function to load JS file as JSON
def load_js_as_json(js_file):
    with open(js_file, 'r', encoding='utf-8') as f:
        js_content = f.read()
    
    # Extract JSON part using regex
    json_match = re.search(r'const players = (\[.*\]);', js_content, re.DOTALL)
    if not json_match:
        raise ValueError("Invalid JS file format")
    
    json_str = json_match.group(1)
    return json.loads(json_str)

# Load data
with open(all_players_file, 'r', encoding='utf-8') as f:
    all_players = json.load(f)

players_2024 = load_js_as_json(players_2024_file)

# Convert 2024 players into a dictionary for fast lookup by Player_ID
players_2024_dict = {str(player["Player_ID"]): player for player in players_2024}

# Update all instances of the Player_ID in all_players.json with available info from players_2024
for player in all_players:
    player_id = str(player.get("Player_ID"))  # Ensure Player_ID is treated as a string for consistent matching
    if player_id in players_2024_dict:
        for key in ["Height", "Weight", "Birthdate", "College", "Draft"]:
            if key in players_2024_dict[player_id]:
                player[key] = players_2024_dict[player_id][key]
            else:
                player[key] = ""  # Ensure the field exists even if empty

# Save the updated all_players.json
with open(all_players_file, 'w', encoding='utf-8') as f:
    json.dump(all_players, f, indent=4)

print("✅ All instances in all_players.json updated successfully with player info from players_2024.js.")
