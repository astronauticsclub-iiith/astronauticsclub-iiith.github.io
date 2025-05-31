export interface BlogAuthor {
  name: string;
  avatar: string;
  bio: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: BlogAuthor;
  publishedAt: string;
  readTime: number;
  tags: string[];
  images: string[];
  views: number;
  likes: number;
}

export interface BlogFilters {
  search: string;
  tags: string[];
  sortBy: 'latest' | 'oldest' | 'popular' | 'most-liked';
}