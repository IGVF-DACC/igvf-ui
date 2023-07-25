// node_modules
import PropTypes from "prop-types";
// components/facets
import facetRegistry from "./facet-registry";

/**
 * Displays a single facet with its title and terms.
 */
export default function Facet({ facet, children }) {
  const Title = facetRegistry.title.lookup(facet.field);

  return (
    <div
      key={facet.field}
      className="my-4 first:mt-0 last:mb-0"
      data-testid={`facet-${facet.field}`}
    >
      <Title facet={facet} />
      {children}
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
      }),
    ).isRequired,
  }).isRequired,
};
