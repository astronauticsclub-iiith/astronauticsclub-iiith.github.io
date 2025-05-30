"use client";

import { useEffect, useState } from 'react';
import AstroLoader from '../common/AstroLoader';

interface LoaderProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}

const Loader = ({ 
  className = '', 
  size = 'medium', 
  overlay = false
}: LoaderProps) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) return null;
  
  // Size-specific classes
  const sizeClasses = {
    small: 'h-32',
    medium: 'h-60',
    large: 'h-80'
  };
  
  // If this is an overlay loader
  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className={`w-full max-w-md ${sizeClasses[size]} ${className}`}>
          <AstroLoader />
        </div>
      </div>
    );
  }
  
  // Standard inline loader
  return (
    <div className={`w-full ${sizeClasses[size]} ${className}`}>
      <AstroLoader />
    </div>
  );
};

export default Loader;
