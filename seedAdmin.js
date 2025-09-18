const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

// Admin credentials
const adminCredentials = {
  username: 'admin@baitalwahda.com',
  password: 'Bait@2024UAE#',
};

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: adminCredentials.username });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.username);
      process.exit(0);
    }

    // Create new admin user
    const admin = new User({
      username: adminCredentials.username,
      password: adminCredentials.password,
    });

    await admin.save();
    console.log('Admin user created successfully:', admin.username);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();
