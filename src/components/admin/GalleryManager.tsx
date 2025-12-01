"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    ImageIcon,
    ChevronDown,
    Camera,
    Calendar,
} from "lucide-react";
import { GalleryImage } from "@/types/gallery-image";
import AdminPhotoCard from "@/components/admin/AdminPhotoCard";
import { withBasePath } from "@/components/common/HelperFunction";

interface GalleryManagerProps {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
}

export default function GalleryManager({
    showSuccess,
    showError,
}: GalleryManagerProps) {
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadCategory, setUploadCategory] = useState<
        "astrophotography" | "events" | "others"
    >("astrophotography");
    const [uploadFilename, setUploadFilename] = useState("");
    const [showUploadCategoryDropdown, setShowUploadCategoryDropdown] =
        useState(false);
    const uploadDropdownRef = useRef<HTMLDivElement>(null);
    const [editingImage, setEditingImage] = useState<string | null>(null);

    const fetchGalleryImages = useCallback(async () => {
        setGalleryLoading(true);
        try {
            const response = await fetch(withBasePath(`/api/gallery/admin`));
            if (response.ok) {
                const data = await response.json();
                setGalleryImages(data.images || []);
            } else {
                showError("Failed to fetch gallery images");
            }
        } catch (error) {
            console.error("Error fetching gallery images:", error);
            showError("Failed to fetch gallery images");
        } finally {
            setGalleryLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchGalleryImages();
    }, [fetchGalleryImages]);

    // Close upload dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                uploadDropdownRef.current &&
                !uploadDropdownRef.current.contains(event.target as Node)
            ) {
                setShowUploadCategoryDropdown(false);
            }
        };

        if (showUploadCategoryDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showUploadCategoryDropdown]);

    const getUploadCategoryIcon = (
        category: "astrophotography" | "events" | "others"
    ) => {
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

    const uploadImage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) {
            showError("Please select a file to upload");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", uploadFile);
            formData.append("category", uploadCategory);
            if (uploadFilename) {
                formData.append("filename", uploadFilename);
            }

            const response = await fetch(withBasePath(`/api/gallery/admin`), {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setUploadFile(null);
                setUploadFilename("");
                fetchGalleryImages();
                showSuccess("Image uploaded successfully");
                // Reset file input
                const fileInput = document.querySelector(
                    'input[type="file"]'
                ) as HTMLInputElement;
                if (fileInput) fileInput.value = "";
            } else {
                const error = await response.json();
                showError(error.error || "Failed to upload image");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            showError("Failed to upload image");
        }
    };

    const deleteImage = async (image: GalleryImage) => {
        try {
            const response = await fetch(
                withBasePath(
                    `/api/gallery/admin?filename=${encodeURIComponent(
                        image.filename
                    )}&category=${image.category}`
                ),
                { method: "DELETE" }
            );

            if (response.ok) {
                fetchGalleryImages();
                showSuccess("Image deleted successfully");
            } else {
                const error = await response.json();
                showError(error.error || "Failed to delete image");
            }
        } catch (error) {
            console.error("Error deleting image:", error);
            showError("Failed to delete image");
        }
    };

    const updateImage = async (
        image: GalleryImage,
        newFilename?: string,
        newCategory?: "astrophotography" | "events" | "others"
    ) => {
        try {
            const response = await fetch(withBasePath(`/api/gallery/admin`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentFilename: image.filename,
                    currentCategory: image.category,
                    newFilename,
                    newCategory,
                }),
            });

            if (response.ok) {
                setEditingImage(null);
                fetchGalleryImages();
                showSuccess("Image updated successfully");
            } else {
                const error = await response.json();
                showError(error.error || "Failed to update image");
            }
        } catch (error) {
            console.error("Error updating image:", error);
            showError("Failed to update image");
            throw error;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
        >
            {/* Upload Form */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
            >
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase flex items-center gap-2">
                    <Upload size={18} className="sm:w-6 sm:h-6" />
                    UPLOAD NEW IMAGE
                </h2>
                <form
                    onSubmit={uploadImage}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
                >
                    <div className="lg:col-span-2">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-bold file:bg-white file:text-background hover:file:bg-[#e0e0e0]"
                            required
                        />
                    </div>
                    <div>
                        <div className="relative" ref={uploadDropdownRef}>
                            <button
                                type="button"
                                onClick={() =>
                                    setShowUploadCategoryDropdown(!showUploadCategoryDropdown)
                                }
                                className="w-full flex items-center justify-between gap-2 bg-background border-2 border-white p-3 sm:p-4 text-white font-medium text-sm sm:text-base transition-all duration-200 hover:bg-white hover:text-background focus:scale-[1.02] focus:ring-2 focus:ring-white"
                            >
                                <div className="flex items-center gap-2">
                                    {getUploadCategoryIcon(uploadCategory)}
                                    <span className="uppercase">{uploadCategory}</span>
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${showUploadCategoryDropdown ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            <AnimatePresence>
                                {showUploadCategoryDropdown && (
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
                                                setUploadCategory("astrophotography");
                                                setShowUploadCategoryDropdown(false);
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium hover:bg-white hover:text-background transition-colors ${uploadCategory === "astrophotography"
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
                                                setUploadCategory("events");
                                                setShowUploadCategoryDropdown(false);
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium hover:bg-white hover:text-background transition-colors ${uploadCategory === "events"
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
                                                setUploadCategory("others");
                                                setShowUploadCategoryDropdown(false);
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium hover:bg-white hover:text-background transition-colors ${uploadCategory === "others"
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
                    <div>
                        <input
                            type="text"
                            placeholder="CUSTOM FILENAME (OPTIONAL)"
                            value={uploadFilename}
                            onChange={(e) => setUploadFilename(e.target.value)}
                            className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] uppercase text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-3 sm:px-4 py-3 sm:py-4 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] transition-all duration-200 uppercase text-sm sm:text-base hover:scale-105 active:scale-95"
                    >
                        <Upload className="inline mr-2" size={14} />
                        UPLOAD
                    </button>
                </form>
            </motion.div>

            {/* Gallery Images List */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
            >
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase flex items-center gap-2">
                    <ImageIcon size={18} className="sm:w-6 sm:h-6" />
                    GALLERY IMAGES ({galleryImages.length})
                </h2>

                {galleryLoading ? (
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
                        <span className="ml-3 text-white font-bold uppercase">
                            Loading gallery...
                        </span>
                    </div>
                ) : galleryImages.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-white font-bold uppercase">No images found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {galleryImages.map((image, index) => (
                            <AdminPhotoCard
                                key={image.id}
                                image={image}
                                index={index}
                                onEdit={updateImage}
                                onDelete={deleteImage}
                                isEditing={editingImage === image.id}
                                onStartEdit={() => setEditingImage(image.id)}
                                onCancelEdit={() => setEditingImage(null)}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
