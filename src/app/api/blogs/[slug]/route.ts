import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Blog } from '@/types/blog';

const BLOGS_FILE_PATH = path.join(process.cwd(), 'src/data/blogs.json');

async function readBlogsFile(): Promise<Blog[]> {
  try {
    const data = await fs.readFile(BLOGS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading blogs file:', error);
    return [];
  }
}

async function writeBlogsFile(blogs: Blog[]): Promise<void> {
  try {
    await fs.writeFile(BLOGS_FILE_PATH, JSON.stringify(blogs, null, 2));
  } catch (error) {
    console.error('Error writing blogs file:', error);
    throw error;
  }
}

// Atomic file operations using file locking mechanism
async function atomicBlogUpdate(slug: string, updateFn: (blog: Blog) => Blog): Promise<Blog | null> {
  const lockFile = path.join(process.cwd(), '.blog-lock');
  
  // Simple file-based locking mechanism
  let lockAcquired = false;
  let attempts = 0;
  const maxAttempts = 50;
  
  while (!lockAcquired && attempts < maxAttempts) {
    try {
      await fs.writeFile(lockFile, process.pid.toString(), { flag: 'wx' });
      lockAcquired = true;
    } catch {
      // Lock file exists, wait and retry
      await new Promise(resolve => setTimeout(resolve, 10));
      attempts++;
    }
  }
  
  if (!lockAcquired) {
    throw new Error('Could not acquire lock for atomic operation');
  }
  
  try {
    const blogs = await readBlogsFile();
    const blogIndex = blogs.findIndex(blog => blog.slug === slug);
    
    if (blogIndex === -1) {
      return null;
    }
    
    const updatedBlog = updateFn(blogs[blogIndex]);
    blogs[blogIndex] = updatedBlog;
    
    await writeBlogsFile(blogs);
    return updatedBlog;
  } finally {
    // Release the lock
    try {
      await fs.unlink(lockFile);
    } catch (error) {
      console.error('Error releasing lock:', error);
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blogs = await readBlogsFile();
    const blog = blogs.find(b => b.slug === slug);
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { action } = body;
    
    if (action === 'increment-views') {
      const updatedBlog = await atomicBlogUpdate(slug, (blog) => ({
        ...blog,
        views: blog.views + 1
      }));
      
      if (!updatedBlog) {
        return NextResponse.json(
          { error: 'Blog not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ views: updatedBlog.views });
    } else if (action === 'toggle-like') {
      const { increment } = body;
      
      const updatedBlog = await atomicBlogUpdate(slug, (blog) => ({
        ...blog,
        likes: Math.max(0, blog.likes + (increment ? 1 : -1))
      }));
      
      if (!updatedBlog) {
        return NextResponse.json(
          { error: 'Blog not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ likes: updatedBlog.likes });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}