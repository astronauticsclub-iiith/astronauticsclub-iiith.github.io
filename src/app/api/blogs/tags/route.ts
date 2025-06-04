import { NextResponse } from 'next/server';
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

export async function GET() {
  try {
    const blogs = await readBlogsFile();
    const tags = Array.from(new Set(blogs.flatMap(blog => blog.tags))).sort();
    
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}