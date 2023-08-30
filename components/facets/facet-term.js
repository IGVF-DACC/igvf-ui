// node_modules
import PropTypes from "prop-types";
// components
import Checkbox from "../checkbox";
// components/facets
import facetRegistry from "./facet-registry";

/**
 * Display a single term in a facet with a checkbox.
 */
export default function FacetTerm({ field, term, isChecked, onClick }) {
  const TermLabel = facetRegistry.termLabel.lookup(field);

  return (
    <li data-testid={`facetterm-${term.key}`}>
      <Checkbox
        checked={isChecked}
        name={`${term.key_as_string || term.key} with ${term.doc_count} result${
          term.doc_count > 1 ? "s" : ""
        }`}
        onChange={() => onClick(field, term)}
        className="cursor-pointer rounded border border-transparent px-2 py-1 hover:border-data-border"
      >
        <TermLabel term={term} />
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
    doc_count: PropTypes.number.isRequired,
    key_as_string: PropTypes.string,
  }).isRequired,
  // True if the checkbox is checked
  isChecked: PropTypes.bool.isRequired,
  // Called when the checkbox is checked or unchecked
  onClick: PropTypes.func.isRequired,
};
