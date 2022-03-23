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
        "nav-highlight": "var(--color-brand-highlight)",
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
