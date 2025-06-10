"use client";

import AboutUsSection from "@/components/features/AboutUsSection";
import FAQSection from "@/components/features/FAQSection";
import "@/components/ui/bg-patterns.css";
import "./about.css";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background bg-pattern-topography pt-24 pb-8 md:pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <AboutUsSection />
        <FAQSection />
      </div>
    </main>
  );
}