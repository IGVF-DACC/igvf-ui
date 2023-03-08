// node_modules
import PropTypes from "prop-types";
// components
import Checkbox from "../checkbox";

/**
 * Display a single term in a facet with a checkbox.
 */
export default function FacetTerm({ field, term, isChecked, onClick }) {
  return (
    <li data-testid={`facetterm-${term.key}`}>
      <Checkbox
        checked={isChecked}
        name={`${term.key} with ${term.doc_count} result${
          term.doc_count > 1 ? "s" : ""
        }`}
        onChange={() => onClick(field, term)}
        className="cursor-pointer rounded border border-transparent px-2 py-1 hover:border-data-border"
      >
        <div className="flex grow items-center justify-between gap-2 text-sm font-normal leading-[1.1]">
          <div>{term.key}</div>
          <div>{term.doc_count}</div>
        </div>
      </Checkbox>
    </li>
  );
}

FacetTerm.propTypes = {
  // Facet field the term belongs to
  field: PropTypes.string.isRequired,
  // Term to display in the checkbox
  term: PropTypes.shape({
    key: PropTypes.string.isRequired,
    doc_count: PropTypes.number.isRequired,
  }).isRequired,
  // True if the checkbox is checked
  isChecked: PropTypes.bool.isRequired,
  // Called when the checkbox is checked or unchecked
  onClick: PropTypes.func.isRequired,
};
