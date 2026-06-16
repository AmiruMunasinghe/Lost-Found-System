@echo off
title University Lost and Found Backend Launcher
cls
echo ==========================================================
echo    UNIVERSITY LOST AND FOUND SYSTEM - BACKEND LAUNCHER
echo ==========================================================
echo.

:: 1. Check Java installation
echo [1/3] Checking Java Installation...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in your system PATH.
    echo Please install JDK 21 or higher and try again.
    pause
    exit /b
)
echo [OK] Java is detected.
echo.

:: 2. Remind about MySQL Database
echo [2/3] Checking Database Pre-requisites...
echo.
echo IMPORTANT: Please ensure:
echo 1. Your MySQL server is running.
echo 2. You created the database by running: CREATE DATABASE lostfound;
echo 3. You updated your password in the backend/.env file.
echo.
set /p confirm="Have you completed the database setup? (Y/N): "
if /i "%confirm%" neq "y" (
    echo.
    echo Please complete the database setup first, then run this script again.
    pause
    exit /b
)
echo.

:: 3. Run spring-boot:run
echo [3/3] Launching Spring Boot Backend...
echo.
call .\mvnw.cmd spring-boot:run
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Backend failed to start.
    echo Please check the error messages above for details (e.g. check DB credentials in .env).
)
pause
