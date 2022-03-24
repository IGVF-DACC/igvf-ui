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
        "title-border": "var(--color-title-border)",
      },
      textColor: {
        base: "var(--color-text-base)",
        "data-label": "var(--color-data-label)",
        "data-value": "var(--color-data-value)",
      },
      backgroundColor: {
        highlight: "var(--color-highlight)",
      },
    },
  },
  plugins: [],
}
