// node_modules
import _ from "lodash";
// components
import { Tooltip, TooltipRef, useTooltip } from "../tooltip";
// components/facets
import type { SearchResults, SearchResultsFacet } from "../../globals.d";

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

  // Find the currently selected and negative-selected terms for this facet.
  const groupedFilters = _.groupBy(searchResults.filters, (filter) => {
    if (filter.field === facet.field) {
      return "selected";
    }
    if (filter.field === `${facet.field}!`) {
      return "negative";
    }

    // Not used.
    return "neither";
  });

  // Map the term objects to their titles. Non-selected terms come from the facets, not the
  // filters, so they have a different mapping process.
  const selectedTerms =
    groupedFilters.selected?.map((filter) => filter.term) || [];
  const negativeTerms =
    groupedFilters.negative?.map((filter) => filter.term) || [];
  const nonSelectedTerms = facet.terms
    .map((term) => term.key)
    .filter((term) => {
      return !selectedTerms.includes(term) && !negativeTerms.includes(term);
    });

  // Build the help text for the aria and the tooltip.
  const helpText = `${
    selectedTerms.length + negativeTerms.length
  } selected of ${facet.terms.length} ${
    facet.terms.length === 1 ? "term" : "terms"
  }`;

  const singleIndicatorClassNames = "h-1.5 w-2.5 flex-none border";
  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <div
          className="flex gap-0.5 overflow-hidden facet-term-count-mask"
          data-testid={`facet-term-count-${facet.field}`}
          aria-label={helpText}
        >
          {selectedTerms.map((term) => {
            const className = isFacetOpen
              ? "bg-facet-counter-open-selected border-facet-counter-open-selected"
              : "bg-facet-counter-selected border-facet-counter-selected";
            return (
              <div
                key={term}
                className={`${singleIndicatorClassNames} ${className}`}
              />
            );
          })}
          {negativeTerms.map((term) => {
            const className = isFacetOpen
              ? "bg-facet-counter-open-negative border-facet-counter-open-negative"
              : "bg-facet-counter-negative border-facet-counter-negative";
            return (
              <div
                key={term}
                className={`${singleIndicatorClassNames} ${className}`}
              />
            );
          })}
          {nonSelectedTerms.map((term) => {
            const className = isFacetOpen
              ? "border-facet-counter-open"
              : "border-facet-counter";
            return (
              <div
                key={term}
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
