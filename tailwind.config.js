module.exports = {
  darkMode: "class",
  content: ["./pages/**/*.js", "./components/**/*.js"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: "var(--color-brand)",
      },
      textColor: {
        base: "var(--color-text-base)",
      },
      backgroundColor: {
        highlight: "var(--color-highlight)",
      },
    },
  },
  plugins: [],
}
