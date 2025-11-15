// node_modules
import { Bars3Icon, MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
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
 * @param isEditOrderMode - True when editing facet order
 */
export function StandardTitleElement({
  field,
  isFacetOpen,
  isEditOrderMode,
  children,
}: {
  field: string;
  isFacetOpen: boolean;
  isEditOrderMode: boolean;
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
      {isEditOrderMode ? (
        <div className="basis-4">
          <Bars3Icon className="h-4 w-4 fill-gray-400 dark:fill-gray-600" />
        </div>
      ) : (
        <div className="basis-4">
          {isFacetOpen ? (
            <MinusIcon className="h-4 w-4" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
        </div>
      )}
    </h2>
  );
}

/**
 * Displays the standard facet title, using the `title` property of the displayed facet.
 *
 * @param facet - Facet to display the title for
 * @param searchResults - Search results that include the given facet
 * @param isFacetOpen - True if the facet displays all its terms
 * @param isEditOrderMode - True when editing facet order
 */
export default function StandardTitle({
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
  // Facets that appear to be boolean facets should not display a term count.
  if (checkForBooleanFacet(facet)) {
    return (
      <NoTermCountTitle
        facet={facet}
        isFacetOpen={isFacetOpen}
        isEditOrderMode={isEditOrderMode}
      />
    );
  }

  return (
    <>
      <StandardTitleElement
        field={facet.field}
        isFacetOpen={isFacetOpen}
        isEditOrderMode={isEditOrderMode}
      >
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
