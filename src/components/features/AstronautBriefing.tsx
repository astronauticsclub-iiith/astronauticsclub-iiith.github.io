"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import WhimsicalTeamIcon from "./WhimsicalTeamIcon";
import { ChevronLeft } from "lucide-react";
import GlitchText from "./GlitchText";
import { withBasePath, withUploadPath, safeKey } from "../common/HelperFunction";
import {User, Star, Constellations} from "../../types/user"
import Loader from "@/components/ui/Loader";

function mergeMemberIntoStar(star: Star, member: User): Star {
  return {
    ...star,
    clickable: true,
    email: member.email,
    name: member.name ?? star.name,
    avatar: member.avatar ?? star.avatar,
    designations: member.designations ?? star.designations,
    desc: member.bio ?? star.desc,
    linkedin: member.linkedin ?? star.linkedin,
  };
}

function mergeJSON(constellations : Constellations, members : User[]): Constellations {
    const memberMap = new Map<string, User>();
    for (const m of members) {
      memberMap.set(safeKey(m.email), m);
    }

    const merged: Constellations = {};
    for (const [constellationName, constellation] of Object.entries(constellations)) {
      const stars: Record<string, Star> = {};

      for (const [starName, star] of Object.entries(constellation.stars)) {
        const member = memberMap.get(safeKey(star.email));
        stars[starName] = member
          ? mergeMemberIntoStar(star, member)
          : { ...star, clickable: false };
      }

      merged[constellationName] = {
        ...constellation,
        stars,
      };
    }

    return merged
  };

