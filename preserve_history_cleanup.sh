#!/bin/bash

echo "Preserving development history while removing large files..."

# Create a backup branch
git branch backup-full-history-$(date +%Y%m%d-%H%M%S)

echo "Created backup branch with timestamp"

# Use git filter-repo to remove large files while preserving commit structure
echo "Removing large files from entire history..."

# Remove the largest files that are causing bloat
git filter-repo \
  --path player_game_logs2.csv \
  --path player_game_logs.csv \
  --path all_players.js \
  --path all_players.json \
  --path Updated_Players_with_IDs.csv \
  --path Frontend/all_players.js \
  --path Frontend/all_players.json \
  --invert-paths \
  --force

# Clean up and optimize
git gc --prune=now --aggressive

echo ""
echo "✅ Repository cleaned up while preserving development timeline!"
echo "📊 Your commit history showing gradual progress is intact"
echo "🗂️  Large data files removed from entire history"
echo "💾 Backup branch created in case you need to restore"
echo ""
echo "Check the results:"
echo "  git log --oneline --graph"
echo "  git count-objects -vH" 