"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Import WhimsyMouse with no SSR to avoid hydration errors
const WhimsyMouse = dynamic(() => import("@/components/features/WhimsyMouse"), { ssr: false });

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
        const savedMode = sessionStorage.getItem("whimsyMode");
        return savedMode !== null ? JSON.parse(savedMode) : false;
    } catch (error) {
        console.error("Error loading whimsy mode from localStorage:", error);
        return false;
    }
};

// Create a provider component
export const WhimsyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize state from localStorage synchronously
    const [whimsyMode, setWhimsyMode] = useState<boolean>(getInitialWhimsyMode);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    const pathname = usePathname();
    const isAboutPage = pathname.startsWith("/about");
    const isWhimsyActive = whimsyMode && !isAboutPage;

    // Mark as loaded after hydration
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever the state changes (but only when loaded)
    useEffect(() => {
        if (!isLoaded) return;
        try {
            sessionStorage.setItem("whimsyMode", JSON.stringify(whimsyMode));
        } catch (error) {
            console.error("Error saving whimsy mode to sessionStorage:", error);
        }
    }, [whimsyMode, isLoaded]);

    // Apply the whimsy class to the body element
    useEffect(() => {
        if (!isLoaded) return;
        if (isWhimsyActive) {
            document.body.classList.add("whimsy-mode");
        } else {
            document.body.classList.remove("whimsy-mode");
        }
    }, [isWhimsyActive, isLoaded]);

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
            {isLoaded && isWhimsyActive && <WhimsyMouse />}
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
