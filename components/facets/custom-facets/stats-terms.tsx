// node_modules
import { CheckIcon } from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
// components
import { Button } from "../../form-elements";
import Icon from "../../icon";
import { RangeSelector } from "../../range-selector";
// lib
import { SearchResultsFacetStats } from "../../../lib/facets";
import QueryString from "../../../lib/query-string";
import { splitPathAndQueryString } from "../../../lib/query-utils";
// root
import type { SearchResults, SearchResultsFacet } from "../../../globals";

/**
 * Indicates whether the values in the stats facet are integers or floats. This determines how we
 * handle the range selector values and the legend
 */
type ValueMode = "integer" | "float";

function scaleToInteger(originalValue: number, valueMode: ValueMode): number {
  return valueMode === "integer"
    ? originalValue
    : Math.round(originalValue * 100);
}

function scaleToOriginal(scaledValue: number, valueMode: ValueMode): number {
  return valueMode === "integer" ? scaledValue : scaledValue / 100;
}

export default function StatsTerms({
  searchResults,
  facet,
  updateQuery,
}: {
  searchResults: SearchResults;
  facet: SearchResultsFacet;
  updateQuery: (queryString: string) => void;
}) {
  const stats = facet.terms as SearchResultsFacetStats;
  const ref = useRef<HTMLDivElement>(null);
  const { queryString } = splitPathAndQueryString(searchResults["@id"]);
  const query = new QueryString(queryString);
  let initialMin = stats.min;
  let initialMax = stats.max;

  // Determine the value mode based on the stats values. If the min and max values are integers,
  // set the value mode to integer. Otherwise, set it to float.
  const valueMode: ValueMode =
    Number.isInteger(stats.min) && Number.isInteger(stats.max)
      ? "integer"
      : "float";

  // Minimum range value the user has set
  const [minValue, setMinValue] = useState<number>(
    scaleToInteger(initialMin, valueMode)
  );
  // Maximum range value the user has set
  const [maxValue, setMaxValue] = useState<number>(
    scaleToInteger(initialMax, valueMode)
  );
  // True once rangle selector container is visible, preventing rendering while collapsed
  const [isContainerVisible, setIsContainerVisible] = useState(false);
  console.log("STATE", minValue, maxValue);

  // Called when the user changes the range selector values.
  function onChange(min: number, max: number) {
    setMinValue(min);
    setMaxValue(max);
  }

  // Called when the user clicks the apply button. Create a new query string with the selected
  // range values and update the URL.
  function applyRange() {
    query.deleteKeyValue(facet.field);
    query.addKeyValue(
      facet.field,
      `gte:${scaleToOriginal(minValue, valueMode)}`
    );
    query.addKeyValue(
      facet.field,
      `lte:${scaleToOriginal(maxValue, valueMode)}`
    );
    updateQuery(query.format());
  }

  // Called when the user resets the range selector values. It clears the range values from the
  // query string and resets the range selector values to the min and max values from the stats.
  function resetRange() {
    query.deleteKeyValue(facet.field);
    updateQuery(query.format());
    setMinValue(scaleToInteger(stats.min, valueMode));
    setMaxValue(scaleToInteger(stats.max, valueMode));
  }

  // If the minimum or maximum possible values for the facet have changed, update the range
  // selector values. This usually happens because the user has changed another facet's selections.
  useEffect(() => {
    const rangeQueries = query.getKeyValues(facet.field);
    if (rangeQueries.length > 0) {
      // At least one range query exists for this facet, so use the values from the query string
      // as the facet's value.
      const minQuery = rangeQueries.find((query) => query.startsWith("gte:"));
      const maxQuery = rangeQueries.find((query) => query.startsWith("lte:"));
      if (minQuery) {
        initialMin = parseFloat(minQuery.split(":")[1]);
        initialMin = initialMin < stats.min ? stats.min : initialMin;
      }
      if (maxQuery) {
        initialMax = parseFloat(maxQuery.split(":")[1]);
        initialMax = initialMax > stats.max ? stats.max : initialMax;
      }
    } else {
      // No range queries exist for this facet, so set the minimum and maximum values to the
      // minimum and maximum possible values from the facet data.
      initialMin = stats.min;
      initialMax = stats.max;
    }
    setMinValue(scaleToInteger(initialMin, valueMode));
    setMaxValue(scaleToInteger(initialMax, valueMode));
  }, [stats.min, stats.max]);

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
            minRangeValue={scaleToInteger(stats.min, valueMode)}
            maxRangeValue={scaleToInteger(stats.max, valueMode)}
            onChange={onChange}
            isDisabled={stats.min === stats.max}
          />
          <Button onClick={resetRange} size="sm">
            <Icon.Reset className="h-4 w-4" />
          </Button>
          <Button onClick={applyRange} size="sm">
            <CheckIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
