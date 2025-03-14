// node_modules
import _ from "lodash";
// root
import type { MatrixBucket } from "../globals.d";

/**
 * Maps a column label to its 0-based column index in the matrix.
 */
export type ColumnMap = {
  [key: string]: number;
};

/**
 * Generate a map of column labels to their 0-based column index. Each label appears as a key in
 * the returned object, with the value being the index of the corresponding column in the matrix.
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
