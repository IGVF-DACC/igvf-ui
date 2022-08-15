module.exports = {
  darkMode: "class",
  content: ["./pages/**/*.js", "./components/**/*.js"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      backgroundImage: {
        "excel-import": "url('/img/excel-file-origin.png')",
        "excel-import-dark": "url('/img/excel-file-origin-dark.png')",
      },
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

        // Button background colors
        "button-primary": "var(--color-button-primary)",
        "button-secondary": "var(--color-button-secondary)",
        "button-tertiary": "var(--color-button-tertiary)",
        "button-quaternary": "var(--color-button-quaternary)",
        "button-error": "var(--color-button-error)",
        "button-warning": "var(--color-button-warning)",
        "button-success": "var(--color-button-success)",
        "button-info": "var(--color-button-info)",

        // Disabled button background colors
        "button-primary-disabled": "var(--color-button-primary-disabled)",
        "button-secondary-disabled": "var(--color-button-secondary-disabled)",
        "button-tertiary-disabled": "var(--color-button-tertiary-disabled)",
        "button-quaternary-disabled": "var(--color-button-quaternary-disabled)",
        "button-error-disabled": "var(--color-button-error-disabled)",
        "button-warning-disabled": "var(--color-button-warning-disabled)",
        "button-success-disabled": "var(--color-button-success-disabled)",
        "button-info-disabled": "var(--color-button-info-disabled)",
      },
      borderColor: {
        // Outlined button border colors
        "button-primary": "var(--color-button-primary)",
        "button-secondary": "var(--color-button-secondary)",
        "button-tertiary": "var(--color-button-tertiary)",
        "button-quaternary": "var(--color-button-quaternary)",
        "button-error": "var(--color-button-error)",
        "button-warning": "var(--color-button-warning)",
        "button-success": "var(--color-button-success)",
        "button-info": "var(--color-button-info)",
      },
      textColor: {
        // Outlined button text colors
        "button-primary": "var(--color-button-primary)",
        "button-secondary": "var(--color-button-secondary)",
        "button-tertiary": "var(--color-button-tertiary)",
        "button-quaternary": "var(--color-button-quaternary)",
        "button-error": "var(--color-button-error)",
        "button-warning": "var(--color-button-warning)",
        "button-success": "var(--color-button-success)",
        "button-info": "var(--color-button-info)",
      },
      boxShadow: {
        // Status badges
        status: "0 0 0 1px #a0a0a0",
      },
      fill: {
        "button-primary": "var(--color-button-primary)",
        "button-secondary": "var(--color-button-secondary)",
        "button-tertiary": "var(--color-button-tertiary)",
        "button-quaternary": "var(--color-button-quaternary)",
        "button-error": "var(--color-button-error)",
        "button-warning": "var(--color-button-warning)",
        "button-success": "var(--color-button-success)",
        "button-info": "var(--color-button-info)",

        // Document icon tag colors
        "document-autosql": "var(--color-document-autosql)",
        "document-html": "var(--color-document-html)",
        "document-json": "var(--color-document-json)",
        "document-pdf": "var(--color-document-pdf)",
        "document-svs": "var(--color-document-svs)",
        "document-txt": "var(--color-document-txt)",
        "document-tiff": "var(--color-document-tiff)",
        "document-tsv": "var(--color-document-tsv)",
      },
      gridTemplateColumns: {
        "min-2": "repeat(2, minmax(0, min-content))",
        "data-item": "fit-content(200px) 1fr",
      },
      typography: {
        DEFAULT: {
          css: {
            "max-width": "none",
            p: {
              "margin-top": "0.5rem",
              "margin-bottom": "0.5rem",
              "line-height": "1.375",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
