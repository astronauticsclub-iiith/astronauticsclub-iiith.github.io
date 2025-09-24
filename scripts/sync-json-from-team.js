// sync-json-from-data.d.ts
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

// If star is clickable but no matching email found
const keysToRemove = ["photo", "email", "name", "designation", "desc", "linkedin"];
function removeKeys(obj, keys = keysToRemove) {
  keys.forEach((key) => {
    if (key in obj) {
      delete obj[key];
    }
  });
  return obj; // returns the modified object
}

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

export async function syncJsonFromTeam() {
  try {
    // 1. Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI environment variable is not set");
      process.exit(1);
    }
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // 2. Fetch all users from the database
    console.log("👥 Fetching all users from the database...");
    const allUsers = await User.find({});
    const usersByEmail = allUsers.reduce((acc, user) => {
      acc[user.email.toLowerCase()] = user;
      return acc;
    }, {});
    console.log(`✅ Found ${allUsers.length} users in the database.`);

    // 3. Read the JSON file
    const jsonPath = path.join(
      "/var/data/astronautics",
      "constellation.json"
    );
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    console.log("✅ Successfully read constellation.json");

    // 4. Update JSON data from database
    console.log("🚀 Starting JSON sync from database...");
    let updatedEntries = 0;
    let entriesWithNoDbUser = 0;

    for (const constellationName in jsonData) {
      const constellation = jsonData[constellationName];
      for (const starName in constellation.stars) {
        const star = constellation.stars[starName];
        if (!star.clickable || !star.email) {
          continue;
        }

        const email = star.email.toLowerCase();
        const dbUser = usersByEmail[email];

        if (dbUser) {
          let updated = false;
          if (star.name !== dbUser.name) {
            star.name = dbUser.name;
            updated = true;
          }
          if (star.desc !== dbUser.bio) {
            star.desc = dbUser.bio;
            updated = true;
          }
          if (star.linkedin !== dbUser.linkedin) {
            star.linkedin = dbUser.linkedin;
            updated = true;
          }
          const dbAvatarFile = dbUser.avatar ? dbUser.avatar : "";
          if (star.photo !== dbAvatarFile) {
            star.photo = dbAvatarFile;
            updated = true;
          }
          
          if(updated) {
            console.log(`  - Updated: ${dbUser.name} (${email}) in JSON.`);
            updatedEntries++;
          }
        } 
        
        // Remove the userdata if no matching email
        else {
          keysToRemove.forEach((key) => {
            if (key in star) {
              delete star[key];
            }
          });
          star.clickable = false;
          entriesWithNoDbUser++;
          console.log(`  - Warning: No database user found for ${star.name} (${email}).`);
        }
      }
    }

    // 5. Write the updated JSON back to the file
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log("✅ Successfully wrote updated data to constellation.json");

    console.log("\n--- Sync Summary ---");
    console.log(`JSON entries updated: ${updatedEntries}`);
    console.log(`JSON entries with no matching DB user: ${entriesWithNoDbUser}`);
    console.log("✨ JSON sync complete!");
  } catch (error) {
    console.error("❌ An error occurred during the sync process:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed.");
  }
}

syncJsonFromTeam();