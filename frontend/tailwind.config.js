/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#667eea',
          600: '#764ba2',
        },
        gtd: {
          inbox: '#f59e0b',
          next: '#10b981', 
          waiting: '#f97316',
          scheduled: '#3b82f6',
          someday: '#8b5cf6'
        }
      }
    },
  },
  plugins: [],
}