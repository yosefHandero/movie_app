/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        bg: {
          primary: "#0f0818",
          secondary: "#1a0f2e",
          tertiary: "#221438",
          elevated: "#2a1a42",
        },
        // Accent colors
        accent: {
          primary: "#A78BFA",
          secondary: "#8B5CF6",
          tertiary: "#C4B5FD",
        },
        // Text colors
        text: {
          primary: "#FFFFFF",
          secondary: "#E4E4E7",
          tertiary: "#A1A1AA",
          disabled: "#71717A",
        },
        // Border colors
        border: {
          primary: "rgba(167, 139, 250, 0.24)",
          light: "rgba(255, 255, 255, 0.08)",
          secondary: "rgba(255, 255, 255, 0.04)",
        },
        // Status colors
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
        "4xl": "80px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "30px",
        "4xl": "36px",
        "5xl": "48px",
        "6xl": "64px",
      },
      boxShadow: {
        glow: "0 0 16px rgba(167, 139, 250, 0.22)",
        "glow-lg": "0 0 28px rgba(167, 139, 250, 0.26)",
      },
    },
  },
  plugins: [],
};
