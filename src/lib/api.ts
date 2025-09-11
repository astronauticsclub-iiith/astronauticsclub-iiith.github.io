import { Blog, BlogFilters } from '@/types/blog';
import { Event, EventFilters, EventResponse } from '@/types/event';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export async function fetchBlogs(filters?: Partial<BlogFilters>, page = 1, limit = 10) {
  try {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${basePath}api/blogs?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
}

export async function fetchBlogBySlug(slug: string): Promise<Blog> {
  try {
    const response = await fetch(`${basePath}/api/blogs/${slug}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch blog');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }
}

export async function incrementBlogViews(slug: string): Promise<{ views: number }> {
  try {
    const response = await fetch(`${basePath}/api/blogs/${slug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'increment_view',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to increment views');
    }

    return await response.json();
  } catch (error) {
    console.error('Error incrementing views:', error);
    throw error;
  }
}

export async function toggleBlogLike(
  slug: string, 
  userId: string
): Promise<{ likes: number; hasLiked: boolean }> {
  try {
    const response = await fetch(`${basePath}/api/blogs/${slug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'toggle_like',
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

export async function createBlog(blogData: Omit<Blog, '_id' | 'createdAt' | 'updatedAt'>): Promise<Blog> {
  try {
    const response = await fetch(`${basePath}/api/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      throw new Error('Failed to create blog');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
}

export async function updateBlog(slug: string, blogData: Partial<Blog>): Promise<Blog> {
  try {
    const response = await fetch(`${basePath}/api/blogs/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      throw new Error('Failed to update blog');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
}

export async function deleteBlog(slug: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${basePath}/api/blogs/${slug}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete blog');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
}

// Generate a unique user ID for anonymous users (for likes tracking)
export function generateUserId(): string {
  // Check if we're on the client side
  if (typeof window === 'undefined') return '';
  
  const stored = localStorage.getItem('anonymous_user_id');
  if (stored) return stored;
  
  const newId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  localStorage.setItem('anonymous_user_id', newId);
  return newId;
}

// Events API functions
export async function fetchEvents(filters?: Partial<EventFilters>, page = 1, limit = 50): Promise<EventResponse> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type && filters.type.length > 0) params.append('type', filters.type.join(','));
    if (filters?.status && filters.status.length > 0) params.append('status', filters.status.join(','));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`/api/events?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

export async function createEvent(eventData: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
  try {
    const response = await fetch(`/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error('Failed to create event');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}