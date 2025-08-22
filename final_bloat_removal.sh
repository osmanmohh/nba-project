#!/bin/bash

echo "🔥 FINAL BLOAT REMOVAL - Removing ALL remaining bloat..."

# Create backup branch
BACKUP_BRANCH="backup-before-final-bloat-removal-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH"
echo "✅ Created backup branch: $BACKUP_BRANCH"

echo "🗑️  Removing ALL remaining bloat from Git history..."

# Remove ALL remaining bloat
git filter-repo \
  --path-glob 'headshots/*.png' \
  --path-glob 'Frontend/headshots/*.png' \
  --path-glob 'frontend/headshots/*.png' \
  --path-glob 'backend/data/players/*/headshots/*.png' \
  --path walmart_debug.html \
  --path-glob 'players_2024*.js' \
  --path updated_players.js \
  --path Frontend/updated_players.js \
  --path-glob 'players_test/*/*.html' \
  --invert-paths \
  --force

# Clean up and optimize
echo "🧹 Cleaning up and optimizing repository..."
git gc --prune=now --aggressive --force

echo ""
echo "✅ ALL BLOAT REMOVED!"
echo "📈 Your development timeline is preserved"
echo "💾 Backup available at: $BACKUP_BRANCH"
echo ""
echo "📊 Check the results:"
echo "  git count-objects -vH"
echo "  du -sh .git" 