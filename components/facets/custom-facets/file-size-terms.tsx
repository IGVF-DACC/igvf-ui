// node_modules
import { useEffect, useRef, useState } from "react";
// components
import Checkbox from "../../checkbox";
import { Button } from "../../form-elements";
import Icon from "../../icon";
import { RangeSelector } from "../../range-selector";
import { Tooltip, TooltipRef, useTooltip } from "../../tooltip";
// lib
import { SearchResultsFacetStats } from "../../../lib/facets";
import { dataSize } from "../../../lib/general";
import QueryString from "../../../lib/query-string";
import { splitPathAndQueryString } from "../../../lib/query-utils";
// components/facets/custom-facets
import { getRangeQueryValues, RANGE_APPLY_DELAY } from "./stats-lib";
// root
import type { SearchResults, SearchResultsFacet } from "../../../globals";

/**
 * Maximum value the slider can be set to. The maximum possible file size from the stats facet gets
 * mapped to this value while the minimum file size gets mapped to 0. Generally large values cause
 * fewer conversion errors between slider and file-size values.
 */
const SLIDER_MAX_VALUE = 10_000;

/**
 * Converts from slider position to a file size in bytes. Allow more fine-grained values for
 * smaller file sizes and coarser values for larger file sizes.
 * @param sliderValue - Value of the slider
 * @param sizeMin - Minimum possible file size from the stats facet
 * @param sizeMax - Maximum possible file size from the stats facet
 * @returns The actual file size in bytes
 */
function sliderToSize(
  sliderValue: number,
  sizeMin: number,
  sizeMax: number
): number {
  const minLog = Math.log10(sizeMin);
  const maxLog = Math.log10(sizeMax);
  const logValue =
    minLog + (sliderValue / SLIDER_MAX_VALUE) * (maxLog - minLog);
  return Math.round(Math.pow(10, logValue));
}

/**
 * Converts from file size in bytes to slider position.
 * @param sizeValue - File size in bytes
 * @param sizeMin - Minimum possible file size from the stats facet
 * @param sizeMax - Maximum possible file size from the stats facet
 * @returns Value for the slider
 */
function sizeToSlider(
  sizeValue: number,
  sizeMin: number,
  sizeMax: number
): number {
  const minLog = Math.log10(sizeMin);
  const maxLog = Math.log10(sizeMax);
  const sizeValueLog = Math.log10(sizeValue);
  return Math.round(
    ((sizeValueLog - minLog) / (maxLog - minLog)) * SLIDER_MAX_VALUE
  );
}

/**
 * Custom terms facet for allowing the user to select a range of file sizes.
 *
 * This component uses a range selector to allow the user to select a range of file sizes to pass
 * the filter. It uses a logarithmic scale so that the user can select a finer range of values
 * towards the left end, and a coarser range of values towards the right end.
 *
 * The range selector always uses values of 0 to SLIDER_MAX_VALUE, and the actual file sizes are
 * calculated from the slider position.
 *
 * In general, variables with names including "sizeMin" or "sizeMax" are the actual file sizes,
 * while variables with names including "sliderMin" or "sliderMax" are the range slider values.
 * @param searchResults - Current list or report search results from the data provider
 * @param facet - Facet to display from `searchResults`
 * @param updateQuery - Function to call when the user selects a new range of values
 */
