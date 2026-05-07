/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // iOS-inspired palette
        bg: '#F4F4F7',              // Premium off-white
        card: '#FFFFFF',
        cardHover: '#F9F9FB',
        pill: '#E5E5EA',            // iOS system gray 5
        pillActive: '#1C1C1E',      // iOS system label
        
        // Semantic
        label: '#1C1C1E',           // Primary label
        labelSecondary: '#3A3A3C',  // Secondary label
        labelTertiary: '#8E8E93',   // Tertiary label  
        labelQuaternary: '#C7C7CC', // Quaternary label
        separator: '#C6C6C8',       // iOS separator
        separatorLight: '#E5E5EA',  
        
        // Accent
        blue: '#007AFF',            // iOS blue
        blueHover: '#0066D6',
        green: '#34C759',           // iOS green
        red: '#FF3B30',             // iOS red
        orange: '#FF9500',          // iOS orange
        
        // Extended
        groupedBg: '#F4F4F7',
        fillTertiary: '#767680',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text',
          'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'
        ],
      },
      boxShadow: {
        'float': '0 2px 40px -8px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.05)',
        'card': '0 0.5px 0 0 rgba(0,0,0,0.04)',
        'cardLift': '0 16px 48px -8px rgba(0,0,0,0.12), 0 4px 12px -4px rgba(0,0,0,0.06)',
        'cardLiftXl': '0 24px 64px -12px rgba(0,0,0,0.15), 0 8px 24px -8px rgba(0,0,0,0.08)',
        'pill': '0 1px 3px rgba(0,0,0,0.08)',
        'searchInset': 'inset 0 1px 3px rgba(0,0,0,0.06)',
        'dropdownApple': '0 12px 48px -6px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.08)',
        'bottomBar': '0 -1px 0 rgba(0,0,0,0.04), 0 -8px 32px rgba(0,0,0,0.06)',
        'fab': '0 6px 28px -4px rgba(0,0,0,0.2), 0 2px 8px -2px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      animation: {
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
