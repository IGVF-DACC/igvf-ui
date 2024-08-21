// node_modules
import PropTypes from "prop-types";
// components
import Checkbox from "../checkbox";
// components/facets
import facetRegistry from "./facet-registry";
// lib
import { toShishkebabCase } from "../../lib/general";
import { encodeUriElement } from "../../lib/query-encoding";

/**
 * Display a single term in a facet with a checkbox.
 */
export default function FacetTerm({
  field,
  term,
  isChecked,
  isNegative,
  onClick,
}) {
  const TermLabel = facetRegistry.termLabel.lookup(field);
  const id = `${field}-${toShishkebabCase(
    encodeUriElement(term.key_as_string || term.key)
  )}`;

  return (
    <li data-testid={`facetterm-${id}`}>
      <Checkbox
        id={`facet-checkbox-${id}`}
        checked={isChecked}
        name={`${term.key_as_string || term.key} with ${term.doc_count} result${
          term.doc_count > 1 ? "s" : ""
        }`}
        onClick={() => onClick(field, term, false)}
        onLongClick={() => onClick(field, term, true)}
        className={`cursor-pointer rounded border border-transparent px-2 py-1 hover:border-data-border ${
          isNegative ? "line-through" : ""
        }`}
      >
        <TermLabel term={term} isNegative={isNegative} />
      </Checkbox>
    </li>
  );
}

FacetTerm.propTypes = {
  // Facet field the term belongs to
  field: PropTypes.string.isRequired,
  // Term to display in the checkbox
  term: PropTypes.shape({
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    doc_count: PropTypes.number,
    key_as_string: PropTypes.string,
  }).isRequired,
  // True if the checkbox is checked
  isChecked: PropTypes.bool.isRequired,
  // True if the term is negated
  isNegative: PropTypes.bool.isRequired,
  // Called when the checkbox is checked or unchecked
  onClick: PropTypes.func.isRequired,
};
