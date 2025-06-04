export interface BlogAuthor {
  email: string;
  // These fields will be populated dynamically from User model
  name?: string;
  avatar?: string;
  bio?: string;
}

export interface Blog {
  _id?: string;
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
  likedBy?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BlogFilters {
  search: string;
  tags: string[];
  sortBy: 'latest' | 'oldest' | 'popular' | 'most-liked';
}