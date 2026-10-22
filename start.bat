@echo off
REM ============================================================
REM  3D Portfolio - local server launcher
REM  Double-click this file to run the portfolio in your browser.
REM  (A local server is required because the site uses ES modules.)
REM ============================================================
title 3D Portfolio - Local Server
cd /d "%~dp0"

echo.
echo   Starting local server for the 3D portfolio...
echo   URL: http://localhost:8000
echo.
echo   Keep this window OPEN while you work.
echo   Press Ctrl+C to stop the server.
echo.

REM open the browser a moment after the server starts
start "" /b cmd /c "timeout /t 2 >nul && start http://localhost:8000"

REM find a working python
where python >nul 2>&1
if %errorlevel%==0 (
    python -m http.server 8000
    goto done
)
where py >nul 2>&1
if %errorlevel%==0 (
    py -m http.server 8000
    goto done
)

echo.
echo   ERROR: Python was not found on this computer.
echo   Install Python from https://www.python.org/downloads/
echo   and tick "Add Python to PATH" during setup.
echo.
echo   Alternative: use VS Code's "Live Server" extension
echo   and right-click index.html -> "Open with Live Server".

:done
echo.
echo   Server stopped.
pause
