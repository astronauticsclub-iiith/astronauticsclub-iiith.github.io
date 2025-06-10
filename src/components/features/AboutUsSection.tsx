"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useWhimsy } from "@/context/WhimsyContext";
import GravitationalLensing from "./GravitationalLensing";

export default function AboutUsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { whimsyMode, isLoaded } = useWhimsy();

  useEffect(() => {
    if (!isLoaded || !whimsyMode || !sectionRef.current) return;

    const textContainer = sectionRef.current;
    const heading = textContainer.querySelector(".about-us-heading")?.textContent || "";
    const contentElements = textContainer.querySelectorAll(".about-us-content");
    
    const contents: string[] = [];
    contentElements.forEach(el => {
      contents.push(el.textContent || "");
    });

    textContainer.innerHTML = "";

    // Create heading with individual character spans
    const headingContainer = document.createElement("h1");
    headingContainer.className = "about-us-heading";
    
    heading.split(" ").forEach(word => {
      const wordWrapper = document.createElement("span");
      wordWrapper.style.whiteSpace = "nowrap";
      wordWrapper.style.display = "inline-block";

      word.split("").forEach(char => {
        const span = document.createElement("span");
        span.textContent = char;
        wordWrapper.appendChild(span);
      });

      headingContainer.appendChild(wordWrapper);
      headingContainer.appendChild(document.createTextNode("\u00A0"));
    });

    textContainer.appendChild(headingContainer);

    // Create content paragraphs with individual character spans
    contents.forEach(content => {
      const cleanContent = content.replace(/[\r\n]+/gm, " ").replace(/\s{2,}/g, ' ').trim();
      const paragraph = document.createElement("p");
      paragraph.className = "about-us-content";

      cleanContent.split(" ").forEach(word => {
        const wordWrapper = document.createElement("span");
        wordWrapper.style.whiteSpace = "nowrap";
        wordWrapper.style.display = "inline-block";

        word.split("").forEach(char => {
          const span = document.createElement("span");
          span.textContent = char;
          wordWrapper.appendChild(span);
        });

        paragraph.appendChild(wordWrapper);
        paragraph.appendChild(document.createTextNode("\u00A0"));
      });

      textContainer.appendChild(paragraph);
    });

    // Add gravitational lensing effect
    const spans = textContainer.querySelectorAll("span");
    const letterRadius = 70;

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      spans.forEach(span => {
        const rect = span.getBoundingClientRect();
        const letterX = rect.left + rect.width / 2;
        const letterY = rect.top + rect.height / 2;

        const dx = letterX - mouseX;
        const dy = letterY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < letterRadius) {
          const d = distance / letterRadius;
          const smootherstep = (t: number) => 1 / Math.exp(-6 * t + 3) - Math.exp(-3);
          const scale = 0.2 * (1 - smootherstep(1 - d));
          const offsetX = dx * scale * 0.1;
          const offsetY = dy * scale * 0.1;

          (span as HTMLElement).style.transform = `scale(${1 + scale}) translate(${offsetX}px, ${offsetY}px)`;
        } else {
          (span as HTMLElement).style.transform = "none";
        }
      });
    };

    const handleMouseLeave = () => {
      spans.forEach(span => {
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
        className="club-intro relative"
        ref={sectionRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6">
          <motion.h1
            className="about-us-heading"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            About Us
          </motion.h1>
          <motion.div
            className="h-2 bg-white w-40 mt-2 shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: "10rem" }}
            transition={{ delay: 0.4, duration: 0.6 }}
          ></motion.div>
        </div>
        <motion.p
          className="about-us-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Who hasn&apos;t been captivated by the serene vastness of the midnight sky,
          mesmerized by the gentle glow of the moon or awestruck at the sight of
          a shooting star? The universe beckons with its mysteries and wonders,
          inviting us to explore and connect with its infinite beauty. If you&apos;ve
          ever yearned to deepen this connection, look no further into your
          childhood dream.
        </motion.p>
        <motion.p
          className="about-us-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Astronautics Club at IIIT Hyderabad is a vibrant student-run community
          united by our shared passion for space. The word Astronautics is a
          fusion of Astronomy and Aeronautics, perfectly encapsulating our dual
          passion for Astronomy and SpaceTech. From captivating stargazing
          sessions with our telescope to mesmerizing star parties on the serene
          outskirts of the city, we bring the cosmos closer to you. Our journey
          doesn&apos;t stop at observation. We work on ambitious projects and have
          participated in several national and international competitions,
          gaining invaluable experience and recognition along the way.
        </motion.p>
        <motion.p
          className="about-us-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          Whether you are a seasoned stargazer or a curious beginner, we welcome
          everyone to embark along into the journey of discovery, innovation,
          and exploration!
        </motion.p>
      </motion.section>
    );
  }

  // Render container with gravitational lensing for whimsy mode (will be populated by useEffect)
  return (
    <div className="relative">
      <GravitationalLensing />
      <section id="aboutUs" className="club-intro relative z-10" ref={sectionRef}>
        <h1 className="about-us-heading">About Us</h1>
        <p className="about-us-content">
          Who hasn&apos;t been captivated by the serene vastness of the midnight sky,
          mesmerized by the gentle glow of the moon or awestruck at the sight of
          a shooting star? The universe beckons with its mysteries and wonders,
          inviting us to explore and connect with its infinite beauty. If you&apos;ve
          ever yearned to deepen this connection, look no further into your
          childhood dream.
        </p>
        <p className="about-us-content">
          Astronautics Club at IIIT Hyderabad is a vibrant student-run community
          united by our shared passion for space. The word Astronautics is a
          fusion of Astronomy and Aeronautics, perfectly encapsulating our dual
          passion for Astronomy and SpaceTech. From captivating stargazing
          sessions with our telescope to mesmerizing star parties on the serene
          outskirts of the city, we bring the cosmos closer to you. Our journey
          doesn&apos;t stop at observation. We work on ambitious projects and have
          participated in several national and international competitions,
          gaining invaluable experience and recognition along the way.
        </p>
        <p className="about-us-content">
          Whether you are a seasoned stargazer or a curious beginner, we welcome
          everyone to embark along into the journey of discovery, innovation,
          and exploration!
        </p>
      </section>
    </div>
  );
}