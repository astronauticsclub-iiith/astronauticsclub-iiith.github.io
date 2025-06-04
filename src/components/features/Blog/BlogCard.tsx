"use client";

import { motion } from "framer-motion";
import { Heart, Eye, Calendar, ArrowUpRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/types/blog";

interface BlogCardProps {
  blog: Blog;
  variant?: "default" | "showcase";
  className?: string;
}

const BlogCard = ({
  blog,
  variant = "default",
  className = "",
}: BlogCardProps) => {
  const likes = blog.likes;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCount = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + "B";
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  if (variant === "showcase") {
    return (
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        className={`
            flex-shrink-0 w-80 bg-background border-4 border-white 
            hover:shadow-[8px_8px_0px_0px_rgba(220,220,220,1)]
            transition-all duration-200
            ${className}
          `}
      >
        <Link href={`/blogs/${blog.slug}`} className="block cursor-open">
          {/* Image */}
          {blog.images.length > 0 && (
            <div className="relative h-48 overflow-hidden border-b-4 border-white">
              <Image
                src={blog.images[0]}
                alt={blog.title}
                width={320}
                height={192}
                className="w-full h-full object-cover"
              />

              {/* Read time badge */}
              <div className="absolute top-4 right-4 bg-white text-background font-bold px-3 py-1 flex items-center gap-1">
                <Clock size={14} />
                {blog.readTime}m
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <h3 className="font-bold text-xl mb-2 uppercase tracking-tight line-clamp-2 text-white">
              {blog.title}
            </h3>
            <div className="h-1 bg-white w-16 mb-4"></div>

            <p className="text-[#e0e0e0] text-sm mb-6 line-clamp-2 font-medium">
              {blog.excerpt}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Eye size={14} className="text-white" />
                  <span className="text-white">{formatCount(blog.views)}</span>
                </div>
                <div className="flex items-center gap-1 text-[#e0e0e0]">
                  <Heart size={14} />
                  {formatCount(likes)}
                </div>
              </div>

              <div className="w-8 h-8 bg-white flex items-center justify-center">
                <ArrowUpRight size={16} className="text-background" />
              </div>
            </div>

            {/* Date */}
            <div className="mt-4 text-xs font-medium text-[#e0e0e0]">
              {formatDate(blog.publishedAt)}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default variant (for full blogs page)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className={`
          bg-background border-4 border-white
          hover:shadow-[12px_12px_0px_0px_rgba(220,220,220,1)]
          transition-all duration-200 h-full
          ${className}
        `}
    >
      <Link href={`/blogs/${blog.slug}`} className="block cursor-open h-full">
        <div className="grid sm:grid-cols-5 h-full">
          {/* Image section */}
          {blog.images.length > 0 && (
            <div className="relative sm:col-span-2 h-56 sm:h-auto border-b-4 sm:border-b-0 sm:border-r-4 border-white overflow-hidden">
              <Image
                src={blog.images[0]}
                alt={blog.title}
                width={640}
                height={360}
                className="w-full h-full object-cover"
              />

              {/* Read time badge */}
              <div className="absolute top-4 right-4 bg-white text-background font-bold px-3 py-2 flex items-center gap-1">
                <Clock size={16} />
                {blog.readTime}m
              </div>
            </div>
          )}

          {/* Content section */}
          <div className="p-6 sm:col-span-3 h-full flex flex-col justify-between">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white text-background text-xs font-bold uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h2 className="font-bold text-2xl uppercase tracking-tight mb-2 text-white">
              {blog.title}
            </h2>
            <div className="h-1 bg-white w-24 mb-4"></div>

            <p className="text-[#e0e0e0] mb-6 line-clamp-3 font-medium">
              {blog.excerpt}
            </p>

            {/* Author & Date */}
            <div className="flex items-center gap-3 mb-4 border-t-2 border-white pt-4">
              <div className="w-12 h-12 border-2 border-white overflow-hidden bg-white">
                {blog.author.avatar ? (
                  <Image
                    src={blog.author.avatar}
                    alt={blog.author.name || "Author"}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-background flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {blog.author.name?.charAt(0)?.toUpperCase() || "A"}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <p className="font-bold text-white">
                  {blog.author.name || "Anonymous"}
                </p>
                <div className="flex items-center gap-1 text-sm text-[#e0e0e0] font-medium">
                  <Calendar size={12} />
                  {formatDate(blog.publishedAt)}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm font-medium">
                <div className="flex items-center gap-1">
                  <Eye size={16} className="text-white" />
                  <span className="text-white">{formatCount(blog.views)}</span>
                </div>

                <div className="flex items-center gap-1 text-[#e0e0e0]">
                  <Heart size={16} />
                  {formatCount(likes)}
                </div>
              </div>

              <div className="w-10 h-10 bg-white flex items-center justify-center">
                <ArrowUpRight size={20} className="text-background" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BlogCard;
