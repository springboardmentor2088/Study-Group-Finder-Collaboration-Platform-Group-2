/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
        },
        // WhatsApp-like dark theme colors
        dark: {
          bg: '#0b141a',        // Main background (very dark blue-gray)
          surface: '#202c33',   // Cards and surfaces (dark gray)
          hover: '#2a3942',     // Hover states (lighter gray)
          border: '#3b4a54',    // Borders (medium gray)
          text: '#e9edef',      // Primary text (light gray)
          textSecondary: '#8696a0', // Secondary text (muted)
          accent: '#00a884',    // Green accent (WhatsApp green)
        }
      }
    },
  },
  plugins: [],
}
