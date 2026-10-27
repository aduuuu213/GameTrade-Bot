/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sora", "Noto Sans SC", "sans-serif"]
      }
    }
  },
  plugins: []
}
