#!/usr/bin/env node

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

// This schema must be kept in sync with src/models/User.ts
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
      enum: ["admin", "writer", "none"],
      required: true,
      default: "none",
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
      default: "",
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

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function syncTeamData() {
  try {
    // 1. Read and parse the JSON file
    const jsonPath = path.join(
      __dirname,
      "..",
      "public",
      "data",
      "constellation.json"
    );
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    console.log("✅ Successfully read constellation.json");

    // 2. Consolidate User Data
    const consolidatedUsers = {};
    for (const constellationName in jsonData) {
      const constellation = jsonData[constellationName];
      for (const starName in constellation.stars) {
        const star = constellation.stars[starName];
        if (!star.clickable || !star.email) {
          continue;
        }

        const email = star.email.toLowerCase();
        if (!consolidatedUsers[email]) {
          consolidatedUsers[email] = {
            email: email,
            name: star.name,
            avatar: star.photo ? star.photo : "",
            bio: star.desc,
            linkedin: star.linkedin,
            designations: [],
          };
        }
        if (
          star.designation &&
          !consolidatedUsers[email].designations.includes(star.designation)
        ) {
          consolidatedUsers[email].designations.push(star.designation);
        }
      }
    }
    console.log(
      `👥 Found ${
        Object.keys(consolidatedUsers).length
      } unique team members to process.`
    );

    // 3. Determine Role
    for (const email in consolidatedUsers) {
      const user = consolidatedUsers[email];
      let role = "none"; // Default role
      const isLeadOrCoordinator = user.designations.some(
        (d) =>
          d.toLowerCase().includes("co-ordinator") ||
          d.toLowerCase().includes("lead")
      );
      // const isMember = user.designations.some(d => d.toLowerCase().includes('member'));

      if (isLeadOrCoordinator) {
        role = "admin";
      }
      user.role = role;
    }
    console.log("👑 Determined roles for all users.");

    // 4. Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI environment variable is not set");
      process.exit(1);
    }
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // 5. Update or Create Users
    console.log("🚀 Starting database sync...");
    let updatedCount = 0;
    let createdCount = 0;

    for (const email in consolidatedUsers) {
      const userData = consolidatedUsers[email];
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        await User.updateOne({ email: email }, { $set: userData });
        updatedCount++;
        console.log(`  - Updated: ${userData.name} (${email})`);
      } else {
        await User.create(userData);
        createdCount++;
        console.log(`  - Created: ${userData.name} (${email})`);
      }
    }

    console.log("\n--- Sync Summary ---");
    console.log(`Users Updated: ${updatedCount}`);
    console.log(`Users Created: ${createdCount}`);
    console.log("✨ Team sync complete!");
  } catch (error) {
    console.error("❌ An error occurred during the sync process:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed.");
  }
}

syncTeamData();
