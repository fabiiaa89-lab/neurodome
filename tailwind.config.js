/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface2)',
        border: 'var(--border)',
        text: 'var(--text)',
        text2: 'var(--text2)',
        text3: 'var(--text3)',
        teal: 'var(--teal)',
        amber: 'var(--amber)',
        purple: 'var(--purple)',
        blue: 'var(--blue)',
        red: 'var(--red)',
        green: 'var(--green)',
      },
      borderRadius: {
        DEFAULT: 'var(--r)',
      }
    },
  },
  plugins: [],
}
