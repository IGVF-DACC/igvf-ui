/**
 * Single term within a facet.
 */
export type FacetTerm = {
  /** Title of the term */
  key: string;
  /** Number of items with this term */
  doc_count: number;
};

/**
 * Represents the `facets` property in search results.
 */
export type Facet = {
  /** Object property the facet represents */
  field: string;
  /** Title to display for the facet */
  title: string;
  /** List of terms in the facet */
  terms: FacetTerm[];
  /** Total number of objects selected within this facet */
  total: number;
};
