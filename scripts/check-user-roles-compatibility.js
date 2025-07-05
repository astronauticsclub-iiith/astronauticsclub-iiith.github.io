#!/usr/bin/env node

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Define a temporary schema for reading old user data
// This is crucial because the User model has already been updated.
// We need to read the data as it was before the schema change.
const OldUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    roles: { type: [String], enum: ['admin', 'writer'], default: [] }, // Old roles field
    avatar: { type: String },
    bio: { type: String },
  },
  {
    timestamps: true,
  }
);

const OldUser = mongoose.models.OldUser || mongoose.model('OldUser', OldUserSchema, 'users'); // 'users' is the collection name

async function checkUserRolesCompatibility() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.log('Please ensure your .env.local file contains MONGODB_URI.');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Fetching all users to check role compatibility...');
    const users = await OldUser.find({});

    if (users.length === 0) {
      console.log('No users found in the database.');
      return;
    }

    console.log('\n--- User Role Compatibility Report ---');
    let compatibleCount = 0;
    let needsUpdateCount = 0;

    for (const user of users) {
      const oldRoles = user.roles || [];
      let newProposedRole = 'none';
      let compatibilityStatus = 'Compatible';
      let notes = '';

      if (oldRoles.includes('admin')) {
        newProposedRole = 'admin';
        if (oldRoles.includes('writer')) {
          notes = ' (Old roles included both "admin" and "writer". "admin" takes precedence.)';
          compatibilityStatus = 'Needs Update (Admin precedence)';
        }
      } else if (oldRoles.includes('writer')) {
        newProposedRole = 'writer';
      } else if (oldRoles.length === 0) {
        newProposedRole = 'none';
        notes = ' (Old roles were empty. Defaulting to "none".)';
      } else {
        // This case should ideally not happen if enum was strictly enforced
        newProposedRole = 'none';
        notes = ` (Old roles contained unexpected values: ${oldRoles.join(', ')}. Defaulting to "none".)`;
        compatibilityStatus = 'Needs Update (Unexpected old roles)';
      }

      console.log(`\nUser Email: ${user.email}`);
      console.log(`  Old Roles: [${oldRoles.length > 0 ? oldRoles.join(', ') : 'None'}]`);
      console.log(`  Proposed New Role: '${newProposedRole}'`);
      console.log(`  Compatibility Status: ${compatibilityStatus}${notes}`);

      if (compatibilityStatus.startsWith('Needs Update')) {
        needsUpdateCount++;
      } else {
        compatibleCount++;
      }
    }

    console.log('\n--- Summary ---');
    console.log(`Total Users: ${users.length}`);
    console.log(`Users Compatible (no change needed for role logic): ${compatibleCount}`);
    console.log(`Users Needing Update (role will change based on new logic): ${needsUpdateCount}`);
    console.log('\nRecommendation: Review the "Proposed New Role" for each user. If the proposed role is acceptable, you can proceed with a migration script to update the database.');

  } catch (error) {
    console.error('❌ An error occurred:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

checkUserRolesCompatibility();