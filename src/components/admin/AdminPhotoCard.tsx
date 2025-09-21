"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2,
  Trash2,
  Check,
  X,
  ChevronDown,
  Camera,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { withUploadPath } from "../common/HelperFunction";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: "astrophotography" | "events" | "others";
  label: string;
  filename: string;
  size: number;
  modified: string;
  created: string;
}

interface AdminPhotoCardProps {
  image: GalleryImage;
  index: number;
  onEdit: (
    image: GalleryImage,
    newFilename?: string,
    newCategory?: "astrophotography" | "events" | "others"
  ) => Promise<void>;
  onDelete: (image: GalleryImage) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

const AdminPhotoCard: React.FC<AdminPhotoCardProps> = ({
  image,
  index,
  onEdit,
  onDelete,
  isEditing,
  onStartEdit,
  onCancelEdit,
}) => {
  const [editedFilename, setEditedFilename] = useState("");
  const [editedCategory, setEditedCategory] = useState<
    "astrophotography" | "events" | "others"
  >(image.category);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCategoryDropdown]);

  // Get icon for category
  const getCategoryIcon = (category: "astrophotography" | "events" | "others") => {
    switch (category) {
      case "astrophotography":
        return <Camera size={18} />;
      case "events":
        return <Calendar size={18} />;
      case "others":
        return <Calendar size={18} />;
      default:
        return <Camera size={18} />;
    }
  };

  const handleStartEdit = () => {
    setEditedFilename(image.filename.replace(/\.[^/.]+$/, ""));
    setEditedCategory(image.category);
    onStartEdit();
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const extension = image.filename.match(/\.[^/.]+$/)?.[0] || "";
      const newFilename = editedFilename.trim()
        ? editedFilename.trim() + extension
        : undefined;
      const newCategory =
        editedCategory !== image.category ? editedCategory : undefined;

      if (newFilename || newCategory) {
        await onEdit(image, newFilename, newCategory);
      }
      onCancelEdit();
    } catch (error) {
      console.error("Error updating image:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedFilename("");
    setEditedCategory(image.category);
    onCancelEdit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      className="border-2 border-white backdrop-blur-sm hover:shadow-lg hover:shadow-white/5 transition-all duration-200 hover:scale-[1.02] bg-background"
    >
      {/* Image */}
      <div className="aspect-video relative overflow-hidden border-b-2 border-white">
        <Image
          src={withUploadPath(image.src)}
          alt={image.alt}
          unoptimized
          fill
          className="object-cover transition-transform duration-300 hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 text-xs font-bold uppercase border-2 ${
              image.category === "astrophotography"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-green-600 text-white border-green-600"
            }`}
          >
            {image.category}
          </span>
        </div>
      </div>

      {/* Image Info */}
      <div className="p-3 sm:p-4">
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-3">
            <div>
              <label className="block text-white text-xs font-bold mb-1 uppercase">
                Filename (without extension)
              </label>
              <input
                type="text"
                value={editedFilename}
                onChange={(e) => setEditedFilename(e.target.value)}
                className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white"
                placeholder="Enter filename..."
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-white text-xs font-bold mb-1 uppercase">
                Category
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-between gap-2 bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 hover:bg-white hover:text-background focus:scale-[1.02] focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(editedCategory)}
                    <span className="uppercase">{editedCategory}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      showCategoryDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {showCategoryDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-10 left-0 mt-1 w-full border-2 border-white bg-background shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditedCategory("astrophotography");
                          setShowCategoryDropdown(false);
                        }}
                        disabled={isSubmitting}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium hover:bg-white hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          editedCategory === "astrophotography"
                            ? "bg-white text-background"
                            : "text-white"
                        }`}
                      >
                        <Camera size={16} />
                        <span className="uppercase">ASTROPHOTOGRAPHY</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditedCategory("events");
                          setShowCategoryDropdown(false);
                        }}
                        disabled={isSubmitting}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium hover:bg-white hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          editedCategory === "events"
                            ? "bg-white text-background"
                            : "text-white"
                        }`}
                      >
                        <Calendar size={16} />
                        <span className="uppercase">EVENTS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditedCategory("others");
                          setShowCategoryDropdown(false);
                        }}
                        disabled={isSubmitting}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium hover:bg-white hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          editedCategory === "others"
                            ? "bg-white text-background"
                            : "text-white"
                        }`}
                      >
                        <Calendar size={16} />
                        <span className="uppercase">OTHERS</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Edit Action Buttons */}
            <div className="flex gap-2 pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitEdit}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 border-2 border-white bg-green-600 text-white font-bold text-xs uppercase transition-all duration-200 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                    SAVING...
                  </div>
                ) : (
                  <>
                    <Check className="inline mr-1" size={12} />
                    SUBMIT
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 border-2 border-white bg-red-600 text-white font-bold text-xs uppercase transition-all duration-200 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="inline mr-1" size={12} />
                DISCARD
              </motion.button>
            </div>
          </div>
        ) : (
          /* Display Mode */
          <div>
            <h3 className="font-bold text-white uppercase text-sm sm:text-base mb-2 truncate">
              {image.label}
            </h3>
            <p className="text-[#e0e0e0] text-xs sm:text-sm font-medium mb-1">
              <span className="font-bold">File:</span> {image.filename}
            </p>
            <p className="text-[#e0e0e0] text-xs sm:text-sm font-medium mb-1">
              <span className="font-bold">Size:</span>{" "}
              {(image.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className="text-[#e0e0e0] text-xs sm:text-sm font-medium mb-3">
              <span className="font-bold">Modified:</span>{" "}
              {new Date(image.modified).toLocaleDateString()}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartEdit}
                className="flex-1 px-2 py-1.5 border-2 border-white bg-background text-white font-bold text-xs uppercase transition-all duration-200 hover:bg-white hover:text-background"
              >
                <Edit2 className="inline mr-1" size={12} />
                EDIT
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(image)}
                className="flex-1 px-2 py-1.5 border-2 border-white bg-red-600 text-white font-bold text-xs uppercase transition-all duration-200 hover:bg-red-700"
              >
                <Trash2 className="inline mr-1" size={12} />
                DELETE
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminPhotoCard;
