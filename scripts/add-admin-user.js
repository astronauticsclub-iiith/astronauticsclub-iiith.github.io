#!/usr/bin/env node

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// User schema definition (matching the TypeScript model)
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'writer', 'none'],
      required: true,
      default: 'none',
    },
    avatar: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      default: 'Blog Author',
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function addAdminUser() {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.log('Please create a .env.local file with your MongoDB connection string');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'mohit.singh@research.iiit.ac.in';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: adminEmail });
    
    if (existingUser) {
      console.log('👤 User already exists:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name || 'Not set'}`);
      console.log(`   Role: ${existingUser.role || 'Not set'}`);
      console.log(`   Bio: ${existingUser.bio || 'Not set'}`);
      console.log(`   Created: ${existingUser.createdAt}`);
      
      // Update existing user to have admin role if they don't already
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`✅ Set user role to admin.`);
      }
      return;
    }

    // Create new admin user
    const newUser = new User({
      email: adminEmail,
      name: 'Mohit Singh',
      role: 'admin', // Set role to admin
      bio: 'System Administrator and Content Creator'
    });

    const savedUser = await newUser.save();
    
    console.log('🎉 Admin user created successfully!');
    console.log(`   Email: ${savedUser.email}`);
    console.log(`   Name: ${savedUser.name}`);
    console.log(`   Role: ${savedUser.role}`);
    console.log(`   Bio: ${savedUser.bio}`);
    console.log(`   User ID: ${savedUser._id}`);
    console.log(`   Created: ${savedUser.createdAt}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('🔍 This might be a duplicate key error - user may already exist');
    }
    
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
addAdminUser();
