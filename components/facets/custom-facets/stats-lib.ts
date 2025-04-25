// lib
import type QueryString from "../../../lib/query-string";

/**
 * Indicates whether the values in the stats facet are integers or floats. This determines how we
 * handle the range selector values and the legend
 */
export type ValueMode = "integer" | "float";

/**
 * Delay in ms after the user stops changing the range selector values before the new range is
 * applied.
 */
export const RANGE_APPLY_DELAY = 500;

/**
 * Scale the original value from the stats facet to an integer if the value mode is set to
 * "float." If the value mode is set to "integer," the original value is returned. This lets
 * fractional values work with the range selector, which only accepts integers.
 * @param originalValue - The original value from the stats facet
 * @param valueMode - Indicates whether the value is an integer or a float
 * @returns Scaled value if the value mode is set to "float", otherwise the original value
 */
export function scaleToInteger(
  originalValue: number,
  valueMode: ValueMode
): number {
  return valueMode === "integer"
    ? originalValue
    : Math.round(originalValue * 100);
}

/**
 * Scale the value back to the original value from the stats facet.
 * @param scaledValue - The value scaled back to the original value
 * @param valueMode - Indicates whether the value is an integer or a float
 * @returns Original float value if the value mode is "float", otherwise the unscaled integer
 */
export function scaleToOriginal(
  scaledValue: number,
  valueMode: ValueMode
): number {
  return valueMode === "integer" ? scaledValue : scaledValue / 100;
}

/**
 * Get the minimum and maximum values from the query string for the given field. The values are
 * scaled to integers or floats based on the valueMode. If no value exist for either the minimum or
 * maximum values, null is returned for that value.
 * @param query - From the current query string
 * @param field - Property the facet displays
 * @param valueMode - Indicates whether the query-string values are integers or floats
 * @returns The minimum and maximum values from the query string for the given field.
 */
export function getRangeQueryValues(
  query: QueryString,
  field: string,
  valueMode: ValueMode = "integer"
): {
  minRangeQueryValue: number | null;
  maxRangeQueryValue: number | null;
} {
  const rangeQueries = query.getKeyValues(field);
  const minQuery = rangeQueries.find((query) => query.startsWith("gte:"));
  const maxQuery = rangeQueries.find((query) => query.startsWith("lte:"));
  const minQueryValue = minQuery ? parseFloat(minQuery.split(":")[1]) : null;
  const maxQueryValue = maxQuery ? parseFloat(maxQuery.split(":")[1]) : null;
  return {
    minRangeQueryValue: minQueryValue
      ? scaleToInteger(minQueryValue, valueMode)
      : null,
    maxRangeQueryValue: maxQueryValue
      ? scaleToInteger(maxQueryValue, valueMode)
      : null,
  };
}
