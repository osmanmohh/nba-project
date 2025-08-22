#!/bin/bash

echo "🔥 FINAL CLEANUP - Removing NBA summary HTML files from Git history..."

# Create backup branch
BACKUP_BRANCH="backup-before-final-cleanup-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH"
echo "✅ Created backup branch: $BACKUP_BRANCH"

echo "🗑️  Removing NBA summary HTML files from entire Git history..."

# Remove the NBA summary HTML files that are bloating the history
git filter-repo \
  --path-glob 'backend/data/nba_summary/*.html' \
  --path walmart_debug.html \
  --invert-paths \
  --force

# Clean up and optimize
echo "🧹 Cleaning up and optimizing repository..."
git gc --prune=now --aggressive --force

echo ""
echo "✅ FINAL CLEANUP COMPLETE!"
echo "📈 Your development timeline is preserved"
echo "💾 Backup available at: $BACKUP_BRANCH"
echo ""
echo "📊 Check the results:"
echo "  git count-objects -vH"
echo "  du -sh .git" 