"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { withUploadPath } from "@/components/common/HelperFunction";
import { GalleryImage } from "@/types/gallery-image";

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

export default PhotoCard