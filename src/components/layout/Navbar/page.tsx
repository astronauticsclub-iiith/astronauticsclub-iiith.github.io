"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsScrolled(false);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if this is the first visit in an hour
  useEffect(() => {
    const checkFirstVisit = () => {
      const lastVisit = localStorage.getItem("lastVisitTime");
      const currentTime = new Date().getTime();

      // If no last visit or last visit was more than an hour ago
      if (!lastVisit || currentTime - parseInt(lastVisit) > 60 * 60 * 1000) {
        setIsFirstVisit(true);
        localStorage.setItem("lastVisitTime", currentTime.toString());
      }
    };

    // Only run in browser, not during SSR
    if (typeof window !== "undefined") {
      checkFirstVisit();
    }
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/blogs", label: "Blogs" },
    { href: "/gallery", label: "Gallery" },
    { href: "/team", label: "Team" },
    { href: "/events", label: "Events" },
    { href: "/about", label: "About" },
  ];

  const delayCounter =
    (typeof window !== "undefined" && window.innerWidth < 768
      ? 0
      : navLinks.length) + (pathname === "/" ? 10 : 0);

  // Add active class based on current path
  const activeClass = (href: string) =>
    pathname === href
      ? "text-white underline underline-offset-[5px]"
      : "text-white/50";

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 rounded-b-2xl select-none backdrop-blur-sm text-lg animate-fade-in ${
        isScrolled || pathname !== "/" ? "bg-black/95" : "bg-transparent"
      }`}
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4 text-white font-bold">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Logo"
                width={80}
                height={90}
                className="w-auto h-12 opacity-0 animate-fade-in z-50"
                style={{
                  animationDelay: isFirstVisit
                    ? `${(delayCounter + 1) * 150}ms`
                    : "10ms",
                }}
              />
            </Link>
            <span
              className="opacity-0 animate-slide-in z-20"
              style={{
                animationDelay: isFirstVisit
                  ? `${(delayCounter + 3) * 150}ms`
                  : "10ms",
              }}
            >
              Astronautics Club | IIITH
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <ul className="flex space-x-8">
              {navLinks.map((link, index) => (
                <li
                  key={link.href}
                  className="opacity-0 animate-fade-in"
                  style={{
                    animationDelay: isFirstVisit
                      ? `${(delayCounter - index) * 150}ms`
                      : "10ms",
                  }}
                >
                  <Link
                    href={link.href}
                    className={`${activeClass(
                      link.href
                    )}  transition-colors duration-300 hover:text-white focus:text-white`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hamburger Menu Button */}
          <div className="md:hidden">
            <button
              ref={buttonRef}
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white focus:outline-none transition-transform duration-300 ease-in-out"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-6 mr-2">
                {/* First line */}
                <span
                  className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ease-in-out ${
                    isOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                {/* Middle line */}
                <span
                  className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ease-in-out ${
                    isOpen ? "opacity-0" : "opacity-100 translate-y-[8px]"
                  }`}
                />
                {/* Last line */}
                <span
                  className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ease-in-out ${
                    isOpen ? "-rotate-45 translate-y-2" : "translate-y-[16px]"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation with Animation */}
        <div
          ref={menuRef}
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-black/95 ${
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="px-2 pt-2 pb-6 space-y-1">
            {navLinks.map((link, index) => (
              <li
                key={link.href}
                className="transform transition-all duration-300 ease-in-out"
                style={{
                  transitionDelay: `${index * 50}ms`,
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? "scale(1)" : "scale(0.5)",
                }}
              >
                <Link
                  href={link.href}
                  className={`block px-4 py-2 rounded-md text-base text-center ${activeClass(
                    link.href
                  )} transition-colors duration-300 hover:text-white focus:text-white`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
