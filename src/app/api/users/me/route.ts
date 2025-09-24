import { NextRequest, NextResponse } from "next/server";
import { requireWriter } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const { user } = await requireWriter();
    
    return NextResponse.json({
      id: user._id,
      email: user.email,
      linkedin: user.linkedin,
      name: user.name,
      role: user.role,
      designations: user.designations,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user } = await requireWriter();
    const body = await request.json();
    
    const { name, bio, linkedin } = body;
    
    // Validate input
    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json(
        { error: "Name must be a string" },
        { status: 400 }
      );
    }
    
    if (bio !== undefined && typeof bio !== 'string') {
      return NextResponse.json(
        { error: "Bio must be a string" },
        { status: 400 }
      );
    }
    
    if (linkedin !== undefined && typeof linkedin !== 'string') { // Add better string checking
      return NextResponse.json(
        { error: "Linkedin must be a string" },
        { status: 400 }
      );
    }

    // Update user profile
    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        ...(name !== undefined && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(linkedin !== undefined && { linkedin: linkedin.trim() })
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update in constellation.json
    const jsonPath = path.join("/var/data/astronautics", "constellation.json");
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    for (const constellationName in jsonData) 
    {
      const constellation = jsonData[constellationName];
      for (const starName in constellation.stars) 
        {
          const star = constellation.stars[starName];
          if (star.clickable && star.email == user.email){
            star.name = name;
            star.bio = bio;
            star.linkedin = linkedin;
            star.clickable = true;
          }
      }
    }
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

    return NextResponse.json({
      id: updatedUser._id,
      email: updatedUser.email,
      linkedin: updatedUser.linkedin,
      name: updatedUser.name,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}