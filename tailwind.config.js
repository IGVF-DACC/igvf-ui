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
        "brand-accent": "var(--color-brand-accent)",
        "nav-highlight": "var(--color-brand-highlight)",
        "title-border": "var(--color-title-border)",
        "data-background": "var(--color-data-background)",
        "data-border": "var(--color-data-border)",
        highlight: "var(--color-highlight)",
        "highlight-border": "var(--color-highlight-border)",
        "data-label": "var(--color-data-label)",
        "data-value": "var(--color-data-value)",
      },
      boxShadow: {
        // Status badges
        status: "0 0 0 1px #a0a0a0",
      },
    },
  },
  plugins: [],
}
