'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  roles: string[];
}

interface ProfileEditorProps {
  user: UserProfile;
  onProfileUpdate: (user: UserProfile) => void;
  onClose: () => void;
}

export default function ProfileEditor({ user, onProfileUpdate, onClose }: ProfileEditorProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAvatarPreview(result.filePath);
        return result.filePath;
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload avatar');
        return null;
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    await handleAvatarUpload(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onProfileUpdate({
          ...updatedUser,
          avatar: avatarPreview || user.avatar,
        });
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background border-4 border-white p-6 w-full max-w-md mx-4 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white uppercase">EDIT PROFILE</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-colors text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-white overflow-hidden bg-background flex items-center justify-center">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
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
              className="px-4 py-2 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] disabled:bg-[#666] disabled:border-[#666] transition-colors uppercase"
            >
              {uploading ? 'UPLOADING...' : 'CHANGE AVATAR'}
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase">
                EMAIL
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-background border-2 border-white px-4 py-3 text-[#666] font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase">
                NAME
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ENTER YOUR NAME"
                className="w-full bg-background border-2 border-white px-4 py-3 text-white font-medium placeholder-[#666] focus:ring-2 focus:ring-white focus:border-white"
              />
            </div>


            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase">
                BIO
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="TELL US ABOUT YOURSELF"
                rows={3}
                className="w-full bg-background border-2 border-white px-4 py-3 text-white font-medium placeholder-[#666] focus:ring-2 focus:ring-white focus:border-white resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase">
                ROLES
              </label>
              <div className="w-full bg-background border-2 border-white px-4 py-3 text-[#666] font-bold uppercase">
                {user.roles.join(', ').toUpperCase()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-colors uppercase"
            >
              CANCEL
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex-1 px-4 py-3 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] disabled:bg-[#666] disabled:border-[#666] disabled:text-white transition-colors uppercase"
            >
              {saving ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}