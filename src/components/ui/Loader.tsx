"use client";

import { useEffect, useState } from "react";
import AstroLoader from "../common/AstroLoader";

interface LoaderProps {
  className?: string;
  overlay?: boolean;
  fullscreen?: boolean;
}

const Loader = ({
  className = "",
  overlay = false,
  fullscreen = false,
}: LoaderProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // If this is an overlay loader
  if (overlay) {
    return (
        <div className={`h-96 w-full max-w-md ${className}`}>
          <AstroLoader />
        </div>
    );
  }

  // If this is a fullscreen loader
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className={`h-full w-full ${className}`}>
          <AstroLoader />
        </div>
      </div>
    );
  }

  // Standard inline loader
  return (
    <div className={`h-full w-full ${className}`}>
      <AstroLoader />
    </div>
  );
};

export default Loader;
