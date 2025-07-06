"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const circle1Ref = useRef<SVGCircleElement>(null);
  const circle2Ref = useRef<SVGCircleElement>(null);
  const circle3Ref = useRef<SVGCircleElement>(null);
  
  const [blinkState1, setBlinkState1] = useState({ isBlinking: false, progress: 0 });
  const [blinkState2, setBlinkState2] = useState({ isBlinking: false, progress: 0 });
  const [blinkState3, setBlinkState3] = useState({ isBlinking: false, progress: 0 });
  
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const [isHovered3, setIsHovered3] = useState(false);
  
  const [positions, setPositions] = useState({
    circle1: { x: 0, y: 0 },
    circle2: { x: 0, y: 0 },
    circle3: { x: 0, y: 0 },
  });
  
  const blinkIntervalRefs = useRef<{
    circle1: NodeJS.Timeout | null;
    circle2: NodeJS.Timeout | null;
    circle3: NodeJS.Timeout | null;
  }>({
    circle1: null,
    circle2: null,
    circle3: null,
  });

  const blinkAnimationRefs = useRef<{
    circle1: number | null;
    circle2: number | null;
    circle3: number | null;
  }>({
    circle1: null,
    circle2: null,
    circle3: null,
  });

  // Handle mouse movement and hover detection
  useEffect(() => {
    if (!whimsyMode || !svgRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;

      const svgRect = svgRef.current.getBoundingClientRect();
      const relativeX = e.clientX - svgRect.left;
      const relativeY = e.clientY - svgRect.top;

      // Normalize to SVG viewBox (0-24)
      const normalizedX = (relativeX / svgRect.width) * 24;
      const normalizedY = (relativeY / svgRect.height) * 24;

      // Circle positions
      const circles = [
        { x: 12, y: 7, key: 'circle1' },
        { x: 7, y: 16, key: 'circle2' },
        { x: 17, y: 16, key: 'circle3' },
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

        // Hover detection with hysteresis
        if (key === 'circle1') {
          if (!isHovered1 && distance < hoverEnterDistance) {
            setIsHovered1(true);
          } else if (isHovered1 && distance > hoverExitDistance) {
            setIsHovered1(false);
          }
        } else if (key === 'circle2') {
          if (!isHovered2 && distance < hoverEnterDistance) {
            setIsHovered2(true);
          } else if (isHovered2 && distance > hoverExitDistance) {
            setIsHovered2(false);
          }
        } else if (key === 'circle3') {
          if (!isHovered3 && distance < hoverEnterDistance) {
            setIsHovered3(true);
          } else if (isHovered3 && distance > hoverExitDistance) {
            setIsHovered3(false);
          }
        }

        // Cursor avoidance
        if (distance < avoidanceDistance && distance > 0) {
          const angle = Math.atan2(y - normalizedY, x - normalizedX);
          const avoidanceStrength = Math.max(0, (avoidanceDistance - distance) / avoidanceDistance);
          
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

  // Smooth blink animation function with easing
  const startBlinkAnimation = (circleIndex: 1 | 2 | 3) => {
    if (!whimsyMode) return;

    console.log(`Starting smooth blink animation for circle ${circleIndex}`);
    
    const setBlinkState = circleIndex === 1 ? setBlinkState1 : 
                         circleIndex === 2 ? setBlinkState2 : setBlinkState3;
    
    const animationRef = circleIndex === 1 ? 'circle1' : 
                        circleIndex === 2 ? 'circle2' : 'circle3';

    // Clear any existing animation
    if (blinkAnimationRefs.current[animationRef]) {
      cancelAnimationFrame(blinkAnimationRefs.current[animationRef]!);
    }

    setBlinkState({ isBlinking: true, progress: 0 });

    let startTime = Date.now();
    const duration = 400; // 400ms total blink duration for natural feel
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      
      // Use custom easing function for natural eye blink
      // Fast close, slow open (like real blinks)
      const easeInOutCubic = (t: number) => {
        if (t < 0.3) {
          // Fast close (30% of time)
          return (t / 0.3) * (t / 0.3) * (t / 0.3);
        } else {
          // Slow open (70% of time)
          const adjustedT = (t - 0.3) / 0.7;
          return 1 - Math.pow(1 - adjustedT, 3);
        }
      };
      
      const easedProgress = easeInOutCubic(rawProgress);
      
      setBlinkState({ 
        isBlinking: true, 
        progress: easedProgress 
      });
      
      if (rawProgress < 1) {
        blinkAnimationRefs.current[animationRef] = requestAnimationFrame(animate);
      } else {
        console.log(`Completed blink animation for circle ${circleIndex}`);
        setBlinkState({ isBlinking: false, progress: 0 });
        blinkAnimationRefs.current[animationRef] = null;
      }
    };
    
    animate();
  };

  // Set up blinking intervals
  useEffect(() => {
    if (!whimsyMode) return;

    console.log("Setting up blink intervals"); // Debug

    // Clear existing intervals
    Object.values(blinkIntervalRefs.current).forEach(interval => {
      if (interval) clearInterval(interval);
    });

    // Immediate test blinks with smooth animation
    setTimeout(() => startBlinkAnimation(1), 500);
    setTimeout(() => startBlinkAnimation(2), 1000);
    setTimeout(() => startBlinkAnimation(3), 1500);

    // Set up regular intervals with natural timing (3.5-4.5 seconds)
    blinkIntervalRefs.current.circle1 = setInterval(() => {
      startBlinkAnimation(1);
    }, 3500);

    setTimeout(() => {
      blinkIntervalRefs.current.circle2 = setInterval(() => {
        startBlinkAnimation(2);
      }, 4200);
    }, 1100);

    setTimeout(() => {
      blinkIntervalRefs.current.circle3 = setInterval(() => {
        startBlinkAnimation(3);
      }, 3800);
    }, 2300);

    return () => {
      Object.values(blinkIntervalRefs.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
      Object.values(blinkAnimationRefs.current).forEach(frameId => {
        if (frameId) cancelAnimationFrame(frameId);
      });
    };
  }, [whimsyMode]);

  const getTransform = (circleIndex: 1 | 2 | 3, isHovered: boolean) => {
    const circleKey = `circle${circleIndex}` as keyof typeof positions;
    const position = positions[circleKey];
    const blinkState = circleIndex === 1 ? blinkState1 : 
                      circleIndex === 2 ? blinkState2 : blinkState3;
    
    const translatePart = `translate(${position.x}px, ${position.y}px)`;
    
    // If hovered, stay fully closed
    if (isHovered) {
      return `${translatePart} scaleY(0.05)`;
    }
    
    // If blinking, use smooth progressive scale
    if (blinkState.isBlinking) {
      // Create smooth blink curve: 1 -> 0.05 -> 1
      const scaleY = blinkState.progress < 0.5 
        ? 1 - (blinkState.progress * 2 * 0.95)  // Close: 1 -> 0.05
        : 0.05 + ((blinkState.progress - 0.5) * 2 * 0.95); // Open: 0.05 -> 1
      
      return `${translatePart} scaleY(${scaleY})`;
    }
    
    return translatePart;
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
      {/* Circle 1 (Top) */}
      <circle
        ref={circle1Ref}
        cx="12"
        cy="7"
        r="3"
        fill="none"
        stroke="#76a6c9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: getTransform(1, isHovered1),
          transformOrigin: "12px 7px",
          transition: whimsyMode ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          cursor: whimsyMode ? "pointer" : "default",
        }}
      />
      
      {/* Circle 2 (Bottom Left) */}
      <circle
        ref={circle2Ref}
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
          transform: getTransform(2, isHovered2),
          transformOrigin: "7px 16px",
          transition: whimsyMode ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          cursor: whimsyMode ? "pointer" : "default",
        }}
      />
      
      {/* Circle 3 (Bottom Right) */}
      <circle
        ref={circle3Ref}
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
          transform: getTransform(3, isHovered3),
          transformOrigin: "17px 16px",
          transition: whimsyMode ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          cursor: whimsyMode ? "pointer" : "default",
        }}
      />
    </svg>
  );
};

export default WhimsicalTeamIcon;