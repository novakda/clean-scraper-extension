#!/bin/bash
echo "=== Dev Environment Setup ==="
echo "Working directory: $(pwd)"
echo ""

echo "=== Git History ==="
git log --oneline -5 2>/dev/null || echo "No git history found"
echo ""

echo "=== Harness Status ==="
if [ -f "claude-progress.json" ]; then
  echo "Progress tracked in claude-progress.json"
  echo "Last updated: $(node -e "console.log(require('./claude-progress.json').lastUpdated)")" 2>/dev/null
fi
if [ -f "feature-list.json" ]; then
  echo "Active features: $(node -e "console.log(require('./feature-list.json').features.length)" 2>/dev/null || echo "0")"
fi
echo ""

echo "=== Next Steps ==="
echo "- Use /harness-feature to add features"
echo "- Use /harness-orchestrate for complex multi-agent tasks"
echo "- Use /harness-checkpoint to save progress and commit"
