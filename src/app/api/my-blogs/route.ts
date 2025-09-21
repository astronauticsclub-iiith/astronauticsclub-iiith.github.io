import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import User from "@/models/User";
import { requireWriter } from "@/lib/auth";

// Helper function to populate author details
async function populateAuthorDetails(blogs: Array<Record<string, unknown>>) {
  const authorEmails = [
    ...new Set(blogs.map((blog) => (blog.author as { email: string }).email)),
  ];
  const authors = await User.find({ email: { $in: authorEmails } }).lean();

  const authorMap = new Map();
  authors.forEach((author) => {
    authorMap.set(author.email, {
      name: author.name || "Anonymous",
      avatar: author.avatar || `/team/default-avatar.svg`,
      bio: author.bio || "",
      email: author.email,
    });
  });

  return blogs.map((blog) => ({
    ...blog,
    author: authorMap.get((blog.author as { email: string }).email) || {
      name: "Anonymous",
      avatar: `/team/default-avatar.svg`,
      bio: "",
      email: (blog.author as { email: string }).email,
    },
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireWriter();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Find blogs authored by the current user
    const query = { "author.email": user.email };

    const [blogs, total] = await Promise.all([
      Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Blog.countDocuments(query),
    ]);

    // Populate author details
    const blogsWithAuthors = await populateAuthorDetails(
      blogs as Array<Record<string, unknown>>
    );

    // Calculate stats
    const totalViews = await Blog.aggregate([
      { $match: query },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);

    const totalLikes = await Blog.aggregate([
      { $match: query },
      { $group: { _id: null, totalLikes: { $sum: "$likes" } } },
    ]);

    return NextResponse.json({
      blogs: blogsWithAuthors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalBlogs: total,
        totalViews: totalViews[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch your blogs" },
      { status: 500 }
    );
  }
}
