#!/usr/bin/env node

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Define the NEW User schema for updating
// This should match your updated src/models/User.ts
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
    designations: {
      type: [String],
      default: [],
    },
    avatar: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    linkedin: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users'); // 'users' is the collection name

async function addLinkedInToUsers() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.log('Please ensure your .env.local file contains MONGODB_URI.');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🚀 Starting user linkedin field migration...');

    const users = await mongoose.connection.collection('users').find({}).toArray();

    if (users.length === 0) {
      console.log('No users found in the database. Migration complete (no users to update).');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const userDoc of users) {
      if (userDoc.linkedin !== undefined) {
        console.log(`  User ${userDoc.email} already has a linkedin field. Skipping.`);
        skippedCount++;
        continue;
      }

      try {
        await User.findByIdAndUpdate(
          userDoc._id,
          { $set: { linkedin: '' } },
          { new: true, runValidators: true }
        );
        console.log(`  ✅ Added linkedin field to user ${userDoc.email}`);
        updatedCount++;
      } catch (updateError) {
        console.error(`  ❌ Failed to update user ${userDoc.email}: ${updateError.message}`);
      }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`Total Users Processed: ${users.length}`);
    console.log(`Users Updated: ${updatedCount}`);
    console.log(`Users Skipped (already had field): ${skippedCount}`);
    console.log('✨ User linkedin field migration complete!');

  } catch (error) {
    console.error('❌ An error occurred during migration:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

addLinkedInToUsers();