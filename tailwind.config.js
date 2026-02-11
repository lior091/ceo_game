/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1E2761',
        teal: '#00A896',
        gold: '#FFC857',
        danger: '#E63946',
        cream: '#F5F5F5',
        slate: '#E2E8F0',
        dark: '#1F2937',
      },
      animation: {
        pulse: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        meter: 'meter 0.3s ease-out',
      },
      keyframes: {
        meter: {
          '0%': { width: 'var(--from)' },
          '100%': { width: 'var(--to)' }
        }
      }
    },
  },
  plugins: [],
}
