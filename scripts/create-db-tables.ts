import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import Event from "@/models/Event"
import User from "@/models/User"
import Blog from "@/models/Blog"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function createDatabaseTable(){
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

        // Team members
        await User.createCollection();
        console.log("Created user collection in MongoDB")

        // Blogs
        await Blog.createCollection();
        console.log("Created blog collection in MongoDB")

        // Event
        await Event.createCollection();
        console.log("Created event collection in MongoDB")
    }
    catch (error: unknown) {
        if (error instanceof Error) {
            console.error('❌ Error creating DB tables:', error.message);
        }
        process.exit(1);
    } 
    finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

createDatabaseTable()