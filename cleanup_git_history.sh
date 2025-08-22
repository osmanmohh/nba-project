#!/bin/bash

echo "Cleaning up Git history by removing large files..."

# Remove large CSV files from history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch player_game_logs2.csv player_game_logs.csv Updated_Players_with_IDs.csv' \
  --prune-empty --tag-name-filter cat -- --all

# Remove large JSON/JS files from history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch all_players.js all_players.json Frontend/all_players.js' \
  --prune-empty --tag-name-filter cat -- --all

# Clean up the refs and force garbage collection
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "Git history cleanup complete!" 