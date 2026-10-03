/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.85)' },
          '50%': { opacity: '0.95', transform: 'scale(1.15)' },
        },
      },
      animation: {
        'twinkle-1': 'twinkle 3s ease-in-out infinite',
        'twinkle-2': 'twinkle 4.2s ease-in-out 1.4s infinite',
        'twinkle-3': 'twinkle 3.6s ease-in-out 2.2s infinite',
      },
    },
  },
  plugins: [],
};
