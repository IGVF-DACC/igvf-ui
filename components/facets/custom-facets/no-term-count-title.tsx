// components/facets/custom-facets
import { StandardTitleElement } from "./standard-title";
// root
import type { SearchResultsFacet } from "../../../globals.d";

/**
 * Appears the same as StandardTitle but without the facet term count indicator.
 *
 * @param facet - Facet object from search results
 * @param isFacetOpen - True if the facet displays all its terms
 * @param isEditOrderMode - True if the facet list is in edit order mode
 */
export default function NoTermCountTitle({
  facet,
  isFacetOpen,
  isEditOrderMode,
}: {
  facet: SearchResultsFacet;
  isFacetOpen: boolean;
  isEditOrderMode: boolean;
}) {
  return (
    <StandardTitleElement
      field={facet.field}
      isFacetOpen={isFacetOpen}
      isEditOrderMode={isEditOrderMode}
    >
      {facet.title}
    </StandardTitleElement>
  );
}
