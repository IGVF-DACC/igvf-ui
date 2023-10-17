// node_modules
import PropTypes from "prop-types";
// lib
import { getFilterTerm } from "../../../lib/facets";

/**
 * Display the standard facet tag label. This is the default tag label for all facets that do not
 * have a custom tag label.
 *
 * When the tag term is `*`, the tag label displays as `ANY` or `NOT` depending on whether the tag
 * field ends with `!`.
 */
export default function TaxaTagLabel({ filter }) {
  const term = getFilterTerm(filter);
  return term !== "NOT" && term !== "ANY" ? <i>{term}</i> : <>{term}</>;
}

TaxaTagLabel.propTypes = {
  // Filter object from search results
  filter: PropTypes.shape({
    // Object property the filter represents
    field: PropTypes.string.isRequired,
    // Value of the object property
    term: PropTypes.string.isRequired,
  }).isRequired,
};
