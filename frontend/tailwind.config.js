import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF', // Clean White Background
        surface: {
          lowest: '#F8FAFC', // Slate 50
          low: '#F1F5F9',    // Slate 100
          base: '#FFFFFF',
          elevated: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#0F172A', // Slate 900 (Main Text)
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#64748B', // Slate 500 (Muted Text)
          foreground: '#0F172A',
        },
        accent: {
          DEFAULT: '#334155', // Slate 700 (Executive Accent)
          hover: '#1e293b',   // Slate 800
          slate: '#0F172A',
        },
        border: '#E2E8F0',    // Slate 200
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [
    forms,
    typography,
  ],
}
