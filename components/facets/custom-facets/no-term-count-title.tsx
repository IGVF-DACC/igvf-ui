// components/facets/custom-facets
import { StandardTitleElement } from "./standard-title";
// root
import type { SearchResultsFacet } from "../../../globals.d";

/**
 * Appears the same as StandardTitle but without the facet term count indicator.
 */
export default function NoTermCountTitle({
  facet,
  isFacetOpen,
}: {
  facet: SearchResultsFacet;
  isFacetOpen: boolean;
}) {
  return (
    <StandardTitleElement field={facet.field} isFacetOpen={isFacetOpen}>
      {facet.title}
    </StandardTitleElement>
  );
}
