/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F9FA',
        surface: '#FFFFFF',
        surfaceHover: '#F1F3F5',
        surfaceActive: '#E9ECEF',
        primary: '#1E293B',       // Dark slate — premium primary
        primaryHover: '#0F172A',
        accent: '#2563EB',        // Clean blue accent
        accentHover: '#1D4ED8',
        secondary: '#059669',
        textMain: '#0F172A',      // Near-black
        textSecondary: '#334155', // Dark slate
        textMuted: '#94A3B8',     // Soft muted gray
        textLight: '#CBD5E1',
        border: '#E2E8F0',
        borderHover: '#CBD5E1',
        error: '#EF4444',
        success: '#10B981',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)',
        'cardHover': '0 20px 40px -12px rgba(0,0,0,0.1), 0 8px 20px -8px rgba(0,0,0,0.06)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        'glow': '0 0 20px rgba(37,99,235,0.15)',
        'input': 'inset 0 2px 4px 0 rgba(0,0,0,0.04)',
        'elevated': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
        'dropdown': '0 10px 40px -10px rgba(0,0,0,0.12), 0 4px 12px -4px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      transitionDuration: {
        '400': '400ms',
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.7 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}
