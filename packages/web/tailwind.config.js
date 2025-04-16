/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bgColor: 'var(--bgColor)',
        darkBlue: 'var(--darkBlue)',
        midBlue: 'var(--midBlue)',
        lightBlue: 'var(--lightBlue)',
        creamWhite: 'var(--creamWhite)',
      },
    },
  },
  plugins: [],
}
