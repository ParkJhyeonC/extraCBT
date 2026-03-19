@echo off
setlocal
set PORT=8000
if not "%~1"=="" set PORT=%~1
set "REPO_ROOT=%~dp0"
set "LOCAL_CLOUDFLARED=%REPO_ROOT%.tools\cloudflared"

echo [extraCBT] Ensuring cloudflared is installed before opening a public tunnel...
powershell -NoProfile -ExecutionPolicy Bypass -File "%REPO_ROOT%tools\ensure-cloudflared.ps1"
if errorlevel 1 (
  echo [extraCBT] Failed to install cloudflared automatically.
  exit /b 1
)

if exist "%LOCAL_CLOUDFLARED%\cloudflared.exe" (
  set "PATH=%LOCAL_CLOUDFLARED%;%PATH%"
)

echo [extraCBT] Starting public mode with cloudflared tunnel...
python serve.py --host 0.0.0.0 --port %PORT% --tunnel cloudflared
endlocal
