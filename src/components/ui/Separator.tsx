"use client";

import React from "react";
import "./WaveSeparator.css";

interface SeparatorProps {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  height?: number;
  className?: string;
}

const WaveSeparator: React.FC<SeparatorProps> = ({
  color1 = "#b62f84",
  color2 = "#161148",
  color3 = "#6a71af",
  color4 = "#e0e0e0",
  height = 80,
  className = "",
}) => {
  return (
    <svg
      className={`separator ${className}`}
      viewBox="0 24 150 28"
      preserveAspectRatio="none"
      style={{ height: `${height}px`, maxHeight: `${height}px` }}
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

export default WaveSeparator;
