"use client";

import Image, { ImageProps } from "next/image";
import { useImagePreview } from "@/context/ImagePreviewContext";
import "./ClickableImage.css";
import { withBasePath } from "./HelperFunction";

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
  const { openPreview } = useImagePreview();

  const handleClick = () => {
    if (openOnClick) {
      openPreview(typeof src === "string" ? src : src.toString(), alt || "");
    }
  };

  return (
    <div
      className={`clickable-image-wrapper cursor-open h-full w-full ${wrapperClassName}`}
      onClick={handleClick}
    >
      <Image src={withBasePath(src)} alt={alt || ""} className={className} {...props} />
    </div>
  );
};

export default ClickableImage;
