"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define the context type
type WhimsyContextType = {
  whimsyMode: boolean;
  toggleWhimsyMode: () => void;
  setWhimsyMode: (value: boolean) => void;
};

// Create the context with a default value
const WhimsyContext = createContext<WhimsyContextType | undefined>(undefined);

// Create a provider component
export const WhimsyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize state from localStorage if available, otherwise default to false
  const [whimsyMode, setWhimsyMode] = useState<boolean>(false);

  // Load the saved preference when the component mounts
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("whimsyMode");
      if (savedMode !== null) {
        setWhimsyMode(JSON.parse(savedMode));
      }
    } catch (error) {
      console.error("Error loading whimsy mode from localStorage:", error);
    }
  }, []);

  // Save to localStorage whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem("whimsyMode", JSON.stringify(whimsyMode));
    } catch (error) {
      console.error("Error saving whimsy mode to localStorage:", error);
    }
  }, [whimsyMode]);

  // Apply the whimsy class to the body element
  useEffect(() => {
    if (whimsyMode) {
      document.body.classList.add("whimsy-mode");
    } else {
      document.body.classList.remove("whimsy-mode");
    }
  }, [whimsyMode]);

  // Toggle function
  const toggleWhimsyMode = () => {
    setWhimsyMode((prev) => !prev);
  };

  // Value object to be provided by the context
  const value = {
    whimsyMode,
    toggleWhimsyMode,
    setWhimsyMode: (value: boolean) => setWhimsyMode(value),
  };

  return (
    <WhimsyContext.Provider value={value}>{children}</WhimsyContext.Provider>
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
