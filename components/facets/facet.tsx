// node_modules
import { XMarkIcon } from "@heroicons/react/20/solid";
// components/facets
import facetRegistry from "./facet-registry";
// components
import { Tooltip, TooltipRef, useTooltip } from "../../components/tooltip";
// root
import type { SearchResults, SearchResultsFacet } from "../../globals";

/**
 * Displays the quick hide button for optional facets.
 *
 * @param onQuickHideClick - Callback when the user clicks the quick hide button
 * @param isOptional - True if the facet this appears in is optional
 * @param isFacetOpen - True if the user has opened the facet
 */
function OptionalQuickHide({
  facet,
  onOptionalFacetQuickHideChange,
  isOptional,
  isFacetOpen,
}: {
  facet: SearchResultsFacet;
  onOptionalFacetQuickHideChange: (propertyToHide: string) => void;
  isOptional: boolean;
  isFacetOpen: boolean;
}) {
  const tooltipAttr = useTooltip(`quick-hide-${facet.field}`);

  return (
    <>
      {isOptional && (
        <>
          <TooltipRef tooltipAttr={tooltipAttr}>
            <button
              data-testid={`optional-facet-quick-hide-button-${facet.field}`}
              onClick={() => onOptionalFacetQuickHideChange(facet.field)}
              aria-label={`Hide optional ${facet.title} filter`}
              className={
                isFacetOpen
                  ? "text-optional-facet-quick-hide-open hover:bg-optional-facet-quick-hide-hover-open cursor-pointer"
                  : "text-optional-facet-quick-hide-closed hover:bg-optional-facet-quick-hide-hover-closed cursor-pointer"
              }
            >
              <XMarkIcon className={`h-4 w-4`} />
            </button>
          </TooltipRef>
          <Tooltip tooltipAttr={tooltipAttr}>
            Hide optional {facet.title} filter. You can display optional filters
            with the <b>Optional Filters</b> button.
          </Tooltip>
        </>
      )}
    </>
  );
}

/**
 * Displays a single facet with its title and terms.
 *
 * @param facet - Facet object from search results
 * @param searchResults - Search results from data provider
 * @param updateQuery - Function to call when the user clicks on a facet term
 * @param updateOpen - Function to call when the user clicks the open/collapse button
 * @param onOptionalFacetQuickHideChange - Callback when the user clicks to quick hide an optional facet
 * @param isFacetOpen - True if the facet displays all its terms
 */
export default function Facet({
  facet,
  searchResults,
  updateQuery,
  updateOpen,
  onOptionalFacetQuickHideChange,
  isFacetOpen,
  isEditOrderMode,
  isOptional,
  children,
}: {
  facet: SearchResultsFacet;
  searchResults: SearchResults;
  updateQuery: (queryString: string) => void;
  updateOpen: (e: React.MouseEvent) => void;
  onOptionalFacetQuickHideChange: (propertyToHide: string) => void;
  isFacetOpen: boolean;
  isEditOrderMode: boolean;
  isOptional: boolean;
  children: React.ReactNode;
}) {
  const Title = facetRegistry.title.lookup(facet.field);

  return (
    <div
      className="border-panel border-t"
      data-testid={`facet-container-${facet.field}`}
    >
      <div
        className={`flex ${
          isFacetOpen
            ? "bg-gray-600 dark:bg-gray-400"
            : "bg-white dark:bg-black"
        }`}
      >
        <OptionalQuickHide
          facet={facet}
          onOptionalFacetQuickHideChange={onOptionalFacetQuickHideChange}
          isOptional={isOptional}
          isFacetOpen={isFacetOpen}
        />
        <button
          onClick={updateOpen}
          className={`w-full py-2 pr-4 ${isEditOrderMode ? "cursor-ns-resize" : "cursor-pointer"} ${isOptional ? "pl-1" : "pl-5"}`}
          data-testid={`facettrigger-${facet.field}`}
          aria-expanded={isFacetOpen}
        >
          <Title
            facet={facet}
            searchResults={searchResults}
            updateQuery={updateQuery}
            isFacetOpen={isFacetOpen}
            isEditOrderMode={isEditOrderMode}
          />
        </button>
      </div>
      {children}
    </div>
  );
}
