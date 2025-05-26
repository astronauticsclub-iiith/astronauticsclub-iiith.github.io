import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        slideInFromLeft: {
          "0%": { transform: "translateX(-2rem)", opacity: "0" },
          "50%": { transform: "translateX(-0.5rem)", opacity: "0.15" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInFromRight: {
          "0%": { transform: "translateX(2rem)", opacity: "0" },
          "50%": { transform: "translateX(0.5rem)", opacity: "0.15" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInFromTop: {
          "0%": { transform: "translateY(-2rem)", opacity: "0" },
          "50%": { transform: "translateY(-0.5rem)", opacity: "0.15" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInFromBottom: {
          "0%": { transform: "translateY(2rem)", opacity: "0" },
          "50%": { transform: "translateY(0.5rem)", opacity: "0.15" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-in-from-left": "slideInFromLeft 0.5s ease-out forwards",
        "slide-in-from-right": "slideInFromRight 0.5s ease-out forwards",
        "slide-in-from-top": "slideInFromTop 0.5s ease-out forwards",
        "slide-in-from-bottom": "slideInFromBottom 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
