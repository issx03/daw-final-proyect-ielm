/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F6', // Off-white/Ivory
        surface: {
          lowest: '#FFFFFF',
          low: '#F3F2EE',
          base: '#EBE9E1',
        },
        primary: {
          DEFAULT: '#2C2B29', // Soft Charcoal
          foreground: '#FAF9F6',
        },
        secondary: {
          DEFAULT: '#52504C', // Slate Grey
          foreground: '#FAF9F6',
        },
        accent: '#8C7D6B', // Muted Taupe
        border: '#E2E0D6',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'editorial': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
