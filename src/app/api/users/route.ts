import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";
import Logger from "@/lib/logger";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const users = await User.find({}).sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user: adminUser } = await requireAdmin();
    await connectToDatabase();

    const userData = await request.json();
    const { email, name, role } = userData;

    if (!email || !role || !name) {
      return NextResponse.json(
        { error: "Name, email and role are required" },
        { status: 400 }
      );
    }

    if (!["admin", "writer", "none"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const user = new User({
      email,
      name,
      role,
    });

    // Add the user to constellation.json
    const jsonPath = path.join("/var/data/astronautics", "constellation.json");
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    let starName : string = "", constellationName : string = "", magnitude : number = 10;
    for (const c in jsonData) {
      const constellation = jsonData[c];
      for (const s in constellation.stars){
        if (constellation.stars[s].magnitude < magnitude){
          starName = s;
          constellationName = c;
          magnitude = constellation.stars[s].magnitude;
        }
      }
    }

    if (constellationName && starName){
      jsonData[constellationName].stars[starName]["email"]=user.email;
      jsonData[constellationName].stars[starName]["clickable"]=true;
    }

    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    await user.save();

    // Log the action
    Logger.logWriteOperation(
      "CREATE_USER",
      adminUser.email!,
      "user",
      user._id.toString(),
      { email, role }
    );

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}