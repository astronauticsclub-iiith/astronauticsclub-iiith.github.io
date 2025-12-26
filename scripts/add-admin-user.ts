#!/usr/bin/env node
import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import User from "@/models/User";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function addAdminUser() {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI environment variable is not set");
      console.log("Please create a .env.local file with your MongoDB connection string");
      process.exit(1);
    }

    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const adminEmail = "mohit.singh@research.iiit.ac.in";

    // Check if user already exists
    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      console.log("👤 User already exists:");
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name || "Not set"}`);
      console.log(`   Role: ${existingUser.role || "Not set"}`);
      console.log(`   Bio: ${existingUser.bio || "Not set"}`);
      console.log(`   Created: ${existingUser.createdAt}`);

      // Update existing user to have admin role if they don't already
      if (existingUser.role !== "admin") {
        existingUser.role = "admin";
        await existingUser.save();
        console.log(`✅ Set user role to admin.`);
      }
      return;
    }

    // Create new admin user
    const newUser = new User({
      email: adminEmail,
      name: "Mohit Singh",
      role: "admin", // Set role to admin
      bio: "Web Dev Team",
    });

    const savedUser = await newUser.save();

    console.log("🎉 Admin user created successfully!");
    console.log(`   Email: ${savedUser.email}`);
    console.log(`   Name: ${savedUser.name}`);
    console.log(`   Role: ${savedUser.role}`);
    console.log(`   Bio: ${savedUser.bio}`);
    console.log(`   User ID: ${savedUser._id}`);
    console.log(`   Created: ${savedUser.createdAt}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Error creating admin user:", error.message);
      const e: any = error;
      if (e.code === 11000) {
        console.log("🔍 Duplicate key error — user may already exist");
      }
    } else {
      console.error("❌ Unknown error:", error);
    }

    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the script
addAdminUser();
