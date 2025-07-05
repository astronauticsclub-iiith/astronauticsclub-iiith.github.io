import mongoose, { Schema, Document } from 'mongoose';
import { Blog as BlogInterface } from '@/types/blog';

export interface BlogDocument extends Omit<BlogInterface, '_id' | 'id'>, Document {
  _id: mongoose.Types.ObjectId;
  id: string;
}

const BlogSchema = new Schema<BlogDocument>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  author: { email: { type: String, required: true } },
  publishedAt: { type: String, required: true },
  readTime: { type: Number, required: true },
  tags: [{ type: String, required: true }],
  images: [{ type: String }],
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
}, {
  timestamps: true,
});

// Create indexes for better performance (slug index already defined in schema)
BlogSchema.index({ tags: 1 });
BlogSchema.index({ publishedAt: -1 });
BlogSchema.index({ views: -1 });
BlogSchema.index({ likes: -1 });

// Prevent recompilation during development
const Blog = mongoose.models.Blog || mongoose.model<BlogDocument>('Blog', BlogSchema);

export default Blog;