const AstronautBriefing: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [starDetailsVisible, setStarDetailsVisible] = useState(false);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [constellations, setConstellations] = useState<Constellations>({});
  const [hoveredStar, setHoveredStar] = useState<string | null>(null);
  const [stats, setStats] = useState({ missions: 0, distance: "0.0K" });
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Canvas state
  const scaleRef = useRef(0.8);
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);
  const rotationAngleRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isRotatingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastRotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        missions: Math.floor(Math.random() * 20) + 5,
        distance: `${(Math.random() * 100).toFixed(1)}K`,
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);


  // Fetching all the member info from the database
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        const response = await fetch(withBasePath(`/api/team`));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMembers(data || []);
      } catch (error) {
        console.error("Error loading team members:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);


  const getCanvasMousePosition = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { mouseX: 0, mouseY: 0 };

      const rect = canvas.getBoundingClientRect();

      // Handle CSS scaling (canvas drawing buffer vs display size)
      const cssToCanvasX = canvas.width / rect.width;
      const cssToCanvasY = canvas.height / rect.height;

      // Account for scroll and navbar positioning
      const mouseX = (clientX - rect.left) * cssToCanvasX;
      const mouseY = (clientY - rect.top) * cssToCanvasY;
      return { mouseX, mouseY };
    },
    []
  );

  const drawCelestialGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const radius = Math.min(canvas.width, canvas.height) / 2;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;

    // Draw concentric circles (declination lines)
    for (let dec = 0; dec <= 90; dec += 15) {
      const r = (radius * (90 - Math.abs(dec))) / 90;
      ctx.beginPath();
      ctx.arc(
        offsetXRef.current,
        offsetYRef.current,
        r * scaleRef.current,
        0,
        2 * Math.PI
      );
      ctx.stroke();
    }

    // Draw radial lines (right ascension lines)
    for (let ra = 0; ra < 360; ra += 15) {
      const radRA = (ra / 360) * 2 * Math.PI;
      const x =
        offsetXRef.current + radius * Math.cos(radRA) * scaleRef.current;
      const y =
        offsetYRef.current + radius * Math.sin(radRA) * scaleRef.current;
      ctx.beginPath();
      ctx.moveTo(offsetXRef.current, offsetYRef.current);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.closePath();
    }

    ctx.restore();
  }, []);

  const projectCelestial = useCallback((ra: number, dec: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const radius = Math.min(canvas.width, canvas.height) / 2;
    const radRA = (ra / 360) * 2 * Math.PI; // Convert RA to radians
    const radDec = (dec / 360) * 2 * Math.PI; // Convert Dec to radians

    let x = radius * Math.cos(radDec) * Math.sin(radRA) + offsetXRef.current;
    let y = -radius * Math.cos(radDec) * Math.cos(radRA) + offsetYRef.current;

    // Apply rotation transformation around the celestial pole (center of canvas)
    const cosTheta = Math.cos(rotationAngleRef.current);
    const sinTheta = Math.sin(rotationAngleRef.current);
    const dx = (x - offsetXRef.current) / scaleRef.current; // Remove scaling before rotation
    const dy = (y - offsetYRef.current) / scaleRef.current;
    x = offsetXRef.current + (dx * cosTheta - dy * sinTheta) * scaleRef.current;
    y = offsetYRef.current + (dx * sinTheta + dy * cosTheta) * scaleRef.current;

    // Apply scaling transformation based on the zoom level
    x = offsetXRef.current + (x - offsetXRef.current) * scaleRef.current;
    y = offsetYRef.current + (y - offsetYRef.current) * scaleRef.current;

    return { x, y };
  }, []);

  const drawStars = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;

    for (const name in constellations) {
      const constellation = constellations[name];
      const stars = constellation.stars;

      for (const star in stars) {
        const { x, y } = projectCelestial(stars[star].ra, stars[star].dec);

        // Adjust star size based on magnitude
        const size = Math.max(1, 5 - stars[star].magnitude);

        ctx.beginPath();
        ctx.arc(x, y, size * scaleRef.current, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
      }

      constellation.lines.forEach(([start, end]) => {
        // Check if both stars exist before drawing the line
        if (!stars[start] || !stars[end]) {
          return;
        }

        const { x: x1, y: y1 } = projectCelestial(
          stars[start].ra,
          stars[start].dec
        );
        const { x: x2, y: y2 } = projectCelestial(
          stars[end].ra,
          stars[end].dec
        );

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
    }
    ctx.restore();
  }, [constellations, projectCelestial]);

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCelestialGrid();
    drawStars();
  }, [drawCelestialGrid, drawStars]);


  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;

    const setCanvasSize = () => {
      if (!container) return;
      const canvasWidth = container.clientWidth;
      const canvasHeight = container.clientHeight;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      offsetXRef.current = canvasWidth / 2;
      offsetYRef.current = canvasHeight / 2;
      drawScene();
    };

    setCanvasSize();

    // Load constellation data  
    fetch(withUploadPath(`/constellation.json`))
      .then((response) => response.json())
      .then((data: Constellations) => {
        setConstellations(data);
      })
      .catch((error) => {
        console.error("Error loading constellation data:", error);
      });

    // Merge with database data
    setConstellations(mergeJSON(constellations, members));

    // Handle resizing
    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [constellations, members, drawScene]);

  useEffect(() => {
    if (Object.keys(constellations).length > 0) {
      drawScene();
    }
  }, [constellations, drawScene]);

  const displayStarDetails = useCallback((star: Star) => {
    setSelectedStar(star);
    setStarDetailsVisible(true);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { mouseX, mouseY } = getCanvasMousePosition(e.clientX, e.clientY);

      for (const name in constellations) {
        const constellation = constellations[name];
        const stars = constellation.stars;

        for (const starName in stars) {
          const star = stars[starName];

          // Loop through stars to check if the click is near any star
          const { x, y } = projectCelestial(star.ra, star.dec);
          const distance = Math.sqrt(
            Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2)
          );

          // Star clicked, display the details
          if (distance <= 10 && star.clickable) {
            displayStarDetails(star);
            return;
          } else {
            setStarDetailsVisible(false);
          }
        }
      }
    },
    [
      constellations,
      getCanvasMousePosition,
      projectCelestial,
      displayStarDetails,
    ]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (isDraggingRef.current) {
        // Panning logic
        offsetXRef.current += e.clientX - dragStartRef.current.x;
        offsetYRef.current += e.clientY - dragStartRef.current.y;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        drawScene();
      } else if (isRotatingRef.current) {
        const deltaX = e.clientX - lastRotationRef.current.x;

        // Horizontal rotation (RA)
        rotationAngleRef.current += deltaX * 0.005;

        lastRotationRef.current = { x: e.clientX, y: e.clientY };
        drawScene();
      } else {
        // Hover detection
        const { mouseX, mouseY } = getCanvasMousePosition(e.clientX, e.clientY);
        let currentHover: string | null = null;

        // Check all stars
        for (const constellationName in constellations) {
          const constellation = constellations[constellationName];
          const stars = constellation.stars;

          for (const starName in stars) {
            const star = stars[starName];
            const { x, y } = projectCelestial(star.ra, star.dec);
            const distance = Math.sqrt(
              Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2)
            );

            if (distance <= 10 && star.clickable) {
              currentHover = starName;
              break;
            }
          }
          if (currentHover) break;
        }

        // Update cursor only when state changes
        if (currentHover !== hoveredStar) {
          canvas.style.cursor = currentHover ? "pointer" : "grab";
          setHoveredStar(currentHover);
        }
      }
    },
    [
      constellations,
      getCanvasMousePosition,
      projectCelestial,
      drawScene,
      hoveredStar,
    ]
  );

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (e.shiftKey) {
        // Panning mode
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      } else {
        // Rotation mode
        isRotatingRef.current = true;
        lastRotationRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    []
  );

  const handleCanvasMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    isRotatingRef.current = false;
  }, []);

  const handleCanvasMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
    isRotatingRef.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const zoomSpeed = 0.001;
      scaleRef.current *= 1 - e.deltaY * zoomSpeed;
      drawScene();
    };

    // Add non-passive listener
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [drawScene]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader fullscreen />
      </div>
    );
  }

  return (
    <div className="bg-background flex">
      {/* Left Sidebar - Fixed Width */}
      <div className="w-[512px] flex-shrink-0 flex flex-col bg-pattern-graph">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="p-6 border-b-4 border-white bg-background/50 backdrop-blur-sm"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight mb-3 text-white leading-tight"
          >
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 flex items-center justify-center">
                <WhimsicalTeamIcon
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter text-white text-shadow-brutal">
                  Crew Briefing
                </h1>
                <div className="h-2 bg-white w-40 mt-2 shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"></div>
              </div>
            </div>
          </motion.h1>
        </motion.div>

        {/* Instructions Section */}
        {!starDetailsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex-1 p-6 space-y-6"
          >
            <div className="border-4 border-white p-6 backdrop-blur-sm bg-background/30">
              <h2 className="text-xl font-bold uppercase text-white mb-4 tracking-wide">
                MISSION CONTROL
              </h2>
              <div className="space-y-4 text-[#e0e0e0] font-medium">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white mt-2 flex-shrink-0" />
                  <p>
                    <strong className="text-white">INTERACT:</strong> Click on
                    stars to learn about our team members
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white mt-2 flex-shrink-0" />
                  <p>
                    <strong className="text-white">ROTATE:</strong> Drag to
                    explore different regions of space
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white mt-2 flex-shrink-0" />
                  <p>
                    <strong className="text-white">ZOOM:</strong> Use mouse
                    wheel to zoom in and out
                  </p>
                </div>
              </div>
            </div>

            <div className="border-4 border-white p-6 backdrop-blur-sm bg-background/30">
              <h3 className="text-lg font-bold uppercase text-white mb-3 tracking-wide">
                STELLAR NAVIGATION
              </h3>
              <p className="text-[#e0e0e0] font-medium leading-relaxed">
                Each star represents a member of our astronomical society.
                Navigate through the celestial grid to discover the brilliant
                minds behind our cosmic explorations.
              </p>
            </div>
          </motion.div>
        )}

        {/* Star Details Section */}
        <AnimatePresence mode="wait">
          {starDetailsVisible && selectedStar && (
            <motion.div
              key={selectedStar.name || "default"} // Unique key for each star
              initial={{ opacity: 0, x: -50, scale: 0.9, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, x: 50, scale: 0.9, rotateY: 15 }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
                opacity: { duration: 0.4 },
                scale: { duration: 0.5 },
                rotateY: { duration: 0.6 },
              }}
              className="flex-1 p-6 overflow-y-auto"
            >
              <div className="h-full">
                {/* Header with Back Button */}
                <motion.div
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="border-4 border-white bg-background/50 backdrop-blur-sm p-4 mb-6"
                >
                  <motion.button
                    onClick={() => setStarDetailsVisible(false)}
                    className="text-[#e0e0e0] hover:text-white transition-all duration-300 text-sm font-black uppercase tracking-wider flex items-center gap-2 group w-full h-full cursor-close"
                    whileHover={{ x: -8, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="text-lg"
                      animate={{ x: [-2, 0, -2] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <ChevronLeft size={16} className="text-white" />
                    </motion.span>
                    RETURN TO INSTRUCTIONS
                  </motion.button>
                </motion.div>

                {/* Astronaut Profile Card */}
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="border-4 border-white bg-background/50 backdrop-blur-sm overflow-hidden"
                >
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-background/80 to-background/60 p-6 border-b-4 border-white">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotateX: -20 }}
                      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                      transition={{
                        duration: 0.7,
                        delay: 0.3,
                        ease: "easeOut",
                      }}
                      className="flex items-start gap-6"
                    >
                      <div className="relative">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            duration: 0.8,
                            delay: 0.4,
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                          }}
                          whileHover={{ scale: 1.05, rotate: 2 }}
                          className="relative"
                        >
                          <Image
                            className="w-24 h-24 object-cover border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)]"
                            src={selectedStar.avatar ?  withUploadPath(selectedStar.avatar) :  withBasePath(`/default-avatar.svg`)}
                            alt={selectedStar.name || "Astronaut"}
                            unoptimized={!!selectedStar.avatar}
                            width={96}
                            height={96}
                          />
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 0.8,
                              type: "spring",
                              stiffness: 500,
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-background rounded-full flex items-center justify-center"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          </motion.div>
                        </motion.div>
                      </div>

                      <div className="flex-1">
                        <motion.h2
                          initial={{ opacity: 0, x: -30, y: -10 }}
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          className="text-2xl font-black uppercase tracking-tighter text-white mb-2 text-shadow-brutal"
                        >
                          {selectedStar.name || "COMMANDER STARDUST"}
                        </motion.h2>
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "100%", opacity: 1 }}
                          transition={{
                            duration: 1,
                            delay: 0.7,
                            ease: "easeOut",
                          }}
                          className="h-2 bg-white mb-3 shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"
                        />
                        <motion.p
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.9 }}
                          className="text-lg text-[#e0e0e0] font-bold uppercase tracking-wide"
                        >
                          {selectedStar.designations ? selectedStar.designations.join(", ") :
                            "STELLAR NAVIGATION SPECIALIST"}
                        </motion.p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Bio Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    className="p-6"
                  >
                    <div className="mb-6">
                      <h3 className="text-xl font-black uppercase tracking-wider text-white mb-4 flex items-center gap-3">
                        <div className="w-3 h-3 bg-white" />
                        MISSION PROFILE
                      </h3>
                      <div className="border-l-4 border-white pl-4">
                        <p className="text-[#e0e0e0] font-medium leading-relaxed">
                          {selectedStar.desc ||
                            "A dedicated astronaut with expertise in cosmic navigation and stellar cartography. Specializes in deep space exploration and has logged over 2,847 hours in zero gravity environments. Known for discovering three new constellations and contributing to our understanding of galactic positioning systems."}
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1.6 }}
                        className="border-2 border-white p-3 bg-background/30"
                      >
                        <div className="text-xs font-bold uppercase tracking-wide text-[#e0e0e0] mb-1">
                          SPACE MISSIONS
                        </div>
                        <div className="text-2xl font-black text-white">
                          <GlitchText text={String(stats.missions)} />
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1.8 }}
                        className="border-2 border-white p-3 bg-background/30"
                      >
                        <div className="text-xs font-bold uppercase tracking-wide text-[#e0e0e0] mb-1">
                          LIGHT YEARS TRAVELED
                        </div>
                        <div className="text-2xl font-black text-white">
                          <GlitchText text={stats.distance} />
                        </div>
                      </motion.div>
                    </div>

                    {/* Contact Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 2 }}
                    >
                      <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4 flex items-center gap-3">
                        <div className="w-3 h-3 bg-white" />
                        COMMUNICATION CHANNELS
                      </h3>
                      <div className="flex gap-3">
                        <motion.a
                          href={`mailto:${selectedStar.email}`}
                          className="group relative overflow-hidden"
                          whileHover={{ scale: 1.1, rotate: 2 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <div className="relative z-10 text-white group-hover:text-background transition-colors duration-300 p-3 border-4 border-white group-hover:bg-white font-bold">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z" />
                            </svg>
                          </div>
                          <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </motion.a>

                        {selectedStar.linkedin && (
                          <motion.a
                            href={selectedStar.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative overflow-hidden"
                            whileHover={{ scale: 1.1, rotate: -2 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <div className="relative z-10 text-white group-hover:text-background transition-colors duration-300 p-3 border-4 border-white group-hover:bg-white font-bold">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
                              </svg>
                            </div>
                            <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                          </motion.a>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Canvas - Remaining Space */}
      <div
        ref={canvasContainerRef}
        className="flex-1 relative overflow-hidden"
        style={{
          height: "calc(100vh - 6rem)", // Adjust height to fit the header
        }}
      >
        <canvas
          ref={canvasRef}
          id="starMap"
          className="block cursor-open"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseLeave}
        />
      </div>
    </div>
  );
};

export default AstronautBriefing;
