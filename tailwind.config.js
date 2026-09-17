/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#F3F6F4',
          100: '#E4ECE6',
          200: '#C8D9CD',
          600: '#2A5242',
          700: '#204134',
          800: '#1E3A2F',
          900: '#152921',
          950: '#0C1813',
          canvas: '#FAF9F6',
          linen: '#F4F0EA',
          stone: '#ECE8E1',
        },
      },
    },
  },
  plugins: [],
};
