"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2,
  Trash2,
  Check,
  X,
  ChevronDown,
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { Event } from "@/types/event";
import ImageSelector from "./ImageSelector";

interface AdminEventCardProps {
  event: Event;
  index: number;
  onEdit: (eventId: string, eventData: Partial<Event>) => Promise<void>;
  onDelete: (eventId: string) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

const AdminEventCard: React.FC<AdminEventCardProps> = ({
  event,
  index,
  onEdit,
  onDelete,
  isEditing,
  onStartEdit,
  onCancelEdit,
}) => {
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const eventTypes = [
    "stargazing",
    "starparty",
    "astrophotography",
    "theory",
    "competition",
    "workshop",
    "project",
    "other",
  ];

  const eventStatuses = ["upcoming", "ongoing", "completed", "cancelled"];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTypeDropdown(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false);
      }
    };

    if (showTypeDropdown || showStatusDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTypeDropdown, showStatusDropdown]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-600 border-blue-600";
      case "ongoing":
        return "bg-green-600 border-green-600";
      case "completed":
        return "bg-gray-600 border-gray-600";
      case "cancelled":
        return "bg-red-600 border-red-600";
      default:
        return "bg-gray-600 border-gray-600";
    }
  };

  const getTypeIcon = () => {
    switch (editedEvent.type || event.type) {
      case "stargazing":
      case "starparty":
        return "🌟";
      case "astrophotography":
        return "📸";
      case "theory":
        return "📚";
      case "competition":
        return "🏆";
      case "workshop":
        return "🔧";
      case "project":
        return "🚀";
      default:
        return "📅";
    }
  };

  const handleStartEdit = () => {
    setEditedEvent({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time || "",
      location: event.location || "",
      type: event.type,
      participants: event.participants,
      organizer: event.organizer || "",
      registrationLink: event.registrationLink || "",
      status: event.status,
      image: event.image || "",
    });
    onStartEdit();
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updatedData = { ...editedEvent };

      // Always include registrationLink in updates (can be empty string)
      if (!updatedData.hasOwnProperty("registrationLink")) {
        updatedData.registrationLink = "";
      }

      console.log("Updating event with data:", updatedData);
      console.log("Registration link in update:", updatedData.registrationLink);

      // Remove empty fields except for optional fields that should be preserved
      Object.keys(updatedData).forEach((key) => {
        if (
          updatedData[key as keyof Event] === "" &&
          key !== "time" &&
          key !== "location" &&
          key !== "organizer" &&
          key !== "registrationLink"
        ) {
          delete updatedData[key as keyof Event];
        }
      });

      await onEdit(event.id, updatedData);
      onCancelEdit();
    } catch (error) {
      console.error("Error updating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedEvent({});
    onCancelEdit();
  };

  const updateEditedEvent = (
    field: keyof Event,
    value: string | number | undefined | string[]
  ) => {
    setEditedEvent((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      className="border-2 border-white backdrop-blur-sm hover:shadow-lg hover:shadow-white/5 transition-all duration-200 hover:scale-[1.01] bg-background"
    >
      <div className="p-3 sm:p-4">
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-3">
            {/* Title */}
            <div>
              <label className="block text-white text-xs font-bold mb-1 uppercase">
                Title
              </label>
              <input
                type="text"
                value={editedEvent.title || ""}
                onChange={(e) => updateEditedEvent("title", e.target.value)}
                className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white uppercase"
                placeholder="Event title..."
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white text-xs font-bold mb-1 uppercase">
                Description
              </label>
              <textarea
                value={editedEvent.description || ""}
                onChange={(e) =>
                  updateEditedEvent("description", e.target.value)
                }
                className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white resize-none"
                placeholder="Event description..."
                rows={3}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white text-xs font-bold mb-1 uppercase">
                  Date
                </label>
                <input
                  type="date"
                  value={editedEvent.date || ""}
                  onChange={(e) => updateEditedEvent("date", e.target.value)}
                  className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div>
                <label className="block text-white text-xs font-bold mb-1 uppercase">
                  Time (Optional)
                </label>
                <input
                  type="time"
                  value={editedEvent.time || ""}
                  onChange={(e) => updateEditedEvent("time", e.target.value)}
                  className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-white text-xs font-bold mb-1 uppercase">
                Location (Optional)
              </label>
              <input
                type="text"
                value={editedEvent.location || ""}
                onChange={(e) => updateEditedEvent("location", e.target.value)}
                className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white"
                placeholder="Event location..."
                disabled={isSubmitting}
              />
            </div>

            {/* Type and Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white text-xs font-bold mb-1 uppercase">
                  Type
                </label>
                <div className="relative" ref={typeDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-between gap-2 bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 hover:bg-white hover:text-background focus:scale-[1.02] focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <span>{getTypeIcon()}</span>
                      <span className="uppercase">
                        {editedEvent.type || event.type}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        showTypeDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {showTypeDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 left-0 mt-1 w-full border-2 border-white bg-background shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)] max-h-48 overflow-y-auto"
                      >
                        {eventTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              updateEditedEvent("type", type);
                              setShowTypeDropdown(false);
                            }}
                            disabled={isSubmitting}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium hover:bg-white hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              (editedEvent.type || event.type) === type
                                ? "bg-white text-background"
                                : "text-white"
                            }`}
                          >
                            <span className="uppercase">{type}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <label className="block text-white text-xs font-bold mb-1 uppercase">
                  Status
                </label>
                <div className="relative" ref={statusDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-between gap-2 bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 hover:bg-white hover:text-background focus:scale-[1.02] focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="uppercase">
                      {editedEvent.status || event.status}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        showStatusDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {showStatusDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 left-0 mt-1 w-full border-2 border-white bg-background shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"
                      >
                        {eventStatuses.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              updateEditedEvent("status", status);
                              setShowStatusDropdown(false);
                            }}
                            disabled={isSubmitting}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium hover:bg-white hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              (editedEvent.status || event.status) === status
                                ? "bg-white text-background"
                                : "text-white"
                            }`}
                          >
                            <span className="uppercase">{status}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Participants and Organizer */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white text-xs font-bold mb-1 uppercase">
                  Participants (Optional)
                </label>
                <input
                  type="number"
                  value={editedEvent.participants || ""}
                  onChange={(e) =>
                    updateEditedEvent(
                      "participants",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white"
                  placeholder="Number of participants"
                  disabled={isSubmitting}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-white text-xs font-bold mb-1 uppercase">
                  Organizer (Optional)
                </label>
                <input
                  type="text"
                  value={editedEvent.organizer || ""}
                  onChange={(e) =>
                    updateEditedEvent("organizer", e.target.value)
                  }
                  className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white"
                  placeholder="Event organizer..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Registration Link */}
            <div>
              <label className="block text-white text-xs font-bold mb-1 uppercase">
                Registration Link (Optional)
              </label>
              <input
                type="url"
                value={editedEvent.registrationLink || ""}
                onChange={(e) =>
                  updateEditedEvent("registrationLink", e.target.value)
                }
                className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white"
                placeholder="https://example.com/register"
                disabled={isSubmitting}
              />
            </div>

            {/* Image Selection */}
            <ImageSelector
              selectedImage={editedEvent.image || ""}
              onChange={(image) => updateEditedEvent("image", image)}
              disabled={isSubmitting}
            />

            {/* Edit Action Buttons */}
            <div className="flex gap-2 pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitEdit}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 border-2 border-white bg-green-600 text-white font-bold text-xs uppercase transition-all duration-200 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                    SAVING...
                  </div>
                ) : (
                  <>
                    <Check className="inline mr-1" size={12} />
                    UPDATE
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 border-2 border-white bg-red-600 text-white font-bold text-xs uppercase transition-all duration-200 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="inline mr-1" size={12} />
                CANCEL
              </motion.button>
            </div>
          </div>
        ) : (
          /* Display Mode */
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white uppercase text-sm sm:text-base mb-1 truncate">
                  {event.title}
                </h3>
                <p className="text-[#e0e0e0] text-xs sm:text-sm mb-2 line-clamp-2">
                  {event.description}
                </p>
              </div>
              <div className="ml-3">
                <span
                  className={`px-2 py-1 text-xs font-bold uppercase border-2 text-white ${getStatusColor(
                    event.status
                  )}`}
                >
                  {event.status}
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-[#e0e0e0] text-xs sm:text-sm">
                <Calendar size={14} />
                <span>
                  {new Date(event.date).toLocaleDateString()}
                  {event.time && ` at ${event.time}`}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2 text-[#e0e0e0] text-xs sm:text-sm">
                  <MapPin size={14} />
                  <span>{event.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-[#e0e0e0] text-xs sm:text-sm">
                <span>{getTypeIcon()}</span>
                <span className="uppercase font-medium">{event.type}</span>
              </div>

              {event.participants && (
                <div className="flex items-center gap-2 text-[#e0e0e0] text-xs sm:text-sm">
                  <Users size={14} />
                  <span>{event.participants} participants</span>
                </div>
              )}

              {event.organizer && (
                <div className="text-[#e0e0e0] text-xs sm:text-sm">
                  <span className="font-bold">Organizer:</span>{" "}
                  {event.organizer}
                </div>
              )}

              {event.registrationLink && (
                <div className="text-[#e0e0e0] text-xs sm:text-sm">
                  <span className="font-bold">Registration:</span>{" "}
                  <a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline break-all"
                  >
                    {event.registrationLink}
                  </a>
                </div>
              )}

              {event.image && (
                <div className="flex items-center gap-2 text-[#e0e0e0] text-xs sm:text-sm">
                  <ImageIcon size={14} />
                  <span>Has image</span>
                </div>
              )}
            </div>

            {/* Event ID */}
            <div className="text-[#999] text-xs font-mono mb-3">
              ID: {event.id}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartEdit}
                className="flex-1 px-2 py-1.5 border-2 border-white bg-background text-white font-bold text-xs uppercase transition-all duration-200 hover:bg-white hover:text-background"
              >
                <Edit2 className="inline mr-1" size={12} />
                EDIT
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(event.id)}
                className="flex-1 px-2 py-1.5 border-2 border-white bg-red-600 text-white font-bold text-xs uppercase transition-all duration-200 hover:bg-red-700"
              >
                <Trash2 className="inline mr-1" size={12} />
                DELETE
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminEventCard;
