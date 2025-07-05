import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";
import Logger from "@/lib/logger";

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
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
