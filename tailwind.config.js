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
        // Background colors (50% lighter)
        bg: {
          primary: "#858587", // 50% lighter from #0A0A0F
          secondary: "#89898D", // 50% lighter from #12121A
          tertiary: "#8D8D92", // 50% lighter from #1A1A24
          elevated: "#929298", // 50% lighter from #242430
        },
        // Accent colors
        accent: {
          primary: "#8B5CF6",
          secondary: "#6366F1",
          tertiary: "#A855F7",
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
          primary: "rgba(139, 92, 246, 0.2)",
          light: "rgba(161, 161, 170, 0.2)",
          secondary: "rgba(161, 161, 170, 0.1)",
        },
        // Status colors
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
        // Legacy support (keeping for backward compatibility)
        primary: "#0A0A0F",
        secondary1: "#12121A",
        light: {
          100: "#E4E4E7",
          200: "#A1A1AA",
          300: "#71717A",
        },
        dark: {
          100: "#1A1A24",
          200: "#0A0A0F",
        },
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
        glow: "0 0 20px rgba(139, 92, 246, 0.3)",
        "glow-lg": "0 0 40px rgba(139, 92, 246, 0.4)",
      },
    },
  },
  plugins: [],
};
