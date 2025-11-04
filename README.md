# HealthMate AI - Personal Health Tracker with Smart Recommendations

## 🚀 Overview

HealthMate AI is a comprehensive personal health tracking application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that provides intelligent health insights using OpenAI's API.

## ✨ Features

- **📊 Health Dashboard**: Beautiful, intuitive dashboard showing daily health metrics
- **📝 Health Logging**: Track steps/activity, sleep, diet, mood, energy levels, and wellness
- **📈 Smart Analytics**: Visual charts and trends analysis with Chart.js
- **🤖 AI Health Coach**: Personalized recommendations and 24/7 chat assistance
- **👤 User Profiles**: Complete user management with health goals and preferences
- **🎨 Modern UI**: Attractive interface with Tailwind CSS and Framer Motion animations
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** - Server and API
- **MongoDB** + **Mongoose** - Database
- **OpenAI API** - AI-powered health insights
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - User interface
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Chart.js** + **react-chartjs-2** - Data visualization
- **Heroicons** - Icons
- **React Router** - Navigation
- **Axios** - HTTP client

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (running locally or MongoDB Atlas)
- **OpenAI API Key** (from openai.com)

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
cd /Users/i577307/Desktop/Healthws/Healthmate
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Setup
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/healthmate
JWT_SECRET=your_super_secret_jwt_key_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
NODE_ENV=development
```

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# Or start manually
mongod
```

### 6. Run the Application
```bash
# Start both backend and frontend
npm run dev

# Or start them separately:
# Backend only
npm run server

# Frontend only (in another terminal)
npm run client
```

### 7. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔧 Configuration

### MongoDB Setup
1. **Local MongoDB**: Ensure MongoDB is installed and running
2. **MongoDB Atlas**: Replace the MONGODB_URI with your Atlas connection string

### OpenAI API Setup
1. Sign up at [OpenAI](https://platform.openai.com)
2. Generate an API key
3. Add it to your `.env` file

## 📱 Usage

### Getting Started
1. **Register**: Create a new account with your health information
2. **Profile Setup**: Complete your health profile and goals
3. **Daily Logging**: Start tracking your daily health metrics
4. **AI Insights**: Chat with the AI coach for personalized advice
5. **Analytics**: Monitor your progress with beautiful charts

### Key Features

#### 🏠 Dashboard
- Overview of daily health metrics
- Quick action buttons
- AI-generated health insights
- Progress tracking

#### 📝 Health Log
- **Activity**: Track steps and daily movement
- **Sleep**: Log sleep duration, quality, bedtime, wake-up time
- **Nutrition**: Add meals, track calories, water intake
- **Wellness**: Monitor mood, energy levels, weight, notes

#### 📊 Analytics
- Interactive charts for steps, sleep, calories
- Mood distribution analysis
- Health trends over time
- Personalized insights

#### 🤖 AI Chat
- 24/7 health coaching
- Nutrition advice
- Sleep optimization tips
- Quick question suggestions

#### 👤 Profile
- Personal information management
- Health metrics (BMI calculation)
- Activity level settings
- Health goals configuration

## 🔐 Security Features

- **JWT Authentication**: Secure user sessions
- **Password Hashing**: bcryptjs encryption
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin request security
- **Environment Variables**: Sensitive data protection

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Themes**: Modern color schemes
- **Smooth Animations**: Framer Motion interactions
- **Loading States**: User feedback during operations
- **Toast Notifications**: Real-time user feedback
- **Accessible Design**: WCAG compliance considerations

## 📊 Database Schema

### User Model
- Personal information (name, email, age, height, weight)
- Health preferences (activity level, goals)
- Authentication data (hashed password)

### HealthLog Model
- Daily metrics (steps/activity, sleep, diet)
- Mood and energy tracking
- AI-generated insights and recommendations
- Timestamps for trend analysis

## 🤖 AI Integration

The application integrates with OpenAI's GPT models to provide:

- **Daily Summaries**: AI analysis of health data
- **Personalized Recommendations**: Based on user patterns
- **Health Predictions**: Trend analysis and warnings
- **Interactive Chat**: 24/7 health coaching assistance

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build
cd ..

# Set environment to production
export NODE_ENV=production

# Start server
npm start
```

### Environment Variables for Production
```env
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
OPENAI_API_KEY=your_openai_api_key
PORT=5000
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@healthmate.com or join our community forum.

## 🔄 Updates

The application includes automatic health trend analysis and will continuously improve AI recommendations based on user data patterns.

---

**Built with ❤️ using the MERN Stack + AI**
