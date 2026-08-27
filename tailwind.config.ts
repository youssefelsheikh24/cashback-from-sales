import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#FDFBF5",
          100: "#F9F3DE",
          200: "#F1E4B5",
          300: "#E8D387",
          400: "#DEC25C",
          500: "#D4AF37", // Primary metallic gold — matches the CashBack logo
          600: "#B89426",
          700: "#927419",
          800: "#6F5714",
          900: "#4F3D0F",
          light: "#F5DF90",
          dark: "#A7831C",
        },
        dark: {
          bg: "#040406",
          surface: "#0C0C10",
          card: "#111117",
          cardHover: "#17171F",
          border: "#1D1D28",
          borderLight: "#2A2A3A",
          subtle: "#141420",
          muted: "#87879B",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #AA7C11 100%)",
        "gold-shimmer": "linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)",
        "dark-radial": "radial-gradient(ellipse at top, #17171F 0%, #040406 70%)",
      },
      boxShadow: {
        "gold-glow": "0 0 35px -5px rgba(212, 175, 55, 0.25)",
        "gold-glow-lg": "0 0 60px -10px rgba(212, 175, 55, 0.35)",
        "dark-card": "0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      },
      animation: {
        "pulse-subtle": "pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2.5s infinite",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
