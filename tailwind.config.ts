import type { Config } from "tailwindcss";

const tailwindConfig: Config = {
  darkMode: "class",
  content: ["./pages/**/*.{js,tsx}", "./components/**/*.{js,tsx}"],
  safelist: [
    "fore-fileset-type-analysis",
    "back-fileset-type-analysis",
    "fore-fileset-type-prediction",
    "back-fileset-type-prediction",
    "fore-fileset-type-measurement",
    "back-fileset-type-measurement",
  ],
  compilerOptions: {
    moduleResolution: "bundler",
  },
  theme: {
    container: {
      center: true,
    },
    extend: {
      animation: {
        "scroll-fade": "scrollFade 3s linear",
      },
      // that is actual animation
      keyframes: {
        scrollFade: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
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

        "table-header-cell": "var(--color-table-header-cell-background)",
        "table-data-cell": "var(--color-table-data-cell-background)",

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

        "facet-counter": "var(--color-facet-counter)",
        "facet-counter-open": "var(--color-facet-counter-open)",
        "facet-counter-selected": "var(--color-facet-counter-selected)",
        "facet-counter-open-selected":
          "var(--color-facet-counter-open-selected)",
        "facet-counter-negative": "var(--color-facet-counter-negative)",
        "facet-counter-open-negative":
          "var(--color-facet-counter-open-negative)",

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
        "schema-version": "var(--color-schema-version-background)",

        "checkfiles-version": "var(--color-checkfiles-version-background)",

        "indexed-state": "var(--color-indexed-state-background)",
        "indexing-state": "var(--color-indexing-state-background)",

        "schema-name-highlight":
          "var(--color-schema-name-highlight-background)",
        "schema-search": "var(--color-schema-search-background)",

        "menu-trigger": "var(--color-menu-trigger-background)",
        "menu-trigger-hover": "var(--color-menu-trigger-background-hover)",
        "menu-trigger-open": "var(--color-menu-trigger-background-open)",
        "menu-items": "var(--color-menu-items-background)",
        "menu-item-hover": "var(--color-menu-item-background-hover)",

        // File graph node and legend colors
        "file-graph-analysis": "var(--color-file-graph-analysis)",
        "file-graph-analysis-count": "var(--color-file-graph-analysis-count)",
        "file-graph-auxiliary": "var(--color-file-graph-auxiliary)",
        "file-graph-auxiliary-count": "var(--color-file-graph-auxiliary-count)",
        "file-graph-construct-library":
          "var(--color-file-graph-construct-library)",
        "file-graph-construct-library-count":
          "var(--color-file-graph-construct-library-count)",
        "file-graph-curated": "var(--color-file-graph-curated)",
        "file-graph-curated-count": "var(--color-file-graph-curated-count)",
        "file-graph-measurement": "var(--color-file-graph-measurement)",
        "file-graph-measurement-count":
          "var(--color-file-graph-measurement-count)",
        "file-graph-model": "var(--color-file-graph-model)",
        "file-graph-model-count": "var(--color-file-graph-model-count)",
        "file-graph-prediction": "var(--color-file-graph-prediction)",
        "file-graph-prediction-count":
          "var(--color-file-graph-prediction-count)",
        "file-graph-unknown-count": "var(--color-file-graph-unknown-count)",
        "file-graph-unknown": "var(--color-file-graph-unknown)",
        "file-graph-file": "var(--color-file-graph-file)",
        "file-graph-file-count": "var(--color-file-graph-file-count)",
        "file-graph-qc-trigger": "var(--color-file-graph-qc-trigger-bg)",
        "file-graph-qc-trigger-text": "var(--color-file-graph-qc-trigger-text)",

        "tissue-matrix-data-homo-sapiens":
          "var(--color-tissue-matrix-data-homo-sapiens)",
        "tissue-matrix-column-header-homo-sapiens":
          "var(--color-tissue-matrix-column-header-homo-sapiens)",
        "tissue-matrix-row-header-homo-sapiens":
          "var(--color-tissue-matrix-row-header-homo-sapiens)",
        "tissue-matrix-row-subheader-homo-sapiens":
          "var(--color-tissue-matrix-row-subheader-homo-sapiens)",
        "tissue-matrix-highlight-homo-sapiens":
          "var(--color-tissue-matrix-highlight-homo-sapiens)",
        "tissue-matrix-data-mus-musculus":
          "var(--color-tissue-matrix-data-mus-musculus)",
        "tissue-matrix-column-header-mus-musculus":
          "var(--color-tissue-matrix-column-header-mus-musculus)",
        "tissue-matrix-row-header-mus-musculus":
          "var(--color-tissue-matrix-row-header-mus-musculus)",
        "tissue-matrix-row-subheader-mus-musculus":
          "var(--color-tissue-matrix-row-subheader-mus-musculus)",
        "tissue-matrix-highlight-mus-musculus":
          "var(--color-tissue-matrix-highlight-mus-musculus)",

        "cell-model-matrix-data-cell-line":
          "var(--color-cell-model-matrix-data-cell-line)",
        "cell-model-matrix-column-header-cell-line":
          "var(--color-cell-model-matrix-column-header-cell-line)",
        "cell-model-matrix-row-header-cell-line":
          "var(--color-cell-model-matrix-row-header-cell-line)",
        "cell-model-matrix-row-subheader-cell-line":
          "var(--color-cell-model-matrix-row-subheader-cell-line)",
        "cell-model-matrix-highlight-cell-line":
          "var(--color-cell-model-matrix-highlight-cell-line)",
        "cell-model-matrix-data-differentiated-specimens":
          "var(--color-cell-model-matrix-data-differentiated-specimens)",
        "cell-model-matrix-column-header-differentiated-specimens":
          "var(--color-cell-model-matrix-column-header-differentiated-specimens)",
        "cell-model-matrix-row-header-differentiated-specimens":
          "var(--color-cell-model-matrix-row-header-differentiated-specimens)",
        "cell-model-matrix-row-subheader-differentiated-specimens":
          "var(--color-cell-model-matrix-row-subheader-differentiated-specimens)",
        "cell-model-matrix-highlight-differentiated-specimens":
          "var(--color-cell-model-matrix-highlight-differentiated-specimens)",

        "assay-summary-matrix-term-category-total":
          "var(--color-assay-summary-matrix-term-category-total)",
        "assay-summary-matrix-data-column-header":
          "var(--color-assay-summary-matrix-data-column-header)",
        "assay-summary-matrix-data-cell":
          "var(--color-assay-summary-matrix-data-cell)",
        "assay-summary-matrix-total-cell":
          "var(--color-assay-summary-matrix-total-cell)",

        "computational-tools-header":
          "var(--color-computational-tools-header-background)",
        "computational-tools-category-crispr-screens":
          "var(--color-computational-tools-category-crispr-screens)",
        "computational-tools-category-bioinformatic-utilities":
          "var(--color-computational-tools-category-bioinformatic-utilities)",
        "computational-tools-category-genomic-annotations":
          "var(--color-computational-tools-category-genomic-annotations)",
        "computational-tools-category-networks":
          "var(--color-computational-tools-category-networks)",
        "computational-tools-category-predictions":
          "var(--color-computational-tools-category-predictions)",
        "computational-tools-category-reporter-assays":
          "var(--color-computational-tools-category-reporter-assays)",
        "computational-tools-category-single-cell":
          "var(--color-computational-tools-category-single-cell)",
        "computational-tools-category-unknown":
          "var(--color-computational-tools-category-unknown)",

        "uniform-pipeline-completed":
          "var(--color-uniform-pipeline-background-completed)",
        "uniform-pipeline-error":
          "var(--color-uniform-pipeline-background-error)",
        "uniform-pipeline-preprocessing":
          "var(--color-uniform-pipeline-background-preprocessing)",
        "uniform-pipeline-processing":
          "var(--color-uniform-pipeline-background-processing)",
        "uniform-pipeline-fallback":
          "var(--color-uniform-pipeline-background-fallback)",

        "standardized-file-format":
          "var(--color-standardized-file-format-background)",
        "modal-backdrop": "var(--color-modal-backdrop)",
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

        "facet-counter": "var(--color-facet-counter)",
        "facet-counter-open": "var(--color-facet-counter-open)",
        "facet-counter-selected": "var(--color-facet-counter-selected)",
        "facet-counter-open-selected":
          "var(--color-facet-counter-open-selected)",
        "facet-counter-negative": "var(--color-facet-counter-negative)",
        "facet-counter-open-negative":
          "var(--color-facet-counter-open-negative)",

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
        "schema-version": "var(--color-schema-version-border)",

        "checkfiles-version": "var(--color-checkfiles-version-border)",

        "indexed-state": "var(--color-indexed-state-border)",
        "indexing-state": "var(--color-indexing-state-border)",

        "menu-items": "var(--color-menu-items-border)",

        // File graph borders
        "file-graph-analysis": "var(--color-file-graph-analysis-border)",
        "file-graph-auxiliary": "var(--color-file-graph-auxiliary-border)",
        "file-graph-construct-library":
          "var(--color-file-graph-construct-library-border)",
        "file-graph-curated": "var(--color-file-graph-curated-border)",
        "file-graph-measurement": "var(--color-file-graph-measurement-border)",
        "file-graph-model": "var(--color-file-graph-model-border)",
        "file-graph-prediction": "var(--color-file-graph-prediction-border)",
        "file-graph-unknown": "var(--color-file-graph-unknown-border)",
        "file-graph-file": "var(--color-file-graph-file-border)",
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
        "schema-version": "var(--color-schema-version-text)",

        "checkfiles-version": "var(--color-checkfiles-version-text)",

        "indexed-state": "var(--color-indexed-state-content)",
        "indexing-state": "var(--color-indexing-state-content)",

        "menu-item": "var(--color-menu-item-text)",
        "menu-item-hover": "var(--color-menu-item-text-hover)",

        "computational-tools-header":
          "var(--color-computational-tools-header-foreground)",

        "uniform-pipeline-completed":
          "var(--color-uniform-pipeline-text-completed)",
        "uniform-pipeline-error": "var(--color-uniform-pipeline-text-error)",
        "uniform-pipeline-preprocessing":
          "var(--color-uniform-pipeline-text-preprocessing)",
        "uniform-pipeline-processing":
          "var(--color-uniform-pipeline-text-processing)",
        "uniform-pipeline-fallback":
          "var(--color-uniform-pipeline-text-fallback)",
      },
      ringColor: {
        "standardized-file-format":
          "var(--color-standardized-file-format-ring)",
        status: "#a0a0a0",

        "uniform-pipeline-completed":
          "var(--color-uniform-pipeline-ring-completed)",
        "uniform-pipeline-error": "var(--color-uniform-pipeline-ring-error)",
        "uniform-pipeline-preprocessing":
          "var(--color-uniform-pipeline-ring-preprocessing)",
        "uniform-pipeline-processing":
          "var(--color-uniform-pipeline-ring-processing)",
        "uniform-pipeline-fallback":
          "var(--color-uniform-pipeline-ring-fallback)",
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

        "uniform-pipeline-completed":
          "var(--color-uniform-pipeline-fill-completed)",
        "uniform-pipeline-error": "var(--color-uniform-pipeline-fill-error)",
        "uniform-pipeline-preprocessing":
          "var(--color-uniform-pipeline-fill-preprocessing)",
        "uniform-pipeline-processing":
          "var(--color-uniform-pipeline-fill-processing)",
        "uniform-pipeline-fallback":
          "var(--color-uniform-pipeline-fill-fallback)",

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
        "data-item-small": "fit-content(140px) 1fr",
      },
      maxHeight: {
        "column-select-modal": "calc(100vh - 300px)",
      },
      stroke: {
        "nav-collapse": "var(--color-nav-collapse)",
        "facet-filter-icon": "var(--color-facet-filter-icon-stroke)",
        "facet-filter-icon-set": "var(--color-facet-filter-icon-set-stroke)",

        "file-graph-node": "var(--color-file-graph-node-stroke)",
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
} as unknown as Config;

export default tailwindConfig;
