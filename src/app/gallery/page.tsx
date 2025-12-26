"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useImagePreview } from "@/context/ImagePreviewContext";
import Loader from "@/components/ui/Loader";
import Image from "next/image";
import GalleryIcon from "@/components/features/GalleryIcon";
import "@/components/ui/bg-patterns.css";
import "./gallery.css";
import { withBasePath, withUploadPath } from "@/components/common/HelperFunction";
import { GalleryImage } from "@/types/gallery-image";

type FilterType = "all" | "astrophotography" | "events" | "others";

const BATCH_SIZE = 12; // Only load 12 images at a time to prevent 429 errors

const PhotoCard: React.FC<{
  image: GalleryImage;
  onClick: () => void;
  index: number;
}> = ({ image, onClick, index }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { delay: 0.05, duration: 0.4 },
      }}
      whileHover={{
        zIndex: 10,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className="gallery-card cursor-zoom-in"
      onClick={onClick}
    >
      <div className="gallery-card-image">
        <Image
          src={withUploadPath(image.src)}
          alt={image.alt || image.label}
          unoptimized
          width={0}
          height={0}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
          // Only prioritize the very first few images to save bandwidth
          priority={index < 4}
        />
        <div className="gallery-overlay" />
      </div>
      <div className="gallery-content">
        <div className="gallery-category">{image.category}</div>
        <div className="gallery-heading">{image.label}</div>
      </div>
    </motion.div>
  );
};

const Gallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE); // Track how many are shown
  const { openPreview } = useImagePreview();

  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const response = await fetch(withBasePath(`/api/gallery`));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setImages(data.images || []);
      } catch (error) {
        console.error("Error loading images:", error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filter]);

  // Handle window resize for columns
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= 1440) setColumns(4);
      else if (window.innerWidth >= 1024) setColumns(3);
      else if (window.innerWidth >= 640) setColumns(2);
      else setColumns(1);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const filteredImages = images.filter((image) => filter === "all" || image.category === filter);

  // Get only the currently visible slice to prevent massive requests
  const visibleImages = filteredImages.slice(0, visibleCount);
  const hasMore = visibleCount < filteredImages.length;

  const loadMore = () => {
    setVisibleCount((prev) => prev + BATCH_SIZE);
  };

  // Distribute visible images into columns
  const distributedColumns = useMemo(() => {
    const cols: GalleryImage[][] = Array.from({ length: columns }, () => []);
    visibleImages.forEach((img, i) => {
      cols[i % columns].push(img);
    });
    return cols;
  }, [visibleImages, columns]);

  const handleImageClick = (image: GalleryImage) => {
    openPreview(withUploadPath(image.src), image.alt);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader fullscreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-pattern-graph pt-24 pb-16 md:pb-20 px-4">
      <div className="gallery-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 lg:mb-12"
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 flex items-center justify-center">
              <GalleryIcon width={64} height={64} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-6xl font-black uppercase tracking-tighter text-white text-shadow-brutal">
                The Spaceframe
              </h1>
              <div className="h-2 bg-white w-40 mt-2 shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"></div>
            </div>
          </div>
          <p className="text-l md:text-xl text-[#e0e0e0] max-w-2xl font-medium ml-2 border-l-4 border-white pl-4 my-6">
            Snapshots of the infinite cosmos.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="gallery-filters"
          >
            {(["all", "astrophotography", "events", "others"] as FilterType[]).map((f) => (
              <motion.button
                key={f}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`gallery-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-[#e0e0e0] font-medium md:pl-4 py-2 text-center md:text-left">
            Showing{" "}
            <span className="font-bold accent bg-background px-1">{visibleImages.length}</span> of{" "}
            {filteredImages.length} {filteredImages.length === 1 ? "image" : "images"}
            {filter !== "all" ? ` in ${filter}` : ""}
          </p>
        </motion.div>

        {visibleImages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="gallery-empty"
          >
            <p>
              {filter === "all"
                ? "No images found in the gallery."
                : `No images found in ${filter}.`}
            </p>
            <p className="gallery-empty-hint">Check back later for more images.</p>
          </motion.div>
        ) : (
          <>
            <div className="gallery-masonry">
              <AnimatePresence mode="popLayout">
                {distributedColumns.map((columnImages, colIndex) => (
                  <div key={colIndex} className="masonry-column">
                    {columnImages.map((image, index) => (
                      <PhotoCard
                        key={`image-${colIndex}-${index}-${image.filename}`}
                        image={image}
                        index={index}
                        onClick={() => handleImageClick(image)}
                      />
                    ))}
                  </div>
                ))}
              </AnimatePresence>
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button onClick={loadMore} className="gallery-load-more-btn">
                  Load More Cosmos
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Gallery;
