"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/types/blog";
import { useImagePreview } from "@/context/ImagePreviewContext";
import Loader from "@/components/ui/Loader";
import "@/components/ui/bg-patterns.css";

const BlogPostPage = () => {
  const { openPreview } = useImagePreview();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const params = useParams() as { slug: string };

  useEffect(() => {
    const loadBlog = async () => {
      setLoading(true);

      const slug = params.slug;

      try {
        // Fetch blog data
        const response = await fetch(`/api/blogs/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch blog');
        }
        
        const foundBlog = await response.json();
        setBlog(foundBlog);
        setLikes(foundBlog.likes);
        setViews(foundBlog.views);

        // Check if user has already liked this blog from cookie
        const likedBlogs = document.cookie
          .split("; ")
          .find((row) => row.startsWith("liked_blogs="))
          ?.split("=")[1];

        if (likedBlogs) {
          const likedArray = JSON.parse(decodeURIComponent(likedBlogs));
          setLiked(likedArray.includes(slug));
        }

        // Increment view count
        try {
          const viewResponse = await fetch(`/api/blogs/${slug}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'increment-views' }),
          });
          
          if (viewResponse.ok) {
            const { views: newViews } = await viewResponse.json();
            setViews(newViews);
          }
        } catch (error) {
          console.error('Error incrementing view count:', error);
        }
      } catch (error) {
        console.error('Error loading blog:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [params]);

  const handleLike = async () => {
    const likedBlogs = document.cookie
      .split("; ")
      .find((row) => row.startsWith("liked_blogs="))
      ?.split("=")[1];

    let likedArray: string[] = [];
    if (likedBlogs) {
      likedArray = JSON.parse(decodeURIComponent(likedBlogs));
    }

    const wasLiked = liked;
    const increment = !wasLiked;

    // Optimistic update
    if (wasLiked) {
      setLikes(likes - 1);
      setLiked(false);
      likedArray = likedArray.filter((slug) => slug !== params.slug);
    } else {
      setLikes(likes + 1);
      setLiked(true);
      likedArray.push(params.slug);
    }

    // Save to cookie
    document.cookie = `liked_blogs=${encodeURIComponent(
      JSON.stringify(likedArray)
    )}; path=/; max-age=${60 * 60 * 24 * 365}`;

    // Update server
    try {
      const response = await fetch(`/api/blogs/${params.slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'toggle-like',
          increment 
        }),
      });
      
      if (response.ok) {
        const { likes: newLikes } = await response.json();
        setLikes(newLikes);
      } else {
        // Revert optimistic update on error
        if (wasLiked) {
          setLikes(likes + 1);
          setLiked(true);
        } else {
          setLikes(likes - 1);
          setLiked(false);
        }
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update on error
      if (wasLiked) {
        setLikes(likes + 1);
        setLiked(true);
      } else {
        setLikes(likes - 1);
        setLiked(false);
      }
    }
  };

  const handleImageClick = (imageSrc: string) => {
    openPreview(imageSrc, blog?.title || "Blog image");
  };

  const nextImage = () => {
    if (blog && blog.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % blog.images.length);
    }
  };

  const prevImage = () => {
    if (blog && blog.images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + blog.images.length) % blog.images.length
      );
    }
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
              {formatCount(views)} views
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
                src={blog.author.avatar}
                alt={blog.author.name}
                width={64}
                height={64}
                className="w-full h-full object-cover cursor-pointer cursor-open"
                onClick={() => handleImageClick(blog.author.avatar)}
              />
            </div>

            <div>
              <h3 className="font-bold text-xl text-white">
                {blog.author.name}
              </h3>
              <p className="text-[#e0e0e0] font-medium">{blog.author.bio}</p>
            </div>
          </div>
        </motion.div>

        {/* Image Carousel */}
        {blog.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div
              className="relative border-4 border-white overflow-hidden"
              style={{ height: "24rem" }}
            >
              {blog.images.map((image, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0 w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: index === currentImageIndex ? 1 : 0,
                    scale: index === currentImageIndex ? 1 : 1.05,
                  }}
                  transition={{
                    opacity: { duration: 0.5 },
                    scale: { duration: 0.7 },
                  }}
                  style={{ zIndex: index === currentImageIndex ? 1 : 0 }}
                >
                  <Image
                    src={image}
                    alt={`${blog.title} - Image ${index + 1}`}
                    width={800}
                    height={400}
                    className="w-full h-full object-cover cursor-pointer cursor-open"
                    onClick={() => handleImageClick(image)}
                  />
                </motion.div>
              ))}

              {/* Navigation arrows */}
              {blog.images.length > 1 && (
                <>
                  <motion.button
                    onClick={prevImage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-4 top-1/2 p-2 bg-white text-background hover:bg-[#e0e0e0] transition-colors z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} />
                  </motion.button>
                  <motion.button
                    onClick={nextImage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 p-2 bg-white text-background hover:bg-[#e0e0e0] transition-colors z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} />
                  </motion.button>
                </>
              )}

              {/* Image indicators */}
              {blog.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  {blog.images.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 border-2 border-white transition-all ${
                        index === currentImageIndex
                          ? "bg-white"
                          : "bg-transparent"
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Image counter */}
              {blog.images.length > 1 && (
                <motion.div
                  className="absolute top-4 right-4 bg-white text-background px-3 py-1 font-bold text-sm z-10"
                  key={currentImageIndex}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentImageIndex + 1} / {blog.images.length}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Content - Rendered Markdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="text-[2.5rem] leading-tight tracking-tight font-extrabold text-foreground border-b border-accent pb-3 mt-12 mb-6 uppercase"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-[2rem] leading-snug tracking-tight font-bold text-foreground border-b border-accent-medium pb-2 mt-10 mb-5 uppercase"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-[1.5rem] leading-snug font-semibold text-accent mt-8 mb-4 uppercase"
                    {...props}
                  />
                ),
                h4: ({ ...props }) => (
                  <h4
                    className="text-[1.25rem] font-medium text-accent-medium mt-6 mb-3"
                    {...props}
                  />
                ),
                h5: ({ ...props }) => (
                  <h5
                    className="text-[1.125rem] font-medium text-foreground mt-4 mb-2"
                    {...props}
                  />
                ),
                h6: ({ ...props }) => (
                  <h6
                    className="text-[1rem] font-semibold text-foreground opacity-70 mb-2 uppercase tracking-wide"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    className="text-foreground font-medium leading-[1.8] mb-6"
                    {...props}
                  />
                ),
                a: ({ ...props }) => (
                  <a
                    className="custom-link text-accent hover:text-accent-medium transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-l-4 border-accent px-5 py-3 pt-9 my-6 bg-accent-really-dark rounded-r-md text-foreground italic"
                    {...props}
                  />
                ),
                code: ({ ...props }) => (
                  <pre className="bg-[var(--accent-really-dark)] p-5 my-6 rounded-lg overflow-x-auto text-sm text-foreground">
                    <code className="hljs font-mono" {...props} />
                  </pre>
                ),
                ul: ({ ...props }) => (
                  <ul
                    className="list-disc pl-6 space-y-2 text-foreground mb-6"
                    {...props}
                  />
                ),
                ol: ({ ...props }) => (
                  <ol
                    className="list-decimal pl-6 space-y-2 text-foreground mb-6"
                    {...props}
                  />
                ),
                li: ({ ...props }) => (
                  <li
                    className="ml-1 font-medium leading-relaxed text-foreground"
                    {...props}
                  />
                ),
                strong: ({ ...props }) => (
                  <strong
                    className="text-foreground font-extrabold"
                    {...props}
                  />
                ),
                em: ({ ...props }) => (
                  <em className="italic text-foreground" {...props} />
                ),
                del: ({ ...props }) => (
                  <del className="line-through text-gray-500" {...props} />
                ),
                hr: ({ ...props }) => (
                  <hr className="my-8 border-t border-accent" {...props} />
                ),
                table: ({ ...props }) => (
                  <table
                    className="w-full my-8 border-collapse border border-[var(--accent-really-dark)]"
                    {...props}
                  />
                ),
                thead: ({ ...props }) => (
                  <thead
                    className="bg-[var(--accent-really-dark)] text-accent"
                    {...props}
                  />
                ),
                tbody: ({ ...props }) => (
                  <tbody className="text-foreground" {...props} />
                ),
                tr: ({ ...props }) => (
                  <tr
                    className="border-b border-[var(--accent-really-dark)]"
                    {...props}
                  />
                ),
                th: ({ ...props }) => (
                  <th
                    className="text-left py-3 px-4 font-semibold text-accent border border-[var(--accent-really-dark)]"
                    {...props}
                  />
                ),
                td: ({ ...props }) => (
                  <td
                    className="py-3 px-4 border border-[var(--accent-really-dark)] text-foreground"
                    {...props}
                  />
                ),
                img: ({ src = "", alt = "", width, height, ...props }) =>
                  typeof src === "string" ? (
                    <Image
                      src={src}
                      alt={alt}
                      width={typeof width === "number" ? width : 800}
                      height={typeof height === "number" ? height : 400}
                      className="my-6 max-w-full rounded-lg shadow-lg border border-[var(--accent-really-dark)]"
                      draggable={false}
                      {...props}
                    />
                  ) : null,
              }}
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
                  liked
                    ? "bg-[#d2042d]"
                    : "text-white hover:bg-white hover:text-background"
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
      </div>
    </div>
  );
};

export default BlogPostPage;
