"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Mail } from "lucide-react";
import { withBasePath, withUploadPath } from "../common/HelperFunction";
import { User } from "@/types/user";

const TeamCard: React.FC<{
  member: User;
  index: number;
}> = ({ member, index }) => {
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      setOverlayVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) {
      setOverlayVisible(false);
    }
  };

  const toggleOverlay = () => {
    if (isTouchDevice) {
      setOverlayVisible(!isOverlayVisible);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isTouchDevice && cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setOverlayVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTouchDevice]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { delay: 0.1 * index, duration: 0.5 },
      }}
      whileTap={isTouchDevice ? { scale: 0.98 } : {}}
      className="relative overflow-hidden rounded-lg shadow-lg group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTap={toggleOverlay}
    >
      <div className="relative w-full h-80">
        <Image
          src={member.avatar ? withUploadPath(member.avatar) : withBasePath(`/default-avatar.svg`)}
          alt={member.name || "Team Member"}
          unoptimized={!!member.avatar}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
          priority={index < 4}
        />
      </div>

      {/* Default visible content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
        <h3 className="text-xl font-bold text-white">{member.name || "Unnamed Member"}</h3>
        {member.designations && member.designations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {member.designations.map((d) => (
              <span
                key={d}
                className="px-2 py-1 text-xs font-semibold text-black bg-white rounded-full"
              >
                {d}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {isOverlayVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex flex-col justify-center items-center p-6 text-center"
          >
            <p className="text-white mb-4">{member.bio}</p>
            <div className="flex space-x-4">
              {member.email && (
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href={`mailto:${member.email}`}
                  className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail size={20} />
                </motion.a>
              )}
              {member.linkedin && (
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href={member.linkedin}
                  className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
                  </svg>
                </motion.a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TeamCard;
