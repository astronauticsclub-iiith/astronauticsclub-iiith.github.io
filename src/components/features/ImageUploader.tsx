"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useAlert } from "@/hooks/useAlert";
import CustomAlert from "@/components/ui/CustomAlert";
import { withBasePath, withUploadPath } from "../common/HelperFunction";

interface UploadedImage {
    filename: string;
    filePath: string;
    fileSize: number;
    fileType: string;
}

interface ImageUploaderProps {
    onImageUpload: (imagePath: string) => void;
    onClose: () => void;
}

export default function ImageUploader({ onImageUpload, onClose }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showError, showSuccess, closeAlert, alertState } = useAlert();

    const handleFileUpload = async (files: FileList) => {
        setUploading(true);
        const newImages: UploadedImage[] = [];

        try {
            for (const file of Array.from(files)) {
                // Validate file type and size
                if (!file.type.startsWith("image/")) {
                    showError(`${file.name} is not an image file`);
                    continue;
                }

                if (file.size > 10 * 1024 * 1024) {
                    showError(`${file.name} is too large. Maximum size is 10MB`);
                    continue;
                }

                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch(withBasePath(`/api/upload`), {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    newImages.push(result);
                } else {
                    const error = await response.json();
                    showError(`Failed to upload ${file.name}: ${error.error}`);
                }
            }

            setUploadedImages([...uploadedImages, ...newImages]);

            // Automatically add all uploaded images to the blog
            newImages.forEach((image) => {
                onImageUpload(image.filePath);
            });

            if (newImages.length > 0) {
                showSuccess(
                    `Successfully uploaded ${newImages.length} image${newImages.length > 1 ? "s" : ""}`
                );
            }
        } catch (error) {
            console.error("Error uploading files:", error);
            showError("Failed to upload images");
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileUpload(files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const copyImageUrl = (imagePath: string) => {
        navigator.clipboard.writeText(imagePath);
        showSuccess("Image URL copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background border-4 border-white p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white uppercase">UPLOAD IMAGES</h2>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-colors text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* Upload Area */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-4 border-white p-8 text-center transition-colors ${
                        dragOver ? "bg-white bg-opacity-10" : "hover:bg-white hover:bg-opacity-5"
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="space-y-4">
                        <div className="text-white text-6xl font-bold">📁</div>

                        <div>
                            <p className="text-white text-lg font-bold uppercase">
                                DROP IMAGES HERE OR{" "}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] transition-colors uppercase"
                                >
                                    BROWSE FILES
                                </button>
                            </p>
                            <p className="text-[#e0e0e0] text-sm mt-2 font-medium uppercase">
                                SUPPORTS JPEG, PNG, GIF UP TO 10MB EACH
                            </p>
                        </div>
                    </div>
                </div>

                {uploading && (
                    <div className="mt-4 p-4 border-2 border-white bg-background">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            <span className="text-white font-bold uppercase">
                                UPLOADING IMAGES...
                            </span>
                        </div>
                    </div>
                )}

                {/* Uploaded Images */}
                {uploadedImages.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-bold text-white mb-4 uppercase">
                            UPLOADED IMAGES
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {uploadedImages.map((image, index) => (
                                <div
                                    key={index}
                                    className="border-2 border-white bg-background p-4"
                                >
                                    <div className="aspect-video relative border-2 border-white overflow-hidden mb-3">
                                        <Image
                                            src={withUploadPath(image.filePath)}
                                            alt={image.filename}
                                            unoptimized
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-white text-sm font-bold truncate uppercase">
                                            {image.filename}
                                        </p>
                                        <p className="text-[#e0e0e0] text-xs font-medium">
                                            {(image.fileSize / 1024 / 1024).toFixed(2)} MB
                                        </p>

                                        <button
                                            onClick={() => copyImageUrl(image.filePath)}
                                            className="w-full px-3 py-2 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-colors text-sm uppercase"
                                        >
                                            COPY URL
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Markdown Help */}
                <div className="mt-6 p-4 border-2 border-white bg-background">
                    <h4 className="text-white font-bold mb-2 uppercase">HOW IMAGES WORK:</h4>
                    <div className="text-[#e0e0e0] text-sm space-y-1 font-medium">
                        <p>
                            • <strong>UPLOAD</strong> - IMAGES ARE AUTOMATICALLY ADDED TO YOUR BLOG
                        </p>
                        <p>
                            • <strong>MANAGE</strong> - USE THE TOOLBAR ABOVE THE CONTENT EDITOR TO
                            INSERT OR REMOVE
                        </p>
                        <p>
                            • <strong>COPY URL</strong> - FOR MANUAL MARKDOWN:{" "}
                            <code className="bg-white text-background px-1 font-bold">
                                ![ALT TEXT](IMAGE_URL)
                            </code>
                        </p>
                    </div>
                </div>

                {/* Custom Alert */}
                <CustomAlert
                    isOpen={alertState.isOpen}
                    message={alertState.message}
                    type={alertState.type}
                    onClose={closeAlert}
                />
            </div>
        </div>
    );
}
