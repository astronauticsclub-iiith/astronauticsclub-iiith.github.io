"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, FileText, AlertTriangle, Plus } from "lucide-react";
import Image from "next/image";
import ProfileEditor from "@/components/features/ProfileEditor";
import ProfileInfo from "@/components/features/mod/ProfileInfo";
import CustomAlert from "@/components/ui/CustomAlert";
import CustomConfirm from "@/components/ui/CustomConfirm";
import { useAlert } from "@/hooks/useAlert";
import "@/components/ui/bg-patterns.css";

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles?: string[];
}

interface User {
  _id: string;
  email: string;
  name?: string;
  roles: ("admin" | "writer")[];
  avatar?: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  roles: string[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "logs">("users");
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    roles: ["writer"] as ("admin" | "writer")[],
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

  useEffect(() => {
    if (status === "loading") return;

    const user = session?.user as ExtendedUser;
    if (!user?.roles || !user.roles.includes("admin")) {
      router.push("/stay-away-snooper");
      return;
    }

    fetchUsers();
    fetchUserProfile();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/users/me");
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

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setNewUser({ email: "", name: "", roles: ["writer"] });
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

  const updateUserRoles = async (
    userId: string,
    roles: ("admin" | "writer")[]
  ) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles }),
      });

      if (response.ok) {
        fetchUsers();
        showSuccess("User roles updated successfully");
      } else {
        showError("Failed to update user roles");
      }
    } catch (error) {
      console.error("Error updating user roles:", error);
      showError("Failed to update user roles");
    }
  };

  const toggleUserRole = (
    userId: string,
    currentRoles: ("admin" | "writer")[],
    role: "admin" | "writer"
  ) => {
    const currentUserEmail = session?.user?.email;
    const targetUser = users.find((u) => u._id === userId);

    // Check if current user is trying to modify themselves
    const isModifyingSelf = targetUser?.email === currentUserEmail;

    // Restrict admin role modifications - admins cannot modify admin roles, except self
    if (
      role === "admin" &&
      !isModifyingSelf &&
      currentRoles.includes("admin")
    ) {
      showError("Admin roles cannot be modified for security reasons");
      return;
    }

    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];

    updateUserRoles(userId, newRoles);

    // Update cookies for the current user if they are modifying their own roles
    if (isModifyingSelf) {
      fetchUserProfile();

      // If not an admin, redirect to stay away page
      if (!newRoles.includes("admin")) {
        router.push("/stay-away-snooper");
      }
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
                    ROLES:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newUser.roles.includes("writer")}
                        onChange={(e) => {
                          const roles = e.target.checked
                            ? [...newUser.roles, "writer" as const]
                            : newUser.roles.filter((r) => r !== "writer");
                          setNewUser({
                            ...newUser,
                            roles: roles,
                          });
                        }}
                        className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 hover:scale-110"
                      />
                      <span className="text-white font-bold uppercase text-xs sm:text-sm">
                        WRITER
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newUser.roles.includes("admin")}
                        onChange={(e) => {
                          const roles = e.target.checked
                            ? [...newUser.roles, "admin" as const]
                            : newUser.roles.filter((r) => r !== "admin");
                          setNewUser({
                            ...newUser,
                            roles: roles,
                          });
                        }}
                        className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 hover:scale-110"
                      />
                      <span className="text-white font-bold uppercase text-xs sm:text-sm">
                        ADMIN
                      </span>
                    </label>
                  </div>
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
                            src={user.avatar}
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
                        <button
                          onClick={() =>
                            toggleUserRole(user._id, user.roles, "writer")
                          }
                          className={`w-full sm:w-auto px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-white font-bold text-xs sm:text-sm uppercase transition-all duration-200 hover:scale-105 active:scale-95 ${
                            user.roles.includes("writer")
                              ? "bg-white text-background hover:bg-[#ffffffbb]"
                              : "bg-background text-white hover:bg-white hover:text-background"
                          }`}
                        >
                          WRITER
                        </button>
                        <button
                          onClick={() =>
                            toggleUserRole(user._id, user.roles, "admin")
                          }
                          className={`w-full sm:w-auto px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-white font-bold text-xs sm:text-sm uppercase transition-all duration-200 hover:scale-105 active:scale-95 ${
                            user.roles.includes("admin")
                              ? "bg-[#d2042d] text-white " +
                                (user._id !== userProfile?.id
                                  ? "opacity-50 cursor-not-allowed hover:scale-100"
                                  : "hover:bg-[#d2042d99] hover:text-white")
                              : "bg-background text-white hover:bg-[#d2042d] hover:text-white"
                          }`}
                        >
                          ADMIN
                        </button>
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
              SYSTEM LOGS
            </h2>
            <div className="bg-black border-2 border-white p-3 sm:p-4 h-64 sm:h-80 lg:h-96 overflow-y-auto font-mono text-xs sm:text-sm transition-all duration-200 hover:border-opacity-80">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-green-400 mb-2"
              >
                <span className="text-[#666]">astronautics@admin:~$</span> tail
                -f /var/log/system.log
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-yellow-400 mb-2"
              >
                Connecting to log stream...
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                <div className="text-white mb-2">
                  ┌─────────────────────────────────────────────────┐
                </div>
                <div className="text-white mb-2">│ │</div>
                <div className="text-white mb-2">│ 🚧 COMING SOON 🚧 │</div>
                <div className="text-white mb-2">│ │</div>
                <div className="text-white mb-2">
                  │ System logs monitoring will be available │
                </div>
                <div className="text-white mb-2">│ in a future update. │</div>
                <div className="text-white mb-2">│ │</div>
                <div className="text-white mb-2">
                  └─────────────────────────────────────────────────┘
                </div>
                <div className="text-[#666] mt-4">
                  <span className="animate-pulse">█</span>
                </div>
              </motion.div>
            </div>
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
