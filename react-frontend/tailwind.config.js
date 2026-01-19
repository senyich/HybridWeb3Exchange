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
          "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 100%)",
        "glass-shine":
          "linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%)",
        "noise-pattern":
          "url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')",
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
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-up": "fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "rotate-180": "rotate180 0.3s ease-in-out",
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
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        rotate180: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(180deg)" },
        },
      },
    },
  },
  plugins: [],
};
