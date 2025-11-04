# HealthMate - Windows Installation Guide

## Prerequisites Installation

### 1. Install Node.js
1. Visit https://nodejs.org/
2. Download the LTS version for Windows
3. Run the installer and follow the setup wizard
4. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

### 2. Install MongoDB (Choose Option A or B)

#### Option A: Local MongoDB Installation
1. Visit https://www.mongodb.com/try/download/community
2. Select Windows platform
3. Download and run the installer
4. During installation:
   - Choose "Complete" setup
   - Install MongoDB as a Service (recommended)
   - Install MongoDB Compass (GUI tool)
5. Verify installation:
   ```cmd
   mongod --version
   ```

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. Visit https://www.mongodb.com/atlas
2. Create a free account
3. Create a free cluster
4. Get connection string for your app

### 3. Install Git (Optional)
1. Visit https://git-scm.com/download/win
2. Download and install
3. Use Git Bash or Command Prompt

## Project Setup

### Step 1: Clone/Download Project
```cmd
# If using Git
git clone [your-repository-url]
cd HealthMate

# Or download ZIP and extract
```

### Step 2: Install Dependencies
```cmd
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Step 3: Environment Configuration
Create `.env` file in root directory:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/healthmate
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthmate

# OpenAI API (Optional - for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Server Port
PORT=5001
```

### Step 4: Start the Application
```cmd
# Option 1: Use the start script (if available)
npm start

# Option 2: Manual start
# Terminal 1 - Start MongoDB (if local)
mongod

# Terminal 2 - Start Backend Server
cd server
node server.js

# Terminal 3 - Start Frontend
cd client
npm start
```

## Quick Start with Batch Script (Easiest Method)

I've created an automated Windows batch script that handles everything for you!

### How to Use the Batch Script:

1. **Download/Clone the project** to your computer
2. **Open the project folder** in File Explorer
3. **Double-click** `start-windows.bat`
4. **Follow the prompts** - the script will:
   - ✅ Check if Node.js is installed
   - ✅ Install all dependencies automatically
   - ✅ Create a sample .env file if missing
   - ✅ Start both backend and frontend servers
   - ✅ Open your browser to the application

### Alternative Ways to Run the Batch Script:

**Method 1: Double-click**
- Simply double-click `start-windows.bat` in File Explorer

**Method 2: Command Prompt**
```cmd
cd path\to\HealthMate
start-windows.bat
```

**Method 3: Right-click context menu**
- Right-click `start-windows.bat` → "Run as administrator" (if needed)

### What the Batch Script Does:

The `start-windows.bat` script automatically:

1. **Validates Installation**
   - Checks if Node.js and npm are installed
   - Verifies you're in the correct directory

2. **Installs Dependencies**
   - Runs `npm install` in root directory
   - Runs `npm install` in client directory
   - Only installs if not already present

3. **Configuration Setup**
   - Creates a sample `.env` file if missing
   - Sets up default MongoDB connection
   - Includes placeholder for OpenAI API key

4. **Starts Application**
   - Launches both backend server (port 5001)
   - Launches React frontend (port 3000)
   - Opens your browser automatically

### Stopping the Application:
- Press **Ctrl+C** in any of the command windows
- Or simply close the command prompt windows

## Windows-Specific Notes

### PowerShell Execution Policy
If you encounter PowerShell script errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Issues
- Windows Defender might block ports
- Ensure ports 3000 (React) and 5001 (Server) are available
- Check Windows Firewall settings if needed

### MongoDB Service
- MongoDB should auto-start as Windows Service
- Check Services app (services.msc) if MongoDB doesn't start
- Service name: "MongoDB"

## Troubleshooting

### Common Windows Issues:

1. **"'node' is not recognized"**
   - Restart Command Prompt/PowerShell after Node.js installation
   - Check PATH environment variable

2. **MongoDB Connection Issues**
   - Ensure MongoDB service is running
   - Check Windows Services (Win + R → services.msc)
   - Verify MONGODB_URI in .env file

3. **Permission Errors**
   - Run Command Prompt as Administrator if needed
   - Check folder permissions

4. **Port Already in Use**
   - Check Task Manager for processes using ports 3000/5001
   - Kill processes or change ports in configuration

## Alternative: Docker Setup (Advanced)

For advanced users who prefer containerization:

1. Install Docker Desktop for Windows
2. Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
  
  app:
    build: .
    ports:
      - "3000:3000"
      - "5001:5001"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/healthmate

volumes:
  mongodb_data:
```

3. Run: `docker-compose up`

## Quick Start Commands Summary

```cmd
# 1. Install Node.js from https://nodejs.org/
# 2. Install MongoDB from https://www.mongodb.com/try/download/community

# 3. Setup project
git clone [repo-url]
cd HealthMate
npm install
cd client && npm install && cd ..

# 4. Create .env file with MongoDB connection

# 5. Start application
npm start
# OR
# Terminal 1: mongod (if local MongoDB)
# Terminal 2: cd server && node server.js
# Terminal 3: cd client && npm start

# 6. Open browser to http://localhost:3000
```

## Support

If you encounter issues:
1. Check Node.js and npm versions are compatible
2. Ensure MongoDB is running
3. Verify all dependencies are installed
4. Check console for error messages
5. Ensure ports 3000 and 5001 are available

The application should work identically on Windows as it does on macOS/Linux!
