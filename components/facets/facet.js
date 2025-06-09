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
      className="border-panel border-t"
      data-testid={`facet-container-${facet.field}`}
    >
      <button
        onClick={updateOpen}
        className={`w-full cursor-pointer px-4 pt-2 pb-2 ${
          isFacetOpen ? "bg-gray-600 dark:bg-gray-400" : ""
        }`}
        data-testid={`facettrigger-${facet.field}`}
        aria-expanded={isFacetOpen}
      >
        <Title
          facet={facet}
          searchResults={searchResults}
          updateQuery={updateQuery}
          isFacetOpen={isFacetOpen}
        />
      </button>
      {children}
    </div>
  );
}

Facet.propTypes = {
  // Facet object from search results
  facet: PropTypes.shape({
    field: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    terms: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.object),
      PropTypes.object,
    ]),
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
