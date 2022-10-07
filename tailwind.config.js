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
              "border-color": "var(--color-data-border)",
              "border-width": "1px",
              "border-style": "solid",
            },
            th: {
              padding: "0.2rem 0.4rem",
              "border-color": "var(--color-data-border)",
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
