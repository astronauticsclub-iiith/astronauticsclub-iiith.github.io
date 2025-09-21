import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import User from "@/models/User";
import { Blog as BlogInterface } from "@/types/blog";
import { requireWriter } from "@/lib/auth";
import Logger from "@/lib/logger";

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
      bio: author.bio || "Blog Author",
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

    return NextResponse.json({
      blogs: blogsWithAuthors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
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

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireWriter();
    await connectToDatabase();

    const blogData: Omit<BlogInterface, "_id" | "createdAt" | "updatedAt"> =
      await request.json();

    // Validate required fields
    const requiredFields = [
      "id",
      "title",
      "slug",
      "excerpt",
      "content",
      "author",
      "publishedAt",
      "readTime",
      "tags",
    ];
    for (const field of requiredFields) {
      if (!blogData[field as keyof typeof blogData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if blog with same id or slug already exists
    const existingBlog = await Blog.findOne({
      $or: [{ id: blogData.id }, { slug: blogData.slug }],
    });

    if (existingBlog) {
      return NextResponse.json(
        { error: "Blog with this ID or slug already exists" },
        { status: 409 }
      );
    }

    // Ensure the author email matches the authenticated user
    const blog = new Blog({
      ...blogData,
      author: {
        email: user.email,
      },
      views: blogData.views || 0,
      likes: blogData.likes || 0,
      likedBy: blogData.likedBy || [],
    });

    await blog.save();

    // Populate author details for response
    const savedBlog = await populateAuthorDetails([blog.toObject()]);

    // Log the action
    Logger.logWriteOperation(
      "CREATE_BLOG",
      user.email,
      "blog",
      blog._id.toString(),
      { title: blog.title, slug: blog.slug }
    );

    return NextResponse.json(savedBlog[0], { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
