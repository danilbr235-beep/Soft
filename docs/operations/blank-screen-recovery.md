# Blank Screen Recovery

Use this checklist when the web app opens at `http://localhost:8082/` but the browser appears blank.

## First Checks

1. Refresh the page once.
2. Confirm the dev server responds:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8082/ -TimeoutSec 20
```

Expected: `200 OK`.

3. If the port is stale, restart Expo web:

```powershell
$listener = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' } | Select-Object -First 1
if ($listener) { Stop-Process -Id $listener.OwningProcess -Force; Start-Sleep -Seconds 2 }
npm.cmd --workspace @pmhc/mobile run web -- --port 8082
```

## In-App Recovery

The app now has a startup recovery screen. If rendering fails, Soft shows:

```text
Soft hit a startup snag
```

Use **Clear local app state and restart** to remove only Soft-owned local demo keys:

- `pmhc:onboarding-complete`
- `pmhc:quick-logs`
- `pmhc:sync-queue`
- `pmhc:content-progress`
- `pmhc:privacy-lock`
- `pmhc:program-progress`
- `pmhc:debug-force-error`

Unrelated browser storage is left untouched.

## Verification

Run the smoke recovery check:

```powershell
npm.cmd run smoke:web -- --grep "startup rendering fails"
```

Run the corrupted-storage check:

```powershell
npm.cmd run smoke:web -- --grep "legacy local storage"
```
