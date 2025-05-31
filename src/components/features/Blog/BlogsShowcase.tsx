"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import BlogCard from "./BlogCard";
import { Blog } from "@/types/blog";
import blogsData from "@/data/blogs.json";

interface BlogsShowcaseProps {
  className?: string;
}

const BlogsShowcase = ({ className = "" }: BlogsShowcaseProps) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    // Sort blogs by date (latest first) and take only 5
    const sortedBlogs = [...(blogsData as Blog[])]
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, 5);
    setBlogs(sortedBlogs);
  }, []);

  // Add scroll event listener to track scroll position
  useEffect(() => {
    const container = document.getElementById("blogs-showcase-container");
    if (!container || blogs.length === 0) return;

    const handleScroll = () => {
      const cardWidth = 320; // w-80 = 320px
      const gap = 24; // gap-6 = 24px

      // Calculate the current index based on scroll position
      const scrollPosition = container.scrollLeft;
      const newIndex = Math.round(scrollPosition / (cardWidth + gap));

      // Update the current index if it's different
      if (
        newIndex !== currentIndex &&
        newIndex >= 0 &&
        newIndex < blogs.length
      ) {
        setCurrentIndex(newIndex);
      }

      // Update scroll button states
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [blogs, currentIndex]);

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("blogs-showcase-container");
    if (!container) return;

    const cardWidth = 320; // w-80 = 320px
    const scrollAmount = cardWidth + 24; // including gap

    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
      setCurrentIndex(Math.max(0, currentIndex - 1));
    } else {
      container.scrollLeft += scrollAmount;
      setCurrentIndex(Math.min(blogs.length - 1, currentIndex + 1));
    }

    // Update button states
    setTimeout(() => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }, 300);
  };

  if (blogs.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.3 }}
      className={`py-20 bg-background ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-4xl font-bold uppercase tracking-tight text-white">
                Beyond Horizons
              </h2>
            </div>
            <div className="h-1 bg-white w-32"></div>
          </div>

          {/* Navigation buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-3 border-2 border-white transition-colors ${
                canScrollLeft
                  ? "text-white hover:bg-white hover:text-background"
                  : "text-white/30 cursor-not-allowed"
              }`}
              aria-label="Previous blog"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-3 border-2 border-white transition-colors ${
                canScrollRight
                  ? "text-white hover:bg-white hover:text-background"
                  : "text-white/30 cursor-not-allowed"
              }`}
              aria-label="Next blog"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Blogs container */}
        <div className="relative">
          <div
            id="blogs-showcase-container"
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-6"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollSnapType: "x mandatory",
            }}
          >
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0.5, x: 20 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  transition: { delay: index * 0.1 },
                }}
                viewport={{ once: true }}
                style={{ scrollSnapAlign: "start" }}
              >
                <BlogCard blog={blog} variant="showcase" />
              </motion.div>
            ))}

            {/* View all blogs card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{
                opacity: 1,
                x: 0,
                transition: { delay: blogs.length * 0.1 },
              }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-80 bg-background border-4 border-white p-8 flex items-center justify-center"
              style={{ scrollSnapAlign: "start" }}
            >
              <Link href="/blogs" className="block w-full text-center group">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-white flex items-center justify-center mx-auto group-hover:shadow-[4px_4px_0px_0px_rgba(224,224,224,1)] transition-all">
                    <ArrowUpRight size={32} className="text-background" />
                  </div>
                </div>

                <h3 className="font-bold text-2xl uppercase tracking-tight mb-4 text-white">
                  View All Articles
                </h3>
                <p className="text-[#e0e0e0] text-sm font-medium mb-6">
                  Explore our complete collection of cosmic insights
                </p>
                <div className="h-1 w-20 bg-white mx-auto"></div>
              </Link>
            </motion.div>
          </div>

          {/* Mobile navigation indicators */}
          <div className="flex justify-center gap-2 mt-8 sm:hidden">
            {blogs.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const container = document.getElementById(
                    "blogs-showcase-container"
                  );
                  if (container) {
                    const cardWidth = 320;
                    const scrollAmount = index * (cardWidth + 24);
                    container.scrollLeft = scrollAmount;
                    setCurrentIndex(index);
                  }
                }}
                className={`
                  w-3 h-3 border-2 border-white transition-all duration-200
                  ${index === currentIndex ? "bg-white" : "bg-transparent"}
                `}
                aria-label={`Go to blog ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hide scrollbar */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.section>
  );
};

export default BlogsShowcase;
