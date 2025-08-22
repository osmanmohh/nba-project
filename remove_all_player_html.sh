#!/bin/bash

echo "🔥 FINAL CLEANUP - Removing ALL player profile HTML files from Git history..."

# Create backup branch
BACKUP_BRANCH="backup-before-player-html-cleanup-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH"
echo "✅ Created backup branch: $BACKUP_BRANCH"

echo "📊 Removing 30,496 player profile HTML files from entire Git history..."

# Remove ALL player profile HTML files that are bloating the history
git filter-repo \
  --path-glob 'backend/data/players/*/*.html' \
  --path-glob 'backend/data/awards/*.html' \
  --path walmart_debug.html \
  --path profile.html \
  --invert-paths \
  --force

# Clean up and optimize
echo "🧹 Cleaning up and optimizing repository..."
git gc --prune=now --aggressive --force

echo ""
echo "✅ PLAYER HTML CLEANUP COMPLETE!"
echo "📈 Your development timeline is preserved"
echo "💾 Backup available at: $BACKUP_BRANCH"
echo ""
echo "📊 Check the results:"
echo "  git count-objects -vH"
echo "  du -sh .git" 