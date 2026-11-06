"use client";

import React from "react";
import { motion } from "framer-motion";
import { FilterType } from "@/types/gallery-image";

const FILTERS: FilterType[] = ["all", "astrophotography", "events", "others"];

export const GalleryFilters: React.FC<{
    filter: FilterType;
    setFilter: (f: FilterType) => void;
}> = ({ filter, setFilter }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="gallery-filters"
        >
            {FILTERS.map((f) => (
                <motion.button
                    key={f}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`gallery-filter-btn ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                </motion.button>
            ))}
        </motion.div>
    );
};
