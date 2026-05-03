/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F9FAFB', // Clean off-white
        surface: '#FFFFFF', // Clean white
        surfaceHover: '#F3F4F6',
        primary: '#2563EB', // Professional blue
        primaryHover: '#1D4ED8',
        accent: '#1E40AF', // Deep blue
        secondary: '#059669', // Emerald
        textMain: '#111827', // Dark gray/black
        textMuted: '#6B7280', // Medium gray
        border: '#E5E7EB', // Light gray border
        error: '#EF4444' // Standard red
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
        body: ['Inter', 'DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
        'glow': '0 10px 25px -5px rgba(37,99,235,0.15), 0 8px 10px -6px rgba(37,99,235,0.1)',
        'glass': 'inset 0 1px 0 0 rgba(255,255,255,0.5)'
      }
    },
  },
  plugins: [],
}
