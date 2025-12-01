"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Users } from "lucide-react";
import Image from "next/image";
import { User } from "@/types/user";
import DesignationCombobox from "@/components/admin/DesignationCombobox";
import { withBasePath, withUploadPath } from "@/components/common/HelperFunction";
import { useSession } from "next-auth/react";

interface UserManagementProps {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showConfirm: (
        title: string,
        message: string,
        onConfirm: () => void,
        options?: {
            type?: "danger" | "warning" | "info";
            confirmText?: string;
            cancelText?: string;
        }
    ) => void;
}

export default function UserManagement({
    showSuccess,
    showError,
    showConfirm,
}: UserManagementProps) {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [allDesignations, setAllDesignations] = useState<string[]>([]);
    const [newUser, setNewUser] = useState({
        email: "",
        name: "",
        role: "writer" as "admin" | "writer" | "none",
    });

    const fetchUsers = async () => {
        try {
            const response = await fetch(withBasePath(`/api/users`));
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
                const designations = Array.from(
                    new Set(data.flatMap((u: User) => u.designations || []))
                ) as string[];
                setAllDesignations(designations);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

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

    const updateUserDesignations = async (
        userId: string,
        designations: string[]
    ) => {
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
            const response = await fetch(withBasePath(`/api/users/${userId}`), {
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
    };

    const deleteUser = async (userId: string) => {
        try {
            const response = await fetch(withBasePath(`/api/users/${userId}`), {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                fetchUsers();
                showSuccess("User removed successfully");
            } else {
                showError("Failed to remove user");
            }
        } catch (error) {
            console.error("Error removing user:", error);
            showError("Failed to remove user");
        }
    };

    const removeUser = async (userId: string) => {
        showConfirm(
            "REMOVE MEMBER",
            "Are you sure you want to remove this member? This action cannot be undone.",
            () => deleteUser(userId),
            { type: "danger", confirmText: "REMOVE MEMBER" }
        );
    };

    return (
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
                        className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
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
                                setNewUser({
                                    ...newUser,
                                    role: e.target.value as "admin" | "writer" | "none",
                                })
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
                            className="border-2 border-white p-3 sm:p-4 backdrop-blur-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 hover:shadow-lg hover:shadow-white/5 transition-all duration-200 hover:scale-[1.01] relative"
                            style={{ zIndex: users.length - index }}
                        >
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full lg:w-auto">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white overflow-hidden bg-white transition-transform duration-200 hover:scale-105">
                                    {user.avatar ? (
                                        <Image
                                            src={withUploadPath(user.avatar)}
                                            alt={user.name || "User"}
                                            unoptimized
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
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString()
                                            : ""}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-2 sm:gap-3 w-full lg:w-auto">
                                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                                    <select
                                        value={user.role}
                                        onChange={(e) =>
                                            setUserRole(
                                                user._id,
                                                user.role,
                                                e.target.value as "admin" | "writer" | "none"
                                            )
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
                                        onChange={(designations) =>
                                            updateUserDesignations(user._id, designations)
                                        }
                                        allDesignations={allDesignations}
                                        disabled={user.email === session?.user?.email}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => removeUser(user._id)}
                                className="px-2 sm:px-3 py-1 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-all duration-200 text-base sm:text-lg lg:text-xl hover:scale-105 active:scale-95 min-w-[2.5rem] flex items-center justify-center"
                            >
                                ×
                            </button>
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
    );
}
