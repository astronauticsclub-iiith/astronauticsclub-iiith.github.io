import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { populateAuthorDetails } from "@/app/blogs/helper";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const tags = searchParams.get("tags") || "";
    const sortBy = searchParams.get("sortBy") || "latest";
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    // Build query
    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { "author.name": { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (tags) {
      const tagArray = tags.split(",").filter((tag) => tag.trim());
      if (tagArray.length > 0) {
        query.tags = { $in: tagArray };
      }
    }

    // Build sort
    let sort: Record<string, 1 | -1> = {};
    switch (sortBy) {
      case "latest":
        sort = { publishedAt: -1 };
        break;
      case "oldest":
        sort = { publishedAt: 1 };
        break;
      case "popular":
        sort = { views: -1 };
        break;
      case "most-liked":
        sort = { likes: -1 };
        break;
      default:
        sort = { publishedAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(query).sort(sort).skip(skip).limit(limit).lean(),
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
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}