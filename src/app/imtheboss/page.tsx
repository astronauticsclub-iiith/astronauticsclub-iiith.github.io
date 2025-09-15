"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  FileText,
  AlertTriangle,
  Plus,
  ImageIcon,
  Upload,
  FolderOpen,
  ChevronDown,
  Camera,
  Calendar,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";
import ProfileEditor from "@/components/features/ProfileEditor";
import ProfileInfo from "@/components/features/mod/ProfileInfo";
import CustomAlert from "@/components/ui/CustomAlert";
import CustomConfirm from "@/components/ui/CustomConfirm";
import AdminPhotoCard from "@/components/admin/AdminPhotoCard";
import AdminEventCard from "@/components/admin/AdminEventCard";
import ImageSelector from "@/components/admin/ImageSelector";
import DesignationCombobox from "@/components/admin/DesignationCombobox";
import { useAlert } from "@/hooks/useAlert";
import { Event } from "@/types/event";
import "@/components/ui/bg-patterns.css";
import { withBasePath } from "@/components/common/HelperFunction";

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: 'admin' | 'writer' | 'none';
}

interface User {
  _id: string;
  email: string;
  name?: string;
  role: 'admin' | 'writer' | 'none';
  designations?: string[];
  avatar?: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'writer' | 'none';
  designations?: string[];
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  source: string;
  userEmail: string;
  action: string;
  details: Record<string, unknown>;
}

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: "astrophotography" | "events" | "others";
  label: string;
  filename: string;
  size: number;
  modified: string;
  created: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [allDesignations, setAllDesignations] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "users" | "logs" | "gallery" | "events"
  >("users");
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
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    id: "",
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "stargazing" as const,
    participants: undefined as number | undefined,
    organizer: "",
    registrationLink: "",
    status: "upcoming" as const,
    image: "",
  });
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "writer" as "admin" | "writer" | "none",
  });
  const [loading, setLoading] = useState(true);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const {
    showSuccess,
    showError,
    closeAlert,
    closeConfirm,
    handleConfirm,
    alertState,
    confirmState,
  } = useAlert();

  const fetchUsers = async () => {
    try {
      const response = await fetch(withBasePath(`/api/users`));
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        const designations = Array.from(new Set(data.flatMap((u: User) => u.designations || []))) as string[];
        setAllDesignations(designations);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const response = await fetch(withBasePath(`/api/logs?limit=50`));
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        showError("Failed to fetch logs");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      showError("Failed to fetch logs");
    } finally {
      setLogsLoading(false);
    }
  }, [showError]);

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

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const response = await fetch(withBasePath(`/api/events/admin`));
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        showError("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      showError("Failed to fetch events");
    } finally {
      setEventsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (status === "loading") return;

    const user = session?.user as ExtendedUser;
    if (user?.role !== "admin") {
      router.push("/stay-away-snooper");
      return;
    }

    fetchUsers();
    fetchUserProfile();
  }, [session, status, router]);

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs();
    } else if (activeTab === "gallery") {
      fetchGalleryImages();
    } else if (activeTab === "events") {
      fetchEvents();
    }
  }, [activeTab, fetchLogs, fetchGalleryImages, fetchEvents]);

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

  // Get icon for upload category
  const getUploadCategoryIcon = (category: "astrophotography" | "events" | "others") => {
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

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(withBasePath(`/api/users`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setNewUser({ email: "", name: "", role: "writer" });
        fetchUsers();
        showSuccess("User added successfully");
      } else {
        const error = await response.json();
        showError(error.error || "Failed to add user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      showError("Failed to add user");
    }
  };

  const updateUserDesignations = async (userId: string, designations: string[]) => {
    try {
      const response = await fetch(withBasePath(`/api/users/${userId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designations }),
      });

      if (response.ok) {
        fetchUsers();
        showSuccess("User designations updated successfully");
      } else {
        showError("Failed to update user designations");
      }
    } catch (error) {
      console.error("Error updating user designations:", error);
      showError("Failed to update user designations");
    }
  };

  const updateUserRole = async (
    userId: string,
    role: "admin" | "writer" | "none"
  ) => {
    try {
      const response = await fetch(withBasePath(`/api/users/${userId}`),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });

      if (response.ok) {
        fetchUsers();
        showSuccess("User role updated successfully");
      } else {
        showError("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      showError("Failed to update user role");
    }
  };

  const setUserRole = (
    userId: string,
    currentRole: "admin" | "writer" | "none",
    newRole: "admin" | "writer" | "none"
  ) => {
    const currentUserEmail = session?.user?.email;
    const targetUser = users.find((u) => u._id === userId);

    // Check if current user is trying to modify themselves
    const isModifyingSelf = targetUser?.email === currentUserEmail;

    // Restrict admin role modifications - admins cannot modify admin role, except self
    if (
      newRole === "admin" &&
      !isModifyingSelf &&
      currentRole === "admin"
    ) {
      showError("Admin role cannot be modified for security reasons");
      return;
    }

    updateUserRole(userId, newRole);

    // Update cookies for the current user if they are modifying their own role
    if (isModifyingSelf) {
      fetchUserProfile();

      // If not an admin, redirect to stay away page
      if (newRole !== "admin") {
        router.push("/stay-away-snooper");
      }
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
        withBasePath(`/api/gallery/admin?filename=${encodeURIComponent(
          image.filename
        )}&category=${image.category}`),
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
      throw error; // Re-throw to let AdminPhotoCard handle the error state
    }
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        id: newEvent.id,
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        type: newEvent.type,
        status: newEvent.status,
        registrationLink: newEvent.registrationLink || "",
        ...(newEvent.time && { time: newEvent.time }),
        ...(newEvent.location && { location: newEvent.location }),
        ...(newEvent.organizer && { organizer: newEvent.organizer }),
        ...(newEvent.participants !== undefined && {
          participants: newEvent.participants,
        }),
        ...(newEvent.image && { image: newEvent.image }),
      };

      console.log("Creating event with data:", eventData);
      console.log("Registration link value:", newEvent.registrationLink);

      const response = await fetch(withBasePath(`/api/events/admin`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        setNewEvent({
          id: "",
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          type: "stargazing",
          participants: undefined,
          organizer: "",
          registrationLink: "",
          status: "upcoming",
          image: "",
        });
        fetchEvents();
        showSuccess("Event created successfully");
      } else {
        const error = await response.json();
        showError(error.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      showError("Failed to create event");
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
    try {
      const response = await fetch(withBasePath(`/api/events/admin`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventData, id: eventId }),
      });

      if (response.ok) {
        setEditingEvent(null);
        fetchEvents();
        showSuccess("Event updated successfully");
      } else {
        const error = await response.json();
        showError(error.error || "Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      showError("Failed to update event");
      throw error; // Re-throw to let AdminEventCard handle the error state
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(
        withBasePath(`/api/events/admin?id=${encodeURIComponent(eventId)}`),
        { method: "DELETE" }
      );

      if (response.ok) {
        fetchEvents();
        showSuccess("Event deleted successfully");
      } else {
        const error = await response.json();
        showError(error.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      showError("Failed to delete event");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-lg sm:text-xl lg:text-2xl font-bold uppercase text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"
          />
          LOADING ADMIN DATA...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-pattern-signal pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 sm:mb-10 lg:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight mb-3 sm:mb-4 text-white leading-tight">
            ADMIN DASHBOARD
          </h1>
          <div className="h-0.5 sm:h-1 bg-white w-24 sm:w-32 mb-4 sm:mb-6"></div>

          {/* Admin Profile Info */}
          {userProfile && (
            <ProfileInfo
              userProfile={userProfile}
              type="admin"
              onEditProfile={() => setShowProfileEditor(true)}
              onLogout={handleLogout}
            />
          )}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border-2 border-white font-bold transition-all duration-200 uppercase text-sm sm:text-base hover:scale-105 active:scale-95 ${
                activeTab === "users"
                  ? "bg-white text-background"
                  : "text-white hover:bg-white hover:text-background"
              }`}
            >
              <Users className="inline mr-2" size={14} />
              <span className="hidden sm:inline">USER MANAGEMENT</span>
              <span className="sm:hidden">USERS</span>
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border-2 border-white font-bold transition-all duration-200 uppercase text-sm sm:text-base hover:scale-105 active:scale-95 ${
                activeTab === "logs"
                  ? "bg-white text-background"
                  : "text-white hover:bg-white hover:text-background"
              }`}
            >
              <FileText className="inline mr-2" size={14} />
              <span className="hidden sm:inline">SYSTEM LOGS</span>
              <span className="sm:hidden">LOGS</span>
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border-2 border-white font-bold transition-all duration-200 uppercase text-sm sm:text-base hover:scale-105 active:scale-95 ${
                activeTab === "gallery"
                  ? "bg-white text-background"
                  : "text-white hover:bg-white hover:text-background"
              }`}
            >
              <FolderOpen className="inline mr-2" size={14} />
              <span className="hidden sm:inline">GALLERY MANAGER</span>
              <span className="sm:hidden">GALLERY</span>
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border-2 border-white font-bold transition-all duration-200 uppercase text-sm sm:text-base hover:scale-105 active:scale-95 ${
                activeTab === "events"
                  ? "bg-white text-background"
                  : "text-white hover:bg-white hover:text-background"
              }`}
            >
              <CalendarDays className="inline mr-2" size={14} />
              <span className="hidden sm:inline">EVENTS MANAGER</span>
              <span className="sm:hidden">EVENTS</span>
            </button>
          </div>
        </motion.div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Add User Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
            >
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase flex items-center gap-2">
                <Plus size={18} className="sm:w-6 sm:h-6" />
                ADD NEW USER
              </h2>
              <form
                onSubmit={addUser}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
              >
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] uppercase text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                  required
                />
                <input
                  type="text"
                  placeholder="FULL NAME (OPTIONAL)"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] uppercase text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                />
                <div className="bg-background border-2 border-white p-3 sm:p-4 space-y-2 transition-all duration-200 hover:border-opacity-80">
                  <label className="text-white font-bold uppercase text-xs sm:text-sm">
                    ROLE:
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value as "admin" | "writer" | "none" })
                    }
                    className="w-full bg-background border-2 border-white p-2 text-white font-bold uppercase text-xs sm:text-sm"
                  >
                    <option value="writer">Writer</option>
                    <option value="admin">Admin</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-3 sm:py-4 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] transition-all duration-200 uppercase text-sm sm:text-base hover:scale-105 active:scale-95"
                >
                  ADD USER
                </button>
              </form>
            </motion.div>

            {/* Users List */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
            >
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase">
                ALL USERS ({users.length})
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {users.map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    className="border-2 border-white p-3 sm:p-4 backdrop-blur-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 hover:shadow-lg hover:shadow-white/5 transition-all duration-200 hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full lg:w-auto">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white overflow-hidden bg-white transition-transform duration-200 hover:scale-105">
                        {user.avatar ? (
                          <Image
                            src={withBasePath(user.avatar)}
                            alt={user.name || "User"}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-background flex items-center justify-center">
                            <Users className="text-white" size={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white uppercase text-sm sm:text-base truncate">
                          {user.name || "UNNAMED USER"}
                        </h3>
                        <p className="text-[#e0e0e0] font-medium text-xs sm:text-sm truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-[#999] font-medium">
                          JOINED:{" "}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-2 sm:gap-3 w-full lg:w-auto">
                      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            setUserRole(user._id, user.role, e.target.value as "admin" | "writer" | "none")
                          }
                          className={`w-full sm:w-auto px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-white font-bold text-xs sm:text-sm uppercase transition-all duration-200 hover:scale-105 active:scale-95 bg-background text-white`}
                          disabled={user.email === session?.user?.email}
                        >
                          <option value="writer">Writer</option>
                          <option value="admin">Admin</option>
                          <option value="none">None</option>
                        </select>
                        <DesignationCombobox
                          selectedDesignations={user.designations || []}
                          onChange={(designations) => updateUserDesignations(user._id, designations)}
                          allDesignations={allDesignations}
                          disabled={user.email === session?.user?.email}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
                {users.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-[#e0e0e0] text-center py-6 sm:py-8 font-bold uppercase text-sm sm:text-base"
                  >
                    NO USERS FOUND IN SYSTEM
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
          >
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase flex items-center gap-2">
              <AlertTriangle size={18} className="sm:w-6 sm:h-6" />
              SYSTEM LOGS ({logs.length})
            </h2>

            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
                <span className="ml-3 text-white font-bold uppercase">
                  Loading logs...
                </span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white font-bold uppercase">No logs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <motion.div
                    key={`${log.timestamp}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    className="border-2 border-white p-3 sm:p-4 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5 transition-all duration-200"
                  >
                    {/* Log Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span
                          className={`px-2 py-1 text-xs font-bold uppercase border ${
                            log.level === "error"
                              ? "bg-red-600 text-white border-red-600"
                              : log.level === "warn"
                              ? "bg-yellow-600 text-white border-yellow-600"
                              : "bg-green-600 text-white border-green-600"
                          }`}
                        >
                          {log.level}
                        </span>
                        <span className="text-white font-bold text-sm sm:text-base uppercase">
                          {log.action}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-[#e0e0e0] font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {/* Log Content */}
                    <div className="space-y-2">
                      <p className="text-white text-sm sm:text-base">
                        <span className="font-bold">Message:</span>{" "}
                        {log.message}
                      </p>

                      {log.userEmail && (
                        <p className="text-[#e0e0e0] text-sm">
                          <span className="font-bold">User:</span>{" "}
                          {log.userEmail}
                        </p>
                      )}

                      {log.source && (
                        <p className="text-[#e0e0e0] text-sm">
                          <span className="font-bold">Source:</span>{" "}
                          {log.source}
                        </p>
                      )}

                      {/* Log Details */}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-3 p-2 sm:p-3 bg-black border border-white overflow-scroll">
                          <p className="text-xs sm:text-sm font-bold text-white mb-2 uppercase">
                            Details:
                          </p>
                          <div className="text-xs text-green-400 font-mono space-y-1">
                            {Object.entries(log.details).map(([key, value]) => (
                              <div key={key} className="break-all">
                                <span className="text-yellow-400">{key}:</span>{" "}
                                <span className="text-green-400">
                                  {typeof value === "object"
                                    ? JSON.stringify(value, null, 2)
                                    : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
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
                        setShowUploadCategoryDropdown(
                          !showUploadCategoryDropdown
                        )
                      }
                      className="w-full flex items-center justify-between gap-2 bg-background border-2 border-white p-3 sm:p-4 text-white font-medium text-sm sm:text-base transition-all duration-200 hover:bg-white hover:text-background focus:scale-[1.02] focus:ring-2 focus:ring-white"
                    >
                      <div className="flex items-center gap-2">
                        {getUploadCategoryIcon(uploadCategory)}
                        <span className="uppercase">{uploadCategory}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          showUploadCategoryDropdown ? "rotate-180" : ""
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
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium hover:bg-white hover:text-background transition-colors ${
                              uploadCategory === "astrophotography"
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
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium hover:bg-white hover:text-background transition-colors ${
                              uploadCategory === "events"
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
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium hover:bg-white hover:text-background transition-colors ${
                              uploadCategory === "others"
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
                  <p className="text-white font-bold uppercase">
                    No images found
                  </p>
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
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Add Event Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
            >
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase flex items-center gap-2">
                <Plus size={18} className="sm:w-6 sm:h-6" />
                CREATE NEW EVENT
              </h2>
              <form onSubmit={addEvent} className="space-y-4">
                {/* Event ID and Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="EVENT ID (UNIQUE)"
                    value={newEvent.id}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, id: e.target.value })
                    }
                    className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] uppercase text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="EVENT TITLE"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] uppercase text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                    required
                  />
                </div>

                {/* Description */}
                <textarea
                  placeholder="EVENT DESCRIPTION"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] uppercase text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white resize-none"
                  rows={3}
                  required
                />

                {/* Date, Time, Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-white text-xs font-bold mb-1 uppercase">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, date: e.target.value })
                      }
                      className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white text-xs font-bold mb-1 uppercase">
                      Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, time: e.target.value })
                      }
                      className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="LOCATION (OPTIONAL)"
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] uppercase text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                  />
                </div>

                {/* Type, Status, Participants, Organizer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-white text-xs font-bold mb-1 uppercase">
                      Event Type *
                    </label>
                    <select
                      value={newEvent.type}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          type: e.target.value as typeof newEvent.type,
                        })
                      }
                      className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                      required
                    >
                      <option value="stargazing">STARGAZING</option>
                      <option value="starparty">STARPARTY</option>
                      <option value="astrophotography">ASTROPHOTOGRAPHY</option>
                      <option value="theory">THEORY</option>
                      <option value="competition">COMPETITION</option>
                      <option value="workshop">WORKSHOP</option>
                      <option value="project">PROJECT</option>
                      <option value="other">OTHER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-xs font-bold mb-1 uppercase">
                      Status *
                    </label>
                    <select
                      value={newEvent.status}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          status: e.target.value as typeof newEvent.status,
                        })
                      }
                      className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                      required
                    >
                      <option value="upcoming">UPCOMING</option>
                      <option value="ongoing">ONGOING</option>
                      <option value="completed">COMPLETED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                  </div>
                  <input
                    type="number"
                    placeholder="PARTICIPANTS"
                    value={newEvent.participants || ""}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        participants: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] uppercase text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                    min="0"
                  />
                  <input
                    type="text"
                    placeholder="ORGANIZER"
                    value={newEvent.organizer}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, organizer: e.target.value })
                    }
                    className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] uppercase text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                  />
                </div>

                {/* Registration Link */}
                <input
                  type="url"
                  placeholder="REGISTRATION LINK (OPTIONAL)"
                  value={newEvent.registrationLink}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      registrationLink: e.target.value,
                    })
                  }
                  className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] uppercase text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                />

                {/* Image Selection */}
                <ImageSelector
                  selectedImage={newEvent.image}
                  onChange={(image) => setNewEvent({ ...newEvent, image })}
                />

                <button
                  type="submit"
                  className="w-full sm:w-auto px-3 sm:px-4 py-3 sm:py-4 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] transition-all duration-200 uppercase text-sm sm:text-base hover:scale-105 active:scale-95"
                >
                  <Plus className="inline mr-2" size={14} />
                  CREATE EVENT
                </button>
              </form>
            </motion.div>

            {/* Events List */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
            >
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase flex items-center gap-2">
                <CalendarDays size={18} className="sm:w-6 sm:h-6" />
                ALL EVENTS ({events.length})
              </h2>

              {eventsLoading ? (
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
                    Loading events...
                  </span>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white font-bold uppercase">
                    No events found
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {events.map((event, index) => (
                    <AdminEventCard
                      key={event.id}
                      event={event}
                      index={index}
                      onEdit={updateEvent}
                      onDelete={deleteEvent}
                      isEditing={editingEvent === event.id}
                      onStartEdit={() => setEditingEvent(event.id)}
                      onCancelEdit={() => setEditingEvent(null)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
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
            showSuccess={showSuccess}
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
  );
}
