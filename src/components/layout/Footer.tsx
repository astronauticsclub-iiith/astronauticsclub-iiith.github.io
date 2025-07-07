"use client";

import React from "react";
import CustomLink from "@/components/common/custom-link/page";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/blogs", label: "Blogs" },
    { href: "/gallery", label: "Gallery" },
    { href: "/team", label: "Team" },
    { href: "/events", label: "Events" },
    { href: "/about", label: "About" },
  ];

  return (
    <footer className="relative bg-black overflow-hidden rounded-t-2xl">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Club Info Section */}
          <div className="space-y-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:space-x-4 space-y-3 md:space-y-0">
              <div className="relative w-20 h-20 rounded-full mx-auto md:mx-0">
                <div className="w-full h-full rounded-full flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Astronautics Club Logo"
                    width={80}
                    height={78}
                    className="rounded-full"
                    priority
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold">Astronautics Club</h2>
            </div>
            <p className="text-gray-300 leading-relaxed max-w-sm mx-auto px-8 md:px-0 md:mx-0">
              Confining our attention to terrestrial matters would be to limit
              the human spirit. Join us to look beyond the horizon.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4 pt-6 text-center">
            <h3 className="text-xl font-semibold mb-4 accent">Links</h3>
            <div className="grid grid-cols-2 gap-x-8">
              <nav className="flex flex-col space-y-2 items-end">
                {navigationLinks
                  .slice(0, Math.ceil(navigationLinks.length / 2))
                  .map((link) => (
                    <CustomLink
                      key={link.href}
                      href={link.href}
                      className="w-auto"
                    >
                      {link.label}
                    </CustomLink>
                  ))}
              </nav>
              <nav className="flex flex-col space-y-2 items-start">
                {navigationLinks
                  .slice(Math.ceil(navigationLinks.length / 2))
                  .map((link) => (
                    <CustomLink
                      key={link.href}
                      href={link.href}
                      className="inline-block"
                    >
                      {link.label}
                    </CustomLink>
                  ))}
              </nav>
            </div>
          </div>

          {/* Reach Us Section */}
          <div className="space-y-4 pt-6 text-center md:text-right">
            <h3 className="text-xl font-semibold mb-4 accent">Reach Us</h3>
            <address className="not-italic space-y-3">
              <p className="text-gray-300">Astronautics Club, IIIT Hyderabad</p>

              <a
                href="mailto:astronauticsclub@students.iiit.ac.in"
                className="flex items-center justify-center md:justify-end space-x-2 text-gray-300 duration-300 group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="break-all">
                  astronauticsclub@students.iiit.ac.in
                </span>
              </a>

              <a
                href="tel:+919899199660"
                className="flex items-center justify-center md:justify-end space-x-2 text-gray-300 duration-300 group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>+91 9899199660</span>
              </a>

              {/* Social Media Links */}
              <div className="footer-social-media-handles-section pt-4 flex justify-center md:justify-end">
                {/* WhatsApp icon */}
                <a
                  href="https://chat.whatsapp.com/DlOZnHdUTRO3PGmfrahozG"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="footer-social-media-icon whatsapp"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                  </svg>
                </a>

                {/* LinkedIn icon */}
                <a
                  href="https://www.linkedin.com/company/astronauticsclub/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="footer-social-media-icon linkedin"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
                  </svg>
                </a>

                {/* Instagram icon */}
                <a
                  href="https://instagram.com/astronautics_club_iiith"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="footer-social-media-icon instagram"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                  </svg>
                </a>

                {/* Discord icon */}
                <a
                  href="https://discord.gg/JyWZVJ8keb"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="footer-social-media-icon discord"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
                  </svg>
                </a>
              </div>
            </address>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-4">
          {/* College Logo */}
          <div className="flex justify-center items-center mb-4">
            <a
              href="https://www.iiit.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Image
                src="/iiit-logo.png"
                alt="IIIT Hyderabad Logo"
                width={100}
                height={100}
                className="h-16 w-auto"
                priority
              />
            </a>
          </div>
          {/* GitHub Repository Link */}
          <div className="my-4 flex justify-center items-center">
            <a
              href="https://github.com/astronauticsclub-iiith/astronauticsclub-iiith.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span>View Source Code</span>
            </a>
          </div>
          <p className="text-center text-gray-400 text-sm">
            Copyright © {currentYear} Astronautics Club, IIIT Hyderabad
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
