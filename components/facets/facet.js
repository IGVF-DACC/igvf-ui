// node_Modules
import PropTypes from "prop-types";

/**
 * Displays a single facet with its title and terms.
 */
export default function Facet({ facet, children }) {
  return (
    <div
      key={facet.field}
      className="my-4 first:mt-0 last:mb-0"
      data-testid={`facet-${facet.field}`}
    >
      <h2
        className="mb-1 bg-facet-title text-center text-base font-medium text-facet-title"
        data-testid={`facettitle-${facet.field}`}
      >
        {facet.title}
      </h2>
      <ul>{children}</ul>
    </div>
  );
}

Facet.propTypes = {
  // Facet object from search results
  facet: PropTypes.shape({
    field: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    terms: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        doc_count: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};
