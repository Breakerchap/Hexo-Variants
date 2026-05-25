@echo off
setlocal

set PORT=8080
if not "%~1"=="" set PORT=%~1

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on PATH.
  echo Install Node.js, then retry.
  pause
  exit /b 1
)

where ngrok >nul 2>nul
if errorlevel 1 (
  echo ngrok was not found on PATH.
  echo Install ngrok and run `ngrok config add-authtoken YOUR_TOKEN` first.
  pause
  exit /b 1
)

if not exist node_modules\ws (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo Starting local server on port %PORT%...
start "HeXO Server" cmd /k "cd /d \"%~dp0\" && set PORT=%PORT% && node server.js"

timeout /t 2 >nul

echo Starting ngrok tunnel...
start "HeXO ngrok" cmd /k "ngrok http %PORT%"

echo.
echo Local URL: http://localhost:%PORT%
echo Share the HTTPS URL shown in the ngrok window.
echo.

endlocal
