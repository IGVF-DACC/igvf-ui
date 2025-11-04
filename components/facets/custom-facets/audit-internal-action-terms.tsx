// node_modules
import { useAuth0 } from "@auth0/auth0-react";
// components/facets/custom-facets
import StandardTerms from "./standard-terms";
import type { SearchResults, SearchResultsFacet } from "../../../globals";

/**
 * Display facet terms for internal action audit events but only for authenticated users.
 *
 * @param searchResults - Search results from the data provider
 * @param facet - Facet object from search results
 * @param updateQuery - Function to call when the user clicks on a facet term
 */
export default function InternalActionAuditTerms({
  searchResults,
  facet,
  updateQuery,
}: {
  searchResults: SearchResults;
  facet: SearchResultsFacet;
  updateQuery: (queryString: string) => void;
}) {
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return (
      <StandardTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );
  }
  return null;
}
