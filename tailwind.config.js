module.exports = {
  darkMode: "class",
  content: ["./pages/**/*.js", "./components/**/*.js"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      aspectRatio: {
        hd: "16 / 9",
        cinema: "21 / 9",
        ultra: "32 / 9",
      },
      backgroundImage: {
        "excel-import": "url('/img/excel-file-origin.png')",
        "excel-import-dark": "url('/img/excel-file-origin-dark.png')",
        "help-banner": "url('/img/help-banner.jpg')",
        "help-banner-dark": "url('/img/help-banner-dark.jpg')",
      },
      colors: {
        background: "var(--color-background)",
        brand: "var(--color-brand)",
        "brand-accent": "var(--color-brand-accent)",
        "nav-highlight": "var(--color-nav-highlight)",
        "nav-border": "var(--color-nav-border)",
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
      },
      backgroundColor: {
        panel: "var(--color-panel-background)",
        "form-element": "var(--color-form-element-background)",

        "button-primary": "var(--color-button-primary-background)",
        "button-secondary": "var(--color-button-secondary-background)",
        "button-warning": "var(--color-button-warning-background)",
        "button-selected": "var(--color-button-selected-background)",
        "button-primary-disabled":
          "var(--color-button-primary-background-disabled)",
        "button-secondary-disabled":
          "var(--color-button-secondary-background-disabled)",
        "button-warning-disabled":
          "var(--color-button-warning-background-disabled)",
        "button-selected-disabled":
          "var(--color-button-selected-background-disabled)",
      },
      borderColor: {
        panel: "var(--color-panel-border)",
        "form-element": "var(--color-form-element-border)",
        "form-element-disabled": "var(--color-form-element-border-disabled)",

        "button-primary": "var(--color-button-primary-border)",
        "button-secondary": "var(--color-button-secondary-border)",
        "button-warning": "var(--color-button-warning-border)",
        "button-selected": "var(--color-button-selected-border)",
        "button-primary-disabled":
          "var(--color-button-primary-border-disabled)",
        "button-secondary-disabled":
          "var(--color-button-secondary-border-disabled)",
        "button-warning-disabled":
          "var(--color-button-warning-border-disabled)",
        "button-selected-disabled":
          "var(--color-button-selected-border-disabled)",
      },
      fontSize: {
        xxs: "0.7rem",
      },
      textColor: {
        "button-primary": "var(--color-button-primary-label)",
        "button-secondary": "var(--color-button-secondary-label)",
        "button-warning": "var(--color-button-warning-label)",
        "button-primary-disabled": "var(--color-button-primary-label-disabled)",
        "button-secondary-disabled":
          "var(--color-button-secondary-label-disabled)",
        "button-warning-disabled": "var(--color-button-warning-label-disabled)",
        "button-selected-disabled":
          "var(--color-button-selected-label-disabled)",
        "form-element": "var(--color-form-element-label)",
        "form-element-disabled": "var(--color-form-element-label-disabled)",
      },
      boxShadow: {
        // Status badges
        status: "0 0 0 1px #a0a0a0",
      },
      fill: {
        "button-primary": "var(--color-button-primary-label)",
        "button-secondary": "var(--color-button-secondary-label)",
        "button-warning": "var(--color-button-warning-label)",
        "button-selected": "var(--color-button-selected-label)",
        "button-primary-disabled": "var(--color-button-primary-label-disabled)",
        "button-secondary-disabled":
          "var(--color-button-secondary-label-disabled)",
        "button-warning-disabled": "var(--color-button-warning-label-disabled)",
        "button-selected-disabled":
          "var(--color-button-selected-label-disabled)",
        "form-element": "var(--color-form-element-label)",
        "form-element-disabled": "var(--color-form-element-label-disabled)",

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
            h1: {
              "font-weight": 600,
              "margin-bottom": "1rem",
            },
            h2: {
              "font-weight": 600,
              "font-size": "1.7rem",
              "margin-top": "2rem",
              "margin-bottom": "1rem",
              "&:first-child": {
                "margin-top": "0",
              },
            },
            h3: {
              "font-weight": 600,
              "font-size": "1.4rem",
              "margin-top": "1.8rem",
              "margin-bottom": "0.9rem",
            },
            h4: {
              "font-weight": 600,
              "font-size": "1.2rem",
              "margin-top": "1.6rem",
              "margin-bottom": "0.8rem",
            },
            h5: {
              "font-weight": 500,
              "font-size": "1.2rem",
              "margin-top": "1.5rem",
              "margin-bottom": "0.6rem",
            },
            h6: {
              "font-weight": 500,
              "font-size": "1rem",
              "margin-top": "1.3rem",
              "margin-bottom": "0.4rem",
            },
            p: {
              "margin-top": "0.5rem",
              "margin-bottom": "0.5rem",
              "line-height": "1.375",
              "&:first-child": {
                "margin-top": "0.5rem",
              },
              "&:last-child": {
                "margin-bottom": "0.5rem",
              },
            },
            li: {
              "margin-top": "0.4rem",
              "margin-bottom": "0.4rem",
            },
            blockquote: {
              "font-style": "normal",
              "font-weight": "normal",
            },
            td: {
              padding: "0.2rem 0.4rem",
              "border-color": "var(--color-panel-border)",
              "border-width": "1px",
              "border-style": "solid",
            },
            th: {
              padding: "0.2rem 0.4rem",
              "border-color": "var(--color-panel-border)",
              "border-width": "1px",
              "border-style": "solid",
              "background-color": "var(--color-data-header-background)",
            },
            pre: {
              "background-color": "var(--color-code-background)",
              color: "var(--color-code-text)",
            },
            code: {
              "background-color": "var(--color-code-background)",
              padding: "0.1rem 0.4rem",
              "border-radius": "0.2rem",
              "font-weight": "normal",
            },
            // Removes the backticks from code blocks
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
