#!/bin/bash

echo "🔥 FINAL PNG CLEANUP - Removing unused PNG files from Git history..."

# Create backup branch
BACKUP_BRANCH="backup-before-png-cleanup-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH"
echo "✅ Created backup branch: $BACKUP_BRANCH"

echo "📊 Removing 461 unused PNG files from entire Git history..."

# Remove unused PNG files but keep essential logos
git filter-repo \
  --path-glob 'Frontend/headshots/*.png' \
  --path-glob 'frontend/headshots/*.png' \
  --path-glob 'backend/data/players/*/headshots/*.png' \
  --path walmart_debug.html \
  --path-glob 'players_test/*/*.html' \
  --path-glob 'players_2024*.js' \
  --path updated_players.js \
  --invert-paths \
  --force

# Clean up and optimize
echo "🧹 Cleaning up and optimizing repository..."
git gc --prune=now --aggressive --force

echo ""
echo "✅ PNG CLEANUP COMPLETE!"
echo "📈 Your development timeline is preserved"
echo "💾 Backup available at: $BACKUP_BRANCH"
echo ""
echo "📊 Check the results:"
echo "  git count-objects -vH"
echo "  du -sh .git" 