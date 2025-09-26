"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit, Trash2, Eye, Heart, Upload, Plus, FileText, BookCheck } from "lucide-react";
import Image from "next/image";
import ProfileEditor from "@/components/features/ProfileEditor";
import ImageUploader from "@/components/features/ImageUploader";
import BlogPreview from "@/components/features/BlogPreview";
import CustomAlert from "@/components/ui/CustomAlert";
import CustomConfirm from "@/components/ui/CustomConfirm";
import { useAlert } from "@/hooks/useAlert";
import "@/components/ui/bg-patterns.css";
import ProfileInfo from "@/components/features/mod/ProfileInfo";
import { withBasePath, withUploadPath } from "@/components/common/HelperFunction";
import {User} from "@/types/user"
import { Blog, BlogStats } from "@/types/blog";

interface NewBlog {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  readTime: number;
  images?: string[];
}

export default function BlogAuthorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState<BlogStats>({
    totalBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [activeTab, setActiveTab] = useState<"dashboard" | "write" | "edit">(
    "dashboard"
  );
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'writer' | 'none' | undefined>(undefined);
  const [newBlog, setNewBlog] = useState<NewBlog>({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    readTime: 1,
    images: [],
  });
  const {
    showSuccess,
    showError,
    showConfirm,
    closeAlert,
    closeConfirm,
    handleConfirm,
    alertState,
    confirmState,
  } = useAlert();

  useEffect(() => {
    if (status === "loading") return;

    const user = session?.user as User;
    const userRole = user?.role;
    setCurrentUserRole(userRole);
    if (userRole !== "admin" && userRole !== "writer") {
      router.push("/stay-away-snooper");
      return;
    }

    fetchMyBlogs(userRole);
    fetchUserProfile();
  }, [session, status, router]);

  const fetchMyBlogs = async (role: string) => {
    try {
      const url = role === 'admin' ? `/api/admin-blogs` : `/api/my-blogs`;
      const response = await fetch(withBasePath(url));
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(withBasePath(`/api/users/me`));
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Error during logout:", error);
      showError("Failed to logout");
    }
  };

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  function calculateReadTime(text: string, wpm = 200): number {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wpm));
  }


  const publishBlog = async () => {
    if (!newBlog.title || !newBlog.content || !newBlog.excerpt) {
      showError("Please fill in all required fields");
      return;
    }

    if (!newBlog.images || newBlog.images.length === 0) {
      showError("Please upload at least one image for your blog");
      return;
    }

    const slug = createSlug(newBlog.title);
    const blogData = {
      id: `blog-${Date.now()}`,
      title: newBlog.title,
      slug,
      excerpt: newBlog.excerpt,
      content: newBlog.content,
      author: {
        email: session?.user?.email || "",
      },
      publishedAt: new Date().toISOString(),
      readTime: calculateReadTime(newBlog.content),
      approved: false,
      tags: newBlog.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      images: newBlog.images || [],
    };

    try {
      const response = await fetch(withBasePath(`/api/blogs`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogData),
      });

      if (response.ok) {
        setNewBlog({
          title: "",
          excerpt: "",
          content: "",
          tags: "",
          readTime: 1,
          images: [],
        });
        setActiveTab("dashboard");
        if (currentUserRole) {
          fetchMyBlogs(currentUserRole);
        }
        showSuccess("Blog published successfully!");
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to publish blog");
      }
    } catch (error) {
      console.error("Error publishing blog:", error);
      showError("Failed to publish blog");
    }
  };

  const deleteBlog = async (slug: string) => {
    showConfirm(
      "DELETE BLOG",
      "Are you sure you want to delete this blog? This action cannot be undone.",
      () => performDeleteBlog(slug),
      { type: "danger", confirmText: "DELETE BLOG" }
    );
  };

  const approveBlog = async (slug: string) => {
    showConfirm(
      "APPROVE BLOG",
      "Are you sure you want to approve this blog? This action cannot be undone.",
      () => performApproveBlog(slug),
      { type: "danger", confirmText: "APPROVE BLOG" }
    );
  }

  const performDeleteBlog = async (slug: string) => {
    try {
      const response = await fetch(withBasePath(`/api/blogs/${slug}`), {
        method: "DELETE",
      });

      if (response.ok) {
        if (currentUserRole) {
          fetchMyBlogs(currentUserRole);
        }
        showSuccess("Blog deleted successfully");
      } else {
        showError("Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      showError("Failed to delete blog");
    }
  };

  const performApproveBlog = async (slug: string) => {
    try {
      const response = await fetch(withBasePath(`/api/blogs/${slug}`), {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
        }),
      });

      if (response.ok) {
        if (currentUserRole) {
          fetchMyBlogs(currentUserRole);
        }
        showSuccess("Blog approved successfully");
      } else {
        showError("Failed to approve blog");
      }
    } catch (error) {
      console.error("Error approving blog:", error);
      showError("Failed to approve blog");
    }
  };

  const updateBlog = async () => {
    if (
      !editingBlog ||
      !editingBlog.title ||
      !editingBlog.content ||
      !editingBlog.excerpt
    ) {
      showError("Please fill in all required fields");
      return;
    }

    if (!editingBlog.images || editingBlog.images.length === 0) {
      showError("Please upload at least one image for your blog");
      return;
    }

    try {
      const response = await fetch(withBasePath(`/api/blogs/${editingBlog.slug}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingBlog.title,
          excerpt: editingBlog.excerpt,
          content: editingBlog.content,
          tags: editingBlog.tags,
          readTime: calculateReadTime(editingBlog.content),
          images: editingBlog.images,
        }),
      });

      if (response.ok) {
        setEditingBlog(null);
        setActiveTab("dashboard");
        if (currentUserRole) {
          fetchMyBlogs(currentUserRole);
        }
        showSuccess("Blog updated successfully!");
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to update blog");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      showError("Failed to update blog");
    }
  };

  const addImageToBlog = (imagePath: string) => {
    if (activeTab === "write") {
      const currentImages = newBlog.images || [];
      const updatedImages = currentImages.includes(imagePath)
        ? currentImages
        : [...currentImages, imagePath];

      setNewBlog({
        ...newBlog,
        images: updatedImages,
      });
    } else if (editingBlog) {
      const currentImages = editingBlog.images || [];
      const updatedImages = currentImages.includes(imagePath)
        ? currentImages
        : [...currentImages, imagePath];

      setEditingBlog({
        ...editingBlog,
        images: updatedImages,
      });
    }
    setShowImageUploader(false);
  };

  const removeImageFromBlog = async (imagePath: string) => {
    try{
      const response = await fetch(withBasePath(`/api/upload?filename=${encodeURIComponent(imagePath)}`), {
        method: "DELETE",
      });

      if (response.ok){
        if (activeTab === "write") {
          const updatedImages =
            newBlog.images?.filter((img) => img !== imagePath) || [];
          setNewBlog({
            ...newBlog,
            images: updatedImages,
          });
        } 
        else if (editingBlog) {
          const updatedImages =
            editingBlog.images?.filter((img) => img !== imagePath) || [];
          setEditingBlog({
            ...editingBlog,
            images: updatedImages,
          });
        }
      }
    } catch(err) {
        console.error(err);
        showError("Failed to delete image");
    }
  };

  const insertImageReference = (imagePath: string) => {
    const imageMarkdown = `\n![Image](${imagePath})\n`;
    if (activeTab === "write") {
      setNewBlog({
        ...newBlog,
        content: newBlog.content + imageMarkdown,
      });
    } else if (editingBlog) {
      setEditingBlog({
        ...editingBlog,
        content: editingBlog.content + imageMarkdown,
      });
    }
  };

  const copyImageUrl = (imagePath: string) => {
    navigator.clipboard.writeText(imagePath);
    showSuccess("Image URL copied to clipboard!");
  };

  const UploadedImagesPanel = () => {
    const currentImages =
      activeTab === "write" ? newBlog.images || [] : editingBlog?.images || [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-2 border-white bg-background/70 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white font-bold uppercase text-sm sm:text-base lg:text-lg"
          >
            BLOG IMAGES ({currentImages.length})
          </motion.h3>
          <motion.button
            onClick={() => setShowImageUploader(true)}
            className="group w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] transition-all duration-300 uppercase text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Upload
              size={16}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            ADD IMAGE
          </motion.button>
        </div>

        {currentImages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-8 sm:py-12 lg:py-16"
          >
            <Upload size={48} className="mx-auto mb-4 text-[#666]" />
            <p className="text-[#e0e0e0] font-bold uppercase text-sm sm:text-base">
              NO IMAGES UPLOADED YET
            </p>
            <p className="text-[#e0e0e0] text-xs sm:text-sm mt-2">
              AT LEAST ONE IMAGE IS REQUIRED FOR PUBLISHING
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
          >
            {currentImages.map((imagePath : string, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 * index,
                  type: "spring",
                  stiffness: 200,
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 25px rgba(255, 255, 255, 0.2)",
                  transition: { duration: 0.3 },
                }}
                className="group border-2 border-white bg-background/50 p-2 sm:p-3 hover:bg-background/70 transition-all duration-300"
              >
                <motion.div
                  className="aspect-video relative border-2 border-white overflow-hidden mb-3"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={withUploadPath(imagePath)}
                    alt={`Blog image ${index + 1}`}
                    unoptimized
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </motion.div>

                <div className="space-y-2 sm:space-y-3">
                  <p className="text-white text-xs sm:text-sm font-bold truncate">
                    {imagePath.split("/").pop()}
                  </p>

                  <div className="grid grid-cols-3 gap-1">
                    <motion.button
                      onClick={() => insertImageReference(imagePath)}
                      className="px-1 sm:px-2 py-1 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] transition-all duration-300 text-xs uppercase hover:scale-105"
                      title="Insert into content"
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      INSERT
                    </motion.button>
                    <motion.button
                      onClick={() => copyImageUrl(imagePath)}
                      className="px-1 sm:px-2 py-1 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-all duration-300 text-xs uppercase hover:scale-105"
                      title="Copy URL"
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      COPY
                    </motion.button>
                    <motion.button
                      onClick={() => removeImageFromBlog(imagePath)}
                      className="px-1 sm:px-2 py-1 border-2 border-white bg-[#d2042d] text-white font-bold hover:bg-white hover:text-[#d2042d] transition-all duration-300 text-xs uppercase hover:scale-105"
                      title="Remove from blog"
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      DELETE
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background bg-pattern-wiggle flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4 sm:mb-6"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-wider"
          >
            LOADING DASHBOARD...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-pattern-wiggle">
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8 sm:mb-10 lg:mb-12"
          >
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight mb-3 sm:mb-4 text-white leading-tight"
            >
              WRITER DASHBOARD
            </motion.h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="h-1 bg-white mb-4 sm:mb-6"
            ></motion.div>

            {/* Profile Info */}
            {userProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              >
                <ProfileInfo
                  userProfile={userProfile}
                  type="writer"
                  onEditProfile={() => setShowProfileEditor(true)}
                  onLogout={handleLogout}
                />
              </motion.div>
            )}
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            className="mb-6 sm:mb-8 lg:mb-10"
          >
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
              <motion.button
                onClick={() => setActiveTab("dashboard")}
                className={`group w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4 border-2 border-white font-bold transition-all duration-300 uppercase text-sm sm:text-base ${
                  activeTab === "dashboard"
                    ? "bg-white text-background shadow-lg"
                    : "text-white hover:bg-white hover:text-background hover:scale-105 hover:shadow-lg"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FileText
                  className="inline mr-2 transition-transform duration-300 group-hover:rotate-12"
                  size={16}
                />
                DASHBOARD
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("write")}
                className={`group w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4 border-2 border-white font-bold transition-all duration-300 uppercase text-sm sm:text-base ${
                  activeTab === "write"
                    ? "bg-white text-background shadow-lg scale-105"
                    : "text-white hover:bg-white hover:text-background hover:scale-105 hover:shadow-lg"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus
                  className="inline mr-2 transition-transform duration-300 group-hover:rotate-90"
                  size={16}
                />
                WRITE NEW
              </motion.button>
            </div>
          </motion.div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6 sm:space-y-8 lg:space-y-10"
            >
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    title: "TOTAL BLOGS",
                    value: formatCount(stats.totalBlogs),
                    delay: 0.1,
                    icon: FileText,
                  },
                  {
                    title: "TOTAL VIEWS",
                    value: formatCount(stats.totalViews),
                    delay: 0.2,
                    icon: Eye,
                  },
                  {
                    title: "TOTAL LIKES",
                    value: formatCount(stats.totalLikes),
                    delay: 0.3,
                    icon: Heart,
                  },
                ].map((stat) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: stat.delay,
                      ease: "easeOut",
                    }}
                    className="group border-4 border-white p-4 sm:p-6 lg:p-8 backdrop-blur-sm text-center bg-background/50 hover:bg-background/70 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center mb-2 sm:mb-3">
                      <stat.icon
                        size={24}
                        className="text-white transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <motion.h3
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        duration: 0.8,
                        delay: stat.delay + 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      {stat.value}
                    </motion.h3>
                    <p className="text-[#e0e0e0] font-bold uppercase text-xs sm:text-sm lg:text-base">
                      {stat.title}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Blogs List */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="border-4 border-white p-4 sm:p-6 lg:p-8 backdrop-blur-sm bg-background/50"
              >
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8 text-white uppercase">
                  YOUR BLOGS
                </h2>
                <div className="space-y-6">
                  {blogs.map((blog, index) => (
                    <motion.div
                      key={blog._id}
                      initial={{ opacity: 0, x: -30, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.1 * index,
                        ease: "easeOut",
                      }}
                      className="group border-2 border-white p-4 sm:p-6 backdrop-blur-sm flex flex-col lg:flex-row justify-between items-start bg-background/30 hover:bg-background/50 transition-all duration-300"
                    >
                      <div className="flex-1 w-full lg:w-auto">
                        <h3
                          className="text-lg sm:text-xl lg:text-2xl font-bold uppercase mb-2 sm:mb-3 duration-300"
                        >
                          {blog.title}
                        </h3>
                        <p className="text-[#e0e0e0] font-medium mb-3 text-sm sm:text-base leading-relaxed">
                          {blog.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                          {blog.tags.map((tag, tagIndex) => (
                            <motion.span
                              key={tag}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                duration: 0.3,
                                delay: 0.1 * tagIndex,
                              }}
                              className="px-2 sm:px-3 py-1 bg-white text-background font-bold text-xs sm:text-sm uppercase"
                            >
                              {tag}
                            </motion.span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-[#e0e0e0] font-medium">
                          <motion.span
                            className="flex items-center gap-1 hover:text-white transition-colors duration-300"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Eye
                              size={14}
                              className="transition-transform duration-300 hover:scale-110"
                            />
                            {formatCount(blog.views)}
                          </motion.span>
                          <motion.span
                            className="flex items-center gap-1 hover:text-red-400 transition-colors duration-300"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Heart
                              size={14}
                              className="transition-transform duration-300 hover:scale-110"
                            />
                            {formatCount(blog.likes)}
                          </motion.span>
                          <span className="hover:text-white transition-colors duration-300">
                            {new Date(blog.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-row lg:flex-col gap-2 sm:gap-3 mt-4 lg:mt-0 lg:ml-6 w-full lg:w-auto">
                        <motion.button
                          onClick={() => {
                            setEditingBlog(blog);
                            setActiveTab("edit");
                          }}
                          className="group/btn flex-1 lg:flex-none px-3 sm:px-4 py-2 sm:py-3 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-all duration-300 uppercase text-xs sm:text-sm flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit
                            size={14}
                            className="transition-transform duration-300 group-hover/btn:rotate-12"
                          />
                          EDIT
                        </motion.button>
                        <motion.button
                          onClick={() => deleteBlog(blog.slug)}
                          className="group/btn flex-1 lg:flex-none px-3 sm:px-4 py-2 sm:py-3 border-2 border-white bg-[#d2042d] text-white font-bold hover:bg-white hover:text-[#d2042d] transition-all duration-300 uppercase text-xs sm:text-sm flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2
                            size={14}
                            className="transition-transform duration-300 group-hover/btn:rotate-12"
                          />
                          DELETE
                        </motion.button>
                        {session?.user?.role=="admin" && blog.approved==false? 
                          <motion.button
                            onClick={() => approveBlog(blog.slug)}
                            className="group/btn flex-1 lg:flex-none px-3 sm:px-4 py-2 sm:py-3 border-2 border-white bg-[#1bbb1b] text-white font-bold hover:bg-white hover:text-[#d2042d] transition-all duration-300 uppercase text-xs sm:text-sm flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <BookCheck
                              size={14}
                              className="transition-transform duration-300 group-hover/btn:rotate-12"
                            />
                            APPROVE
                          </motion.button>
                        : ""}
                      </div>
                    </motion.div>
                  ))}
                  {blogs.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="text-[#e0e0e0] text-center py-12 sm:py-16 font-bold uppercase text-sm sm:text-base lg:text-lg"
                    >
                      <FileText size={48} className="mx-auto mb-4 opacity-50" />
                      NO BLOGS YET. START WRITING YOUR FIRST BLOG!
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Write/Edit Tab */}
          {(activeTab === "write" || activeTab === "edit") && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-4 sm:space-y-6 lg:space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6"
              >
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white uppercase">
                  {activeTab === "write" ? "WRITE NEW BLOG" : "EDIT BLOG"}
                </h2>
                <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 sm:gap-3 lg:gap-4">
                  <motion.button
                    onClick={() => setIsPreview(!isPreview)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-all duration-300 uppercase text-sm sm:text-base hover:scale-105 hover:shadow-lg"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isPreview ? "EDIT" : "PREVIEW"}
                  </motion.button>
                  <motion.button
                    onClick={activeTab === "write" ? publishBlog : updateBlog}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] transition-all duration-300 uppercase text-sm sm:text-base hover:scale-105 hover:shadow-lg"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {activeTab === "write" ? "PUBLISH" : "UPDATE"}
                  </motion.button>
                </div>
              </motion.div>

              {!isPreview ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="border-4 border-white p-4 sm:p-6 lg:p-8 backdrop-blur-sm space-y-4 sm:space-y-6 bg-background/50"
                >
                  <motion.input
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    type="text"
                    placeholder="BLOG TITLE"
                    value={
                      activeTab === "write"
                        ? newBlog.title
                        : editingBlog?.title || ""
                    }
                    onChange={(e) =>
                      activeTab === "write"
                        ? setNewBlog({ ...newBlog, title: e.target.value })
                        : setEditingBlog(
                            editingBlog
                              ? { ...editingBlog, title: e.target.value }
                              : null
                          )
                    }
                    className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white text-lg sm:text-xl font-bold placeholder-[#666] uppercase focus:border-yellow-300 focus:outline-none transition-all duration-300 focus:shadow-lg"
                  />

                  <motion.textarea
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    placeholder="BLOG EXCERPT"
                    value={
                      activeTab === "write"
                        ? newBlog.excerpt
                        : editingBlog?.excerpt || ""
                    }
                    onChange={(e) =>
                      activeTab === "write"
                        ? setNewBlog({ ...newBlog, excerpt: e.target.value })
                        : setEditingBlog(
                            editingBlog
                              ? { ...editingBlog, excerpt: e.target.value }
                              : null
                          )
                    }
                    className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white h-20 sm:h-24 font-medium placeholder-[#666] focus:border-yellow-300 focus:outline-none transition-all duration-300 focus:shadow-lg resize-none"
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                  >
                    <input
                      type="text"
                      placeholder="TAGS (COMMA SEPARATED)"
                      value={
                        activeTab === "write"
                          ? newBlog.tags
                          : editingBlog?.tags.join(", ") || ""
                      }
                      onChange={(e) =>
                        activeTab === "write"
                          ? setNewBlog({ ...newBlog, tags: e.target.value })
                          : setEditingBlog(
                              editingBlog
                                ? {
                                    ...editingBlog,
                                    tags: e.target.value
                                      .split(",")
                                      .map((t) => t.trim()),
                                  }
                                : null
                            )
                      }
                      className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] focus:border-yellow-300 focus:outline-none transition-all duration-300 focus:shadow-lg"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <UploadedImagesPanel />
                  </motion.div>

                  <motion.textarea
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    placeholder="WRITE YOUR BLOG CONTENT IN MARKDOWN..."
                    value={
                      activeTab === "write"
                        ? newBlog.content
                        : editingBlog?.content || ""
                    }
                    onChange={(e) =>
                      activeTab === "write"
                        ? setNewBlog({ ...newBlog, content: e.target.value })
                        : setEditingBlog(
                            editingBlog
                              ? { ...editingBlog, content: e.target.value }
                              : null
                          )
                    }
                    className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white h-96 sm:h-80 lg:h-96 font-mono placeholder-[#666] focus:outline-none transition-all duration-300 focus:shadow-lg resize-none"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <BlogPreview
                    title={
                      activeTab === "write"
                        ? newBlog.title
                        : editingBlog?.title || ""
                    }
                    excerpt={
                      activeTab === "write"
                        ? newBlog.excerpt
                        : editingBlog?.excerpt || ""
                    }
                    content={
                      activeTab === "write"
                        ? newBlog.content
                        : editingBlog?.content || ""
                    }
                    tags={
                      activeTab === "write"
                        ? newBlog.tags
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter((tag) => tag)
                        : editingBlog?.tags || []
                    }
                    readTime={
                      activeTab === "write"
                        ? newBlog.readTime
                        : editingBlog?.readTime || 1
                    }
                    author={{
                      name:
                        userProfile?.name || session?.user?.name || "Anonymous",
                      email: session?.user?.email || "",
                      avatar: userProfile?.avatar,
                      bio: userProfile?.bio || "Blog Author",
                    }}
                    images={
                      activeTab === "write"
                        ? newBlog.images
                        : editingBlog?.images || []
                    }
                  />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Profile Editor Modal */}
          {showProfileEditor && userProfile && (
            <ProfileEditor
              user={userProfile}
              onProfileUpdate={(updatedUser) => {
                setUserProfile(updatedUser);
                fetchUserProfile();
              }}
              onClose={() => setShowProfileEditor(false)}
            />
          )}

          {/* Image Uploader Modal */}
          {showImageUploader && (
            <ImageUploader
              onImageUpload={addImageToBlog}
              onClose={() => setShowImageUploader(false)}
            />
          )}

          {/* Custom Alert */}
          <CustomAlert
            isOpen={alertState.isOpen}
            message={alertState.message}
            type={alertState.type}
            onClose={closeAlert}
          />

          {/* Custom Confirm */}
          <CustomConfirm
            isOpen={confirmState.isOpen}
            title={confirmState.title}
            message={confirmState.message}
            type={confirmState.type}
            confirmText={confirmState.confirmText}
            cancelText={confirmState.cancelText}
            onConfirm={handleConfirm}
            onCancel={closeConfirm}
          />
        </div>
      </div>
    </div>
  );
}
