module.exports = {
  darkMode: "class",
  content: ["./pages/**/*.js", "./components/**/*.js"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      animation: {
        "scroll-fade": "scrollFade 3s linear",
      },
      // that is actual animation
      keyframes: () => ({
        scrollFade: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
      }),
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

        "collapse-ctrl": "var(--color-collapse-ctrl-background)",

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

        "button-audit-open": "var(--color-button-audit-open-background)",
        "button-audit-closed": "var(--color-button-audit-closed-background)",
        "button-audit-level-detail": "var(--color-button-audit-level-detail)",
        "audit-level-detail": "var(--color-audit-level-detail-background)",
        audit: "var(--color-audit-background)",
        "audit-error": "var(--color-audit-error-background)",
        "audit-warning": "var(--color-audit-warning-background)",
        "audit-not-compliant": "var(--color-audit-not-compliant-background)",
        "audit-internal-action":
          "var(--color-audit-internal-action-background)",

        "facet-group-button": "var(--color-facet-group-button-background)",
        "facet-group-button-selected":
          "var(--color-facet-group-button-selected-background)",
        "facet-title": "var(--color-facet-title-background)",

        "facet-tag": "var(--color-facet-tag-background)",
        "facet-tag-neg": "var(--color-facet-tag-neg-background)",

        "site-search-header": "var(--color-site-search-header-background)",

        "schema-prop-type-string": "var(--color-schema-prop-type-bg-string)",
        "schema-prop-type-number": "var(--color-schema-prop-type-bg-number)",
        "schema-prop-type-integer": "var(--color-schema-prop-type-bg-integer)",
        "schema-prop-type-boolean": "var(--color-schema-prop-type-bg-boolean)",
        "schema-prop-type-array": "var(--color-schema-prop-type-bg-array)",
        "schema-prop-type-object": "var(--color-schema-prop-type-bg-object)",
        "schema-prop-type-link": "var(--color-schema-prop-type-bg-link)",
        "schema-prop-type-null": "var(--color-schema-prop-type-bg-null)",
        "schema-prop-type-default": "var(--color-schema-prop-type-bg-default)",

        "indexed-state": "var(--color-indexed-state-background)",
        "indexing-state": "var(--color-indexing-state-background)",

        "schema-name-highlight":
          "var(--color-schema-name-highlight-background)",
        "schema-search": "var(--color-schema-search-background)",
      },
      borderColor: {
        panel: "var(--color-panel-border)",
        "form-element": "var(--color-form-element-border)",
        "form-element-disabled": "var(--color-form-element-border-disabled)",

        "data-list-item": "var(--color-data-list-item-border)",

        "collapse-ctrl": "var(--color-collapse-ctrl-border)",

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

        audit: "var(--color-audit-border)",

        "facet-tag": "var(--color-facet-tag-border)",
        "facet-tag-neg": "var(--color-facet-tag-neg-border)",

        "facet-group-button": "var(--color-facet-group-button-border)",
        "facet-group-button-selected":
          "var(--color-facet-group-button-selected-border)",

        "facet-filter": "var(--color-facet-filter-input-border)",
        "facet-filter-focus": "var(--color-facet-filter-input-border-focus)",

        "tab-group": "var(--color-tab-group-border)",
        "tab-selected": "var(--color-tab-selected-border)",
        "tab-unselected": "var(--color-tab-unselected-border)",
        "tab-disabled": "var(--color-tab-disabled-border)",
        "tab-hover": "var(--color-tab-hover-border)",

        "json-panel": "var(--color-json-panel-border)",

        "schema-prop-type-string":
          "var(--color-schema-prop-type-border-string)",
        "schema-prop-type-number":
          "var(--color-schema-prop-type-border-number)",
        "schema-prop-type-integer":
          "var(--color-schema-prop-type-border-integer)",
        "schema-prop-type-boolean":
          "var(--color-schema-prop-type-border-boolean)",
        "schema-prop-type-array": "var(--color-schema-prop-type-border-array)",
        "schema-prop-type-object":
          "var(--color-schema-prop-type-border-object)",
        "schema-prop-type-link": "var(--color-schema-prop-type-border-link)",
        "schema-prop-type-null": "var(--color-schema-prop-type-border-null)",
        "schema-prop-type-default":
          "var(--color-schema-prop-type-border-default)",

        "indexed-state": "var(--color-indexed-state-border)",
        "indexing-state": "var(--color-indexing-state-border)",
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

        "collapse-ctrl": "var(--color-collapse-ctrl-text)",

        "button-facet-group": "var(--color-button-facet-group-text)",
        "button-facet-group-selected":
          "var(--color-button-facet-group-selected-text)",
        "facet-title": "var(--color-facet-title-text)",

        "facet-tag": "var(--color-facet-tag-text)",

        "facet-filter": "var(--color-facet-filter-input-text)",
        "facet-filter-focus": "var(--color-facet-filter-input-text-focus)",

        "tab-title-selected": "var(--color-tab-title-selected-text)",
        "tab-title-unselected": "var(--color-tab-title-unselected-text)",
        "tab-title-disabled": "var(--color-tab-title-disabled-text)",
        "tab-title-hover": "var(--color-tab-title-hover-text)",

        "schema-prop": "var(--color-schema-prop-text)",
        "schema-prop-description": "var(--color-schema-prop-description-text)",

        "schema-prop-type-string": "var(--color-schema-prop-type-text-string)",
        "schema-prop-type-number": "var(--color-schema-prop-type-text-number)",
        "schema-prop-type-integer":
          "var(--color-schema-prop-type-text-integer)",
        "schema-prop-type-boolean":
          "var(--color-schema-prop-type-text-boolean)",
        "schema-prop-type-array": "var(--color-schema-prop-type-text-array)",
        "schema-prop-type-object": "var(--color-schema-prop-type-text-object)",
        "schema-prop-type-link": "var(--color-schema-prop-type-text-link)",
        "schema-prop-type-null": "var(--color-schema-prop-type-text-null)",
        "schema-prop-type-default":
          "var(--color-schema-prop-type-text-default)",

        "indexed-state": "var(--color-indexed-state-content)",
        "indexing-state": "var(--color-indexing-state-content)",
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

        "facet-clear-filter-icon": "var(--color-facet-clear-filter-icon-fill)",
        "facet-filter-icon-set": "var(--color-facet-filter-icon-set-fill)",
        "facet-filter-icon": "var(--color-facet-filter-icon-fill)",

        "indexed-state": "var(--color-indexed-state-content)",
        "indexing-state": "var(--color-indexing-state-content)",

        "audit-error": "var(--color-audit-error-fill)",
        "audit-warning": "var(--color-audit-warning-fill)",
        "audit-not-compliant": "var(--color-audit-not-compliant-fill)",
        "audit-internal-action": "var(--color-audit-internal-action-fill)",
        "audit-facet": "var(--color-audit-facet-fill)",
      },
      gridTemplateColumns: {
        "min-2": "repeat(2, minmax(0, min-content))",
        "data-item": "fit-content(200px) 1fr",
      },
      maxHeight: {
        "column-select-modal": "calc(100vh - 300px)",
      },
      stroke: {
        "nav-collapse": "var(--color-nav-collapse)",
        "facet-filter-icon": "var(--color-facet-filter-icon-stroke)",
        "facet-filter-icon-set": "var(--color-facet-filter-icon-set-stroke)",
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
              "word-break": "break-all",
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
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/container-queries"),

    // Add .break-anywhere class until this gets built into Tailwind CSS. A PR exists for this but
    // it hasn't been merged yet:
    // https://github.com/tailwindlabs/tailwindcss/pull/12128
    function ({ addUtilities }) {
      const newUtilities = {
        ".break-anywhere": {
          "@supports (overflow-wrap: anywhere)": {
            "overflow-wrap": "anywhere",
          },
          "@supports not (overflow-wrap: anywhere)": {
            "word-break": "break-word",
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
