Write-Host "=== Dev Environment Setup ==="
Write-Host "Working directory: $PWD"
Write-Host ""

Write-Host "=== Git History ==="
git log --oneline -5 2>$null; if ($LASTEXITCODE -ne 0) { Write-Host "No git history found" }
Write-Host ""

Write-Host "=== Harness Status ==="
if (Test-Path "claude-progress.json") {
  Write-Host "Progress tracked in claude-progress.json"
  try {
    $progress = Get-Content "claude-progress.json" | ConvertFrom-Json
    Write-Host "Last updated: $($progress.lastUpdated)"
  } catch {}
}
if (Test-Path "feature-list.json") {
  try {
    $features = Get-Content "feature-list.json" | ConvertFrom-Json
    Write-Host "Active features: $($features.features.Count)"
  } catch {}
}
Write-Host ""

Write-Host "=== Next Steps ==="
Write-Host "- Use /harness-feature to add features"
Write-Host "- Use /harness-orchestrate for complex multi-agent tasks"
Write-Host "- Use /harness-checkpoint to save progress and commit"
