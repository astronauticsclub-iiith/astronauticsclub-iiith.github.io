"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useWhimsy } from "@/context/WhimsyContext";
import GravitationalLensing from "./GravitationalLensing";

export default function AboutUsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { whimsyMode, isLoaded } = useWhimsy();
  const [mousePosition, setMousePosition] = useState({ x: -1, y: -1 });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isLoaded || !whimsyMode || !sectionRef.current) return;

    const textContainer = sectionRef.current;
    const headingEl = textContainer.querySelector(".about-us-heading");
    const contentElements = textContainer.querySelectorAll(".about-us-content");

    const animateText = (element: Element) => {
      const text = element.textContent || "";
      element.innerHTML = "";
      text.split(" ").forEach((word) => {
        const wordWrapper = document.createElement("span");
        wordWrapper.style.whiteSpace = "nowrap";
        wordWrapper.style.display = "inline-block";
        word.split("").forEach((char) => {
          const span = document.createElement("span");
          span.textContent = char;
          wordWrapper.appendChild(span);
        });
        element.appendChild(wordWrapper);
        element.appendChild(document.createTextNode("\u00A0"));
      });
    };

    if (headingEl) {
      animateText(headingEl);
    }
    contentElements.forEach(animateText);

    // Add gravitational lensing effect
    const spans = textContainer.querySelectorAll("span");
    const letterRadius = 70;

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      setMousePosition({ x: mouseX, y: mouseY });

      spans.forEach((span) => {
        const rect = span.getBoundingClientRect();
        const letterX = rect.left + rect.width / 2;
        const letterY = rect.top + rect.height / 2;

        const dx = letterX - mouseX;
        const dy = letterY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < letterRadius) {
          const d = distance / letterRadius;
          const smootherstep = (t: number) =>
            1 / Math.exp(-6 * t + 3) - Math.exp(-3);
          const scale = 0.2 * (1 - smootherstep(1 - d));
          const offsetX = dx * scale * 0.1;
          const offsetY = dy * scale * 0.1;

          (span as HTMLElement).style.transform = `scale(${
            1 + scale
          }) translate(${offsetX}px, ${offsetY}px)`;
        } else {
          (span as HTMLElement).style.transform = "none";
        }
      });
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: -1, y: -1 });
      spans.forEach((span) => {
        (span as HTMLElement).style.transform = "none";
      });
    };

    textContainer.addEventListener("mousemove", handleMouseMove);
    textContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      textContainer.removeEventListener("mousemove", handleMouseMove);
      textContainer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [whimsyMode, isLoaded]);

  // Render normal content if whimsy mode is off or not loaded
  if (!whimsyMode || !isLoaded) {
    return (
      <motion.section
        id="aboutUs"
        className="relative club-intro"
        ref={sectionRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-4xl font-bold uppercase tracking-tight text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            About Us
          </motion.h1>
          <motion.div
            className="h-1 bg-white w-24 mt-2 mx-auto"
            initial={{ width: 0 }}
            animate={{ width: "6rem" }}
            transition={{ delay: 0.4, duration: 0.6 }}
          ></motion.div>
        </div>
        <div className="max-w-4xl mx-auto mt-8 text-lg text-white/80 space-y-6">
          <motion.p
            className="about-us-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Who hasn&apos;t been captivated by the serene vastness of the
            midnight sky, mesmerized by the gentle glow of the moon or awestruck
            at the sight of a shooting star? The universe beckons with its
            mysteries and wonders, inviting us to explore and connect with its
            infinite beauty. If you&apos;ve ever yearned to deepen this
            connection, look no further into your childhood dream.
          </motion.p>
          <motion.p
            className="about-us-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Astronautics Club at IIIT Hyderabad is a vibrant student-run
            community united by our shared passion for space. The word
            Astronautics is a fusion of Astronomy and Aeronautics, perfectly
            encapsulating our dual passion for Astronomy and SpaceTech. From
            captivating stargazing sessions with our telescope to mesmerizing
            star parties on the serene outskirts of the city, we bring the
            cosmos closer to you. Our journey doesn&apos;t stop at observation.
            We work on ambitious projects and have participated in several
            national and international competitions, gaining invaluable
            experience and recognition along the way.
          </motion.p>
          <motion.p
            className="about-us-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Whether you are a seasoned stargazer or a curious beginner, we
            welcome everyone to embark along into the journey of discovery,
            innovation, and exploration!
          </motion.p>
        </div>
      </motion.section>
    );
  }

  // Render container with gravitational lensing for whimsy mode (will be populated by useEffect)
  return (
    <div className="relative">
      {isDesktop && (
        <GravitationalLensing
          mouseX={mousePosition.x}
          mouseY={mousePosition.y}
        />
      )}
      <motion.section
        id="aboutUs"
        className="relative club-intro z-50"
        ref={sectionRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-4xl font-bold uppercase tracking-tight text-white mb-4 w-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            About Us
          </motion.h1>
          <motion.div
            className="h-1 bg-white w-24 mt-2 mx-auto"
            initial={{ width: 0 }}
            animate={{ width: "6rem" }}
            transition={{ delay: 0.4, duration: 0.6 }}
          ></motion.div>
        </div>
        <div className="max-w-4xl mx-auto mt-8 text-lg text-white/80 space-y-6">
          <motion.p
            className="about-us-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Who hasn&apos;t been captivated by the serene vastness of the
            midnight sky, mesmerized by the gentle glow of the moon or awestruck
            at the sight of a shooting star? The universe beckons with its
            mysteries and wonders, inviting us to explore and connect with its
            infinite beauty. If you&apos;ve ever yearned to deepen this
            connection, look no further into your childhood dream.
          </motion.p>
          <motion.p
            className="about-us-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Astronautics Club at IIIT Hyderabad is a vibrant student-run
            community united by our shared passion for space. The word
            Astronautics is a fusion of Astronomy and Aeronautics, perfectly
            encapsulating our dual passion for Astronomy and SpaceTech. From
            captivating stargazing sessions with our telescope to mesmerizing
            star parties on the serene outskirts of the city, we bring the
            cosmos closer to you. Our journey doesn&apos;t stop at observation.
            We work on ambitious projects and have participated in several
            national and international competitions, gaining invaluable
            experience and recognition along the way.
          </motion.p>
          <motion.p
            className="about-us-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Whether you are a seasoned stargazer or a curious beginner, we
            welcome everyone to embark along into the journey of discovery,
            innovation, and exploration!
          </motion.p>
        </div>
      </motion.section>
    </div>
  );
}
