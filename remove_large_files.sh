#!/bin/bash

echo "Removing large files from working directory..."

# Remove large files from current directory
rm -f player_game_logs2.csv
rm -f player_game_logs.csv
rm -f Updated_Players_with_IDs.csv
rm -f all_players.js
rm -f all_players.json

# Remove from frontend directory
rm -f frontend/all_players.js
rm -f frontend/all_players.json

echo "Large files removed from working directory."
echo "You can now commit these changes with: git add . && git commit -m 'Remove large data files'" 