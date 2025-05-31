"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../ui/Loader";

interface ImagePreviewProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImagePreview = ({ src, alt, isOpen, onClose }: ImagePreviewProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle close action
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Set up viewport variables for better mobile experience
  useEffect(() => {
    if (!isMounted) return;

    const setViewportHeight = () => {
      // Set CSS variables for viewport dimensions
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };

    // Handle body scroll locking
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Update viewport height calculation for mobile
      setViewportHeight();
      window.addEventListener("resize", setViewportHeight);
      window.addEventListener("orientationchange", setViewportHeight);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      window.removeEventListener("resize", setViewportHeight);
      window.removeEventListener("orientationchange", setViewportHeight);
    };
  }, [isOpen, isMounted]);

  // Initialize component
  useEffect(() => {
    setIsMounted(true);

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [handleClose]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm touch-none"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100dvw",
            height: "calc(var(--vh, 1vh) * 100)",
            transform: "translate3d(0,0,0)",
            WebkitTransform: "translate3d(0,0,0)",
            margin: 0,
            padding: 0,
            WebkitTapHighlightColor: "transparent",
            touchAction: "none",
          }}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Image preview: ${alt}`}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 350,
              duration: 0.25,
            }}
            className="relative max-w-5xl w-[90%] sm:w-full max-h-[80dvh] sm:max-h-[90vh] bg-background shadow-2xl rounded-xl overflow-hidden border border-gray-200/10 m-auto"
            style={{
              maxHeight: "calc(var(--vh, 1vh) * 80)",
              transform: "translate3d(0,0,0)",
              WebkitTransform: "translate3d(0,0,0)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-md cursor-close"
              aria-label="Close preview"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader />
              </div>
            )}
            {/* Image container */}
            <div
              className="relative w-full p-2 sm:p-6"
              style={{
                height: "calc(var(--vh, 1vh) * 70)",
                maxHeight: "calc(var(--vh, 1vh) * 70)",
                transform: "translate3d(0,0,0)",
                WebkitTransform: "translate3d(0,0,0)",
              }}
            >
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain transition-opacity duration-300"
                sizes="(max-width: 768px) 100vw, 90vw"
                priority
                quality={95}
                onLoad={handleImageLoad}
                style={{ opacity: isLoading ? 0 : 1 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImagePreview;
