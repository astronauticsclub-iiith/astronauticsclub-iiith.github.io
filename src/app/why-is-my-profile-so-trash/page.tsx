"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProfileEditor from "@/components/features/ProfileEditor";
import { useAlert } from "@/hooks/useAlert";
import CustomAlert from "@/components/ui/CustomAlert";
import "@/components/ui/bg-patterns.css";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'writer' | 'none';
  designations?: string[];
}

export default function MyProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess, alertState, closeAlert } = useAlert();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/let-me-innn");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        } else {
          showError("Failed to fetch your profile.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        showError("Failed to fetch your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [session, status, router, showError]);

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
          LOADING YOUR PROFILE...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-pattern-signal pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight mb-3 sm:mb-4 text-white leading-tight">
            YOUR PROFILE
          </h1>
          <div className="h-0.5 sm:h-1 bg-white w-24 sm:w-32 mb-8"></div>

          {userProfile && (
            <ProfileEditor
              user={userProfile}
              onProfileUpdate={(updatedUser) => {
                setUserProfile(updatedUser);
              }}
              onClose={() => {
                // On a dedicated page, maybe we just show a success message
                showSuccess("Profile updated successfully!");
              }}
              showSuccess={showSuccess}
              isSelfEdit={true}
            />
          )}
        </motion.div>
      </div>
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        type={alertState.type}
        onClose={closeAlert}
      />
    </div>
  );
}
