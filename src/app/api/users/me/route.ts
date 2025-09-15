import { NextRequest, NextResponse } from "next/server";
import { requireWriter } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

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
    
    const { name, bio } = body;
    
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
    
    // Update user profile
    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        ...(name !== undefined && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() })
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
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