"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, ChevronDown, X, Check, Plus } from "lucide-react";
import Image from "next/image";
import { withBasePath } from "../common/HelperFunction";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: "astrophotography" | "events";
  label: string;
  filename: string;
  size: number;
  modified: string;
  created: string;
}

interface ImageSelectorProps {
  selectedImage: string;
  onChange: (image: string) => void;
  disabled?: boolean;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  selectedImage,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch gallery images when component opens
  useEffect(() => {
    const fetchGalleryImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(withBasePath(`/api/gallery/admin`));
        if (response.ok) {
          const data = await response.json();
          setGalleryImages(data.images || []);
        } else {
          setError("Failed to fetch gallery images");
        }
      } catch (error) {
        console.error("Error fetching gallery images:", error);
        setError("Failed to fetch gallery images");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && galleryImages.length === 0) {
      fetchGalleryImages();
    }
  }, [isOpen, galleryImages.length]);

  const refetchGalleryImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(withBasePath(`/api/gallery/admin`));
      if (response.ok) {
        const data = await response.json();
        setGalleryImages(data.images || []);
      } else {
        setError("Failed to fetch gallery images");
      }
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      setError("Failed to fetch gallery images");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageSrc: string) => {
    if (selectedImage === imageSrc) {
      onChange(""); // Deselect if clicking the same image
    } else {
      onChange(imageSrc); // Select new image
    }
  };

  const handleRemoveImage = () => {
    onChange("");
  };

  const getSelectedImageData = (src: string) => {
    return galleryImages.find((img) => img.src === src);
  };

  return (
    <div className="space-y-4">
      {/* Selected Image Display */}
      {selectedImage && (
        <div className="space-y-2">
          <label className="block text-white text-xs font-bold uppercase">
            Selected Image
          </label>
          <div className="w-32 h-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group border-2 border-white bg-background w-full h-full"
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={withBasePath(selectedImage)}
                  alt={
                    getSelectedImageData(selectedImage)?.alt || "Selected image"
                  }
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={disabled}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 border-2 border-white text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={12} />
              </button>
              {getSelectedImageData(selectedImage) && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {getSelectedImageData(selectedImage)?.label}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Image Selector Toggle */}
      <div>
        <label className="block text-white text-xs font-bold mb-1 uppercase">
          Event Image (Optional)
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full flex items-center justify-between gap-2 bg-background border-2 border-white p-3 text-white font-medium text-sm transition-all duration-200 hover:bg-white hover:text-background focus:scale-[1.02] focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <ImageIcon size={16} />
            <span>
              {isOpen ? "Hide Gallery" : "Select from Gallery"}
              {selectedImage && " (1 selected)"}
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Gallery Selector */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-2 border-white bg-background p-4"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
                <span className="ml-3 text-white font-medium">
                  Loading images...
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400 font-medium mb-2">{error}</p>
                <button
                  type="button"
                  onClick={refetchGalleryImages}
                  className="px-4 py-2 border-2 border-white text-white font-medium hover:bg-white hover:text-background transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white font-medium">
                  No images found in gallery
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm uppercase">
                    Gallery Images ({galleryImages.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
                  {galleryImages.map((image) => {
                    const isSelected = selectedImage === image.src;
                    return (
                      <motion.div
                        key={image.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative cursor-pointer border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-green-400 bg-green-400/20"
                            : "border-white hover:border-gray-300"
                        }`}
                        onClick={() => handleImageSelect(image.src)}
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <Image
                            src={withBasePath(image.src)}
                            alt={image.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                          />
                        </div>

                        {/* Selection indicator */}
                        <div
                          className={`absolute top-1 right-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected
                              ? "bg-green-400 border-green-400 text-white"
                              : "bg-background border-white text-white hover:bg-white hover:text-background"
                          }`}
                        >
                          {isSelected ? (
                            <Check size={12} />
                          ) : (
                            <Plus size={12} />
                          )}
                        </div>

                        {/* Category badge */}
                        <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/75 text-white text-xs font-medium rounded">
                          {image.category}
                        </div>

                        {/* Image info overlay */}
                        <div className="absolute inset-0 bg-black/75 text-white p-2 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end">
                          <p className="text-xs font-medium truncate">
                            {image.label}
                          </p>
                          <p className="text-xs text-gray-300 truncate">
                            {image.filename}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageSelector;
