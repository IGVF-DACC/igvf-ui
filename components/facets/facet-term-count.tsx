// node_modules
import _ from "lodash";
// components
import { Tooltip, TooltipRef, useTooltip } from "../tooltip";
// components/facets
import type {
  SearchResults,
  SearchResultsFacet,
  SearchResultsFacetTerm,
} from "../../globals.d";
// lib
import { getTermSelections } from "../../lib/facets";

/**
 * Displays a representation of the count of items and selections in a facet.
 * @param facet - Facet to display
 * @param searchResults - Search results being displayed
 * @param isFacetOpen - Whether the facet is open or closed
 */
export function FacetTermCount({
  facet,
  searchResults,
  isFacetOpen = false,
}: {
  facet: SearchResultsFacet;
  searchResults: SearchResults;
  isFacetOpen?: boolean;
}) {
  const tooltipAttr = useTooltip(`facet-counter-${facet.field}`);
  const { selectedTerms, negativeTerms, nonSelectedTerms } = getTermSelections(
    facet,
    searchResults.filters
  );

  // Build the help text for the aria and the tooltip.
  const terms = facet.terms as SearchResultsFacetTerm[];
  const helpText = `${
    selectedTerms.length + negativeTerms.length
  } selected of ${terms.length} ${terms.length === 1 ? "term" : "terms"}`;

  // NOTE: The use of a loop index for React keys is a workaround for the lack of unique keys in
  // the facet term object. This is a temporary solution until the backend can guarantee a unique
  // key for each facet term.
  const singleIndicatorClassNames = "h-1.5 w-2.5 flex-none border";
  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <div
          className="flex gap-0.5 overflow-hidden facet-term-count-mask"
          data-testid={`facet-term-count-${facet.field}`}
          aria-label={helpText}
        >
          {selectedTerms.map((term, i) => {
            const className = isFacetOpen
              ? "bg-facet-counter-open-selected border-facet-counter-open-selected"
              : "bg-facet-counter-selected border-facet-counter-selected";
            return (
              <div
                key={`${term}-${i}`}
                className={`${singleIndicatorClassNames} ${className}`}
              />
            );
          })}
          {negativeTerms.map((term, i) => {
            const className = isFacetOpen
              ? "bg-facet-counter-open-negative border-facet-counter-open-negative"
              : "bg-facet-counter-negative border-facet-counter-negative";
            return (
              <div
                key={`${term}-${i}`}
                className={`${singleIndicatorClassNames} ${className}`}
              />
            );
          })}
          {nonSelectedTerms.map((term, i) => {
            const className = isFacetOpen
              ? "border-facet-counter-open"
              : "border-facet-counter";
            return (
              <div
                key={`${term}-${i}`}
                className={`${singleIndicatorClassNames} ${className}`}
              />
            );
          })}
        </div>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>{helpText}</Tooltip>
    </>
  );
}
