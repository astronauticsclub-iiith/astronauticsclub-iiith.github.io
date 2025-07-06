"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useWhimsy } from "@/context/WhimsyContext";

type WhimsicalTeamIconProps = {
  width?: number;
  height?: number;
  className?: string;
};

const WhimsicalTeamIcon: React.FC<WhimsicalTeamIconProps> = ({
  width = 64,
  height = 64,
  className = "",
}) => {
  const { whimsyMode } = useWhimsy();
  const svgRef = useRef<SVGSVGElement>(null);

  const [isBlinking1, setIsBlinking1] = useState(false);
  const [isBlinking2, setIsBlinking2] = useState(false);
  const [isBlinking3, setIsBlinking3] = useState(false);

  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const [isHovered3, setIsHovered3] = useState(false);

  const [positions, setPositions] = useState({
    circle1: { x: 0, y: 0 },
    circle2: { x: 0, y: 0 },
    circle3: { x: 0, y: 0 },
  });

  const blinkIntervalRefs = useRef<{
    [key: string]: NodeJS.Timeout | null;
  }>({ circle1: null, circle2: null, circle3: null });

  // Handle mouse movement and hover detection
  useEffect(() => {
    if (!whimsyMode || !svgRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const svgRect = svgRef.current.getBoundingClientRect();
      const relativeX = e.clientX - svgRect.left;
      const relativeY = e.clientY - svgRect.top;
      const normalizedX = (relativeX / svgRect.width) * 24;
      const normalizedY = (relativeY / svgRect.height) * 24;

      const circles = [
        { x: 12, y: 7, key: "circle1" },
        { x: 7, y: 16, key: "circle2" },
        { x: 17, y: 16, key: "circle3" },
      ];

      const newPositions = { ...positions };
      const hoverEnterDistance = 3;
      const hoverExitDistance = 5;
      const avoidanceDistance = 4;
      const maxOffset = 0.5;

      circles.forEach(({ x, y, key }) => {
        const distance = Math.sqrt(
          Math.pow(normalizedX - x, 2) + Math.pow(normalizedY - y, 2)
        );

        if (key === "circle1") {
          if (!isHovered1 && distance < hoverEnterDistance) setIsHovered1(true);
          else if (isHovered1 && distance > hoverExitDistance)
            setIsHovered1(false);
        } else if (key === "circle2") {
          if (!isHovered2 && distance < hoverEnterDistance) setIsHovered2(true);
          else if (isHovered2 && distance > hoverExitDistance)
            setIsHovered2(false);
        } else if (key === "circle3") {
          if (!isHovered3 && distance < hoverEnterDistance) setIsHovered3(true);
          else if (isHovered3 && distance > hoverExitDistance)
            setIsHovered3(false);
        }

        if (distance < avoidanceDistance && distance > 0) {
          const angle = Math.atan2(y - normalizedY, x - normalizedX);
          const avoidanceStrength = Math.max(
            0,
            (avoidanceDistance - distance) / avoidanceDistance
          );
          newPositions[key as keyof typeof positions] = {
            x: Math.cos(angle) * maxOffset * avoidanceStrength,
            y: Math.sin(angle) * maxOffset * avoidanceStrength,
          };
        } else {
          newPositions[key as keyof typeof positions] = { x: 0, y: 0 };
        }
      });
      setPositions(newPositions);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [whimsyMode, isHovered1, isHovered2, isHovered3, positions]);

  // Memoized blink trigger function
  const triggerBlink = useCallback(
    (circleIndex: 1 | 2 | 3) => {
      if (!whimsyMode) return;
      const setBlinker =
        circleIndex === 1
          ? setIsBlinking1
          : circleIndex === 2
          ? setIsBlinking2
          : setIsBlinking3;
      const blinkDuration = 150; // How long the eye stays closed
      setBlinker(true);
      setTimeout(() => {
        setBlinker(false);
      }, blinkDuration);
    },
    [whimsyMode]
  );

  // Set up and tear down blinking intervals
  useEffect(() => {
    if (!whimsyMode) {
      return;
    }

    const createBlinkInterval = (
      blinker: (circleIndex: 1 | 2 | 3) => void,
      circleIndex: 1 | 2 | 3
    ) => {
      const run = () => {
        blinker(circleIndex);
        const randomDelay = 3000 + Math.random() * 2000; // Blink every 3-5 seconds
        blinkIntervalRefs.current[`circle${circleIndex}`] = setTimeout(
          run,
          randomDelay
        );
      };
      run();
    };

    createBlinkInterval(triggerBlink, 1);
    setTimeout(() => createBlinkInterval(triggerBlink, 2), 700);
    setTimeout(() => createBlinkInterval(triggerBlink, 3), 1500);

    // Capture the ref's current value for cleanup
    const capturedRef = blinkIntervalRefs.current;

    return () => {
      // Use the captured value in the cleanup function
      Object.values(capturedRef).forEach((timeoutId) => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
  }, [whimsyMode, triggerBlink]);

  // Calculate transform based on state
  const getTransform = (circleIndex: 1 | 2 | 3) => {
    const circleKey = `circle${circleIndex}` as keyof typeof positions;
    const position = positions[circleKey];
    const isBlinking =
      circleIndex === 1
        ? isBlinking1
        : circleIndex === 2
        ? isBlinking2
        : isBlinking3;
    const isHovered =
      circleIndex === 1
        ? isHovered1
        : circleIndex === 2
        ? isHovered2
        : isHovered3;

    const translatePart = `translate(${position.x}px, ${position.y}px)`;
    const scaleX =
      isHovered || isBlinking ? (circleIndex === 1 ? 0.05 : 1.25) : 1.05;
    const scaleY =
      isHovered || isBlinking ? (circleIndex !== 1 ? 0.05 : 1.25) : 1.05;
    const scalePart = `scaleX(${scaleX}) scaleY(${scaleY})`;

    return `${translatePart} ${scalePart}`;
  };

  // Define transition style
  const getTransition = () => {
    return whimsyMode ? "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)" : "none";
  };

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="12"
        cy="7"
        r="3"
        fill="none"
        stroke="#76a6c9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: getTransform(1),
          transformOrigin: "12px 7px",
          transition: getTransition(),
          cursor: whimsyMode ? "pointer" : "default",
        }}
      />
      <circle
        cx="7"
        cy="16"
        r="3"
        fill="none"
        stroke="#76a6c9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
        style={{
          transform: getTransform(2),
          transformOrigin: "7px 16px",
          transition: getTransition(),
          cursor: whimsyMode ? "pointer" : "default",
        }}
      />
      <circle
        cx="17"
        cy="16"
        r="3"
        fill="none"
        stroke="#76a6c9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
        style={{
          transform: getTransform(3),
          transformOrigin: "17px 16px",
          transition: getTransition(),
          cursor: whimsyMode ? "pointer" : "default",
        }}
      />
    </svg>
  );
};

export default WhimsicalTeamIcon;
