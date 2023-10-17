// node_modules
import PropTypes from "prop-types";

/**
 * Displays the standard term label for the standard facet terms. It shows the term name at the
 * left of the space, and the count of terms on the right.
 */
export default function StandardTermLabel({ term, isNegative }) {
  return (
    <div className="flex grow items-center justify-between gap-2 text-sm font-normal leading-[1.1]">
      <div>{term.key_as_string || term.key}</div>
      {!isNegative && <div>{term.doc_count}</div>}
    </div>
  );
}

StandardTermLabel.propTypes = {
  // Single term from a facet from the search results
  term: PropTypes.shape({
    // Term name
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    // Number of times the term appears in the search results
    doc_count: PropTypes.number.isRequired,
    // Term name as a string when available
    key_as_string: PropTypes.string,
  }).isRequired,
  // True if the term is negated
  isNegative: PropTypes.bool.isRequired,
};
