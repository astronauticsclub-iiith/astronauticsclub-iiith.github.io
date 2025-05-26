"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import ImagePreview from "@/components/common/ImagePreview";
import "./ClickableImage.css";

interface ClickableImageProps extends Omit<ImageProps, "onClick"> {
  wrapperClassName?: string;
  openOnClick?: boolean;
}

/**
 * A reusable image component that can be clicked to open in a preview modal.
 * Extends Next.js Image component with preview functionality.
 */
const ClickableImage = ({
  src,
  alt,
  wrapperClassName = "",
  openOnClick = true,
  className = "",
  ...props
}: ClickableImageProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleClick = () => {
    if (openOnClick) {
      setIsPreviewOpen(true);
    }
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  return (
    <>
      <div
        className={`clickable-image-wrapper h-full w-full ${wrapperClassName}`}
        onClick={handleClick}
      >
        <Image src={src} alt={alt || ""} className={className} {...props} />
      </div>

      <ImagePreview
        src={typeof src === "string" ? src : src.toString()}
        alt={alt || ""}
        isOpen={isPreviewOpen}
        onClose={closePreview}
      />
    </>
  );
};

export default ClickableImage;
