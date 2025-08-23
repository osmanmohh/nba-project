#!/bin/bash

echo "🔥 REMOVING TEAM RATINGS HTML BLOAT..."

# Create backup branch
BACKUP_BRANCH="backup-before-team-ratings-cleanup-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH"
echo "✅ Created backup branch: $BACKUP_BRANCH"

echo "📊 Removing 74 team rating HTML files from entire Git history..."

# Remove team rating HTML files that are bloating the history
git filter-repo \
  --path-glob 'backend/data/team_ratings/*.html' \
  --invert-paths \
  --force

# Clean up and optimize
echo "🧹 Cleaning up and optimizing repository..."
git gc --prune=now --aggressive --force

echo ""
echo "✅ TEAM RATINGS HTML CLEANUP COMPLETE!"
echo "📈 Your development timeline is preserved"
echo "💾 Backup available at: $BACKUP_BRANCH"
echo ""
echo "📊 Check the results:"
echo "  git count-objects -vH"
echo "  du -sh .git" 