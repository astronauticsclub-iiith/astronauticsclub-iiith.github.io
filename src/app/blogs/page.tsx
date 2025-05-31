"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Zap,
  ArrowUpAZ,
  ThumbsUp,
  Eye,
} from "lucide-react";
import BlogCard from "@/components/features/Blog/BlogCard";
import Loader from "@/components/ui/Loader";
import { Blog, BlogFilters } from "@/types/blog";
import blogsData from "@/data/blogs.json";
import Image from "next/image";
import { useWhimsy } from "@/context/WhimsyContext";
import "@/components/ui/bg-patterns.css"

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BlogFilters>({
    search: "",
    tags: [],
    sortBy: "latest",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const { whimsyMode } = useWhimsy();
  const telescopeRef = useRef<HTMLImageElement>(null);
  const [telescopeRotation, setTelescopeRotation] = useState(0);
  const [telescopeLoaded, setTelescopeLoaded] = useState(false);

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

  useEffect(() => {
    // Simulate API call
    const loadBlogs = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const loadedBlogs = blogsData as Blog[];
      setBlogs(loadedBlogs);

      // Extract all unique tags
      const tags = Array.from(
        new Set(loadedBlogs.flatMap((blog) => blog.tags))
      ).sort();
      setAllTags(tags);

      setLoading(false);
    };

    loadBlogs();
  }, []);

  const filteredAndSortedBlogs = useMemo(() => {
    let filtered = [...blogs];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchLower) ||
          blog.excerpt.toLowerCase().includes(searchLower) ||
          blog.author.name.toLowerCase().includes(searchLower) ||
          blog.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter((blog) =>
        filters.tags.some((tag) => blog.tags.includes(tag))
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "latest":
        filtered.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.publishedAt).getTime() -
            new Date(b.publishedAt).getTime()
        );
        break;
      case "popular":
        filtered.sort((a, b) => b.views - a.views);
        break;
      case "most-liked":
        filtered.sort((a, b) => b.likes - a.likes);
        break;
    }

    return filtered;
  }, [blogs, filters]);

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSortChange = (sortBy: BlogFilters["sortBy"]) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      tags: [],
      sortBy: "latest",
    });
  };

  const hasActiveFilters =
    filters.search || filters.tags.length > 0 || filters.sortBy !== "latest";

  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleSortButtonClick = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader fullscreen />
      </div>
    );
  }

  // Get icon for sort option
  const getSortIcon = (sortOption: string) => {
    switch (sortOption) {
      case "latest":
        return <Zap size={18} />;
      case "oldest":
        return <ArrowUpAZ size={18} />;
      case "popular":
        return <Eye size={18} />;
      case "most-liked":
        return <ThumbsUp size={18} />;
      default:
        return <Zap size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-background bg-pattern-topography pt-24 pb-8 md:pb-16 px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 lg:mb-16"
        >
          <div className="flex items-center gap-6 mb-6">
            <div
              className={`w-16 h-16 flex items-center justify-center ${
                whimsyMode ? "telescope-whimsy" : ""
              }`}
            >
              <Image
                src="/icons/telescope.svg"
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
              <h1 className="text-2xl md:text-3xl lg:text-6xl font-black uppercase tracking-tighter text-white text-shadow-brutal">
                Beyond Horizons
              </h1>
              <div className="h-2 bg-white w-40 mt-2 shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"></div>
            </div>
          </div>
          <p className="text-l md:text-xl text-[#e0e0e0] max-w-2xl font-medium ml-2 border-l-4 border-white pl-4 mt-6">
            Exploring the universe, one story at a time.
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 bg-background border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(128,128,128,0.5)]"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search size={18} className="text-[#e0e0e0]" />
              </div>
              <input
                type="text"
                placeholder="Search articles..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border-2 border-white font-medium text-white placeholder-[#e0e0e0]
                           focus:outline-none focus:border-white focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)] transition-shadow"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 border-2 border-white font-bold text-white hover:bg-white hover:text-background transition-colors hover:shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"
            >
              <Filter size={18} />
              Filters
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={handleSortButtonClick}
                className="w-full sm:w-auto flex items-center justify-between gap-2 px-6 py-3 border-2 border-white font-bold text-white hover:bg-white hover:text-background transition-colors hover:shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"
              >
                {getSortIcon(filters.sortBy)}
                <span className="flex-grow text-left">
                  {filters.sortBy.charAt(0).toUpperCase() +
                    filters.sortBy.slice(1).replace("-", " ")}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    showSortDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 right-0 mt-1 w-full sm:w-48 border-2 border-white bg-background shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"
                  >
                    <button
                      onClick={() => {
                        handleSortChange("latest");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-left font-medium hover:bg-white hover:text-background transition-colors ${
                        filters.sortBy === "latest"
                          ? "bg-white text-background"
                          : "text-white"
                      }`}
                    >
                      <Zap size={18} /> Latest
                    </button>
                    <button
                      onClick={() => {
                        handleSortChange("oldest");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-left font-medium hover:bg-white hover:text-background transition-colors ${
                        filters.sortBy === "oldest"
                          ? "bg-white text-background"
                          : "text-white"
                      }`}
                    >
                      <ArrowUpAZ size={18} /> Oldest
                    </button>
                    <button
                      onClick={() => {
                        handleSortChange("popular");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-left font-medium hover:bg-white hover:text-background transition-colors ${
                        filters.sortBy === "popular"
                          ? "bg-white text-background"
                          : "text-white"
                      }`}
                    >
                      <Eye size={18} /> Most Popular
                    </button>
                    <button
                      onClick={() => {
                        handleSortChange("most-liked");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-left font-medium hover:bg-white hover:text-background transition-colors ${
                        filters.sortBy === "most-liked"
                          ? "bg-white text-background"
                          : "text-white"
                      }`}
                    >
                      <ThumbsUp size={18} /> Most Liked
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-6 border-t-2 border-white">
                  <h3 className="font-bold text-lg uppercase mb-4 inline-block px-2 py-1 bg-white text-background rotate-[-1deg]">
                    Filter by Tags
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-4">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-4 py-2 border-2 border-white transition-colors font-medium text-sm ${
                          filters.tags.includes(tag)
                            ? "bg-white text-background shadow-[3px_3px_0px_0px_rgba(128,128,128,0.5)] -translate-y-1"
                            : "text-white hover:bg-white hover:text-background hover:shadow-[3px_3px_0px_0px_rgba(128,128,128,0.5)] hover:-translate-y-0.5"
                        } transform transition-transform`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="mt-6 pt-4 border-t-2 border-white flex flex-wrap items-center gap-3">
              <span className="text-sm text-white font-bold bg-background border-2 border-white px-2 py-1 uppercase">
                Active filters:
              </span>
              {filters.search && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white text-background font-medium text-sm border-2 border-background shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)]">
                  <span>&quot;{filters.search}&quot;</span>
                  <button
                    onClick={() => handleSearchChange("")}
                    className="text-background hover:opacity-70 ml-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {filters.tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-2 px-3 py-1 bg-white text-background font-medium text-sm border-2 border-background shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)]"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="text-background hover:opacity-70 ml-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {filters.sortBy !== "latest" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white text-background font-medium text-sm border-2 border-background shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)]">
                  <span>{getSortIcon(filters.sortBy)}</span>
                  <span>
                    {filters.sortBy.charAt(0).toUpperCase() +
                      filters.sortBy.slice(1).replace("-", " ")}
                  </span>
                </div>
              )}
              <button
                onClick={clearFilters}
                className="px-4 py-1 border-2 border-white text-white font-medium text-sm hover:bg-white hover:text-background transition-colors hover:shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)]"
              >
                Clear All
              </button>
            </div>
          )}
        </motion.div>

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center flex-wrap gap-4 justify-center md:justify-between">
            <p className="text-[#e0e0e0] font-medium md:pl-4 py-2">
              Showing{" "}
              <span className="font-bold accent bg-background px-1">
                {filteredAndSortedBlogs.length}
              </span>{" "}
              {filteredAndSortedBlogs.length === 1 ? "article" : "articles"}
              {hasActiveFilters ? " with applied filters" : ""}
            </p>

            {hasActiveFilters && (
              <motion.button
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={clearFilters}
                className="px-4 py-2 bg-white text-background font-bold text-sm hover:shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)] transition-all uppercase tracking-wider"
              >
                Reset
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Blogs Grid Layout */}
        {filteredAndSortedBlogs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-8"
          >
            {filteredAndSortedBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.1 * index, duration: 0.5 },
                }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="transform transition-transform"
              >
                <BlogCard blog={blog} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center py-20 border-4 border-white shadow-[8px_8px_0px_0px_rgba(128,128,128,0.5)]"
          >
            <div className="mb-8">
              <div className="w-20 h-20 border-4 border-white flex items-center justify-center mx-auto transform rotate-12 shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]">
                <X size={36} className="text-white -rotate-12" />
              </div>
            </div>
            <h3 className="text-3xl font-black mb-4 uppercase tracking-wide text-white">
              No Articles Found
            </h3>
            <p className="text-[#e0e0e0] max-w-md mx-auto font-medium mb-8 border-l-4 border-r-4 border-white px-6 py-2">
              We couldn&apos;t find any articles matching your filters. Try
              adjusting your search criteria.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
              onClick={clearFilters}
              className="px-8 py-3 bg-white text-background font-bold hover:shadow-[6px_6px_0px_0px_rgba(128,128,128,0.5)] transition-all uppercase tracking-wider"
            >
              Clear All Filters
            </motion.button>

            <style jsx global>{`
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
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
