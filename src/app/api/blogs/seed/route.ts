import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import blogsData from '@/data/blogs.json';
import { Blog as BlogInterface } from '@/types/blog';

export async function POST(request: NextRequest) {
  try {
    // Check if this is development or if a special header is provided
    const authHeader = request.headers.get('x-seed-auth');
    if (process.env.NODE_ENV === 'production' && authHeader !== process.env.SEED_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Clear existing blogs
    await Blog.deleteMany({});

    // Transform and insert blog data
    const transformedBlogs = (blogsData as BlogInterface[]).map(blog => ({
      ...blog,
      likedBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const insertedBlogs = await Blog.insertMany(transformedBlogs);

    return NextResponse.json({
      message: 'Blogs seeded successfully',
      count: insertedBlogs.length,
      blogs: insertedBlogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
      })),
    });

  } catch (error) {
    console.error('Error seeding blogs:', error);
    return NextResponse.json(
      { error: 'Failed to seed blogs' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Blog seeding endpoint. Use POST to seed data.',
    note: 'This endpoint clears all existing blogs and recreates them from the JSON file.',
  });
}