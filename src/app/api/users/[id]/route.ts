import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";
import Logger from "@/lib/logger";
import fs from "fs";
import path from "path";

const FILE_DIRECTORY = process.env.FILE_DIRECTORY || path.join(process.cwd(), "public/")

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await requireAdmin();
    await connectToDatabase();

    const userData = await request.json();
    const { name, role, designations } = userData;

    if (role && !["admin", "writer", "none"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    const { id } = await params;

    if (id === adminUser.id) {
        if (role !== undefined || designations !== undefined) {
            return NextResponse.json(
                { error: "Admins cannot change their own role or designations." },
                { status: 403 }
            );
        }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (designations !== undefined) updateData.designations = designations;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add in constellation.json
    // const jsonPath = path.join("/var/data/astronautics", "constellation.json");
    // const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    // for (const constellationName in jsonData) 
    // {
    //   const constellation = jsonData[constellationName];
    //   if (!user.designation.includes(constellation.team)) continue;

    //   // Star with highest magnitude and which is not clickable
    //   const starEntries = Object.entries(constellation.stars).filter(([_, star]) => !star.clickable);
    //   const [starName, starObj] = starEntries.reduce((max, curr) =>
    //     curr[1].magnitude > max[1].magnitude ? curr : max
    //   );

    //   constellation.stars[starName] = {
    //     ...starObj,          // keep existing properties
    //     clickable: true,     // make it clickable
    //     name: name,    // add/update new properties
    //     photo: "",
    //     designation: constellation.team,
    //     desc: "",
    //     email: email,
    //     linkedin: ""
    //   };
    // }
    // fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

    // Log the action
    Logger.logWriteOperation(
      "UPDATE_USER",
      adminUser.email!,
      "user",
      user._id.toString(),
      { email: user.email, updatedFields: updateData }
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await requireAdmin();
    await connectToDatabase();
    
    const { id } = await params;
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Deleting the user avatar
    const avatarFilename = user.avatar; 
    if (avatarFilename) {
      const filePath = path.join(FILE_DIRECTORY, avatarFilename); // server path
      fs.unlink(filePath, (error) => {
          if (error) console.error(error);
        });
    };

    await User.findByIdAndDelete(id);

    // Delete from constellation.json
    const keysToRemove = ["photo", "email", "name", "designation", "desc", "linkedin"];
    const jsonPath = path.join("/var/data/astronautics", "constellation.json");
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    for (const constellationName in jsonData) 
    {
      const constellation = jsonData[constellationName];
      for (const starName in constellation.stars) 
        {
          const star = constellation.stars[starName];
          if (star.clickable && star.email == user.email){
            keysToRemove.forEach((key) => {
              if (key in star) {
                delete star[key];
              }
            });
            star.clickable = false;
          }
      }
    }
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

    // Log the action
    Logger.logWriteOperation(
      "DELETE_USER",
      adminUser.email!,
      "user",
      user._id.toString(),
      { email: user.email }
    );

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
