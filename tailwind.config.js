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
        "modal-border": "var(--color-modal-border)",

        // Data items on an object page
        "data-title": "var(--color-data-title)",
        "data-label": "var(--color-data-label)",
        "data-value": "var(--color-data-value)",

        // Generic button styles
        "button-primary": "var(--color-button-primary)",
        "button-secondary": "var(--color-button-secondary)",
        "button-success": "var(--color-button-success)",
        "button-alert": "var(--color-button-alert)",
        "button-warning": "var(--color-button-warning)",
        "button-info": "var(--color-button-info)",
      },
      textColor: {
        "button-primary": "#ffffff",
        "button-secondary": "#ffffff",
        "button-success": "#000000",
        "button-alert": "#ffffff",
        "button-warning": "#000000",
        "button-info": "var(--color-button-text-info)",
      },
      borderColor: {
        "button-primary": "var(--color-border-primary)",
        "button-secondary": "var(--color-border-secondary)",
        "button-success": "var(--color-border-success)",
        "button-alert": "var(--color-border-alert)",
        "button-warning": "var(--color-border-warning)",
        "button-info": "var(--color-border-info)",
      },
      boxShadow: {
        // Status badges
        status: "0 0 0 1px #a0a0a0",
      },
      fill: {
        "button-primary": "#ffffff",
        "button-secondary": "#ffffff",
        "button-success": "#000000",
        "button-alert": "#ffffff",
        "button-warning": "#000000",
        "button-info": "var(--color-button-text-info)",
      },
      gridTemplateColumns: {
        "min-2": "repeat(2, minmax(0, min-content))",
      },
    },
  },
  plugins: [],
}
