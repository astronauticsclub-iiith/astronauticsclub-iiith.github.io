"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import "./Hero.css";
import { useWhimsy } from "@/context/WhimsyContext";
import { withBasePath } from "@/components/common/HelperFunction";

const Hero = () => {
  const sRef = useRef<HTMLSpanElement>(null);
  const sparkleContainerRef = useRef<HTMLDivElement>(null);
  const { whimsyMode, setWhimsyMode, isLoaded } = useWhimsy();
  const [isHydrated, setIsHydrated] = useState(false);
  const sparkleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll down arrow click
  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // S toggle color and click handler
  useEffect(() => {
    if (!isHydrated || !isLoaded) return;

    const s = sRef.current;
    if (!s) return;

    s.style.color = whimsyMode ? "#d2042d" : "white";

    const handleClick = () => {
      if (!s) return;

      setWhimsyMode(!whimsyMode);
      s.style.color = !whimsyMode ? "#d2042d" : "white";
    };

    s.addEventListener("click", handleClick);

    return () => {
      if (s) {
        s.removeEventListener("click", handleClick);
      }
    };
  }, [whimsyMode, setWhimsyMode, isHydrated, isLoaded]);

  // Sparkle effect around the 's' letter
  useEffect(() => {
    if (!isHydrated || !isLoaded || whimsyMode) return;

    const s = sRef.current;
    const sparkleContainer = sparkleContainerRef.current;
    if (!s || !sparkleContainer) return;

    // Position the sparkle container at the 's' letter position
    const updateSparklePosition = () => {
      const sRect = s.getBoundingClientRect();
      sparkleContainer.style.left = `${sRect.left + sRect.width / 2}px`;
      sparkleContainer.style.top = `${sRect.top + sRect.height / 2}px`;
    };

    // Initial positioning
    updateSparklePosition();

    // Update position on resize
    window.addEventListener("resize", updateSparklePosition);

    // Create a sparkle element with random properties
    const createSparkle = () => {
      if (whimsyMode) return; // Don't create sparkles in whimsy mode

      const sparkle = document.createElement("div");

      // Random size class
      const sizeClasses = ["tiny", "small", "medium"];
      const sizeClass = sizeClasses[Math.floor(Math.random() * sizeClasses.length)];

      // Random color class
      const colorClasses = ["", "blue", "purple", "gold"];
      const colorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];

      sparkle.classList.add("s-sparkle", sizeClass);
      if (colorClass) sparkle.classList.add(colorClass); // Random position around the center
      const angle = Math.random() * Math.PI * 2; // Random angle in radians

      // Initial position (centered on the sparkle container)
      sparkle.style.left = "0px";
      sparkle.style.top = "0px";

      // Calculate drift direction for animation
      const driftDistance = 30 + Math.random() * 80;
      const driftX = Math.cos(angle) * driftDistance;
      const driftY = Math.sin(angle) * driftDistance;
      const driftRotate = -180 + Math.random() * 360;

      // Set custom properties for the drift animation
      sparkle.style.setProperty("--drift-x", `${driftX}px`);
      sparkle.style.setProperty("--drift-y", `${driftY}px`);
      sparkle.style.setProperty("--drift-rotate", `${driftRotate}deg`);

      // Set animation properties
      const fadeOutDuration = 1 + Math.random() * 2; // 1-3 seconds
      sparkle.style.animation = `
        sparkle-fade-out ${fadeOutDuration}s ease-out forwards,
        sparkle-drift ${fadeOutDuration}s ease-out forwards
      `;

      // Add to container and remove when animation completes
      sparkleContainer.appendChild(sparkle);

      setTimeout(() => {
        if (sparkleContainer.contains(sparkle)) {
          sparkleContainer.removeChild(sparkle);
        }
      }, fadeOutDuration * 1000);
    };

    // Create sparkles at random intervals
    const startSparkleInterval = () => {
      // Clear any existing interval
      if (sparkleIntervalRef.current) {
        clearInterval(sparkleIntervalRef.current);
      }

      // Create a new sparkle every 150-300ms
      sparkleIntervalRef.current = setInterval(
        () => {
          if (!whimsyMode) {
            createSparkle();
          } else {
            // If whimsy mode turned on, stop the sparkles
            if (sparkleIntervalRef.current) {
              clearInterval(sparkleIntervalRef.current);
              sparkleIntervalRef.current = null;
            }
          }
        },
        150 + Math.random() * 150
      );
    };

    // Start creating sparkles
    startSparkleInterval();

    // Cleanup function
    return () => {
      if (sparkleIntervalRef.current) {
        clearInterval(sparkleIntervalRef.current);
        sparkleIntervalRef.current = null;
      }
      window.removeEventListener("resize", updateSparklePosition);

      // Clear any remaining sparkles
      while (sparkleContainer.firstChild) {
        sparkleContainer.removeChild(sparkleContainer.firstChild);
      }
    };
  }, [isHydrated, isLoaded, whimsyMode]);

  // Show simplified version during loading/hydration
  if (!isLoaded || !isHydrated) {
    return (
      <section className="hero">
        <section className="stars-container">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </section>
        <div className="hero-container">
          <div className="hero-content" style={{ height: "80%" }}>
            <h1 className="font-bold">
              <span className="nowrap">Astronautics</span>
              <span> Club</span>
            </h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero">
      {/* Sparkle container - positioned absolutely via JS */}
      <div ref={sparkleContainerRef} className="s-sparkle-container"></div>

      <section className="stars-container">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </section>

      <div className="hero-container">
        <div className="hero-content" style={{ height: "80%" }}>
          <h1 className="font-bold">
            <span className="nowrap">
              A
              <span ref={sRef} id="s-hover-effect" className="cursor-close">
                s
              </span>
              tronautics
            </span>
            <span> Club</span>
          </h1>
          <p>International Institute of Information Technology, Hyderabad</p>
        </div>
        <div className="hero-content">
          <Image
            id="scroll-down-arrow"
            src={withBasePath(`/icons/down.png`)}
            alt="scroll down"
            width={50}
            height={50}
            onClick={handleScrollDown}
            className="cursor-pointer"
            role="button"
            aria-label="Scroll down"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
