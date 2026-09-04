/**
 * Represents a single cell within a row in a data table.
 *
 * @property id - ID for the cell, unique among all cells in one row
 * @property content - Content of the cell; it can be a React node as well
 * @property component - React component to render the cell instead of the default
 * @property componentProps - Extra props to pass to `component`
 * @property childRows - Rows to the right vertically spanned by this cell
 * @property colSpan - Number of columns to span
 * @property isHeaderCell - True if the cell is a header cell, usually for vertical headers; false
 *                          for a data cell
 * @property _rowSpan - Number of rows spanned by this cell. Internal use
 * @property _htmlRowId - All cells within a single HTML table row share the same ID. Internal use
 */
export type Cell = {
  id: string;
  content: string | number | React.ReactNode;
  component?: React.ElementType;
  componentProps?: Record<string, unknown>;
  childRows?: Row[];
  colSpan?: number;
  isHeaderCell?: boolean;
  _rowSpan?: number;
  _htmlRowId?: number;
};

/**
 * Props supplied to custom cell components by `DataTable`.
 */
type InjectedCellComponentProps = "children" | "rowSpan" | "colSpan" | "meta";

/**
 * Get the props callers must supply for a custom cell component. Only include the props that are
 * not injected by `DataTable`.
 */
type CustomCellComponentProps<TComponent extends React.ElementType> = Omit<
  React.ComponentProps<TComponent>,
  InjectedCellComponentProps
>;

/**
 * Determine which values can be used as the cell's `content`. If the custom component declares a
 * `children` prop, infer its type so `content` must satisfy that component's requirements. For a
 * component without an explicit `children` prop, allow any React content.
 */
type CustomCellContent<TComponent extends React.ElementType> =
  React.ComponentProps<TComponent> extends { children: infer TContent }
    ? TContent
    : React.ReactNode;

/**
 * Cell definition whose component and custom props are checked together before being stored as a
 * heterogeneous `Cell`.
 */
type CustomCell<TComponent extends React.ElementType> = Omit<
  Cell,
  "component" | "componentProps" | "content"
> & {
  component: TComponent;
  content: CustomCellContent<NoInfer<TComponent>>;
  componentProps: CustomCellComponentProps<NoInfer<TComponent>>;
};

/**
 * Create a cell with type-checked content and custom component props. `DataTable` injects
 * `children`, `rowSpan`, `colSpan`, and `meta`; callers provide every other component prop.
 *
 * @param cell - Custom cell definition to create a type-checked cell from
 */
export function createCell<TComponent extends React.ElementType>(
  cell: CustomCell<TComponent>
): Cell {
  return cell as unknown as Cell;
}

/**
 * Represents a single row in a data table.
 *
 * @property id - ID for the row, unique among all rows
 * @property cells - Cells in the row
 * @property isHeaderRow - True if the row is a header row, false or undefined for a data row
 */
export type Row = {
  id: string;
  cells: Cell[];
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
 *
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
 *
 * @param cell - Cell to calculate the row span for
 * @returns Number of rows spanned by the cell
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
 *
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
