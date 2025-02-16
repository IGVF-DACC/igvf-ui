/**
 * Represents a single cell within a row in a data table.
 */
export type Cell = {
  /** ID for the cell, unique among all cells in one row */
  id: string;
  /** Content of the cell; it can be a React node as well */
  content: string | number | React.ReactNode;
  /** React component to render the cell instead of the default */
  component?: React.ComponentType<{
    children: string | number | React.ReactNode;
  }>;
  /** Extra props to pass to `component` */
  componentProps?: Record<string, unknown>;
  /** True if the cell is a header cell, usually for vertical headers; false for a data cell */
  isHeaderCell?: boolean;
};

/**
 * Represents a single row in a data table.
 */
export type Row = {
  /** ID for the row, unique among all rows */
  id: string;
  /** Cells in the row */
  cells: Cell[];
  /** True if the row is a header row, false for a data row */
  isHeaderRow?: boolean;
};

/**
 * Single type to represent all the rows of a data table.
 */
export type DataTableFormat = Row[];

/**
 * Split the given array of rows into segments (arrays) of arrays of rows. Each segment contains
 * either only header rows or only data rows. The order of the rows is preserved.
 * @param rows - The array of rows to split.
 * @returns Array of arrays of rows, where each inner array contains either only header rows or
 *     only data rows.
 */
export function splitHeaderAndDataRows(
  rows: DataTableFormat
): DataTableFormat[] {
  let headerRows: Row[] = [];
  let dataRows: Row[] = [];
  const result: DataTableFormat[] = [];

  for (const row of rows) {
    if (row.isHeaderRow) {
      headerRows.push(row);

      // If we had been collecting data rows, add them all to the result and reset the data rows.
      if (dataRows.length > 0) {
        result.push(dataRows);
        dataRows = [];
      }
    } else {
      dataRows.push(row);

      // If we had been collecting header rows, add them all to the result and reset the header rows.
      if (headerRows.length > 0) {
        result.push(headerRows);
        headerRows = [];
      }
    }
  }

  // Add remaining header and data rows to the result. We can do this in either order because if
  // the table ends in header rows, `dataRows` is empty.
  if (headerRows.length > 0) {
    result.push(headerRows);
  }
  if (dataRows.length > 0) {
    result.push(dataRows);
  }
  return result;
}
