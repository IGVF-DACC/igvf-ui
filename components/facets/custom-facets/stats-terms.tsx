// node_modules
import { useEffect, useRef, useState } from "react";
// components
import { Button } from "../../form-elements";
import Icon from "../../icon";
import { RangeSelector } from "../../range-selector";
import { Tooltip, TooltipRef, useTooltip } from "../../tooltip";
// lib
import { SearchResultsFacetStats } from "../../../lib/facets";
import QueryString from "../../../lib/query-string";
import { splitPathAndQueryString } from "../../../lib/query-utils";
// components/facets/custom-facets
import {
  getRangeQueryValues,
  RANGE_APPLY_DELAY,
  scaleToInteger,
  scaleToOriginal,
  type ValueMode,
} from "./stats-lib";
// root
import type { SearchResults, SearchResultsFacet } from "../../../globals";

/**
 * Custom terms facet for allowing the user to select a range of values, as well as displaying a
 * legend of the currently-selected range.
 * @param searchResults - The current list or report search results from the data provider
 * @param facet - The facet to display from `searchResults`
 * @param updateQuery - Function to call when the user selects a new range of values
 */
export default function StatsTerms({
  searchResults,
  facet,
  updateQuery,
}: {
  searchResults: SearchResults;
  facet: SearchResultsFacet;
  updateQuery: (queryString: string) => void;
}) {
  const resetTooltipAttr = useTooltip("reset-range");

  const stats = facet.terms as SearchResultsFacetStats;
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { queryString } = splitPathAndQueryString(searchResults["@id"]);
  const query = new QueryString(queryString);

  // Determine the value mode based on the stats values. If the min and max values are integers,
  // set the value mode to integer. Otherwise, set it to float.
  const valueMode: ValueMode =
    Number.isInteger(stats.min) && Number.isInteger(stats.max)
      ? "integer"
      : "float";

  // Get the scaled minimum and maximum values from the query string if they exist.
  const { minRangeQueryValue, maxRangeQueryValue } = getRangeQueryValues(
    query,
    facet.field,
    valueMode
  );

  // Get the minimum and maximum possible values for the facet, scaled for the value mode.
  const statsMin = scaleToInteger(stats.min, valueMode);
  const statsMax = scaleToInteger(stats.max, valueMode);

  // Minimum range value the user has set
  const [minValue, setMinValue] = useState<number>(statsMin);
  // Maximum range value the user has set
  const [maxValue, setMaxValue] = useState<number>(statsMax);
  // True once range selector container is visible, preventing rendering while collapsed
  const [isContainerVisible, setIsContainerVisible] = useState(false);

  // Called when the user changes the range selector values. Applies the new range values to the
  // query string if the user makes no new changes during a short delay.
  function onChange(min: number, max: number) {
    setMinValue(min);
    setMaxValue(max);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Apply the new range settings if the user doesn't change the setting for a short while.
    timerRef.current = setTimeout(() => {
      applyRange(min, max);
    }, RANGE_APPLY_DELAY);
  }

  // Called when the user clicks the apply button. Create a new query string with the selected
  // range values and update the URL.
  function applyRange(newMinValue: number, newMaxValue: number) {
    query.deleteKeyValue(facet.field);
    if (newMinValue > statsMin) {
      query.addKeyValue(
        facet.field,
        `gte:${scaleToOriginal(newMinValue, valueMode)}`
      );
    }
    if (newMaxValue < statsMax) {
      query.addKeyValue(
        facet.field,
        `lte:${scaleToOriginal(newMaxValue, valueMode)}`
      );
    }
    query.deleteKeyValue("from");
    updateQuery(query.format());
  }

  // Called when the user resets the range selector values. It clears the range values from the
  // query string and resets the range selector values to the min and max values from the stats.
  function resetRange() {
    query.deleteKeyValue(facet.field);
    query.deleteKeyValue("from");
    updateQuery(query.format());
    setMinValue(statsMin);
    setMaxValue(statsMax);
  }

  // If the minimum or maximum possible values for the facet have changed, update the range
  // selector values. This usually happens because the user has changed another facet's selections.
  useEffect(() => {
    let limitedMin = statsMin;
    let limitedMax = statsMax;
    if (minRangeQueryValue || maxRangeQueryValue) {
      // At least one range query exists for this facet, so use the values from the query string
      // as the facet's value.
      if (minRangeQueryValue) {
        limitedMin =
          minRangeQueryValue < statsMin ? statsMin : minRangeQueryValue;
      }
      if (maxRangeQueryValue) {
        limitedMax =
          maxRangeQueryValue > statsMax ? statsMax : maxRangeQueryValue;
      }
    }
    setMinValue(limitedMin);
    setMaxValue(limitedMax);
  }, [statsMin, statsMax, minRangeQueryValue, maxRangeQueryValue]);

  // <RangeSelector> measures its dimensions, but the dimensions are all zero when the facet
  // expansion animation begins. Only start rendering the range selector when the width is greater
  // than 0.
  useEffect(() => {
    if (ref.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (!isContainerVisible && entry.contentRect.width > 0) {
            setIsContainerVisible(true);
          }
        }
      });
      resizeObserver.observe(ref.current);

      return () => resizeObserver.disconnect();
    }
  }, []);

  // Reset-range button is disabled if neither the minimum nor maximum values exist in the query
  // string.
  const resetButtonDisabled =
    minRangeQueryValue === null && maxRangeQueryValue === null;

  return (
    <div ref={ref} className="p-2">
      <div className="flex justify-center gap-2 text-sm font-semibold">
        <div className="flex-1 text-right">
          {scaleToOriginal(minValue, valueMode)}
        </div>
        <div>&ndash;</div>
        <div className="flex-1">{scaleToOriginal(maxValue, valueMode)}</div>
      </div>
      {isContainerVisible && (
        <div className="flex items-center gap-1">
          <RangeSelector
            id={`${facet.field}-range`}
            minValue={minValue}
            maxValue={maxValue}
            minRangeValue={statsMin}
            maxRangeValue={statsMax}
            onChange={onChange}
            isDisabled={statsMin === statsMax}
          />
          <TooltipRef tooltipAttr={resetTooltipAttr}>
            <div>
              <Button
                onClick={resetRange}
                size="sm"
                isDisabled={resetButtonDisabled}
              >
                <Icon.Reset className="h-4 w-4" />
              </Button>
            </div>
          </TooltipRef>
          <Tooltip tooltipAttr={resetTooltipAttr}>
            Reset the range to the minimum and maximum values
          </Tooltip>
        </div>
      )}
    </div>
  );
}
