"use client";

import { useEffect, useRef, useState } from "react";
import { useWhimsy } from "@/context/WhimsyContext";
import "./WhimsyMouse.css";

const WhimsyMouse = () => {
    const { whimsyMode, isLoaded } = useWhimsy();
    const mouseSparkleContainerRef = useRef<HTMLDivElement>(null);
    const mouseCursorRef = useRef<HTMLDivElement>(null);
    const mouseSparkleIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const [hoverState, setHoverState] = useState("normal");
    const [isMobile, setIsMobile] = useState(false);

    // Track mouse position and handle hover states
    useEffect(() => {
        if (!isLoaded || !whimsyMode) return;

        // Detect if device is mobile
        const checkIfMobile = () => {
            setIsMobile(window.matchMedia("(hover: none) and (pointer: coarse)").matches);
        };

        checkIfMobile();
        window.addEventListener("resize", checkIfMobile);

        const handleMouseMove = (e: MouseEvent) => {
            mousePositionRef.current = {
                x: e.clientX,
                y: e.clientY,
            };

            // Update cursor position (only on desktop)
            if (mouseCursorRef.current && !isMobile) {
                mouseCursorRef.current.style.left = `${e.clientX}px`;
                mouseCursorRef.current.style.top = `${e.clientY}px`;
            }
        };

        const handleElementHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if target is clickable
            const isClickable =
                target.tagName === "BUTTON" ||
                target.tagName === "A" ||
                !!target.closest("a") ||
                !!target.closest("button") ||
                target.getAttribute("role") === "button" ||
                window.getComputedStyle(target).cursor === "pointer" ||
                !!target.closest(".clickable-image-wrapper");

            // Check for custom cursor states
            const hasCursorOpen =
                target.classList.contains("cursor-open") || !!target.closest(".cursor-open");

            const hasCursorClose =
                target.classList.contains("cursor-close") || !!target.closest(".cursor-close");

            // Check if target is normal selectable text
            const isText =
                !isClickable &&
                target.tagName !== "BODY" &&
                target.tagName !== "HTML" &&
                target.textContent &&
                target.textContent.trim().length > 0 &&
                // Check if it's an inline element or has direct text nodes
                (window.getComputedStyle(target).display.startsWith("inline") ||
                    Array.from(target.childNodes).some(
                        (node) =>
                            node.nodeType === Node.TEXT_NODE &&
                            node.textContent &&
                            node.textContent.trim().length > 0
                    )) &&
                // ensure the text is selectable
                window.getComputedStyle(target).userSelect !== "none" &&
                window.getComputedStyle(target).pointerEvents !== "none";

            // Set cursor state - priority: cursor-open, cursor-close, clickable, text
            if (hasCursorOpen) {
                setHoverState("open");
            } else if (hasCursorClose) {
                setHoverState("close");
            } else if (isClickable) {
                setHoverState("hover");
            } else if (isText) {
                setHoverState("text-hover");
            } else {
                setHoverState("normal");
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseover", handleElementHover);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseover", handleElementHover);
            window.removeEventListener("resize", checkIfMobile);
        };
    }, [isLoaded, whimsyMode, isMobile]);

    // Mouse sparkle effect
    useEffect(() => {
        if (!isLoaded || !whimsyMode) return;

        const sparkleContainer = mouseSparkleContainerRef.current;
        if (!sparkleContainer) return;

        // Track when mouse/touch last moved
        let lastMoveTimestamp = Date.now();

        // Create a sparkle element with random properties
        const createMouseSparkle = (
            x = mousePositionRef.current.x,
            y = mousePositionRef.current.y
        ) => {
            if (!whimsyMode) return;

            const sparkle = document.createElement("div");

            // Random size class
            const sizeClasses = ["tiny", "small", "medium"];
            const sizeClass = sizeClasses[Math.floor(Math.random() * sizeClasses.length)];

            // Random color class
            const colorClasses = ["", "blue", "purple", "gold", "red"];
            const colorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];

            // Occasionally create a star-shaped sparkle
            const isStarShaped = Math.random() < 0.3; // 30% chance

            sparkle.classList.add("mouse-sparkle", sizeClass);
            if (colorClass) sparkle.classList.add(colorClass);
            if (isStarShaped) sparkle.classList.add("star");

            // Random position around the mouse/touch pointer (with slight offset)
            const offset = 5;
            const randomOffsetX = -offset / 2 + Math.random() * offset;
            const randomOffsetY = -offset / 2 + Math.random() * offset;

            sparkle.style.left = `${x + randomOffsetX}px`;
            sparkle.style.top = `${y + randomOffsetY}px`;

            // Calculate drift direction for animation
            const angle = Math.random() * Math.PI * 2; // Random angle in radians
            const driftDistance = 30 + Math.random() * 100; // Larger distance for space feel
            const driftX = Math.cos(angle) * driftDistance;
            const driftY = Math.sin(angle) * driftDistance;
            const driftRotate = -180 + Math.random() * 360;

            // Set custom properties for the drift animation
            sparkle.style.setProperty("--drift-x", `${driftX}px`);
            sparkle.style.setProperty("--drift-y", `${driftY}px`);
            sparkle.style.setProperty("--drift-rotate", `${driftRotate}deg`);

            // Set animation properties
            const fadeOutDuration = 0.7 + Math.random() * 1.8; // 0.7-2.5 seconds
            sparkle.style.animation = `
        mouse-sparkle-fade-out ${fadeOutDuration}s ease-out forwards,
        mouse-sparkle-drift ${fadeOutDuration}s ease-out forwards
      `;

            // Add to container and remove when animation completes
            sparkleContainer.appendChild(sparkle);

            setTimeout(() => {
                if (sparkleContainer.contains(sparkle)) {
                    sparkleContainer.removeChild(sparkle);
                }
            }, fadeOutDuration * 1000);
        };

        // Create sparkles at random intervals when whimsy mode is ON
        const startMouseSparkleInterval = () => {
            // Clear any existing interval
            if (mouseSparkleIntervalRef.current) {
                clearInterval(mouseSparkleIntervalRef.current);
            }

            if (whimsyMode) {
                // Create a new sparkle every 40-90ms when mouse moves
                mouseSparkleIntervalRef.current = setInterval(
                    () => {
                        // Only create sparkles if the mouse has moved recently
                        const timeSinceLastMove = Date.now() - lastMoveTimestamp;
                        if (timeSinceLastMove < 500) {
                            // If mouse moved in the last 500ms
                            createMouseSparkle();
                        }
                    },
                    40 + Math.random() * 50
                );
            }
        };

        const trackMouseMovement = () => {
            lastMoveTimestamp = Date.now();
        };

        // Handle touch events for mobile
        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                mousePositionRef.current = {
                    x: touch.clientX,
                    y: touch.clientY,
                };
                lastMoveTimestamp = Date.now();

                // Create a bunch of sparkles on touch
                for (let i = 0; i < 5; i++) {
                    createMouseSparkle(touch.clientX, touch.clientY);
                }
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                mousePositionRef.current = {
                    x: touch.clientX,
                    y: touch.clientY,
                };
                lastMoveTimestamp = Date.now();

                // Create sparkles while moving finger
                createMouseSparkle(touch.clientX, touch.clientY);
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];

                // Create a final burst of sparkles when lifting finger
                for (let i = 0; i < 8; i++) {
                    createMouseSparkle(touch.clientX, touch.clientY);
                }
            }
        };

        window.addEventListener("mousemove", trackMouseMovement);

        // Add touch events for mobile devices
        if (isMobile) {
            window.addEventListener("touchstart", handleTouchStart);
            window.addEventListener("touchmove", handleTouchMove);
            window.addEventListener("touchend", handleTouchEnd);
        }

        startMouseSparkleInterval();

        // Cleanup function
        return () => {
            window.removeEventListener("mousemove", trackMouseMovement);

            if (isMobile) {
                window.removeEventListener("touchstart", handleTouchStart);
                window.removeEventListener("touchmove", handleTouchMove);
                window.removeEventListener("touchend", handleTouchEnd);
            }

            if (mouseSparkleIntervalRef.current) {
                clearInterval(mouseSparkleIntervalRef.current);
                mouseSparkleIntervalRef.current = null;
            }

            // Clear any remaining sparkles
            while (sparkleContainer.firstChild) {
                sparkleContainer.removeChild(sparkleContainer.firstChild);
            }
        };
    }, [isLoaded, whimsyMode, isMobile]);

    // Only render the container if whimsy mode is ON
    if (!whimsyMode) return null;

    return (
        <>
            <div ref={mouseSparkleContainerRef} className="mouse-sparkle-container"></div>
            {!isMobile && (
                <div ref={mouseCursorRef} className={`mouse-cursor-dot ${hoverState}`}></div>
            )}
        </>
    );
};

export default WhimsyMouse;
