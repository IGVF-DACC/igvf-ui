// node_modules
import PropTypes from "prop-types";

/**
 * Custom term-label component for the taxa facet. It displays the same as the standard term label,
 * but with the term name in italics.
 */
export default function TaxaTermLabel({ term }) {
  return (
    <div className="flex grow items-center justify-between gap-2 text-sm font-normal leading-[1.1]">
      <div className="italic">{term.key}</div>
      <div>{term.doc_count}</div>
    </div>
  );
}

TaxaTermLabel.propTypes = {
  term: PropTypes.shape({
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    doc_count: PropTypes.number.isRequired,
  }).isRequired,
};
