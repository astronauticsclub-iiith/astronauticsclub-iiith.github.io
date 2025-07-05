export interface Blog {
  _id?: string;
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    email: string;
    name?: string;
    avatar?: string;
    bio?: string;
  };
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