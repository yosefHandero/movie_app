/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
          colors:{
              primary: '#030014',
              secondary1: '#151312',
              light: {
                  100: "#D6C7FF",
                  200: "#A8B5DB",
                  300: "#9CA4AB",
              },
              dark: {
                  100:'#221F3d',
                  200:'#0f0d23',
              }
          }
        },
    },
    plugins: [],
}