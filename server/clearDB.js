const mongoose = require('mongoose');
const HealthLog = require('./models/HealthLog');
const User = require('./models/User');

// Load environment variables
require('dotenv').config();

async function clearHealthData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthmate', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');

    // Clear all health logs
    const deletedLogs = await HealthLog.deleteMany({});
    console.log(`🗑️  Deleted ${deletedLogs.deletedCount} health log records`);

    // Optional: Reset user profiles (uncomment if you want to clear users too)
    // const deletedUsers = await User.deleteMany({});
    // console.log(`🗑️  Deleted ${deletedUsers.deletedCount} user records`);

    console.log('✅ Database cleared successfully!');
    console.log('📝 All health logs have been removed to accommodate the new simplified structure');
    console.log('👤 User accounts are preserved - users can log in with existing credentials');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
clearHealthData();
