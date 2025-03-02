import json

def remove_exact_duplicates_in_place(file_path):
    # Load the JSON file
    with open(file_path, "r", encoding="utf-8") as f:
        players = json.load(f)

    # Remove duplicates using a dictionary (preserves order)
    unique_players = list({tuple(player.items()): player for player in players}.values())

    # Write back the unique players (overwriting the original file)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(unique_players, f, indent=4)

    print(f"Duplicates removed. Updated {file_path} in place.")

# Example usage
remove_exact_duplicates_in_place("all_players.json")
