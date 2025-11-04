// node_modules
import type { ComponentType } from "react";
// root
import type {
  SearchResults,
  SearchResultsFacet,
  SearchResultsFacetTerm,
  SearchResultsFilter,
} from "../../globals";
// components/facets/custom-facets
import AuditTitle from "./custom-facets/audit-title";
import DateRangeTagLabel from "./custom-facets/date-range-tag-label";
import DateRangeTerms from "./custom-facets/date-range-terms";
import FileSizeTerms from "./custom-facets/file-size-terms";
import InternalActionAuditTerms from "./custom-facets/audit-internal-action-terms";
import NoTermCountTitle from "./custom-facets/no-term-count-title";
import StandardTagLabel from "./custom-facets/standard-tag-label";
import StandardTermLabel from "./custom-facets/standard-term-label";
import StandardTerms from "./custom-facets/standard-terms";
import StandardTitle from "./custom-facets/standard-title";
import FileSizeTagLabel from "./custom-facets/file-size-tag-label";
import TaxaTagLabel from "./custom-facets/taxa-tag-label";
import TaxaTermLabel from "./custom-facets/taxa-term-label";

/**
 * Custom facet tag component and its props.
 *
 * @property filter - `filters` property from the search results
 */
type TagComponentProps = {
  filter: SearchResultsFilter;
};
type TagComponent = ComponentType<TagComponentProps>;

/**
 * Custom facet term label component and its props.
 *
 * @property term - Facet term to display
 * @property isNegative - True if the term is a negative filter
 * @property isChildTerm - True if the term is a child term in a hierarchical facet
 */
type TermLabelComponentProps = {
  term: SearchResultsFacetTerm;
  isNegative: boolean;
  isChildTerm: boolean;
};
type TermLabelComponent = ComponentType<TermLabelComponentProps>;

/**
 * Custom facet terms component and its props.
 *
 * @property facet - Facet to display
 * @property searchResults - Search results that include the given facet
 * @property updateQuery - Function to update the query string on user selection
 */
type TermComponentProps = {
  facet: SearchResultsFacet;
  searchResults: SearchResults;
  updateQuery: (queryString: string) => void;
};
type TermComponent = ComponentType<TermComponentProps>;

/**
 * Custom facet title component and its props.
 *
 * @property facet - Facet to display
 * @property searchResults - Search results that include the given facet
 * @property updateQuery - Function to update the query string on user selection
 * @property isFacetOpen - True if the facet is currently open
 * @property isEditOrderMode - True when editing facet order
 */
type TitleComponentProps = {
  facet: SearchResultsFacet;
  searchResults: SearchResults;
  updateQuery: (queryString: string) => void;
  isFacetOpen: boolean;
  isEditOrderMode: boolean;
};
type TitleComponent = ComponentType<TitleComponentProps>;

/**
 * Section type: arbitrary field -> component entries, plus the standard component for the field
 * type, and lookup helpers.
 *
 * @property components - Map of facet field names to custom components
 * @property standard - Standard component to use when no custom component exists for a field
 * @method lookup - Get the custom component for the given facet field, or the standard component
 *                  if no custom component exists
 */
export type FacetRegistrySection<T> = {
  components: Record<string, T>;
  standard: T;
  lookup(field: string): T;
};

/**
 * Facet registry type including all possible facet element types.
 */
type FacetRegistry = {
  tagLabel: FacetRegistrySection<TagComponent>;
  termLabel: FacetRegistrySection<TermLabelComponent>;
  terms: FacetRegistrySection<TermComponent>;
  title: FacetRegistrySection<TitleComponent>;
};

/**
 * Registry of custom facet components for the term label, terms (basically the entire facet sans
 * title), and the facet title. The keys within each section are the facet field names, and the
 * values are the custom component to use for that facet. Sort each section by the alphabetically
 * by key, but with `standard` at the end.
 */
// Custom tag labels.
const tagLabel: FacetRegistrySection<TagComponent> = {
  components: {
    "donors.taxa": TaxaTagLabel,
    creation_timestamp: DateRangeTagLabel,
    file_size: FileSizeTagLabel,
    release_timestamp: DateRangeTagLabel,
    taxa: TaxaTagLabel,
  },
  standard: StandardTagLabel,
  lookup(field: string) {
    return this.components[field] ?? this.standard;
  },
};

// Custom term labels and document counts for a standard facet term.
const termLabel: FacetRegistrySection<TermLabelComponent> = {
  components: {
    "donors.taxa": TaxaTermLabel,
    taxa: TaxaTermLabel,
  },
  standard: StandardTermLabel,
  lookup(field: string) {
    return this.components[field] ?? this.standard;
  },
};

// Custom terms, basically controlling the appearance of the entire facet sans title.
const terms: FacetRegistrySection<TermComponent> = {
  components: {
    "audit.INTERNAL_ACTION.category": InternalActionAuditTerms,
    creation_timestamp: DateRangeTerms,
    file_size: FileSizeTerms,
    release_timestamp: DateRangeTerms,
  },
  standard: StandardTerms,
  lookup(field: string) {
    return this.components[field] ?? this.standard;
  },
};

// Custom facet titles.
const title: FacetRegistrySection<TitleComponent> = {
  components: {
    "audit.ERROR.category": AuditTitle,
    "audit.INTERNAL_ACTION.category": AuditTitle,
    "audit.NOT_COMPLIANT.category": AuditTitle,
    "audit.WARNING.category": AuditTitle,
    controlled_access: NoTermCountTitle,
    creation_timestamp: NoTermCountTitle,
    file_size: NoTermCountTitle,
    release_timestamp: NoTermCountTitle,
  },
  standard: StandardTitle,
  lookup(field: string) {
    return this.components[field] ?? this.standard;
  },
};

const facetRegistry: FacetRegistry = {
  tagLabel,
  termLabel,
  terms,
  title,
};

export default facetRegistry;
