/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F0F14',
        surface: '#181822',
        surfaceHover: '#22222E',
        primary: '#FF6B35',
        primaryHover: '#FF8254',
        secondary: '#1DB954',
        textMain: '#FFFFFF',
        textMuted: '#94A3B8',
        border: '#2A2A35',
        error: '#EF4444'
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Nunito', 'sans-serif'],
        body: ['Inter', 'DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 10px 40px -10px rgba(0,0,0,0.6)',
        'glow': '0 0 20px rgba(255,107,53,0.3)',
      }
    },
  },
  plugins: [],
}
