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

const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users'); // 'users' is the collection name

async function migrateUserRoles() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.log('Please ensure your .env.local file contains MONGODB_URI.');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🚀 Starting user role migration...');

    const users = await mongoose.connection.collection('users').find({}).toArray();

    if (users.length === 0) {
      console.log('No users found in the database. Migration complete (no users to update).');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const userDoc of users) {
      const oldRoles = userDoc.roles || [];
      let newRole = 'none';

      if (oldRoles.includes('admin')) {
        newRole = 'admin';
      } else if (oldRoles.includes('writer')) {
        newRole = 'writer';
      }

      // Check if the user already has the new 'role' field and if it matches
      // This handles cases where the script might be run multiple times or some users were already updated
      if (userDoc.role === newRole && userDoc.roles === undefined) {
        console.log(`  User ${userDoc.email} already compatible. Skipping.`);
        skippedCount++;
        continue;
      }

      try {
        // Use the Mongoose model to update, which will apply schema validation
        await User.findByIdAndUpdate(
          userDoc._id,
          { $set: { role: newRole }, $unset: { roles: "" } }, // Set new role, unset old roles array
          { new: true, runValidators: true } // Return updated doc, run schema validators
        );
        console.log(`  ✅ Updated user ${userDoc.email}: Old roles [${oldRoles.join(', ') || 'None'}] -> New role '${newRole}'`);
        updatedCount++;
      } catch (updateError) {
        console.error(`  ❌ Failed to update user ${userDoc.email}: ${updateError.message}`);
      }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`Total Users Processed: ${users.length}`);
    console.log(`Users Updated: ${updatedCount}`);
    console.log(`Users Skipped (already compatible): ${skippedCount}`);
    console.log('✨ User role migration complete!');

  } catch (error) {
    console.error('❌ An error occurred during migration:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

migrateUserRoles();
