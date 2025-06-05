// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // If you have an index.html in your root
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all relevant files in your src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}