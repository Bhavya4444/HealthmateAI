@echo off
title HealthMate Application Startup

echo ========================================
echo       HealthMate Application
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js is installed

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo ✓ npm is available

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the HealthMate root directory
    pause
    exit /b 1
)

echo ✓ Found package.json

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install root dependencies
        pause
        exit /b 1
    )
)

REM Check if client dependencies are installed
if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install client dependencies
        pause
        exit /b 1
    )
    cd ..
)

echo ✓ Dependencies are installed

REM Check for .env file
if not exist ".env" (
    echo.
    echo WARNING: .env file not found
    echo Creating a sample .env file...
    echo # HealthMate Environment Variables > .env
    echo # MongoDB Connection >> .env
    echo MONGODB_URI=mongodb://localhost:27017/healthmate >> .env
    echo # OR for MongoDB Atlas: >> .env
    echo # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthmate >> .env
    echo. >> .env
    echo # OpenAI API Key ^(Optional^) >> .env
    echo OPENAI_API_KEY=your_openai_api_key_here >> .env
    echo. >> .env
    echo # Server Port >> .env
    echo PORT=5001 >> .env
    echo.
    echo ✓ Created .env file - Please update it with your actual values
    echo.
)

REM Check if MongoDB is running (for local installation)
echo Checking MongoDB connection...
timeout /t 2 >nul

REM Start the application
echo.
echo Starting HealthMate Application...
echo.
echo This will open multiple windows:
echo - Backend server (http://localhost:5001)
echo - Frontend application (http://localhost:3000)
echo.
echo Press Ctrl+C in any window to stop the application
echo.
pause

REM Start the full application using the start script
echo Starting application...
call npm start

echo.
echo Application stopped.
pause
