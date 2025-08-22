#!/bin/bash

echo "🔥 AGGRESSIVE CLEANUP - Removing all large files from Git history..."

# Create backup branch
BACKUP_BRANCH="backup-before-aggressive-cleanup-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH"
echo "✅ Created backup branch: $BACKUP_BRANCH"

echo "🗑️  Removing specific large files from entire Git history..."

# Remove the massive files that are still there
git filter-repo \
  --path all_players.js \
  --path Frontend/all_players.js \
  --path scraped_files.log \
  --path walmart_debug.html \
  --path-glob 'backend/data/players/*/profile.html' \
  --path-glob 'players_test/*/profile.html' \
  --path-glob '*.log' \
  --invert-paths \
  --force

# Clean up and optimize
echo "🧹 Cleaning up and optimizing repository..."
git gc --prune=now --aggressive --force

echo ""
echo "✅ AGGRESSIVE CLEANUP COMPLETE!"
echo "📈 Your development timeline is preserved"
echo "💾 Backup available at: $BACKUP_BRANCH"
echo ""
echo "📊 Check the results:"
echo "  git count-objects -vH"
echo "  du -sh .git" 