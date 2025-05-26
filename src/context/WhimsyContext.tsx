"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Import WhimsyMouse with no SSR to avoid hydration errors
const WhimsyMouse = dynamic(
  () => import("@/components/features/WhimsyMouse"),
  { ssr: false }
);

// Define the context type
type WhimsyContextType = {
  whimsyMode: boolean;
  toggleWhimsyMode: () => void;
  setWhimsyMode: (value: boolean) => void;
  isLoaded: boolean;
};

// Create the context with a default value
const WhimsyContext = createContext<WhimsyContextType | undefined>(undefined);

// Helper function to get initial whimsy mode
const getInitialWhimsyMode = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const savedMode = localStorage.getItem("whimsyMode");
    return savedMode !== null ? JSON.parse(savedMode) : false;
  } catch (error) {
    console.error("Error loading whimsy mode from localStorage:", error);
    return false;
  }
};

// Create a provider component
export const WhimsyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize state from localStorage synchronously
  const [whimsyMode, setWhimsyMode] = useState<boolean>(getInitialWhimsyMode);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Mark as loaded after hydration
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever the state changes (but only when loaded)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("whimsyMode", JSON.stringify(whimsyMode));
    } catch (error) {
      console.error("Error saving whimsy mode to localStorage:", error);
    }
  }, [whimsyMode, isLoaded]);

  // Apply the whimsy class to the body element
  useEffect(() => {
    if (!isLoaded) return;
    if (whimsyMode) {
      document.body.classList.add("whimsy-mode");
    } else {
      document.body.classList.remove("whimsy-mode");
    }
  }, [whimsyMode, isLoaded]);

  // Toggle function
  const toggleWhimsyMode = () => {
    setWhimsyMode((prev) => !prev);
  };

  // Value object to be provided by the context
  const value = {
    whimsyMode,
    toggleWhimsyMode,
    setWhimsyMode: (value: boolean) => setWhimsyMode(value),
    isLoaded,
  };

  return (
    <WhimsyContext.Provider value={value}>
      {children}
      {/* Only render WhimsyMouse when loaded */}
      {isLoaded && <WhimsyMouse />}
    </WhimsyContext.Provider>
  );
};

// Custom hook to use the whimsy context
export const useWhimsy = (): WhimsyContextType => {
  const context = useContext(WhimsyContext);
  if (context === undefined) {
    throw new Error("useWhimsy must be used within a WhimsyProvider");
  }
  return context;
};
