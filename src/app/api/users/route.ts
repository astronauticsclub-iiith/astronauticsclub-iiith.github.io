import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import Logger from '@/lib/logger';

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const users = await User.find({}).sort({ createdAt: -1 });

    return NextResponse.json(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user: adminUser } = await requireAdmin();
    await connectToDatabase();

    const userData = await request.json();
    const { email, name, roles } = userData;

    if (!email || !roles || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { error: 'Email and at least one role are required' },
        { status: 400 }
      );
    }

    const validRoles = roles.filter(role => ['admin', 'writer'].includes(role));
    if (validRoles.length !== roles.length) {
      return NextResponse.json(
        { error: 'All roles must be admin or writer' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const user = new User({
      email,
      name,
      roles: validRoles,
    });

    await user.save();

    // Log the action
    Logger.logWriteOperation(
      'CREATE_USER',
      adminUser.email!,
      'user',
      user._id.toString(),
      { email, roles: validRoles }
    );

    return NextResponse.json(user, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}