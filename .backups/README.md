# 📦 RideWEb Backup System

## How to Create a Backup

**Before making ANY changes, run:**

```powershell
cd C:\Users\Admin\Desktop\RideWEb
powershell -ExecutionPolicy Bypass -File ".backups\backup-files.ps1"
```

This will create a timestamped backup of all critical files.

---

## Files That Are Backed Up

- ✅ DriverDashboard.tsx
- ✅ RiderDashboard.tsx  
- ✅ driverController.js
- ✅ riderController.js
- ✅ subscriptionController.js
- ✅ paymentController.js
- ✅ All route files
- ✅ models.js
- ✅ api.ts and socket.ts

---

## How to Restore from Backup

### 1. List Available Backups
```powershell
dir .backups
```

### 2. Copy a File from Backup
```powershell
# Example: Restore DriverDashboard from specific backup
Copy-Item ".backups\backup_2025-12-08_2214\components\DriverDashboard.tsx" "components\DriverDashboard.tsx" -Force
```

### 3. Restore Entire Backup
```powershell
# Example: Restore all files from specific backup
Copy-Item ".backups\backup_2025-12-08_2214\*" "." -Recurse -Force
```

---

## Backup Retention

- 🔄 The script automatically keeps the **last 20 backups**
- 🗑️ Older backups are automatically deleted to save disk space
- 📅 Each backup has a timestamp: `backup_YYYY-MM-DD_HHMM`

---

## When to Create Backups

**Always create a backup BEFORE:**
- Making major code changes
- Implementing new features
- Refactoring existing code
- Making database changes
- Updating dependencies

---

## Quick Restore Commands

```powershell
# Find latest backup
$latest = Get-ChildItem .backups | Sort-Object CreationTime -Descending | Select-Object -First 1

# Restore specific file from latest backup
Copy-Item "$($latest.FullName)\components\DriverDashboard.tsx" "components\" -Force

# List files in latest backup
Get-ChildItem $latest.FullName -Recurse -File
```

---

## Backup Location

All backups are stored in:
```
C:\Users\Admin\Desktop\RideWEb\.backups\
```

This folder is automatically created and managed by the backup script.
