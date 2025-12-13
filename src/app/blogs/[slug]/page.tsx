"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { markDownComponents } from "@/components/MarkdownEditor";
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/types/blog";
import { useImagePreview } from "@/context/ImagePreviewContext";
import { fetchBlogBySlug, incrementBlogViews, toggleBlogLike, generateUserId } from "@/lib/api";
import Loader from "@/components/ui/Loader";
import "@/components/ui/bg-patterns.css";
import { withBasePath, withUploadPath } from "@/components/common/HelperFunction";

const BlogPostPage = () => {
  const { openPreview } = useImagePreview();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [userId, setUserId] = useState<string>("");

  const params = useParams() as { slug: string };

  useEffect(() => {
    const loadBlog = async () => {
      setLoading(true);

      const slug = params.slug;

      try {
        const foundBlog = await fetchBlogBySlug(slug);
        setBlog(foundBlog);
        setLikes(foundBlog.likes);
        setViews(foundBlog.views);

        // Increment view count (only once per session)
        const viewKey = `blog_viewed_${slug}`;
        if (typeof window !== "undefined" && !sessionStorage.getItem(viewKey)) {
          await incrementBlogViews(slug);
          setViews(foundBlog.views + 1);
          sessionStorage.setItem(viewKey, "true");
        }
      } catch (error) {
        console.error("Failed to load blog:", error);
        notFound();
      }

      setLoading(false);
    };

    loadBlog();
  }, [params]);

  // Generate user ID on client side only
  useEffect(() => {
    const currentUserId = generateUserId();
    setUserId(currentUserId);
  }, []);

  // Update liked status when both blog and userId are available
  useEffect(() => {
    if (blog && userId) {
      const hasLiked = blog.likedBy?.includes(userId) || false;
      setLiked(hasLiked);
    }
  }, [blog, userId]);

  const handleLike = async () => {
    if (!userId || !blog) return;

    try {
      const result = await toggleBlogLike(blog.slug, userId);
      setLikes(result.likes);
      setLiked(result.hasLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleImageClick = (imageSrc: string) => {
    openPreview(imageSrc, blog?.title || "Blog image");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader fullscreen />
      </div>
    );
  }

  if (!blog) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background bg-pattern-topography pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-colors cursor-close"
          >
            <ArrowLeft size={16} />
            Back to Articles
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white text-background font-bold text-sm uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-white leading-tight">
            {blog.title}
          </h1>
          <div className="h-1 bg-white w-32 mb-6"></div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 text-[#e0e0e0] font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {formatDate(blog.publishedAt)}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              {blog.readTime} min read
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} />
              {formatCount(views)} {views === 1 ? "view" : "views"}
            </div>
          </div>
        </motion.div>

        {/* Content - Rendered Markdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
              components={markDownComponents}
            >
              {blog.content}
            </ReactMarkdown>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12 border-t-2 border-white pt-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 border-2 border-white font-bold transition-colors ${
                  liked ? "bg-[#d2042d]" : "text-white hover:bg-white hover:text-background"
                }`}
              >
                <Heart size={18} fill={liked ? "currentColor" : "none"} />
                {formatCount(likes)}
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: blog.title,
                      text: blog.excerpt,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-colors"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>
        </motion.div>

        {/* Author info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 border-4 border-white p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-white overflow-hidden">
              <Image
                src={
                  blog.author.avatar
                    ? withUploadPath(blog.author.avatar)
                    : withBasePath(`/default-avatar.svg`)
                }
                alt={blog.author.name || "Anonymous"}
                width={64}
                height={64}
                className="w-full h-full object-cover cursor-pointer cursor-open"
                unoptimized={!!blog.author.avatar}
                onClick={() =>
                  handleImageClick(
                    blog.author.avatar
                      ? withUploadPath(blog.author.avatar)
                      : withBasePath(`/default-avatar.svg`)
                  )
                }
              />
            </div>

            <div className="flex flex-col w-full h-full">
              <h3 className="font-bold text-xl text-white">{blog.author.name || "Anonymous"}</h3>
              <p className="text-[#e0e0e0] font-medium">{blog.author.bio}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPostPage;
