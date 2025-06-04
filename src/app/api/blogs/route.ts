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


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const sortBy = searchParams.get('sortBy') || 'latest';
    
    let blogs = await readBlogsFile();
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      blogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchLower) ||
        blog.excerpt.toLowerCase().includes(searchLower) ||
        blog.author.name.toLowerCase().includes(searchLower) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Tags filter
    if (tags.length > 0) {
      blogs = blogs.filter(blog =>
        tags.some(tag => blog.tags.includes(tag))
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'latest':
        blogs.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case 'oldest':
        blogs.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
        break;
      case 'popular':
        blogs.sort((a, b) => b.views - a.views);
        break;
      case 'most-liked':
        blogs.sort((a, b) => b.likes - a.likes);
        break;
    }
    
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}