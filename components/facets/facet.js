// node_modules
import PropTypes from "prop-types";
// components/facets
import facetRegistry from "./facet-registry";

/**
 * Displays a single facet with its title and terms.
 */
export default function Facet({
  facet,
  searchResults,
  updateQuery,
  updateOpen,
  isFacetOpen,
  children,
}) {
  const Title = facetRegistry.title.lookup(facet.field);

  return (
    <div
      key={facet.field}
      className={`border-t border-gray-300 px-4 pb-2 pt-2 hover:bg-blue-50 dark:hover:bg-blue-950 ${
        isFacetOpen ? "bg-blue-50 dark:bg-blue-950" : ""
      }`}
      data-testid={`facet-${facet.field}`}
    >
      <Title
        facet={facet}
        searchResults={searchResults}
        updateQuery={updateQuery}
        updateOpen={updateOpen}
        isFacetOpen={isFacetOpen}
      />
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
        key: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        doc_count: PropTypes.number,
        key_as_string: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  // Search results from data provider
  searchResults: PropTypes.object.isRequired,
  // Function to call when the user clicks on a facet term
  updateQuery: PropTypes.func.isRequired,
  // Function to call when the user clicks the open/collapse button
  updateOpen: PropTypes.func.isRequired,
  // True if the facet displays all its terms
  isFacetOpen: PropTypes.bool.isRequired,
};
