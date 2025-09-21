'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import { useImagePreview } from '@/context/ImagePreviewContext';
import "@/components/ui/bg-patterns.css";
import { withBasePath, withUploadPath } from '../common/HelperFunction';

interface BlogPreviewProps {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  readTime: number;
  author: {
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
  images?: string[];
}

export default function BlogPreview({
  title,
  content,
  tags,
  readTime,
  author,
  images = []
}: BlogPreviewProps) {
  const { openPreview } = useImagePreview();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likes] = useState(0);
  const [views] = useState(123);

  const handleImageClick = (imageSrc: string) => {
    openPreview(withBasePath(imageSrc), title || "Blog image");
  };

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
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


  return (
    <div className="min-h-screen bg-background bg-pattern-topography pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag) => (
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
            {title || 'UNTITLED BLOG POST'}
          </h1>
          <div className="h-1 bg-white w-32 mb-6"></div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 text-[#e0e0e0] font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {formatDate(new Date().toISOString())}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              {readTime} min read
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
                src={author.avatar ? withUploadPath(author.avatar) : withBasePath(`/team/default-avatar.svg`)}
                alt={author.name}
                width={64}
                height={64}
                unoptimized={!!author.avatar}
                className="w-full h-full object-cover cursor-pointer cursor-open"
                onClick={() => handleImageClick(author.avatar || `/team/default-avatar.svg`)}
              />
            </div>

            <div>
              <h3 className="font-bold text-xl text-white">
                {author.name}
              </h3>
              <p className="text-[#e0e0e0] font-medium">{author.bio || 'Blog Author'}</p>
            </div>
          </div>
        </motion.div>

        {/* Image Carousel */}
        {images.length > 0 && (
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
              {images.map((image, index) => (
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
                    src={withBasePath(image)}
                    alt={`${title} - Image ${index + 1}`}
                    width={800}
                    height={400}
                    className="w-full h-full object-cover cursor-pointer cursor-open"
                    onClick={() => handleImageClick(image)}
                  />
                </motion.div>
              ))}

              {/* Navigation arrows */}
              {images.length > 1 && (
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
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  {images.map((_, index) => (
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
              {images.length > 1 && (
                <motion.div
                  className="absolute top-4 right-4 bg-white text-background px-3 py-1 font-bold text-sm z-10"
                  key={currentImageIndex}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentImageIndex + 1} / {images.length}
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
                img: ({ src, alt = "", width, height, ...props }) =>
                  typeof src === "string" ? (
                    <Image
                      src={withBasePath(src)}
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
              {content || '*No content yet...*'}
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
                disabled
                className="flex items-center gap-2 px-4 py-2 border-2 border-white text-white font-bold opacity-50 cursor-not-allowed"
              >
                <Heart size={18} />
                {formatCount(likes)}
              </button>

              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 border-2 border-white text-white font-bold opacity-50 cursor-not-allowed"
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
}