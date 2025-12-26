"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { markDownComponents } from "@/components/features/Blog/MarkdownEditor";
import { Calendar, Clock, Eye, Heart, Share2 } from "lucide-react";
import Image from "next/image";
import { useImagePreview } from "@/context/ImagePreviewContext";
import "@/components/ui/bg-patterns.css";
import { withBasePath, withUploadPath } from "../common/HelperFunction";

interface BlogPreviewProps {
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
    readTime: number;
    author: {
        name: string;
        email: string;
        avatar?: string;
        bio?: string;
    };
    images?: string[];
}

export default function BlogPreview({ title, content, tags, readTime, author }: BlogPreviewProps) {
    const { openPreview } = useImagePreview();
    const [likes] = useState(0);
    const [views] = useState(0);

    const handleImageClick = (imageSrc: string) => {
        openPreview(imageSrc, title || "Blog image");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatCount = (num: number) => {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + "B";
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M";
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + "K";
        }
        return num.toString();
    };

    return (
        <div className="min-h-screen bg-background bg-pattern-topography pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-white text-background font-bold text-sm uppercase"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-white leading-tight">
                        {title || "UNTITLED BLOG POST"}
                    </h1>
                    <div className="h-1 bg-white w-32 mb-6"></div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-6 text-[#e0e0e0] font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            {formatDate(new Date().toISOString())}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} />
                            {readTime} min read
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye size={16} />
                            {formatCount(views)} views
                        </div>
                    </div>
                </motion.div>

                {/* Content - Rendered Markdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-12"
                >
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
                            components={markDownComponents}
                        >
                            {content || "*No content yet...*"}
                        </ReactMarkdown>
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-12 border-t-2 border-white pt-8"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                disabled
                                className="flex items-center gap-2 px-4 py-2 border-2 border-white text-white font-bold opacity-50 cursor-not-allowed"
                            >
                                <Heart size={18} />
                                {formatCount(likes)}
                            </button>

                            <button
                                disabled
                                className="flex items-center gap-2 px-4 py-2 border-2 border-white text-white font-bold opacity-50 cursor-not-allowed"
                            >
                                <Share2 size={18} />
                                Share
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Author info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12 border-4 border-white p-6 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 border-2 border-white overflow-hidden">
                            <Image
                                src={
                                    author.avatar
                                        ? withUploadPath(author.avatar)
                                        : withBasePath(`/default-avatar.svg`)
                                }
                                alt={author.name}
                                width={64}
                                height={64}
                                unoptimized={!!author.avatar}
                                className="w-full h-full object-cover cursor-pointer cursor-open"
                                onClick={() =>
                                    handleImageClick(
                                        author.avatar
                                            ? withUploadPath(author.avatar)
                                            : withBasePath(`/default-avatar.svg`)
                                    )
                                }
                            />
                        </div>

                        <div>
                            <h3 className="font-bold text-xl text-white">{author.name}</h3>
                            <p className="text-[#e0e0e0] font-medium">
                                {author.bio || "Blog Author"}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
