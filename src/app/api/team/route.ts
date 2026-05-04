import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

// Returns only the fields required by the team page, no authentication required
export async function GET() {
    try {
        await connectToDatabase();
        // Select only the fields needed for the team page
        const users = await User.find(
            {},
            {
                _id: 0,
                name: 1,
                email: 1,
                avatar: 1,
                designations: 1,
                bio: 1,
                linkedin: 1,
            }
        ).sort({ name: 1 });
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching team members:", error);
        return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
    }
}
