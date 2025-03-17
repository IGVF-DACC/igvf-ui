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
  /** Rows to the right vertically spanned by this cell */
  childRows?: Row[];
  /** Number of columns to span */
  colSpan?: number;
  /** True if the cell is a header cell, usually for vertical headers; false for a data cell */
  isHeaderCell?: boolean;
  /** Number of rows spanned by this cell. Internal use */
  _rowSpan?: number;
  /** All cells within a single HTML table row share the same ID. Internal use */
  _htmlRowId?: number;
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
 * either only header rows or only data rows. The order of the rows is preserved. For example, if
 * the input rows are:
 *   [header, data, header, header, data, data]
 * the output will be:
 *   [[header], [data], [header, header], [data, data]].
 * In the result, you can tell whether a segment is for header rows or data rows by checking the
 * `isHeaderRow` property of the first row in the segment.
 * @param rows - The array of rows to split.
 * @returns Array of arrays of rows, where each inner array contains either only header rows or
 *     only data rows.
 */
export function splitRowsIntoSegments(
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

/**
 * Calculate the number of rows spanned by the given cell. If the cell has child rows, the result
 * includes the number of rows spanned by each child row, and the children of the cells in the
 * child rows, and so on.
 * @param cell - Cell to calculate the row span for
 * @returns The number of rows spanned by the cell
 */
export function calculateRowSpan(cell: Cell): number {
  if (cell.childRows?.length > 0) {
    return cell.childRows.reduce(
      (acc, row) => acc + calculateRowSpan(row.cells[0]),
      0
    );
  }
  return 1;
}

/**
 * Collects all rows within a segment (header/data) and flattens them into a single array of cells.
 * It adds `_htmlRowId` to each cell to indicate which HTML row it belongs to. This lets
 * `<DataTable>` to split this flat array of cells into HTML rows. It also adds `_rowSpan` to each
 * cell to indicate how many rows it spans.
 * @param rows Rows within a segment (header/data) to flatten
 * @param htmlRowId Segment number to split cells into HTML rows
 * @returns Flattened array of cells with updated segment number
 */
export function flattenCells(
  rows: Row[],
  htmlRowId = 0
): { rows: Cell[]; updatedSegment: number } {
  const tableCells: Cell[] = [];
  let lastCellHasChildRows = true;

  rows.forEach((row) => {
    row.cells.forEach((cell, i) => {
      cell._rowSpan = calculateRowSpan(cell);
      if (!lastCellHasChildRows && i === 0) {
        htmlRowId += 1;
      }
      cell._htmlRowId = htmlRowId;

      tableCells.push(cell);
      if (cell.childRows?.length > 0) {
        const { rows: childRowCells, updatedSegment } = flattenCells(
          cell.childRows,
          htmlRowId
        );
        tableCells.push(...childRowCells);
        htmlRowId = updatedSegment;
      }

      lastCellHasChildRows = Boolean(cell.childRows);
    });
  });
  return { rows: tableCells, updatedSegment: htmlRowId + 1 };
}
