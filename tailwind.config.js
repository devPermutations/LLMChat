/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chat-bg': '#1a1a1a',
        'message-bg': '#2a2a2a',
        'input-bg': '#2d2d2d',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
} 