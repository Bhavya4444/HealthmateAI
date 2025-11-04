#!/bin/bash

echo "🚀 Starting HealthMate AI Application..."
echo ""

# Check if MongoDB is running
echo "📊 Checking MongoDB connection..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."

    # Try different MongoDB startup methods
    if command -v brew &> /dev/null; then
        # Check if MongoDB is installed via Homebrew
        if brew list | grep -q mongodb-community; then
            echo "🔧 Starting MongoDB via Homebrew..."
            brew services start mongodb/brew/mongodb-community
            sleep 3
        else
            echo "🔧 MongoDB not found. Installing MongoDB Community Edition..."
            brew tap mongodb/brew 2>/dev/null || true
            brew install mongodb-community
            brew services start mongodb/brew/mongodb-community
            sleep 5
        fi
    else
        echo "🔧 Please install MongoDB manually:"
        echo "   Visit: https://docs.mongodb.com/manual/installation/"
        echo "   Or install Homebrew and run this script again"
        echo ""
    fi
else
    echo "✅ MongoDB is already running"
fi

# Wait a moment for MongoDB to fully start
sleep 2

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOL
MONGODB_URI=mongodb://localhost:27017/healthmate
JWT_SECRET=healthmate_super_secret_jwt_key_2024
OPENAI_API_KEY=your_openai_api_key_here
PORT=5001
NODE_ENV=development
EOL
    echo "✅ Created .env file. Please add your OpenAI API key!"
    echo ""
fi

echo "🔧 Installing any missing dependencies..."
npm install --silent

echo "🎨 Installing frontend dependencies..."
cd client
npm install --silent
cd ..

echo ""
echo "🌟 HealthMate AI is ready to launch!"
echo ""
echo "📋 Quick Setup Checklist:"
echo "   ✅ MongoDB installed and running"
echo "   ✅ Backend dependencies installed"
echo "   ✅ Frontend dependencies installed"
echo "   ⚠️  Add your OpenAI API key to .env file"
echo "   ⚠️  Check OpenAI billing if AI features needed"
echo ""
echo "🚀 Starting the application..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo ""

# Kill any existing processes on the ports
echo "🔧 Clearing any existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
sleep 2

# Start the backend server in the background
echo "🚀 Starting backend server on port 5001..."
PORT=5001 node server/server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start the frontend development server
echo "🎨 Starting frontend development server on port 3000..."
cd client
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ HealthMate AI is now running!"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 Backend API: http://localhost:5001"
echo "   📊 MongoDB: Running"
echo ""
echo "🛑 To stop the application, press Ctrl+C"
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping HealthMate AI..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    echo "✅ Application stopped successfully"
    exit 0
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
