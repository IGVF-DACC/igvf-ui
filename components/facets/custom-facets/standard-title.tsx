// node_modules
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
// components/facets/custom-facets
import NoTermCountTitle from "./no-term-count-title";
// components/facets
import { FacetTermCount } from "../facet-term-count";
// lib
import { checkForBooleanFacet } from "../../../lib/facets";
// root
import type { SearchResults, SearchResultsFacet } from "../../../globals";

/**
 * Alternate facet title renderers can use this to display the standard title collapse/expand
 * button. That way you can keep the standard functionality and only change something about the
 * title itself.
 *
 * @param field - Facet property name
 * @param isFacetOpen - True if the facet displays all its terms
 */
export function StandardTitleElement({
  field,
  isFacetOpen,
  children,
}: {
  field: string;
  isFacetOpen: boolean;
  children: React.ReactNode;
}) {
  return (
    <h2
      className={`text-facet-title flex items-center justify-between text-base font-normal ${
        isFacetOpen ? "text-white dark:text-black" : ""
      }`}
      data-testid={`facettitle-${field}`}
    >
      <div className="text-left">{children}</div>
      <div className="basis-4">
        {isFacetOpen ? (
          <MinusIcon className="h-4 w-4" />
        ) : (
          <PlusIcon className="h-4 w-4" />
        )}
      </div>
    </h2>
  );
}

/**
 * Displays the standard facet title, using the `title` property of the displayed facet.
 *
 * @param facet - Facet to display the title for
 * @param searchResults - Search results that include the given facet
 * @param isFacetOpen - True if the facet displays all its terms
 */
export default function StandardTitle({
  facet,
  searchResults,
  isFacetOpen,
}: {
  facet: SearchResultsFacet;
  searchResults: SearchResults;
  isFacetOpen: boolean;
}) {
  // Facets that appear to be boolean facets should not display a term count.
  if (checkForBooleanFacet(facet)) {
    return <NoTermCountTitle facet={facet} isFacetOpen={isFacetOpen} />;
  }

  return (
    <>
      <StandardTitleElement field={facet.field} isFacetOpen={isFacetOpen}>
        {facet.title}
      </StandardTitleElement>
      <FacetTermCount
        facet={facet}
        searchResults={searchResults}
        isFacetOpen={isFacetOpen}
      />
    </>
  );
}
