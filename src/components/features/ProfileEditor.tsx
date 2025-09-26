"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { withBasePath, withUploadPath } from "../common/HelperFunction";
import { User } from "@/types/user";

interface ProfileEditorProps {
  user: User;
  onProfileUpdate: (user: User) => void;
  onClose: () => void;
  showSuccess?: (message: string) => void;
  isSelfEdit?: boolean;
}

export default function ProfileEditor({
  user,
  onProfileUpdate,
  onClose,
  showSuccess,
  isSelfEdit = false,
}: ProfileEditorProps) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    linkedin: user.linkedin || "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(withBasePath(`/api/upload/avatar`), {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAvatarPreview(result.filePath);
        return result.filePath;
      } else {
        const error = await response.json();
        alert(error.error || "Failed to upload avatar");
        return null;
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    await handleAvatarUpload(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch(withBasePath(`/api/users/me`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onProfileUpdate({
          ...updatedUser,
          avatar: avatarPreview || user.avatar,
        });
        if (showSuccess) {
          showSuccess("Profile updated successfully");
        }
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-slide-in-from-top">
      <div className="bg-background border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 w-full max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto backdrop-blur-sm animate-slide-in-from-top max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl shadow-white/10">
        <div className="flex justify-between items-center mb-3 sm:mb-4 lg:mb-6">
          <h2 className="text-base sm:text-lg lg:text-2xl font-bold text-white uppercase tracking-wider">
            EDIT PROFILE
          </h2>
          <button
            onClick={onClose}
            className="px-2 sm:px-3 py-1 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-all duration-200 text-base sm:text-lg lg:text-xl hover:scale-105 active:scale-95 min-w-[2.5rem] flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-2 sm:space-y-3 lg:space-y-4">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 border-2 sm:border-4 border-white overflow-hidden bg-background flex items-center justify-center transition-all duration-300 hover:border-opacity-80 hover:shadow-lg hover:shadow-white/20 hover:rotate-1">
                {avatarPreview ? (
                  <Image
                    src={withUploadPath(avatarPreview)}
                    alt="Avatar"
                    width={112}
                    height={112}
                    unoptimized
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <span className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold transition-all duration-300 group-hover:scale-110">
                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </span>
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fade-in rounded-sm">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] disabled:bg-[#666] disabled:border-[#666] transition-all duration-200 uppercase text-xs sm:text-sm md:text-base hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {uploading ? "UPLOADING..." : "CHANGE AVATAR"}
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <div
              className="animate-slide-in-from-left"
              style={{ animationDelay: "0.1s" }}
            >
              <label className="block text-xs sm:text-sm font-bold text-white mb-1 sm:mb-2 uppercase tracking-wide">
                EMAIL
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-background border-2 border-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 text-[#666] font-medium text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-not-allowed"
              />
            </div>

            <div
              className="animate-slide-in-from-left"
              style={{ animationDelay: "0.2s" }}
            >
              <label className="block text-xs sm:text-sm font-bold text-white mb-1 sm:mb-2 uppercase tracking-wide">
                NAME
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="ENTER YOUR NAME"
                className="w-full bg-background border-2 border-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 text-white font-medium placeholder-[#666] focus:ring-2 focus:ring-white focus:border-white text-xs sm:text-sm md:text-base transition-all duration-200 focus:scale-[1.01] sm:focus:scale-[1.02] hover:border-opacity-80"
              />
            </div>

            <div
              className="animate-slide-in-from-left"
              style={{ animationDelay: "0.3s" }}
            >
              <label className="block text-xs sm:text-sm font-bold text-white mb-1 sm:mb-2 uppercase tracking-wide">
                BIO
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="TELL US ABOUT YOURSELF"
                rows={2}
                className="w-full bg-background border-2 border-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 text-white font-medium placeholder-[#666] focus:ring-2 focus:ring-white focus:border-white resize-none text-xs sm:text-sm md:text-base transition-all duration-200 focus:scale-[1.01] sm:focus:scale-[1.02] hover:border-opacity-80 sm:rows-3"
              />
            </div>

            <div
              className="animate-slide-in-from-left"
              style={{ animationDelay: "0.3s" }}
            >
              <label className="block text-xs sm:text-sm font-bold text-white mb-1 sm:mb-2 uppercase tracking-wide">
                LINKEDIN
              </label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin: e.target.value })
                }
                placeholder=""
                className="w-full bg-background border-2 border-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 text-white font-medium placeholder-[#666] focus:ring-2 focus:ring-white focus:border-white text-xs sm:text-sm md:text-base transition-all duration-200 focus:scale-[1.01] sm:focus:scale-[1.02] hover:border-opacity-80"
              />
            </div>

            {!isSelfEdit && (
              <>
                <div
                  className="animate-slide-in-from-left"
                  style={{ animationDelay: "0.4s" }}
                >
                  <label className="block text-xs sm:text-sm font-bold text-white mb-1 sm:mb-2 uppercase tracking-wide">
                    ROLE
                  </label>
                  <div className="w-full bg-background border-2 border-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 text-[#666] font-bold uppercase text-xs sm:text-sm md:text-base transition-colors duration-200 min-h-[2rem] sm:min-h-[2.5rem] flex items-center">
                    {user.role.toUpperCase()}
                  </div>
                </div>
                <div
                  className="animate-slide-in-from-left"
                  style={{ animationDelay: "0.5s" }}
                >
                  <label className="block text-xs sm:text-sm font-bold text-white mb-1 sm:mb-2 uppercase tracking-wide">
                    DESIGNATIONS
                  </label>
                  <div className="w-full bg-background border-2 border-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 text-[#666] font-bold uppercase text-xs sm:text-sm md:text-base transition-colors duration-200 min-h-[2rem] sm:min-h-[2.5rem] flex items-center flex-wrap gap-2">
                    {user.designations?.map((d) => (
                      <span key={d} className="bg-white text-background px-2 py-1 text-xs font-bold uppercase">{d}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4 animate-slide-in-from-bottom pt-2 sm:pt-0"
            style={{ animationDelay: "0.5s" }}
          >
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex-1 px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-3 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] disabled:bg-[#666] disabled:border-[#666] disabled:text-white transition-all duration-200 uppercase text-xs sm:text-sm md:text-base hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:cursor-not-allowed min-h-[2.5rem] flex items-center justify-center"
            >
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-3 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-all duration-200 uppercase text-xs sm:text-sm md:text-base hover:scale-105 active:scale-95 min-h-[2.5rem] flex items-center justify-center"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
