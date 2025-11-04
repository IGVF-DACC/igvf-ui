// components/facets
import facetRegistry from "./facet-registry";
// root
import type { SearchResults, SearchResultsFacet } from "../../globals";

/**
 * Displays a single facet with its title and terms.
 *
 * @param facet - Facet object from search results
 * @param searchResults - Search results from data provider
 * @param updateQuery - Function to call when the user clicks on a facet term
 * @param updateOpen - Function to call when the user clicks the open/collapse button
 * @param isFacetOpen - True if the facet displays all its terms
 */
export default function Facet({
  facet,
  searchResults,
  updateQuery,
  updateOpen,
  isFacetOpen,
  children,
}: {
  facet: SearchResultsFacet;
  searchResults: SearchResults;
  updateQuery: (queryString: string) => void;
  updateOpen: (e: React.MouseEvent) => void;
  isFacetOpen: boolean;
  children: React.ReactNode;
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
