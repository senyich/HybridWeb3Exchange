/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        background: "#030014",
        surface: "#0F0518",
        purple: {
          neon: "#B026FF",
          electric: "#D946EF",
          deep: "#581C87",
          dark: "#3B0764",
        },
        crimson: {
          neon: "#FF003C",
          blood: "#7F1D1D",
          dark: "#450A0A",
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient":
          "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
      },
      boxShadow: {
        "neon-purple":
          "0 0 10px rgba(176, 38, 255, 0.3), 0 0 20px rgba(176, 38, 255, 0.1)",
        "neon-red":
          "0 0 10px rgba(255, 0, 60, 0.3), 0 0 20px rgba(255, 0, 60, 0.1)",
        glass: "0 4px 30px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        shimmer: "shimmer 1.5s infinite",
        "fade-in": "fadeIn 0.35s ease-out",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(176, 38, 255, 0.2)" },
          "100%": {
            boxShadow:
              "0 0 20px rgba(176, 38, 255, 0.6), 0 0 10px rgba(255, 0, 60, 0.4)",
          },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
