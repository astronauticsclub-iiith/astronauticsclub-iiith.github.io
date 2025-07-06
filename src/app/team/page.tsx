"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Filter, ChevronDown, X } from "lucide-react";
import Loader from "@/components/ui/Loader";
import "@/components/ui/bg-patterns.css";
import "./team.css";
import TeamCard from "@/components/features/TeamCard";

type TeamMember = {
  name?: string;
  email: string;
  avatar?: string;
  designations?: string[];
  bio?: string;
  linkedin?: string;
};

type FilterType = "all" | string;


const TeamPage: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [allDesignations, setAllDesignations] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        const response = await fetch("/api/team");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMembers(data || []);
        const designations = Array.from(new Set(data.flatMap((u: TeamMember) => u.designations || []))) as string[];
        setAllDesignations(designations);
      } catch (error) {
        console.error("Error loading team members:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const filteredMembers = members.filter(
    (member) =>
      filter === "all" || (member.designations && member.designations.includes(filter))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader fullscreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-pattern-graph pt-24 pb-16 md:pb-20 px-4">
      <div className="team-container px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 lg:mb-16"
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 flex items-center justify-center">
              <Users size={64} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-6xl font-black uppercase tracking-tighter text-white text-shadow-brutal">
                Our Team
              </h1>
              <div className="h-2 bg-white w-40 mt-2 shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"></div>
            </div>
          </div>
          <p className="text-l md:text-xl text-[#e0e0e0] max-w-2xl font-medium ml-2 border-l-4 border-white pl-4 my-6">
            The brilliant minds behind our club.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="team-filters"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="team-filter-btn flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </motion.button>
          </motion.div>
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-3 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`team-filter-btn ${filter === "all" ? "active" : ""}`}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </motion.button>
                  {allDesignations.map((designation) => (
                    <motion.button
                      key={designation}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`team-filter-btn ${filter === designation ? "active" : ""}`}
                      onClick={() => setFilter(designation)}
                    >
                      {designation}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {filter !== "all" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-3"
            >
              <span className="text-sm text-white font-bold bg-background border-2 border-white px-2 py-1 uppercase">
                Active filter:
              </span>
              <div className="flex items-center gap-2 px-3 py-1 bg-white text-background font-medium text-sm border-2 border-background shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)]">
                <span>{filter}</span>
                <button
                  onClick={() => setFilter("all")}
                  className="text-background hover:opacity-70 ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center flex-wrap gap-1 md:gap-4 justify-center md:justify-between">
            <p className="text-[#e0e0e0] font-medium md:pl-4 py-2 text-center md:text-left">
              Showing{" "}
              <span className="font-bold accent bg-background px-1">
                {filteredMembers.length}
              </span>{" "}
              {filteredMembers.length === 1 ? "member" : "members"}
              {filter !== "all" ? ` in ${filter}` : ""}
            </p>
          </div>
        </motion.div>

        {filteredMembers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="team-empty"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {filter === "all"
                ? "No members found."
                : `No members found with designation: ${filter}.`}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="team-grid px-2"
          >
            <AnimatePresence mode="wait">
              {filteredMembers.map((member, index) => (
                <TeamCard
                  key={member.email}
                  member={member}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
