"use client";

import React, { useState, useEffect, useRef } from "react";
import "./WaveSeparator.css";
import "./CloudSeparator.css";
import "./CloudFade.css";
import "./bg-patterns.css";

interface WaveSeparatorProps {
  color0?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  height?: number;
  className?: string;
}

const WaveSeparator: React.FC<WaveSeparatorProps> = ({
  color0 = "#020001",
  color1 = "#b62f84",
  color2 = "#161148",
  color3 = "#6a71af",
  color4 = "#e0e0e0",
  height = 80,
  className = "",
}) => {
  return (
    <svg
      className={`separator bg-[${color0}] ${className}`}
      viewBox="0 24 150 28"
      preserveAspectRatio="none"
      style={{ height: `${height}px`, maxHeight: `${height}px` }}
      suppressHydrationWarning
    >
      <defs>
        <path
          id="gentle-wave"
          d="M-160 44c30 0 
          58-18 88-18s
          58 18 88 18 
          58-18 88-18 
          58 18 88 18
          v44h-352z"
        />
      </defs>
      <g className="parallax1">
        <use xlinkHref="#gentle-wave" x="50" y="3" fill={color1} />
      </g>
      <g className="parallax2">
        <use xlinkHref="#gentle-wave" x="50" y="0" fill={color2} />
      </g>
      <g className="parallax3">
        <use xlinkHref="#gentle-wave" x="50" y="9" fill={color3} />
      </g>
      <g className="parallax4">
        <use xlinkHref="#gentle-wave" x="50" y="6" fill={color4} />
      </g>
    </svg>
  );
};

interface CloudSeparatorProps {
  height?: number;
  cloudColor?: string;
  className?: string;
  backgroundColorFrom?: string;
  backgroundColorTo?: string;
  cloudCount?: number;
  wavePattern?: 1 | 2 | 3;
}

const CloudSeparator: React.FC<CloudSeparatorProps> = ({
  height = 300,
  cloudColor = "#e0e0e0",
  className = "",
  cloudCount: propCloudCount,
}) => {
  const [cloudCount, setCloudCount] = useState<number>(propCloudCount || 25);
  const [isClient, setIsClient] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [separatorHeightVh, setSeparatorHeightVh] = useState<number>(
    height / 15
  );

  const separatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (propCloudCount) {
        setCloudCount(propCloudCount);
        setSeparatorHeightVh(height / 15);
        return;
      }

      const width = window.innerWidth;

      if (width < 640) {
        // mobile – keep them nice and visible
        setCloudCount(15);
        setSeparatorHeightVh(26);
      } else if (width < 1024) {
        // tablet – medium density and height
        setCloudCount(20);
        setSeparatorHeightVh(22);
      } else {
        // desktop – same feel but less tall band
        setCloudCount(22);
        setSeparatorHeightVh(16);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [propCloudCount, height]);

  const clouds = Array.from({ length: cloudCount }, (_, i) => {
    const cloudClass = `cloud-x${(i % 25) + 1}`;
    const delayClass = `delay-${(i % 8) + 1}`;

    const horizontalOffset = `${(i % 6) * 10}%`;

    const minPadding = 10;
    const maxPadding = height > 100 ? 80 : 60;
    const bandHeight = Math.max(height - maxPadding - minPadding, 40);
    const topPosition = minPadding + Math.floor(Math.random() * bandHeight);

    return (
      <div
        key={i}
        className={`${cloudClass} ${delayClass}`}
        style={
          {
            position: "absolute",
            top: `${topPosition}px`,
            left: horizontalOffset,
            "--cloud-index": i,
            "--cloud-delay": `${(i % 8) * -4}s`,
            "--cloud-duration": `${40 + (i % 20)}s`,
            zIndex: 20,
          } as React.CSSProperties
        }
        suppressHydrationWarning
      >
        <div
          className="cloud"
          style={{
            background: `linear-gradient(to bottom, ${cloudColor} 5%, ${adjustColor(
              cloudColor,
              -10
            )} 100%)`,
            boxShadow: `0 8px 5px ${adjustColor(cloudColor, -20, 0.1)}`,
          }}
          suppressHydrationWarning
        />
      </div>
    );
  });

  return (
    <div
      ref={separatorRef}
      className={`cloud-separator w-full absolute ${
        isLoaded ? "loaded" : ""
      } ${className}`}
      style={{
        height: `${separatorHeightVh}vh`,
      }}
      suppressHydrationWarning
    >
      <div
        className="cloud-background-wrap relative z-10 w-full"
        suppressHydrationWarning
      >
        {isClient && clouds}
      </div>
    </div>
  );
};

// Helper function to adjust color brightness
function adjustColor(color: string, percent: number, alpha?: number): string {
  // If it's a named color like "white", convert to hex
  if (!/^#/.test(color)) {
    const tempElement = document.createElement("div");
    tempElement.style.color = color;
    document.body.appendChild(tempElement);
    const computedColor = getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);

    if (computedColor.startsWith("rgb")) {
      // Extract RGB values
      const rgb = computedColor.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        color = rgbToHex(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]));
      }
    }
  }

  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.max(0, Math.min(255, R + percent * 2.55));
  G = Math.max(0, Math.min(255, G + percent * 2.55));
  B = Math.max(0, Math.min(255, B + percent * 2.55));

  const RR = R.toString(16).padStart(2, "0");
  const GG = G.toString(16).padStart(2, "0");
  const BB = B.toString(16).padStart(2, "0");

  if (alpha !== undefined) {
    // Return with alpha value
    return `rgba(${R}, ${G}, ${B}, ${alpha})`;
  }

  return `#${RR}${GG}${BB}`;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export { WaveSeparator, CloudSeparator };
