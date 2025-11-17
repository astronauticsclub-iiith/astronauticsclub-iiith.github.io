"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import BlogCard from "./BlogCard";
import { Blog } from "@/types/blog";
import Image from "next/image";
import { useWhimsy } from "@/context/WhimsyContext";
import Loader from "@/components/ui/Loader";
import "@/components/ui/bg-patterns.css";
import { withBasePath } from "@/components/common/HelperFunction";

interface BlogsShowcaseProps {
  className?: string;
}

const BlogsShowcase = ({ className = "" }: BlogsShowcaseProps) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { whimsyMode } = useWhimsy();
  const telescopeRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [telescopeRotation, setTelescopeRotation] = useState(0);
  const [telescopeLoaded, setTelescopeLoaded] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(withBasePath(`/api/blogs?limit=5&sortBy=latest`));
        if (response.ok) {
          const data = await response.json();
          setBlogs(data.blogs || []);
        } else {
          console.error("Failed to fetch blogs");
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Add scroll event listener to track scroll position
  useEffect(() => {
    const container = containerRef.current;
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
    const container = containerRef.current;
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

  // Add effect for telescope rotation when whimsy mode is enabled
  useEffect(() => {
    if (!whimsyMode || !telescopeLoaded || !telescopeRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!telescopeRef.current) return;

      // Get telescope element position
      const telescopeRect = telescopeRef.current.getBoundingClientRect();
      const telescopeCenterX = telescopeRect.left + telescopeRect.width / 2;
      const telescopeCenterY = telescopeRect.top + telescopeRect.height / 2;

      // Calculate angle between mouse and telescope center
      const deltaX = e.clientX - telescopeCenterX;
      const deltaY = e.clientY - telescopeCenterY;
      const angleRad = Math.atan2(deltaY, deltaX);
      const angleDeg = (angleRad * 180) / Math.PI + 35;

      // Set rotation angle with a slight delay for smoother effect
      // Adding a slight delay with requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        setTelescopeRotation(angleDeg);
      });
    };

    // Add event listener
    window.addEventListener("mousemove", handleMouseMove);

    // Clean up
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [whimsyMode, telescopeLoaded]);

  // Add an initial telescope rotation on component mount if whimsy is enabled
  useEffect(() => {
    if (!whimsyMode || !telescopeLoaded) return;

    const animateInitialRotation = () => {
      // Start with a slight rotation to indicate interactivity
      setTelescopeRotation(15);

      // After a short delay, reset to default position
      setTimeout(() => {
        setTelescopeRotation(0);
      }, 600);
    };

    animateInitialRotation();
  }, [whimsyMode, telescopeLoaded]);

  // Show loading state
  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.3 }}
        className={`pt-5 md:pt-16 pb-20 bg-background ${className} relative bg-pattern-topography`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-24 h-24 flex items-center justify-center">
                  <Image
                    src={withBasePath(`/icons/telescope.svg`)}
                    alt="Telescope"
                    width={64}
                    height={64}
                  />
                </div>
                <div>
                  <h2 className="text-4xl font-bold uppercase tracking-tight text-white">
                    Beyond Horizons
                  </h2>
                  <div className="h-1 bg-white w-24 mt-1"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading state */}
          <div className="flex justify-center items-center py-16">
            <Loader overlay />
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.3 }}
      className={`pt-5 md:pt-16 pb-20 bg-background ${className} relative bg-pattern-topography`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-24 h-24 flex items-center justify-center ${
                  whimsyMode ? "telescope-whimsy" : ""
                }`}
              >
                <Image
                  src={withBasePath(`/icons/telescope.svg`)}
                  alt="Telescope"
                  width={64}
                  height={64}
                  ref={telescopeRef}
                  onLoad={() => setTelescopeLoaded(true)}
                  style={{
                    transform: whimsyMode
                      ? `rotate(${telescopeRotation}deg)`
                      : "none",
                    transition: whimsyMode ? "transform 0.2s ease-out" : "none",
                  }}
                />
              </div>
              <div>
                <h2 className="text-4xl font-bold uppercase tracking-tight text-white">
                  Beyond Horizons
                </h2>
                <div className="h-1 bg-white w-24 mt-1"></div>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-3 border-2 transition-colors ${
                canScrollLeft
                  ? "text-white hover:bg-white hover:text-background border-white"
                  : "text-white/30 cursor-not-allowed border-white/30"
              }`}
              aria-label="Previous blog"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-3 border-2 transition-colors ${
                canScrollRight
                  ? "text-white hover:bg-white hover:text-background border-white"
                  : "text-white/30 cursor-not-allowed border-white/30"
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
            ref={containerRef}
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
                <BlogCard blog={blog} index={index} variant="showcase" />
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
        .telescope-whimsy {
          position: relative;
        }
        .telescope-whimsy:hover::after {
          content: "";
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.2) 0%,
            rgba(255, 255, 255, 0) 70%
          );
          pointer-events: none;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
        }
      `}</style>
    </motion.section>
  );
};

export default BlogsShowcase;
