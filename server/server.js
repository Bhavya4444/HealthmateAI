const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug environment variables
console.log('🔧 JWT_SECRET configured:', process.env.JWT_SECRET ? 'Yes' : 'No');
console.log('🔧 MONGODB_URI:', process.env.MONGODB_URI);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const aiRoutes = require('./routes/ai');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://healthmateai-frontend.onrender.com', // your deployed frontend
    'http://localhost:3000' // for local development, optional
  ],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthmate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/ai', aiRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001 to avoid macOS ControlCenter

// Enhanced server startup with port conflict handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/healthmate'}`);
  console.log(`🤖 OpenRouter: ${process.env.OPENROUTER_API_KEY ? 'Configured' : 'Not configured'}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.log(`💡 Try running: lsof -ti:${PORT} | xargs kill -9`);
    console.log('💡 Then restart the server');
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});
