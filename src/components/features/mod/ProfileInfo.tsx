"use client";

import { motion } from "framer-motion";
import { Shield, Settings, FileText, LogOut } from "lucide-react";
import Image from "next/image";
import { withUploadPath } from "../../common/HelperFunction";
import { User } from "../../../types/user";

interface ProfileInfoProps {
    userProfile: User;
    type: "admin" | "writer";
    onEditProfile: () => void;
    onLogout: () => void;
}

export default function ProfileInfo({
    userProfile,
    type,
    onEditProfile,
    onLogout,
}: ProfileInfoProps) {
    const isAdmin = type === "admin";
    const defaultName = isAdmin ? "SYSTEM ADMINISTRATOR" : "CONTENT WRITER";
    const IconComponent = isAdmin ? Shield : FileText;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 backdrop-blur-sm mb-6 sm:mb-8 hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-white overflow-hidden bg-white transition-transform duration-200 hover:scale-105">
                        {userProfile.avatar ? (
                            <Image
                                src={withUploadPath(userProfile.avatar)}
                                alt={userProfile.name || "Profile"}
                                unoptimized
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-background flex items-center justify-center">
                                <IconComponent className="text-white" size={16} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg sm:text-xl text-white uppercase leading-tight">
                            {userProfile.name || defaultName}
                        </h3>
                        <p className="text-[#e0e0e0] font-medium text-sm sm:text-base">
                            {userProfile.email}
                        </p>
                        <p className="text-[#e0e0e0] font-bold uppercase text-xs sm:text-sm">
                            ROLE: {userProfile.role.toUpperCase()}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                        onClick={onEditProfile}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 uppercase text-sm sm:text-base hover:scale-105 active:scale-95"
                    >
                        <Settings size={14} className="sm:w-4 sm:h-4" />
                        <span className="sm:inline">EDIT PROFILE</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 border-2 border-white bg-[#d2042d] text-white font-bold hover:bg-white hover:text-[#d2042d] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 uppercase text-sm sm:text-base hover:scale-105 active:scale-95"
                    >
                        <LogOut size={14} className="sm:w-4 sm:h-4" />
                        <span className="inline">LOGOUT</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
