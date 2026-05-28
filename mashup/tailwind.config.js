/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  corePlugins: {
    // On désactive le reset global de Tailwind pour ne pas écraser les styles SoHo IDS existants
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
