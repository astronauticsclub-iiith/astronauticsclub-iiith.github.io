import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import User from "@/models/User";
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
      avatar: author.avatar || `/team/default-avatar.png`,
      bio: author.bio || "Blog Author",
      email: author.email,
    });
  });

  return blogs.map((blog) => ({
    ...blog,
    author: authorMap.get((blog.author as { email: string }).email) || {
      name: "Anonymous",
      avatar: `/team/default-avatar.png`,
      bio: "Blog Author",
      email: (blog.author as { email: string }).email,
    },
  }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();

    const { slug } = await params;
    const blog = await Blog.findOne({ slug }).lean();

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Populate author details
    const blogWithAuthor = await populateAuthorDetails([
      blog as Record<string, unknown>,
    ]);

    return NextResponse.json(blogWithAuthor[0]);
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { action, userId } = body;

    const { slug } = await params;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    switch (action) {
      case "increment_view":
        blog.views = (blog.views || 0) + 1;
        await blog.save();
        return NextResponse.json({ views: blog.views });

      case "toggle_like":
        if (!userId) {
          return NextResponse.json(
            { error: "User ID required for like action" },
            { status: 400 }
          );
        }

        const likedBy = blog.likedBy || [];
        const hasLiked = likedBy.includes(userId as string);

        if (hasLiked) {
          // Unlike
          blog.likedBy = likedBy.filter((id: string) => id !== userId);
          blog.likes = Math.max(0, (blog.likes || 0) - 1);
        } else {
          // Like
          blog.likedBy = [...likedBy, userId];
          blog.likes = (blog.likes || 0) + 1;
        }

        await blog.save();

        return NextResponse.json({
          likes: blog.likes,
          hasLiked: !hasLiked,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { user } = await requireWriter();
    await connectToDatabase();

    const blogData = await request.json();

    // Find the blog first to check ownership
    const { slug } = await params;
    const existingBlog = await Blog.findOne({ slug });

    if (!existingBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Check if user owns this blog or is admin
    if (
      user.role !== "admin" &&
      (existingBlog.author as { email: string }).email !== user.email
    ) {
      return NextResponse.json(
        { error: "Not authorized to edit this blog" },
        { status: 403 }
      );
    }

    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $set: blogData },
      { new: true, runValidators: true }
    ).lean();

    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found after update" },
        { status: 404 }
      );
    }

    // Populate author details
    const blogWithAuthor = await populateAuthorDetails([
      blog as Record<string, unknown>,
    ]);

    // Log the action
    const blogRecord = blog as Record<string, unknown>;
    Logger.logWriteOperation(
      "UPDATE_BLOG",
      user.email,
      "blog",
      (blogRecord._id as { toString: () => string }).toString(),
      {
        title: blogRecord.title,
        slug: blogRecord.slug,
        updatedFields: Object.keys(blogData),
      }
    );

    return NextResponse.json(blogWithAuthor[0]);
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { user } = await requireWriter();
    await connectToDatabase();

    // Find the blog first to check ownership
    const { slug } = await params;
    const existingBlog = await Blog.findOne({ slug });

    if (!existingBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Check if user owns this blog or is admin
    if (
      user.role !== "admin" &&
      (existingBlog.author as { email: string }).email !== user.email
    ) {
      return NextResponse.json(
        { error: "Not authorized to delete this blog" },
        { status: 403 }
      );
    }

    await Blog.findOneAndDelete({ slug });

    // Log the action
    const existingBlogRecord = existingBlog as Record<string, unknown>;
    Logger.logWriteOperation(
      "DELETE_BLOG",
      user.email,
      "blog",
      (existingBlogRecord._id as { toString: () => string }).toString(),
      { title: existingBlogRecord.title, slug: existingBlogRecord.slug }
    );

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
