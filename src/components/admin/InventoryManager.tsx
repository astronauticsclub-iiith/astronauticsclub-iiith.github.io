"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, CalendarDays } from "lucide-react";
import { Inventory, validCategoryTypes, validStatusTypes } from "@/types/inventory-item";
import AdminInventoryCard from "@/components/admin/AdminInventoryCard";
import {
    fetchAdminInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
} from "@/lib/admin_api";

interface InventoryManagerProps {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
}

export default function InventoryManager({
    showSuccess,
    showError,
}: InventoryManagerProps) {
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [editingInventory, setEditingInventory] = useState<string | null>(null);
    const [newInventoryItem, setnewInventoryItem] = useState({
        id: "",
        name: "",
        image: "",
        imageFile: null as File | null,
        category: "astronomy",
        description: "",
        year_of_purchase: 2025 as number,
        status: "working",
    });

    // Filter and Sort states
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterCondition, setFilterCondition] = useState<string>("all");
    const [filterIsLent, setFilterIsLent] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Memoized filtering and sorting function
    const getFilteredAndSortedInventory = useMemo(() => {
        return () => {
            let filtered = [...inventory];

            // Apply category filter
            if (filterCategory !== "all") {
                filtered = filtered.filter(item => item.category === filterCategory);
            }

            // Apply condition filter
            if (filterCondition !== "all") {
                filtered = filtered.filter(item => item.status === filterCondition);
            }

            // Apply isLent filter
            if (filterIsLent === "lent") {
                filtered = filtered.filter(item => item.isLent === true);
            } else if (filterIsLent === "available") {
                filtered = filtered.filter(item => item.isLent === false);
            }

            // Apply sorting
            filtered.sort((a, b) => {
                let compareValue = 0;

                if (sortBy === "name") {
                    compareValue = a.name.localeCompare(b.name);
                } else if (sortBy === "year") {
                    compareValue = a.year_of_purchase - b.year_of_purchase;
                }

                return sortOrder === "asc" ? compareValue : -compareValue;
            });

            return filtered;
        };
    }, [inventory, filterCategory, filterCondition, filterIsLent, sortBy, sortOrder]);

    const fetchInventory = useCallback(async () => {
        setInventoryLoading(true);
        try {
            const data = await fetchAdminInventory();
            setInventory(data.inventory || []);
        } catch (error: unknown) {
            console.error("Error fetching inventory:", error);
            showError((error as Error).message || "Failed to fetch inventory");
        } finally {
            setInventoryLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const handleAddInventoryItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Generate ID: name-randomString
            const generatedId = `${newInventoryItem.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}-${Math.random()
                    .toString(36)
                    .substring(2, 8)}`;

            const formData = new FormData();
            formData.append("id", generatedId);
            formData.append("name", newInventoryItem.name);
            formData.append("category", newInventoryItem.category);
            formData.append("description", newInventoryItem.description);
            formData.append(
                "year_of_purchase",
                newInventoryItem.year_of_purchase.toString()
            );
            formData.append("status", newInventoryItem.status);

            if (newInventoryItem.imageFile) {
                formData.append("file", newInventoryItem.imageFile);
            }

            await addInventoryItem(formData);
            setnewInventoryItem({
                id: "",
                name: "",
                image: "",
                imageFile: null,
                category: "astronomy",
                description: "",
                year_of_purchase: 2025,
                status: "working",
            });
            fetchInventory();
            showSuccess("Inventory Item added successfully");
        } catch (error: unknown) {
            console.error("Error adding item:", error);
            showError((error as Error).message || "Failed to add item");
        }
    };

    const handleUpdateInventory = async (inventoryId: string, formData: FormData) => {
        try {
            formData.append("id", inventoryId);
            await updateInventoryItem(formData);
            setEditingInventory(null);
            fetchInventory();
            showSuccess("Inventory item updated successfully");
        } catch (error: unknown) {
            console.error("Error updating item:", error);
            showError((error as Error).message || "Failed to update item");
            throw error;
        }
    };

    const handleDeleteInventory = async (inventoryId: string) => {
        try {
            await deleteInventoryItem(inventoryId);
            fetchInventory();
            showSuccess("Inventory item deleted successfully");
        } catch (error: unknown) {
            console.error("Error deleting item:", error);
            showError((error as Error).message || "Failed to delete item");
        }
    };

    // Filter and sort inventory
    const getFilteredAndSortedInventory = () => {
        let filtered = [...inventory];

        // Apply category filter
        if (filterCategory !== "all") {
            filtered = filtered.filter(item => item.category === filterCategory);
        }

        // Apply status filter
        if (filterStatus !== "all") {
            filtered = filtered.filter(item => item.status === filterStatus);
        }

        // Apply isLent filter
        if (filterIsLent === "lent") {
            filtered = filtered.filter(item => item.isLent === true);
        } else if (filterIsLent === "available") {
            filtered = filtered.filter(item => item.isLent === false);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let compareValue = 0;

            if (sortBy === "name") {
                compareValue = a.name.localeCompare(b.name);
            } else if (sortBy === "year") {
                compareValue = a.year_of_purchase - b.year_of_purchase;
            }

            return sortOrder === "asc" ? compareValue : -compareValue;
        });

        return filtered;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
        >
            {/* Add Inventory Form */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
            >
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase flex items-center gap-2">
                    <Plus size={18} className="sm:w-6 sm:h-6" />
                    ADD NEW INVENTORY ITEM
                </h2>

                <form onSubmit={handleAddInventoryItem} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Name */}
                        <input
                            type="text"
                            placeholder="ITEM NAME"
                            value={newInventoryItem.name}
                            onChange={(e) =>
                                setnewInventoryItem({
                                    ...newInventoryItem,
                                    name: e.target.value,
                                })
                            }
                            className="w-full sm:col-span-2 bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        {/* Category */}
                        <div>
                            <label className="block text-white text-xs font-bold mb-1 uppercase">
                                Category
                            </label>
                            <select
                                value={newInventoryItem.category}
                                onChange={(e) =>
                                    setnewInventoryItem({
                                        ...newInventoryItem,
                                        category: e.target.value,
                                    })
                                }
                                className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white uppercase"
                                required
                            >
                                {validCategoryTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-white text-xs font-bold mb-1 uppercase">
                                Status
                            </label>
                            <select
                                value={newInventoryItem.status}
                                onChange={(e) =>
                                    setnewInventoryItem({
                                        ...newInventoryItem,
                                        status: e.target.value,
                                    })
                                }
                                className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white uppercase"
                                required
                            >
                                {validStatusTypes.map((status) => (
                                    <option key={status} value={status}>
                                        {status.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Year of Purchase */}
                        <div>
                            <label className="block text-white text-xs font-bold mb-1 uppercase">
                                Year
                            </label>
                            <input
                                type="number"
                                placeholder="YEAR"
                                value={newInventoryItem.year_of_purchase}
                                onChange={(e) =>
                                    setnewInventoryItem({
                                        ...newInventoryItem,
                                        year_of_purchase: parseInt(e.target.value),
                                    })
                                }
                                className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <textarea
                        placeholder="ITEM DESCRIPTION"
                        value={newInventoryItem.description}
                        onChange={(e) =>
                            setnewInventoryItem({
                                ...newInventoryItem,
                                description: e.target.value,
                            })
                        }
                        className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white resize-none"
                        rows={3}
                        required
                    />

                    {/* Image Upload */}
                    <div className="mb-4">
                        <label className="block text-white text-xs font-bold mb-1 uppercase">
                            Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setnewInventoryItem({
                                    ...newInventoryItem,
                                    imageFile: e.target.files?.[0] || null,
                                })
                            }
                            className="w-full bg-background border-2 border-white p-2 text-white font-medium text-sm transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-white file:mr-4 file:py-1 file:px-2 file:border-0 file:text-xs file:font-bold file:bg-white file:text-background hover:file:bg-[#e0e0e0]"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-3 sm:px-4 py-3 sm:py-4 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] transition-all duration-200 uppercase text-sm sm:text-base hover:scale-105 active:scale-95"
                    >
                        <Plus className="inline mr-2" size={14} />
                        ADD INVENTORY ITEM
                    </button>
                </form>
            </motion.div>

            {/* Inventory List */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
            >
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase flex items-center gap-2">
                    <CalendarDays size={18} className="sm:w-6 sm:h-6" />
                    INVENTORY LIST ({inventory.length})
                </h2>

                {/* Filter and Sort Controls */}
                <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                    {/* Filters Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-white text-xs font-bold mb-1 uppercase">
                                Filter by Category
                            </label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full bg-background border-2 border-white p-2 sm:p-3 text-white font-medium text-sm uppercase transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                            >
                                <option value="all">ALL CATEGORIES</option>
                                {validCategoryTypes.map((cat) => (
                                    <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-white text-xs font-bold mb-1 uppercase">
                                Filter by Condition
                            </label>
                            <select
                                value={filterCondition}
                                onChange={(e) => setFilterCondition(e.target.value)}
                                className="w-full bg-background border-2 border-white p-2 sm:p-3 text-white font-medium text-sm uppercase transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                            >
                                <option value="all">ALL CONDITIONS</option>
                                {validStatusTypes.map((status) => (
                                    <option key={status} value={status}>{status.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        {/* isLent Filter */}
                        <div>
                            <label className="block text-white text-xs font-bold mb-1 uppercase">
                                Filter by Lent Status
                            </label>
                            <select
                                value={filterIsLent}
                                onChange={(e) => setFilterIsLent(e.target.value)}
                            className="w-full bg-background border-2 border-white p-2 sm:p-3 text-white font-medium text-sm uppercase transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                            >
                            <option value="all">ALL ITEMS</option>
                            <option value="lent">LENT ITEMS</option>
                            <option value="available">AVAILABLE ITEMS</option>
                        </select>
                    </div>
                </div>

                {/* Sorting Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Sort By */}
                    <div>
                        <label className="block text-white text-xs font-bold mb-1 uppercase">
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full bg-background border-2 border-white p-2 sm:p-3 text-white font-medium text-sm uppercase transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                        >
                            <option value="name">NAME</option>
                            <option value="year">YEAR OF PURCHASE</option>
                        </select>
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="block text-white text-xs font-bold mb-1 uppercase">
                            Sort Order
                        </label>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                            className="w-full bg-background border-2 border-white p-2 sm:p-3 text-white font-medium text-sm uppercase transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                        >
                            <option value="asc">ASCENDING ↑</option>
                            <option value="desc">DESCENDING ↓</option>
                        </select>
                    </div>
                </div>
            </div>

            {inventoryLoading ? (
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
                        Loading inventory items...
                    </span>
                </div>
            ) : inventory.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-white font-bold uppercase">
                        No inventory items found
                    </p>
                </div>
            ) : getFilteredAndSortedInventory().length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-white font-bold uppercase">
                        No items match your filters
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {getFilteredAndSortedInventory().map((inventory_item, index) => (
                        <AdminInventoryCard
                            key={inventory_item.id}
                            inventory={inventory_item}
                            index={index}
                            onEdit={handleUpdateInventory}
                            onDelete={handleDeleteInventory}
                            isEditing={editingInventory === inventory_item.id}
                            onStartEdit={() => setEditingInventory(inventory_item.id)}
                            onCancelEdit={() => setEditingInventory(null)}
                        />
                    ))}
                </div>
            )}
        </motion.div>
        </motion.div>
    );
}
