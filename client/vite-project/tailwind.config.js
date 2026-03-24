// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0f",
        surface: "#13131a",
        accent: "#6366f1",
        accent2: "#a855f7",
        text: "#e2e8f0",
      },
      boxShadow: {
        glow: "0 0 40px rgba(99,102,241,0.25)",
      },
      keyframes: {
        floatUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        floatUp: "floatUp 700ms ease-out forwards",
      },
    },
  },
  plugins: [],
};