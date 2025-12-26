"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, FileText, FolderOpen, CalendarDays, Package } from "lucide-react";
import ProfileEditor from "@/components/features/ProfileEditor";
import ProfileInfo from "@/components/features/mod/ProfileInfo";
import CustomAlert from "@/components/ui/CustomAlert";
import CustomConfirm from "@/components/ui/CustomConfirm";
import { useAlert } from "@/hooks/useAlert";
import "@/components/ui/bg-patterns.css";
import { withBasePath } from "@/components/common/HelperFunction";
import { User } from "@/types/user";

// Import new components
import UserManagement from "@/components/admin/UserManagement";
import LogViewer from "@/components/admin/LogViewer";
import GalleryManager from "@/components/admin/GalleryManager";
import EventManager from "@/components/admin/EventManager";
import InventoryManager from "@/components/admin/InventoryManager";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<
        "users" | "logs" | "gallery" | "events" | "inventory"
    >("logs");

    const [loading, setLoading] = useState(true);
    const [showProfileEditor, setShowProfileEditor] = useState(false);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const {
        showSuccess,
        showError,
        closeAlert,
        closeConfirm,
        handleConfirm,
        alertState,
        confirmState,
        showConfirm,
    } = useAlert();

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

    useEffect(() => {
        if (status === "loading") return;

        const user = session?.user as User;
        if (user?.role !== "admin") {
            router.push("/stay-away-snooper");
            return;
        }

        fetchUserProfile();
        setLoading(false);
    }, [session, status, router]);

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
                        <button
                            onClick={() => setActiveTab("inventory")}
                            className={`w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border-2 border-white font-bold transition-all duration-200 uppercase text-sm sm:text-base hover:scale-105 active:scale-95 ${
                                activeTab === "inventory"
                                    ? "bg-white text-background"
                                    : "text-white hover:bg-white hover:text-background"
                            }`}
                        >
                            <Package className="inline mr-2" size={14} />
                            <span className="hidden sm:inline">INVENTORY MANAGER</span>
                            <span className="sm:hidden">INVENTORY</span>
                        </button>
                    </div>
                </motion.div>

                {/* Tab Content */}
                {activeTab === "logs" && <LogViewer showError={showError} />}

                {activeTab === "users" && (
                    <UserManagement
                        showSuccess={showSuccess}
                        showError={showError}
                        showConfirm={showConfirm}
                    />
                )}

                {activeTab === "gallery" && (
                    <GalleryManager showSuccess={showSuccess} showError={showError} />
                )}

                {activeTab === "events" && (
                    <EventManager showSuccess={showSuccess} showError={showError} />
                )}

                {activeTab === "inventory" && (
                    <InventoryManager showSuccess={showSuccess} showError={showError} />
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
