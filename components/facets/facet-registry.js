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
import TriBooleanTerms from "./custom-facets/tri-boolean-terms";

/**
 * Registry of custom facet components for the term label, terms (basically the entire facet sans
 * title), and the facet title. The keys within each section are the facet field names, and the
 * values are the custom component to use for that facet. Sort each section by the alphabetically
 * by key, but with `standard` at the end.
 */
const facetRegistry = {
  // Custom tag labels.
  tagLabel: {
    "donors.taxa": TaxaTagLabel,
    creation_timestamp: DateRangeTagLabel,
    file_size: FileSizeTagLabel,
    release_timestamp: DateRangeTagLabel,
    taxa: TaxaTagLabel,
    standard: StandardTagLabel,
  },

  // Custom term labels and document counts for a standard facet term.
  termLabel: {
    "donors.taxa": TaxaTermLabel,
    taxa: TaxaTermLabel,
    standard: StandardTermLabel,
  },

  // Custom terms, basically controlling the appearance of the entire facet sans title.
  terms: {
    "audit.INTERNAL_ACTION.category": InternalActionAuditTerms,
    controlled_access: TriBooleanTerms,
    creation_timestamp: DateRangeTerms,
    file_size: FileSizeTerms,
    release_timestamp: DateRangeTerms,
    standard: StandardTerms,
  },

  // Custom facet titles.
  title: {
    "audit.ERROR.category": AuditTitle,
    "audit.INTERNAL_ACTION.category": AuditTitle,
    "audit.NOT_COMPLIANT.category": AuditTitle,
    "audit.WARNING.category": AuditTitle,
    controlled_access: NoTermCountTitle,
    creation_timestamp: NoTermCountTitle,
    file_size: NoTermCountTitle,
    release_timestamp: NoTermCountTitle,
    standard: StandardTitle,
  },
};

facetRegistry.tagLabel.lookup = function (field) {
  return facetRegistry.tagLabel[field] || facetRegistry.tagLabel.standard;
};

facetRegistry.termLabel.lookup = function (field) {
  return facetRegistry.termLabel[field] || facetRegistry.termLabel.standard;
};

facetRegistry.terms.lookup = function (field) {
  return facetRegistry.terms[field] || facetRegistry.terms.standard;
};

facetRegistry.title.lookup = function (field) {
  return facetRegistry.title[field] || facetRegistry.title.standard;
};

export default facetRegistry;
