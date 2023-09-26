// components/facets/custom-facets
import AuditTitle from "./custom-facets/audit-title";
import StandardTermLabel from "./custom-facets/standard-term-label";
import StandardTerms from "./custom-facets/standard-terms";
import StandardTitle from "./custom-facets/standard-title";
import TaxaTermLabel from "./custom-facets/taxa-term-label";
import TypeTerm from "./custom-facets/type-terms";

/**
 * Registry of custom facet components for the term label, terms (basically the entire facet sans
 * title), and the facet title. The keys within each section are the facet field names, and the
 * values are the custom component to use for that facet. Sort each section by the alphabetically
 * by key, but with `standard` at the end.
 */
const facetRegistry = {
  // Custom term labels and document counts for a standard facet term.
  termLabel: {
    "donors.taxa": TaxaTermLabel,
    taxa: TaxaTermLabel,
    standard: StandardTermLabel,
  },

  // Custom terms, basically controlling the appearance of the entire facet sans title.
  terms: {
    type: TypeTerm,
    standard: StandardTerms,
  },

  // Custom facet titles.
  title: {
    "audit.ERROR.category": AuditTitle,
    "audit.INTERNAL_ACTION.category": AuditTitle,
    "audit.NOT_COMPLIANT.category": AuditTitle,
    "audit.WARNING.category": AuditTitle,
    standard: StandardTitle,
  },
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
