#!/bin/bash

echo "🚀 Removing ALL CSV and JSON files from Git history..."
echo "📊 This will preserve your development timeline while cleaning up data files"

# Create backup branch
BACKUP_BRANCH="backup-before-csv-json-cleanup-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH"
echo "✅ Created backup branch: $BACKUP_BRANCH"

# Get all CSV and JSON files from current HEAD
echo "📋 Found CSV and JSON files to remove:"
git ls-tree -r --name-only HEAD | grep -E '\.(csv|json)$' | sort

echo ""
echo "🗑️  Removing all CSV and JSON files from entire Git history..."

# Use git filter-repo to remove all CSV and JSON files
git filter-repo \
  --path-glob '*.csv' \
  --path-glob '*.json' \
  --invert-paths \
  --force

# Clean up and optimize
echo "🧹 Cleaning up and optimizing repository..."
git gc --prune=now --aggressive

echo ""
echo "✅ SUCCESS! All CSV and JSON files removed from Git history"
echo "📈 Your development timeline is preserved"
echo "💾 Backup available at: $BACKUP_BRANCH"
echo ""
echo "📊 Check the results:"
echo "  git log --oneline --graph"
echo "  git count-objects -vH"
echo "  du -sh .git" 