# Backup Script for RideWEb Project
# Creates timestamped backups of critical files

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$backupDir = "C:\Users\Admin\Desktop\RideWEb\.backups\backup_$timestamp"

Write-Host "Creating backup: $timestamp" -ForegroundColor Cyan

# Create backup directory
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Critical files to backup
$filesToBackup = @(
    "components\DriverDashboard.tsx",
    "components\RiderDashboard.tsx",
    "backend\controllers\driverController.js",
    "backend\controllers\riderController.js",
    "backend\controllers\subscriptionController.js",
    "backend\controllers\paymentController.js",
    "backend\routes\driverRoutes.js",
    "backend\routes\riderRoutes.js",
    "backend\models.js",
    "services\api.ts",
    "services\socket.ts"
)

$successCount = 0
$failCount = 0

foreach ($file in $filesToBackup) {
    $sourcePath = "C:\Users\Admin\Desktop\RideWEb\$file"
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $backupDir $file
        $destDir = Split-Path $destPath -Parent
        
        # Create subdirectories if needed
        if (!(Test-Path $destDir)) {
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        }
        
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        $successCount++
        Write-Host "  Backed up: $file" -ForegroundColor Green
    } else {
        $failCount++
        Write-Host "  Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Backup complete!" -ForegroundColor Green
Write-Host "  Location: $backupDir" -ForegroundColor Cyan
Write-Host "  Files backed up: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "  Files skipped: $failCount" -ForegroundColor Yellow
}

# Keep only last 20 backups to save space
$allBackups = Get-ChildItem "C:\Users\Admin\Desktop\RideWEb\.backups" -Directory | Sort-Object CreationTime -Descending
if ($allBackups.Count -gt 20) {
    $toDelete = $allBackups | Select-Object -Skip 20
    foreach ($old in $toDelete) {
        Remove-Item $old.FullName -Recurse -Force
        Write-Host "  Removed old backup: $($old.Name)" -ForegroundColor Gray
    }
}
