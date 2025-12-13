"use client";

import React, { useEffect, useRef, useState } from "react";
import { useWhimsy } from "@/context/WhimsyContext";
import "./WhimsicalEventsIcon.css";

interface WhimsicalEventsIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const WhimsicalEventsIcon: React.FC<WhimsicalEventsIconProps> = ({
  width = 64,
  height = 64,
  className = "",
}) => {
  const { whimsyMode, isLoaded } = useWhimsy();
  const iconRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [hoverIntensity, setHoverIntensity] = useState(0);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intensityIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!whimsyMode || !isLoaded) return;

    const iconElement = iconRef.current;
    if (!iconElement) return;

    // Capture ref values to avoid stale closure issues
    const currentHoverTimeoutRef = hoverTimeoutRef;
    const currentIntensityIntervalRef = intensityIntervalRef;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovering) return;

      const rect = iconElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate offset from center
      const offsetX = (e.clientX - centerX) * 0.3; // Reduce intensity
      const offsetY = (e.clientY - centerY) * 0.3;

      setMousePosition({ x: offsetX, y: offsetY });
    };

    const handleMouseEnter = () => {
      setIsHovering(true);

      // Start intensity buildup
      let intensity = 0;
      currentIntensityIntervalRef.current = setInterval(() => {
        intensity = Math.min(intensity + 0.1, 1);
        setHoverIntensity(intensity);
      }, 50);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setMousePosition({ x: 0, y: 0 });

      // Clear intensity buildup
      if (currentIntensityIntervalRef.current) {
        clearInterval(currentIntensityIntervalRef.current);
        currentIntensityIntervalRef.current = null;
      }

      // Gradually reduce intensity
      let intensity = hoverIntensity;
      const fadeInterval = setInterval(() => {
        intensity = Math.max(intensity - 0.2, 0);
        setHoverIntensity(intensity);
        if (intensity <= 0) {
          clearInterval(fadeInterval);
        }
      }, 50);
    };

    iconElement.addEventListener("mousemove", handleMouseMove);
    iconElement.addEventListener("mouseenter", handleMouseEnter);
    iconElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      iconElement.removeEventListener("mousemove", handleMouseMove);
      iconElement.removeEventListener("mouseenter", handleMouseEnter);
      iconElement.removeEventListener("mouseleave", handleMouseLeave);

      if (currentIntensityIntervalRef.current) {
        clearInterval(currentIntensityIntervalRef.current);
      }
      if (currentHoverTimeoutRef.current) {
        clearTimeout(currentHoverTimeoutRef.current);
      }
    };
  }, [whimsyMode, isLoaded, isHovering, hoverIntensity]);

  // Regular SVG for non-whimsy mode
  if (!whimsyMode || !isLoaded) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7 2C7.55228 2 8 2.44772 8 3V5C8 5.55228 7.55228 6 7 6C6.44772 6 6 5.55228 6 5V3C6 2.44772 6.44772 2 7 2Z"
          fill="#76a6c9"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17 2C17.5523 2 18 2.44772 18 3V5C18 5.55228 17.5523 6 17 6C16.4477 6 16 5.55228 16 5V3C16 2.44772 16.4477 2 17 2Z"
          fill="#76a6c9"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7 13C7 12.4477 7.44772 12 8 12H16C16.5523 12 17 12.4477 17 13C17 13.5523 16.5523 14 16 14H8C7.44772 14 7 13.5523 7 13Z"
          fill="#76a6c9"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7 17C7 16.4477 7.44772 16 8 16H12C12.5523 16 13 16.4477 13 17C13 17.5523 12.5523 18 12 18H8C7.44772 18 7 17.5523 7 17Z"
          fill="#76a6c9"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7 4C4.23858 4 2 6.23858 2 9V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V9C22 6.23858 19.7614 4 17 4H7ZM19.8293 8C19.4175 6.83481 18.3062 6 17 6H7C5.69378 6 4.58254 6.83481 4.17071 8H19.8293ZM4 10H20V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V10Z"
          fill="#76a6c988"
        />
      </svg>
    );
  }

  // Whimsical animated version
  return (
    <div
      ref={iconRef}
      className={`whimsical-events-icon ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
        filter: `brightness(${1 + hoverIntensity * 0.5}) drop-shadow(0 0 ${
          hoverIntensity * 10
        }px rgba(118, 166, 201, ${hoverIntensity * 0.8}))`,
        transition: isHovering ? "none" : "transform 0.3s ease-out, filter 0.3s ease-out",
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="whimsical-events-svg"
      >
        {/* Left antenna group - vibrates */}
        <g className="antenna-left">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7 2C7.55228 2 8 2.44772 8 3V5C8 5.55228 7.55228 6 7 6C6.44772 6 6 5.55228 6 5V3C6 2.44772 6.44772 2 7 2Z"
            fill="#76a6c9"
          />
        </g>

        {/* Right antenna group - vibrates */}
        <g className="antenna-right">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17 2C17.5523 2 18 2.44772 18 3V5C18 5.55228 17.5523 6 17 6C16.4477 6 16 5.55228 16 5V3C16 2.44772 16.4477 2 17 2Z"
            fill="#76a6c9"
          />
        </g>

        {/* Body parts - no animation */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7 13C7 12.4477 7.44772 12 8 12H16C16.5523 12 17 12.4477 17 13C17 13.5523 16.5523 14 16 14H8C7.44772 14 7 13.5523 7 13Z"
          fill="#76a6c9"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7 17C7 16.4477 7.44772 16 8 16H12C12.5523 16 13 16.4477 13 17C13 17.5523 12.5523 18 12 18H8C7.44772 18 7 17.5523 7 17Z"
          fill="#76a6c9"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7 4C4.23858 4 2 6.23858 2 9V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V9C22 6.23858 19.7614 4 17 4H7ZM19.8293 8C19.4175 6.83481 18.3062 6 17 6H7C5.69378 6 4.58254 6.83481 4.17071 8H19.8293ZM4 10H20V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V10Z"
          fill="#76a6c988"
        />
      </svg>
    </div>
  );
};

export default WhimsicalEventsIcon;
