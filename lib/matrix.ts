// node_modules
import _ from "lodash";
// root
import type { SearchResults } from "../globals";

/**
 * Format of a single bucket in matrix search results. Each bucket represents a single cell's value
 * in the matrix, or a row of buckets containing the cells of a row.
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
  group_by: string | string[];
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
 * Check if a value is a MatrixBucketWrapper. A MatrixBucketWrapper is an object that contains
 * the properties `doc_count_error_upper_bound`, `sum_other_doc_count`, and `buckets`, where
 * `buckets` is an array of MatrixBucket objects.
 *
 * @param value -
 * @returns
 */
export function isMatrixBucketWrapper(
  value: unknown
): value is MatrixBucketWrapper {
  return (
    typeof value === "object" &&
    value !== null &&
    "doc_count_error_upper_bound" in value &&
    typeof value.doc_count_error_upper_bound === "number" &&
    "sum_other_doc_count" in value &&
    typeof value.sum_other_doc_count === "number" &&
    "buckets" in value &&
    Array.isArray(value.buckets)
  );
}

export function getMatrixBucketWrapper(
  object: MatrixAxis | MatrixBucket,
  property: string
): MatrixBucketWrapper {
  const value = object[property];

  if (!isMatrixBucketWrapper(value)) {
    throw new Error(`Expected "${property}" to contain a MatrixBucketWrapper`);
  }

  return value;
}
