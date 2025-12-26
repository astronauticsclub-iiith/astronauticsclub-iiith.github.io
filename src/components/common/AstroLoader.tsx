"use client";

import { useRef } from "react";
import { useWhimsy } from "@/context/WhimsyContext";
import "./AstroLoader.css";

interface AstroLoaderProps {
    className?: string;
}

const AstroLoader = ({ className = "" }: AstroLoaderProps) => {
    const { whimsyMode } = useWhimsy();
    const astronautRef = useRef<HTMLDivElement>(null);

    // Generate colorful stars when whimsy mode is on
    const generateStars = (boxNumber: number) => {
        if (whimsyMode) {
            // Colors available in whimsy mode
            const colorClasses = ["", "blue", "purple", "gold", "red"];
            const starPositions = [1, 2, 3, 4, 5, 6, 7];

            return starPositions.map((position) => {
                // Random color for each star in whimsy mode
                const colorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
                // 30% chance for star shape in whimsy mode
                const isStarShaped = Math.random() < 0.3;

                return (
                    <div
                        key={`star-${boxNumber}-${position}`}
                        className={`star star-position${position} ${colorClass} ${
                            isStarShaped ? "star-shaped" : ""
                        }`}
                    ></div>
                );
            });
        } else {
            // Regular stars in normal mode
            return [1, 2, 3, 4, 5, 6, 7].map((position) => (
                <div
                    key={`star-${boxNumber}-${position}`}
                    className={`star star-position${position}`}
                ></div>
            ));
        }
    };

    return (
        <div className={`astro-loader-container ${className}`}>
            <div className="box-of-star1">{generateStars(1)}</div>
            <div className="box-of-star2">{generateStars(2)}</div>
            <div className="box-of-star3">{generateStars(3)}</div>
            <div className="box-of-star4">{generateStars(4)}</div>
            <div
                ref={astronautRef}
                data-js="astro"
                className={`astronaut ${whimsyMode ? "astronaut-whimsy" : ""}`}
            >
                <div className="head"></div>
                <div className="arm arm-left"></div>
                <div className="arm arm-right"></div>
                <div className="body">
                    <div className="panel"></div>
                </div>
                <div className="leg leg-left"></div>
                <div className="leg leg-right"></div>
                <div className="schoolbag"></div>
            </div>
        </div>
    );
};

export default AstroLoader;
