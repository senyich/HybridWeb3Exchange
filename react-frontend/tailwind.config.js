/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "className",
  theme: {
    extend: {
      colors: {
        purple: {
          neon: "#A855F7",
          electric: "#C084FC",
          deep: "#9333EA",
          dark: "#6B21A8",
          glow: "#D946EF",
        },

        crimson: {
          dark: "#7F1D1D",
          blood: "#991B1B",
          neon: "#DC2626",
          electric: "#EF4444",
          deep: "#B91C1C",
        },
        neon: {
          purple: "#BF40BF",
          fuchsia: "#FF00FF",
          magenta: "#FF00CC",
          red: "#FF073A",
          violet: "#8A2BE2",
        },

        gradient: {
          start: "#8B0000",
          middle: "#4C1D95",
          end: "#000000",
        },

        custom: {
          "dark-red": "#450A0A",
          "neon-purple": "#D400FF",
          "blood-magenta": "#9D174D",
          "violet-night": "#3B0764",
          "electric-fuchsia": "#EC4899",
        },
      },
      backgroundImage: {
        "purple-red":
          "linear-gradient(135deg, #7F1D1D 0%, #6B21A8 50%, #3B0764 100%)",
        "neon-glow":
          "linear-gradient(135deg, #FF00FF 0%, #FF073A 50%, #BF40BF 100%)",
        "dark-radial":
          "radial-gradient(circle at center, #3B0764 0%, #1F0A33 50%, #0F0519 100%)",
        "blood-moon":
          "linear-gradient(135deg, #450A0A 0%, #7F1D1D 25%, #9333EA 75%, #3B0764 100%)",
      },

      boxShadow: {
        "neon-purple": "0 0 20px #A855F7, 0 0 40px #D946EF",
        "neon-red": "0 0 20px #DC2626, 0 0 40px #FF073A",
        "double-glow": "0 0 20px #FF00FF, 0 0 40px #FF073A, 0 0 60px #A855F7",
        "inner-neon": "inset 0 0 20px #D946EF",
      },

      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "neon-flicker": "neon-flicker 1.5s infinite alternate",
        "gradient-shift": "gradient-shift 3s ease infinite",
      },

      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px #A855F7, 0 0 10px #D946EF" },
          "50%": { boxShadow: "0 0 20px #A855F7, 0 0 40px #D946EF" },
        },
        "neon-flicker": {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": {
            opacity: "1",
            textShadow: "0 0 5px #FF00FF, 0 0 10px #FF073A",
          },
          "20%, 24%, 55%": {
            opacity: "0.8",
            textShadow: "none",
          },
        },
        "gradient-shift": {
          "0%, 100%": {
            "background-position": "0% 50%",
          },
          "50%": {
            "background-position": "100% 50%",
          },
        },
      },

      textShadow: {
        neon: "0 0 5px #A855F7, 0 0 10px #D946EF",
        "red-neon": "0 0 5px #DC2626, 0 0 10px #FF073A",
        "purple-glow": "0 0 10px #BF40BF, 0 0 20px #FF00FF, 0 0 30px #8A2BE2",
      },
    },
  },
};