function FileSizeTermsCore({
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
  const { min: sizeMin, max: sizeMax } = stats;
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { queryString } = splitPathAndQueryString(searchResults["@id"]);
  const query = new QueryString(queryString);

  // Get the minimum and maximum values from the query string for this facet.
  const { minRangeQueryValue, maxRangeQueryValue } = getRangeQueryValues(
    query,
    facet.field
  );

  // Determine whether the query has selected the "Show only files with no size" checkbox.
  const negativeSizeElements = query.getKeyValues(facet.field, "NEGATIVE");
  const noFileSizeSelected = negativeSizeElements.length > 0;

  // Minimum range value the user has set
  const [sliderMinValue, setSliderMinValue] = useState<number>(0);
  // Maximum range value the user has set
  const [sliderMaxValue, setSliderMaxValue] =
    useState<number>(SLIDER_MAX_VALUE);
  // True once range selector container is visible, preventing rendering while collapsed
  const [isContainerVisible, setIsContainerVisible] = useState(false);

  // Called when the user changes the range selector values. Applies the new range values to the
  // query string if the user makes no new changes during a short delay.
  function onChange(changedSliderMin: number, changedSliderMax: number) {
    setSliderMinValue(changedSliderMin);
    setSliderMaxValue(changedSliderMax);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Apply the new range settings if the user doesn't change the setting for a short while.
    timerRef.current = setTimeout(() => {
      applyRange(changedSliderMin, changedSliderMax);
    }, RANGE_APPLY_DELAY);
  }

  // Called to apply the selected range, normally a short time after the user stops making changes
  // to the range. Create a new query string with the selected range values and update the URL.
  function applyRange(changedSliderMin: number, changedSliderMax: number) {
    const changedSizeMin = sliderToSize(changedSliderMin, sizeMin, sizeMax);
    const changedSizeMax = sliderToSize(changedSliderMax, sizeMin, sizeMax);
    query.deleteKeyValue(facet.field);
    if (changedSizeMin > sizeMin) {
      query.addKeyValue(facet.field, `gte:${changedSizeMin}`);
    }
    if (changedSizeMax < sizeMax) {
      query.addKeyValue(facet.field, `lte:${changedSizeMax}`);
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
    setSliderMinValue(0);
    setSliderMaxValue(SLIDER_MAX_VALUE);
  }

  // Called when the user clicks the "Show only files with no size" checkbox.
  function noSizeClick() {
    if (noFileSizeSelected) {
      // Remove the "Show only files with no size" checkbox from the query string.
      query.deleteKeyValue(facet.field, "*");
      updateQuery(query.format());
    } else {
      // Add the "Show only files with no size" checkbox to the query string. Remove any other
      // `file_size=` elements from the query string, including ranges.
      query.deleteKeyValue(facet.field);
      query.addKeyValue(facet.field, "*", "NEGATIVE");
      updateQuery(query.format());
    }
  }

  // If the minimum or maximum possible values for the facet have changed, update the range
  // selector values. This usually happens because the user has changed another facet's selections.
  useEffect(() => {
    let pinnedSizeMin = sizeMin;
    let pinnedSizeMax = sizeMax;
    if (minRangeQueryValue || maxRangeQueryValue) {
      // At least one range query exists for this facet, so use the values from the query string
      // as the facet's value.
      if (minRangeQueryValue) {
        pinnedSizeMin =
          minRangeQueryValue < sizeMin ? sizeMin : minRangeQueryValue;
      }
      if (maxRangeQueryValue) {
        pinnedSizeMax =
          maxRangeQueryValue > sizeMax ? sizeMax : maxRangeQueryValue;
      }
    }
    const pinnedSliderMin = sizeToSlider(pinnedSizeMin, sizeMin, sizeMax);
    const pinnedSliderMax = sizeToSlider(pinnedSizeMax, sizeMin, sizeMax);
    setSliderMinValue(pinnedSliderMin);
    setSliderMaxValue(pinnedSliderMax);
  }, [sizeMin, sizeMax, minRangeQueryValue, maxRangeQueryValue]);

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

  const currentSizeMin = sliderToSize(sliderMinValue, sizeMin, sizeMax);
  const currentSizeMax = sliderToSize(sliderMaxValue, sizeMin, sizeMax);
  return (
    <div ref={ref} className="p-2">
      <div
        data-testid="file-size-terms-legend"
        className="flex justify-center gap-2 text-sm font-semibold"
      >
        {sizeMin === sizeMax || noFileSizeSelected ? (
          <div>No selectable range</div>
        ) : (
          <>
            <div className="flex-1 text-right">{dataSize(currentSizeMin)}</div>
            <div>&ndash;</div>
            <div className="flex-1">{dataSize(currentSizeMax)}</div>
          </>
        )}
      </div>
      {isContainerVisible && (
        <>
          <div
            className="flex items-center gap-1"
            data-testid="file-size-terms-range"
          >
            <RangeSelector
              id={`${facet.field}-range`}
              minValue={sliderMinValue}
              maxValue={sliderMaxValue}
              minRangeValue={0}
              maxRangeValue={SLIDER_MAX_VALUE}
              onChange={onChange}
              isDisabled={sizeMin === sizeMax || noFileSizeSelected}
            />
            <TooltipRef tooltipAttr={resetTooltipAttr}>
              <div>
                <Button
                  onClick={resetRange}
                  size="sm"
                  isDisabled={resetButtonDisabled}
                  id={`reset-range-${facet.field}`}
                >
                  <Icon.Reset className="h-4 w-4" />
                </Button>
              </div>
            </TooltipRef>
            <Tooltip tooltipAttr={resetTooltipAttr}>
              Reset the range to the minimum and maximum values
            </Tooltip>
          </div>
          <div className="flex justify-center">
            <Checkbox
              id={`facet-${facet.field}-no-size`}
              checked={noFileSizeSelected}
              name={`facet-${facet.field}-no-size`}
              className="mt-2 text-sm font-semibold"
              onClick={noSizeClick}
            >
              Show only files with no size
            </Checkbox>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Import this component into the facet registry. To reduce some misconfiguration crashes, it makes
 * sure the facet is a stats facet and not a normal terms facet before rendering the component. If
 * the facet isn't a stats facet, log an error to the console and render nothing -- someone needs to
 * change the search config for this facet into a stats facet.
 */
export default function FileSizeTerms({
  searchResults,
  facet,
  updateQuery,
}: {
  searchResults: SearchResults;
  facet: SearchResultsFacet;
  updateQuery: (queryString: string) => void;
}) {
  if (facet.type !== "stats") {
    console.error(
      `FileSizeTerms: Expected a stats facet but got a ${facet.type} facet for ${facet.field}.`
    );
    return null;
  }

  return (
    <FileSizeTermsCore
      searchResults={searchResults}
      facet={facet}
      updateQuery={updateQuery}
    />
  );
}
