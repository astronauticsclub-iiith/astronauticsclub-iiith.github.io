"use client";

import React, { createContext, useContext, useState } from "react";
import ImagePreview from "@/components/common/ImagePreview";
import { withBasePath } from "@/components/common/HelperFunction"

// Define the context type
type ImagePreviewContextType = {
  isPreviewOpen: boolean;
  previewImage: { src: string; alt: string };
  openPreview: (src: string, alt: string) => void;
  closePreview: () => void;
};

// Create the context with a default value
const ImagePreviewContext = createContext<ImagePreviewContextType | undefined>(
  undefined
);

// Create a provider component
export const ImagePreviewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt: string;
  }>({ src: "", alt: "" });

  // Open preview function
  const openPreview = (src: string, alt: string) => {
    setPreviewImage({ src, alt });
    setIsPreviewOpen(true);
  };

  // Close preview function
  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  // Value object to be provided by the context
  const value = {
    isPreviewOpen,
    previewImage,
    openPreview,
    closePreview,
  };

  return (
    <ImagePreviewContext.Provider value={value}>
      {children}
      <ImagePreview
        src={withBasePath(previewImage.src)}
        alt={previewImage.alt}
        isOpen={isPreviewOpen}
        onClose={closePreview}
      />
    </ImagePreviewContext.Provider>
  );
};

// Custom hook to use the image preview context
export const useImagePreview = (): ImagePreviewContextType => {
  const context = useContext(ImagePreviewContext);
  if (context === undefined) {
    throw new Error(
      "useImagePreview must be used within an ImagePreviewProvider"
    );
  }
  return context;
};
