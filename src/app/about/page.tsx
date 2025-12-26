"use client";

import AboutUsSection from "@/components/features/AboutUsSection";
import FAQSection from "@/components/features/FAQSection";
import { useWhimsy } from "@/context/WhimsyContext";
import { useEffect, useState } from "react";
import "@/components/ui/bg-patterns.css";
import "./about.css";

export default function AboutPage() {
  const { whimsyMode, isLoaded } = useWhimsy();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const backgroundPattern =
    whimsyMode && isLoaded && isDesktop
      ? "bg-pattern-four-point-stars-dimmed"
      : "bg-pattern-four-point-stars";

  return (
    <main className={`min-h-screen bg-background pt-24 pb-8 md:pb-16 px-8 ${backgroundPattern}`}>
      <div className="max-w-7xl mx-auto">
        <AboutUsSection />
        <FAQSection />
      </div>
    </main>
  );
}
