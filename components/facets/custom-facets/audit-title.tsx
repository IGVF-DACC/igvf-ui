// node_modules
import { useAuth0 } from "@auth0/auth0-react";
// components
import { auditMap } from "../../audit";
// component/facets
import { FacetTermCount } from "../facet-term-count";
// components/facets/custom-facets
import { StandardTitleElement } from "./standard-title";
// root
import type { SearchResults, SearchResultsFacet } from "../../../globals";

/**
 * Displays the title for audit facets. These show a shortened title and an icon matching the icons
 * in the audit panels. This component gets used for the titles of all audit categories.
 *
 * @param facet - Facet to display from the search results
 * @param searchResults - Search results that include the given facet
 * @param isFacetOpen - True if the facet is currently open
 * @param isEditOrderMode - True when editing facet order
 */
export default function AuditTitle({
  facet,
  searchResults,
  isFacetOpen,
  isEditOrderMode,
}: {
  facet: SearchResultsFacet;
  searchResults: SearchResults;
  isFacetOpen: boolean;
  isEditOrderMode: boolean;
}) {
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated || facet.field !== "audit.INTERNAL_ACTION.category") {
    // Extract the audit type from the facet field name, and use it to get the color and title.
    const auditType = facet.field.split(".")[1];
    const mapping = auditMap[auditType];

    return (
      <>
        <StandardTitleElement
          field={facet.field}
          isFacetOpen={isFacetOpen}
          isEditOrderMode={isEditOrderMode}
        >
          <div className="flex items-center gap-1">
            <div>Audit {mapping.humanReadable}</div>
            <div className="relative h-4 w-4">
              <mapping.Icon
                className={`absolute top-0 right-0 bottom-0 left-0 ${mapping.color}`}
              />
            </div>
          </div>
        </StandardTitleElement>
        <FacetTermCount
          facet={facet}
          searchResults={searchResults}
          isFacetOpen={isFacetOpen}
        />
      </>
    );
  }
  return null;
}
