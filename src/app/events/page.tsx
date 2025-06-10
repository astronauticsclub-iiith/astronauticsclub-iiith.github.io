"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar,
  Clock,
  Star,
  Rocket,
  Camera,
  Brain,
  Trophy,
  Wrench,
  FolderOpen,
} from "lucide-react";
import EventTimeline from "@/components/features/EventTimeline";
import Loader from "@/components/ui/Loader";
import { Event, EventFilters } from "@/types/event";
import { fetchEvents } from "@/lib/api";
import "@/components/ui/bg-patterns.css";
import Image from "next/image";

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({
    search: "",
    type: [],
    status: [],
    sortBy: "latest",
  });
  const [showFilters, setShowFilters] = useState(false);

  const eventTypes = [
    {
      value: "stargazing",
      label: "Stargazing",
      icon: <Star size={16} className="text-blue-400" />,
    },
    {
      value: "starparty",
      label: "Star Party",
      icon: <Star size={16} className="text-yellow-400" />,
    },
    {
      value: "astrophotography",
      label: "Astrophotography",
      icon: <Camera size={16} className="text-purple-400" />,
    },
    {
      value: "theory",
      label: "Theory",
      icon: <Brain size={16} className="text-green-400" />,
    },
    {
      value: "competition",
      label: "Competition",
      icon: <Trophy size={16} className="text-red-400" />,
    },
    {
      value: "workshop",
      label: "Workshop",
      icon: <Wrench size={16} className="text-orange-400" />,
    },
    {
      value: "project",
      label: "Project",
      icon: <FolderOpen size={16} className="text-cyan-400" />,
    },
    {
      value: "other",
      label: "Other",
      icon: <Rocket size={16} className="text-white" />,
    },
  ];

  const statusTypes = [
    { value: "upcoming", label: "Upcoming" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const response = await fetchEvents({}, 1, 100); // Get all events initially
        setEvents(response.events);
      } catch (error) {
        console.error("Failed to load events:", error);
      }
      setLoading(false);
    };

    loadEvents();
  }, []);

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          (event.location || "").toLowerCase().includes(searchLower) ||
          (event.organizer || "").toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter((event) => filters.type.includes(event.type));
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter((event) =>
        filters.status.includes(event.status)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "latest":
        filtered.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [events, filters]);

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleTypeToggle = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter((t) => t !== type)
        : [...prev.type, type],
    }));
  };

  const handleStatusToggle = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  const handleSortChange = (sortBy: EventFilters["sortBy"]) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: [],
      status: [],
      sortBy: "latest",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.type.length > 0 ||
    filters.status.length > 0 ||
    filters.sortBy !== "latest";

  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const getSortIcon = (sortOption: string) => {
    switch (sortOption) {
      case "latest":
        return <Clock size={18} />;
      case "oldest":
        return <Clock size={18} className="rotate-180" />;
      case "alphabetical":
        return <Filter size={18} />;
      default:
        return <Clock size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader fullscreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-pattern-lines-in-motion pt-24 pb-8 md:pb-16 px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 lg:mb-16"
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 flex items-center justify-center">
              <Image
                src="/icons/events.svg"
                alt="Events"
                width={64}
                height={64}
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-6xl font-black uppercase tracking-tighter text-white text-shadow-brutal">
                Cosmic Chronicles
              </h1>
              <div className="h-2 bg-white w-40 mt-2 shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"></div>
            </div>
          </div>
          <p className="text-l md:text-xl text-[#e0e0e0] max-w-2xl font-medium ml-2 border-l-4 border-white pl-4 mt-6">
            Journey through our astronomical adventures and cosmic endeavors.
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 bg-background border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(128,128,128,0.5)]"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search size={18} className="text-[#e0e0e0]" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border-2 border-white font-medium text-white placeholder-[#e0e0e0]
                           focus:outline-none focus:border-white focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)] transition-shadow"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 border-2 border-white font-bold text-white hover:bg-white hover:text-background transition-colors hover:shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"
            >
              <Filter size={18} />
              Filters
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="w-full sm:w-auto flex items-center justify-between gap-2 px-6 py-3 border-2 border-white font-bold text-white hover:bg-white hover:text-background transition-colors hover:shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"
              >
                {getSortIcon(filters.sortBy)}
                <span className="flex-grow text-left">
                  {filters.sortBy.charAt(0).toUpperCase() +
                    filters.sortBy.slice(1)}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    showSortDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 right-0 mt-1 w-full sm:w-48 border-2 border-white bg-background shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"
                  >
                    {["latest", "oldest", "alphabetical"].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          handleSortChange(option as EventFilters["sortBy"]);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-left font-medium hover:bg-white hover:text-background transition-colors ${
                          filters.sortBy === option
                            ? "bg-white text-background"
                            : "text-white"
                        }`}
                      >
                        {getSortIcon(option)}
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-6 border-t-2 border-white space-y-6">
                  {/* Event Types */}
                  <div>
                    <h3 className="font-bold text-lg uppercase mb-4 inline-block px-2 py-1 bg-white text-background rotate-[-1deg]">
                      Event Types
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-4">
                      {eventTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleTypeToggle(type.value)}
                          className={`flex items-center gap-2 px-4 py-2 border-2 border-white transition-colors font-medium text-sm ${
                            filters.type.includes(type.value)
                              ? "bg-white text-background shadow-[3px_3px_0px_0px_rgba(128,128,128,0.5)] -translate-y-1"
                              : "text-white hover:bg-white hover:text-background hover:shadow-[3px_3px_0px_0px_rgba(128,128,128,0.5)] hover:-translate-y-0.5"
                          } transform transition-transform`}
                        >
                          {type.icon}
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Event Status */}
                  <div>
                    <h3 className="font-bold text-lg uppercase mb-4 inline-block px-2 py-1 bg-white text-background rotate-[1deg]">
                      Status
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-4">
                      {statusTypes.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => handleStatusToggle(status.value)}
                          className={`px-4 py-2 border-2 border-white transition-colors font-medium text-sm ${
                            filters.status.includes(status.value)
                              ? "bg-white text-background shadow-[3px_3px_0px_0px_rgba(128,128,128,0.5)] -translate-y-1"
                              : "text-white hover:bg-white hover:text-background hover:shadow-[3px_3px_0px_0px_rgba(128,128,128,0.5)] hover:-translate-y-0.5"
                          } transform transition-transform`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="mt-6 pt-4 border-t-2 border-white flex flex-wrap items-center gap-3">
              <span className="text-sm text-white font-bold bg-background border-2 border-white px-2 py-1 uppercase">
                Active filters:
              </span>
              {filters.search && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white text-background font-medium text-sm border-2 border-background shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)]">
                  <span>&quot;{filters.search}&quot;</span>
                  <button
                    onClick={() => handleSearchChange("")}
                    className="text-background hover:opacity-70 ml-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {filters.type.map((type) => (
                <div
                  key={type}
                  className="flex items-center gap-2 px-3 py-1 bg-white text-background font-medium text-sm border-2 border-background shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)]"
                >
                  <span>
                    {eventTypes.find((t) => t.value === type)?.label || type}
                  </span>
                  <button
                    onClick={() => handleTypeToggle(type)}
                    className="text-background hover:opacity-70 ml-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {filters.status.map((status) => (
                <div
                  key={status}
                  className="flex items-center gap-2 px-3 py-1 bg-white text-background font-medium text-sm border-2 border-background shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)]"
                >
                  <span>
                    {statusTypes.find((s) => s.value === status)?.label ||
                      status}
                  </span>
                  <button
                    onClick={() => handleStatusToggle(status)}
                    className="text-background hover:opacity-70 ml-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {filters.sortBy !== "latest" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white text-background font-medium text-sm border-2 border-background shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)]">
                  <span className="flex items-center gap-1">
                    {getSortIcon(filters.sortBy)}
                    Sort:{" "}
                    {filters.sortBy.charAt(0).toUpperCase() +
                      filters.sortBy.slice(1)}
                  </span>
                  <button
                    onClick={() => handleSortChange("latest")}
                    className="text-background hover:opacity-70 ml-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <button
                onClick={clearFilters}
                className="px-4 py-1 border-2 border-white text-white font-medium text-sm hover:bg-white hover:text-background transition-colors hover:shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)]"
              >
                Clear All
              </button>
            </div>
          )}
        </motion.div>

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center flex-wrap gap-4 justify-center md:justify-between">
            <p className="text-[#e0e0e0] font-medium md:pl-4 py-2">
              Showing{" "}
              <span className="font-bold accent bg-background px-1">
                {filteredAndSortedEvents.length}
              </span>{" "}
              {filteredAndSortedEvents.length === 1 ? "event" : "events"}
              {hasActiveFilters ? " with applied filters" : ""}
            </p>

            {hasActiveFilters && (
              <motion.button
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={clearFilters}
                className="px-4 py-2 bg-white text-background font-bold text-sm hover:shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)] transition-all uppercase tracking-wider"
              >
                Reset
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Events Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <EventTimeline events={filteredAndSortedEvents} />
        </motion.div>
      </div>
    </div>
  );
};

export default EventsPage;
