module.exports = {
  darkMode: "class",
  content: ["./pages/**/*.js", "./components/**/*.js"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        background: "var(--color-background)",
        brand: "var(--color-brand)",
        "nav-highlight": "var(--color-brand-highlight)",
        "title-border": "var(--color-title-border)",
        "data-background": "var(--color-data-background)",
        highlight: "var(--color-highlight)",
      },
      textColor: {
        base: "var(--color-text-base)",
        "data-label": "var(--color-data-label)",
        "data-value": "var(--color-data-value)",
      },
    },
  },
  plugins: [],
}
