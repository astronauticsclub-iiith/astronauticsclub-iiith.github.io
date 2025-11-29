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
  Image as ImageIcon,
} from "lucide-react";
import { Inventory, validCategoryTypes, validStatusTypes } from "@/types/inventory-item";
import ImageSelector from "./ImageSelector";

interface AdminInventoryCardProps {
  inventory: Inventory;
  index: number;
  onEdit: (inventoryId: string, inventoryData: Partial<Inventory>) => Promise<void>;
  onDelete: (inventoryId: string) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

const AdminInventoryCard: React.FC<AdminInventoryCardProps> = ({
  inventory,
  index,
  onEdit,
  onDelete,
  isEditing,
  onStartEdit,
  onCancelEdit,
}) => {
  const [editedInventory, setEditedInventory] = useState<Partial<Inventory>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (inventory: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(inventory.target as Node)
      ) {
        setShowTypeDropdown(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(inventory.target as Node)
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

  const getBorrowedString = (borrowed: boolean) => {
    if (borrowed) return "TRUE"
    return "FALSE"
  }

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

  const getCategoryIcon = () => {
    switch (editedInventory.category || inventory.category) {
      case "astronomy":
        return "🔭";
      case "electronics":
        return "🔧";
      case "events":
        return "🎨";
      case "others":
        return "𝄜";
      default:
        return "𝄜";
    }
  };

  const handleStartEdit = () => {
    setEditedInventory({
      id: inventory.id,
      name: inventory.name,
      category: inventory.category,
      image: inventory.image || "",
      description: inventory.description,
      year_of_purchase: inventory.year_of_purchase,
      status: inventory.status,
      borrowed: inventory.borrowed,
      borrower: inventory.borrower || "",
      comments: inventory.comments || "",
    });
    onStartEdit();
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updatedData = { ...editedInventory };
      console.log("Updating inventory with data:", updatedData);

      // Remove empty fields except for optional fields that should be preserved
      Object.keys(updatedData).forEach((key) => {
        if (
          updatedData[key as keyof Inventory] === "" &&
          key !== "borrower" &&
          key !== "comments"
        ) {
          delete updatedData[key as keyof Inventory];
        }
      });

      await onEdit(inventory.id, updatedData);
      onCancelEdit();
    } 
    catch (error) {
      console.error("Error updating inventory item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedInventory({});
    onCancelEdit();
  };

  const updateEditedInventory = (
    field: keyof Inventory,
    value: string | number | undefined | string[]
  ) => {
    setEditedInventory((prev) => ({ ...prev, [field]: value }));
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
            {/* Name */}
            <div>
              <label className="block text-white text-xs font-bold mb-1 uppercase">
                Name
              </label>
              <input
                type="text"
                value={editedInventory.name || ""}
                onChange={(e) => updateEditedInventory("name", e.target.value)}
                className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white uppercase"
                placeholder="Inventory Item name..."
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
                value={editedInventory.description || ""}
                onChange={(e) =>
                  updateEditedInventory("description", e.target.value)
                }
                className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white resize-none"
                placeholder="Inventory Item description..."
                rows={3}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Year of Purchase */}
            <div className="grid grid-cols-2 gap-3">
                <label className="block text-white text-xs font-bold mb-1 uppercase">
                    Year of Purchase
                </label>
                <input
                    type="number"
                    value={editedInventory.year_of_purchase || ""}
                    onChange={(e) => updateEditedInventory("year_of_purchase", e.target.value)}
                    className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white"
                    disabled={isSubmitting}
                    required
                />
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white text-xs font-bold mb-1 uppercase">
                  Category
                </label>
                <div className="relative" ref={typeDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-between gap-2 bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 hover:bg-white hover:text-background focus:scale-[1.02] focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <span>{getCategoryIcon()}</span>
                      <span className="uppercase">
                        {editedInventory.category || inventory.category}
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
                        {validCategoryTypes.map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              updateEditedInventory("category", category);
                              setShowTypeDropdown(false);
                            }}
                            disabled={isSubmitting}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium hover:bg-white hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              (editedInventory.category || inventory.category) === category
                                ? "bg-white text-background"
                                : "text-white"
                            }`}
                          >
                            <span className="uppercase">{category}</span>
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
                      {editedInventory.status || inventory.status}
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
                        {validStatusTypes.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              updateEditedInventory("status", status);
                              setShowStatusDropdown(false);
                            }}
                            disabled={isSubmitting}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left font-medium hover:bg-white hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              (editedInventory.status || inventory.status) === status
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

            {/* Borrowed */}
            <div>
              <label className="block text-white text-xs font-bold mb-1 uppercase">
                Borrowed
              </label>
              <input
                type="string"
                value={editedInventory.borrowed? getBorrowedString(editedInventory.borrowed) : "FALSE"}
                onChange={(e) =>
                  updateEditedInventory("borrowed", e.target.value)
                }
                className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white"
                placeholder="No"
                disabled={isSubmitting}
              />
            </div>

            {/* Image Selection */}
            <ImageSelector
              selectedImage={editedInventory.image || ""}
              onChange={(image) => updateEditedInventory("image", image)}
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
                  {inventory.name}
                </h3>
                <p className="text-[#e0e0e0] text-xs sm:text-sm mb-2 line-clamp-2">
                  {inventory.description}
                </p>
              </div>
              <div className="ml-3">
                <span
                  className={`px-2 py-1 text-xs font-bold uppercase border-2 text-white ${getStatusColor(inventory.status)}`}
                >
                  {inventory.status}
                </span>
              </div>
            </div>

            {/* inventory Details */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-[#e0e0e0] text-xs sm:text-sm">
                <Calendar size={14} />
                <span>
                  {inventory.year_of_purchase}
                </span>
              </div>

              {inventory.status && (
                <div className="flex items-center gap-2 text-[#e0e0e0] text-xs sm:text-sm">
                  <MapPin size={14} />
                  <span>{inventory.status}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-[#e0e0e0] text-xs sm:text-sm">
                <span>{getCategoryIcon()}</span>
                <span className="uppercase font-medium">{inventory.category}</span>
              </div>

              {inventory.borrowed && (
                <div className="text-[#e0e0e0] text-xs sm:text-sm">
                  <span className="font-bold">Borrowed:</span>{" "}
                  {inventory.borrowed}
                </div>
              )}

              {inventory.borrower && (
                <div className="text-[#e0e0e0] text-xs sm:text-sm">
                  <span className="font-bold">Borrower:</span>{" "}
                    {inventory.borrower}
                </div>
              )}

              {inventory.comments && (
                <div className="text-[#e0e0e0] text-xs sm:text-sm">
                  <span className="font-bold">Comments:</span>{" "}
                    {inventory.comments}
                </div>
              )}

              {inventory.image && (
                <div className="flex items-center gap-2 text-[#e0e0e0] text-xs sm:text-sm">
                  <ImageIcon size={14} />
                  <span>Has image</span>
                </div>
              )}
            </div>

            {/* inventory ID */}
            <div className="text-[#999] text-xs font-mono mb-3">
              ID: {inventory.id}
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
                onClick={() => onDelete(inventory.id)}
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

export default AdminInventoryCard;
