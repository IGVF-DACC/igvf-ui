// node_modules
import _ from "lodash";
// lib
import { Cell } from "./data-table";
// root
import type { SearchResults } from "../globals";

/**
 * Format of a single bucket in matrix search results. Each bucket represents a single cell's value
 * in the matrix, or a row of buckets containing the cells of a row. Use `unknown` for the index
 * signature because Typescript has no way to correctly type index signatures within an object.
 * Instead, use the `isMatrixBucketWrapper` type guard to safely check if an object is a
 * `MatrixBucketWrapper` and type it correctly.
 *
 * @property key - Title for the column containing the bucket's cell, or the title for the row
 *                 containing the bucket's cells
 * @property doc_count - Number of cells in the bucket
 * @property [key: string] - Each key is a title for a column containing the bucket's cell, and its
 *                           value is a `MatrixBucketWrapper` object that contains the buckets for
 *                           each unique value in the column. Use `getMatrixBucketWrapper` to safely
 *                           access the `MatrixBucketWrapper` for a given row or column.
 */
export type MatrixBucket = {
  key: string;
  doc_count: number;
  [key: string]: unknown;
};

/**
 * Format of the wrapper object that contains the buckets for each column title, as well as the
 * buckets for each row.
 *
 * @property doc_count_error_upper_bound - Unused
 * @property sum_other_doc_count - Unused
 * @property buckets - Array of `MatrixBucket` objects, each representing a unique value in the axis
 */
export type MatrixBucketWrapper = {
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
  buckets: MatrixBucket[];
};

/**
 * The `group_by` property in the `LabData` object can contain a single string, an array of strings, or
 * an array of any combination of strings and arrays of strings.
 */
export type GroupByValue = string | Array<string | string[]>;

/**
 * Format of the x- and y-axis data in matrix search results. The index signature always has a key
 * equal to a value from the `group_by` property, and its value is a `MatrixBucketWrapper` object
 * that contains the buckets for each unique value in the axis.
 *
 * `unknown` is used here because of Typescript limitations with index signatures. Use the
 * `getMatrixBucketWrapper` function to safely access the `MatrixBucketWrapper` for a given matrix
 * axis.
 *
 * @property group_by - Field used to group the data in the axis
 * @property doc_count - Not useful at the axis level
 * @property label - Optional label for the axis
 * @property [key: string] - `key` has a value from `group_by` and its value has the
 *                           `MatrixBucketWrapper` type, which contains the buckets for each unique
 *                           value in the axis
 */
export type MatrixAxis = {
  group_by: GroupByValue;
  doc_count: number;
  label?: string;
  [key: string]: unknown;
};

/**
 * Format of the `matrix` property in matrix search results, which contains the x- and y-axis data.
 *
 * @property x - x-axis data for the matrix
 * @property y - y-axis data for the matrix
 */
export type MatrixResultsObject = {
  x: MatrixAxis;
  y: MatrixAxis;
};

/**
 * Matrix data as returned from matrix endpoints, which includes the `matrix` property in addition
 * to the standard search results properties, such as `facets`.
 *
 * @property matrix - x- and y-axis data for the matrix
 */
export interface MatrixResults extends SearchResults {
  matrix: MatrixResultsObject;
}

/**
 * Maps a column label to its 0-based column index in the matrix.
 */
export type ColumnMap = {
  [key: string]: number;
};

/**
 * Generate a map of column labels to their 0-based column index. Each label appears as a key in
 * the returned object, with the value being the index of the corresponding column in the matrix.
 *
 * @param columnBuckets - Buckets for the x-axis of the matrix
 * @param excludeColumns - List of column labels to exclude from the map
 * @returns Map of column labels to their 0-based column index
 */
export function generateMatrixColumnMap(
  columnBuckets: MatrixBucket[],
  excludeColumns: string[] = []
): ColumnMap {
  const filteredBuckets = columnBuckets.filter(
    (bucket) => !excludeColumns.includes(bucket.key)
  );

  const sortedBuckets = _.sortBy(filteredBuckets, (bucket) =>
    bucket.key.toLowerCase()
  );
  return sortedBuckets.reduce((acc, bucket, i) => {
    const column = { [bucket.key]: i };
    return { ...acc, ...column };
  }, {});
}

/**
 * Check if a value has the form of a MatrixBucketWrapper object.
 *
 * @param value - Value to check
 * @returns True if the value has the form of a MatrixBucketWrapper object
 */
export function isMatrixBucketWrapper(
  value: unknown
): value is MatrixBucketWrapper {
  return (
    typeof value === "object" &&
    value !== null &&
    "buckets" in value &&
    Array.isArray(value.buckets)
  );
}

/**
 * Get the group-by property names for a matrix axis. You need these names to access the buckets of
 * that axis, as well as the nested buckets, if that applies to the given axis.
 *
 * Sometimes an element of the `group_by` array is itself an array of strings, which happens when
 * `group_by` includes a tuple that allows the matrix to contain entries for objects that have no
 * value for the `group_by` property. In that case, only the first element of that tuple is used as
 * the group-by property name. The `key` of the bucket in the returned data equals the second
 * element of the tuple.
 *
 * If the axis has no nested buckets, the returned property name is returned as a single-element
 * array.
 *
 * @param axis - Contents of the `x` or `y` axis of matrix data
 * @returns Group-by property names for that axis in grouping layer order
 */
export function getMatrixAxisGroups(axis: MatrixAxis): string[] {
  const groupBy = axis.group_by;

  if (Array.isArray(groupBy)) {
    // Handle the case where `group_by` is an array of strings or tuples. Return just the first element
    // of any tuples.
    return groupBy
      .map((item) =>
        Array.isArray(item) && typeof item[0] === "string" ? item[0] : item
      )
      .filter((item): item is string => typeof item === "string");
  }
  if (typeof groupBy === "string") {
    return [groupBy];
  }
  return [];
}

/**
 * Get the buckets for a specific property of a matrix axis or a bucket. Both axes and buckets use
 * the same structure for storing buckets.
 *
 * @param data - Contents of the `x` or `y` axis of matrix data or a bucket
 * @param bucketsProperty - Name of the property that contains the buckets
 * @returns Array of MatrixBucket objects for the specified property
 */
export function getMatrixBuckets(
  data: MatrixAxis | MatrixBucket,
  bucketsProperty: string
): MatrixBucket[] {
  const wrapper = data[bucketsProperty];
  return isMatrixBucketWrapper(wrapper) ? wrapper.buckets : [];
}

/**
 * Generates an array of empty data cells for a row in the data grid. Pass the number of data cells
 * in the `length` parameter. Don't include any Y-axis header cells. Each cell has an `id` of the
 * form `empty-<index>`, so you will likely need to overwrite both this and `content` when
 * populating the row with actual data.
 *
 * This is a data-grid function more than a matrix function, but it's really only useful for matrix data.
 *
 * @param length - Number of data cells in the row
 * @returns Array of cells that would render as empty
 */
export function generateEmptyRowCells(length: number): Cell[] {
  return Array(length)
    .fill(null)
    .map((_, i) => ({
      id: `empty-${i}`,
      content: "",
    }));
}
