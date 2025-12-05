"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    Image as ImageIcon,
    Filter,
    Calendar,
    ChevronDown,
    Loader2,
} from "lucide-react";
import { GalleryImage } from "@/types/gallery-image";
import AdminPhotoCard from "@/components/admin/AdminPhotoCard";
import {
    fetchAdminGalleryImages,
    uploadGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
} from "@/lib/admin_api";

interface GalleryManagerProps {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
}

export default function GalleryManager({
    showSuccess,
    showError,
}: GalleryManagerProps) {
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadCategory, setUploadCategory] = useState("all");
    const [customFilename, setCustomFilename] = useState("");
    const [editingImage, setEditingImage] = useState<string | null>(null);
    const [showUploadCategoryDropdown, setShowUploadCategoryDropdown] =
        useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadDropdownRef = useRef<HTMLDivElement>(null);

    const fetchGalleryImages = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAdminGalleryImages();
            setGalleryImages(data.images || []);
        } catch (error: unknown) {
            console.error("Error fetching gallery images:", error);
            showError((error as Error).message || "Failed to fetch images");
        } finally {
            setLoading(false);
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

    const getUploadCategoryIcon = (category: string) => {
        switch (category) {
            case "astrophotography":
                return <ImageIcon size={18} />;
            case "events":
                return <Calendar size={18} />;
            case "others":
                return <Filter size={18} />;
            default:
                return <Filter size={18} />;
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) {
            showError("Please select a file to upload");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("category", uploadCategory);
        if (customFilename) {
            formData.append("customFilename", customFilename);
        }

        try {
            await uploadGalleryImage(formData);
            setUploadFile(null);
            setCustomFilename("");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            fetchGalleryImages();
            showSuccess("Image uploaded successfully");
        } catch (error: unknown) {
            console.error("Error uploading image:", error);
            showError((error as Error).message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (image: GalleryImage) => {
        try {
            await deleteGalleryImage(image.filename, image.category);
            fetchGalleryImages();
            showSuccess("Image deleted successfully");
        } catch (error: unknown) {
            console.error("Error deleting image:", error);
            showError((error as Error).message || "Failed to delete image");
        }
    };

    const handleUpdate = async (
        image: GalleryImage,
        newFilename?: string,
        newCategory?: "astrophotography" | "events" | "others"
    ) => {
        try {
            await updateGalleryImage({
                currentFilename: image.filename,
                currentCategory: image.category,
                newFilename,
                newCategory,
            });

            setEditingImage(null);
            fetchGalleryImages();
            showSuccess("Image updated successfully");
        } catch (error: unknown) {
            console.error("Error updating image:", error);
            showError((error as Error).message || "Failed to update image");
            throw error;
        }
    };

    return (
        <div className="space-y-8">
            {/* Upload Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mb-8 border-2 sm:border-4 border-white p-4 sm:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
            >
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white uppercase flex items-center gap-2">
                    <Upload size={24} />
                    UPLOAD NEW IMAGE
                </h2>

                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white text-xs font-bold mb-1 uppercase">
                                Category
                            </label>
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
                                            className="absolute z-10 w-full mt-2 bg-background border-2 border-white shadow-xl"
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
                                                <ImageIcon size={16} />
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
                                                <Filter size={16} />
                                                <span className="uppercase">OTHERS</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div>
                            <label className="block text-white text-xs font-bold mb-1 uppercase">
                                Custom Filename (Optional)
                            </label>
                            <input
                                type="text"
                                value={customFilename}
                                onChange={(e) => setCustomFilename(e.target.value)}
                                placeholder="LEAVE EMPTY FOR ORIGINAL"
                                className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-white text-xs font-bold mb-1 uppercase">
                            Image File
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white file:mr-4 file:py-1 file:px-2 file:border-0 file:text-xs file:font-bold file:bg-white file:text-background hover:file:bg-[#e0e0e0]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full sm:w-auto px-6 py-3 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] transition-all duration-200 uppercase text-sm hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="inline mr-2 animate-spin" size={14} />
                                UPLOADING...
                            </>
                        ) : (
                            <>
                                <Upload className="inline mr-2" size={14} />
                                UPLOAD IMAGE
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            {/* Gallery Grid */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="border-2 sm:border-4 border-white p-4 sm:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
            >
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white uppercase flex items-center gap-2">
                    <ImageIcon size={24} />
                    GALLERY IMAGES ({galleryImages.length})
                </h2>

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
                        <span className="ml-3 text-white font-bold uppercase">
                            Loading images...
                        </span>
                    </div>
                ) : galleryImages.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-white font-bold uppercase">No images found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {galleryImages.map((image, index) => (
                            <AdminPhotoCard
                                key={image.filename}
                                image={image}
                                index={index}
                                onEdit={handleUpdate}
                                onDelete={handleDelete}
                                isEditing={editingImage === image.filename}
                                onStartEdit={() => setEditingImage(image.filename)}
                                onCancelEdit={() => setEditingImage(null)}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
