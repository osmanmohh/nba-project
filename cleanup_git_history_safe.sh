#!/bin/bash

echo "Cleaning up Git history using git-filter-repo..."

# Create a backup branch first
git branch backup-before-cleanup

echo "Created backup branch: backup-before-cleanup"

# Remove large files from history using git-filter-repo
git filter-repo --path player_game_logs2.csv --invert-paths
git filter-repo --path player_game_logs.csv --invert-paths
git filter-repo --path Updated_Players_with_IDs.csv --invert-paths
git filter-repo --path all_players.js --invert-paths
git filter-repo --path all_players.json --invert-paths
git filter-repo --path Frontend/all_players.js --invert-paths

# Force garbage collection
git gc --prune=now --aggressive

echo "Git history cleanup complete!"
echo "Your repository should now be much smaller."
echo "If you need to restore, checkout the backup-before-cleanup branch." 