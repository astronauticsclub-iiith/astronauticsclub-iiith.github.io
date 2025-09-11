"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useImagePreview } from "@/context/ImagePreviewContext";
import Loader from "@/components/ui/Loader";
import Image from "next/image";
import GalleryIcon from "@/components/features/GalleryIcon";
import "@/components/ui/bg-patterns.css";
import "./gallery.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

type GalleryImage = {
  src: string;
  alt: string;
  category: "astrophotography" | "events";
  label: string;
  filename: string;
  size: number;
  modified: string;
};

type FilterType = "all" | "astrophotography" | "events";

const PhotoCard: React.FC<{
  image: GalleryImage;
  onClick: () => void;
  index: number;
}> = ({ image, onClick, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { delay: 0.1 * index, duration: 0.5 },
      }}
      whileHover={{
        y: -3,
        transition: { duration: 0.1, delay: 0.05 },
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 },
      }}
      className="gallery-card cursor-open"
      onClick={onClick}
    >
      <div className="gallery-card-image">
        <Image
          src={image.src}
          alt={image.alt || image.label}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
          priority={index < 4} // Load the first 4 images immediately
        />
      </div>
      <div className="gallery-category">{image.category}</div>
      <div className="gallery-heading">{image.label}</div>
    </motion.div>
  );
};

const Gallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const { openPreview } = useImagePreview();

  // Fetch images from the gallery folders
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);

        // Simulate network delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 800));

        const response = await fetch(`${basePath}/api/gallery`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setImages(data.images || []);
      } catch (error) {
        console.error("Error loading images:", error);
        // If there's an error, set empty array so UI shows empty state
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  // Get all filtered images
  const filteredImages = images.filter(
    (image) => filter === "all" || image.category === filter
  );

  const handleImageClick = (image: GalleryImage) => {
    openPreview(image.src, image.alt);
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
          className="mb-8 lg:mb-16"
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
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`gallery-filter-btn ${
                filter === "all" ? "active" : ""
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`gallery-filter-btn ${
                filter === "astrophotography" ? "active" : ""
              }`}
              onClick={() => setFilter("astrophotography")}
            >
              Astrophotography
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`gallery-filter-btn ${
                filter === "events" ? "active" : ""
              }`}
              onClick={() => setFilter("events")}
            >
              Events
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center flex-wrap gap-1 md:gap-4 justify-center md:justify-between">
            <p className="text-[#e0e0e0] font-medium md:pl-4 py-2 text-center md:text-left">
              Showing{" "}
              <span className="font-bold accent bg-background px-1">
                {filteredImages.length}
              </span>{" "}
              {filteredImages.length === 1 ? "image" : "images"}
              {filter !== "all" ? ` in ${filter}` : ""}
            </p>
          </div>
        </motion.div>

        {filteredImages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="gallery-empty"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {filter === "all"
                ? "No images found in the gallery."
                : `No images found in ${filter}.`}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="gallery-empty-hint"
            >
              Check back later for more images.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="gallery-masonry px-2"
          >
            <AnimatePresence>
              {filteredImages.map((image, index) => (
                <PhotoCard
                  key={`image-${index}-${image.filename}`}
                  image={image}
                  index={index}
                  onClick={() => handleImageClick(image)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
