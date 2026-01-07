# Clear Next.js cache and restart dev server
# This script helps resolve stale cache issues

Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow

# Stop any running Node processes
Write-Host "Stopping Node processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Remove .next directory
if (Test-Path ".next") {
    Write-Host "Removing .next directory..." -ForegroundColor Yellow
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ .next directory removed" -ForegroundColor Green
} else {
    Write-Host "✓ .next directory not found (already clean)" -ForegroundColor Green
}

# Remove node_modules/.cache if it exists
if (Test-Path "node_modules\.cache") {
    Write-Host "Removing node_modules/.cache..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ node_modules/.cache removed" -ForegroundColor Green
}

Write-Host "`nCache cleared successfully!" -ForegroundColor Green
Write-Host "You can now run 'npm run dev' to start fresh." -ForegroundColor Cyan



