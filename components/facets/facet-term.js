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
  parent = null,
  onClick,
}) {
  const TermLabel = facetRegistry.termLabel.lookup(field);
  const id = `${field}-${toShishkebabCase(
    encodeUriElement(term.key_as_string || term.key)
  )}${parent ? `-${toShishkebabCase(parent.term.key)}` : ""}`;

  return (
    <li data-testid={`facetterm-${id}`}>
      <Checkbox
        id={`facet-checkbox-${id}`}
        checked={isChecked}
        name={`${term.key_as_string || term.key} with ${term.doc_count} result${
          term.doc_count > 1 ? "s" : ""
        }`}
        onClick={() => onClick(field, term, false, parent)}
        onLongClick={() => onClick(field, term, true, parent)}
        className={`hover:border-data-border cursor-pointer rounded border border-transparent px-2 py-1 ${
          isNegative ? "line-through" : ""
        }`}
      >
        <TermLabel
          term={term}
          isNegative={isNegative}
          isChildTerm={Boolean(parent)}
        />
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
  // Field name and key of the parent term if this term is a child term
  parent: PropTypes.exact({
    // Field of the parent term
    field: PropTypes.string,
    // Parent term object including key and subfacet
    term: PropTypes.object,
  }),
  // Called when the checkbox is checked or unchecked
  onClick: PropTypes.func.isRequired,
};
