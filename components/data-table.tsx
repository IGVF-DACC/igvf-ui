// node_modules
import _ from "lodash";
// lib
import {
  flattenCells,
  splitRowsIntoSegments,
  type Cell,
  type DataTableFormat,
} from "../lib/data-table";

/**
 * Utility component to for `DataTable` clients to render a data cell with extra Tailwind CSS
 * classes.
 * @param className - The extra Tailwind CSS classes to apply to the cell
 */
export function DataCellWithClasses({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <td className={`min-w-40 border border-panel p-2 align-top ${className}`}>
      {children}
    </td>
  );
}

/**
 * Default component to render a header cell.
 * @param rowSpan - The number of rows this cell spans
 * @param colSpan - The number of columns this cell spans
 */
function DefaultHeaderCell({
  rowSpan,
  colSpan,
  children,
}: {
  rowSpan: number;
  colSpan: number;
  children: string | number | React.ReactNode;
}) {
  return (
    <th
      className="sticky top-0 z-[2] border-b border-r border-panel bg-table-header-cell p-2 text-left align-bottom last:border-r-0"
      {...(rowSpan > 1 ? { rowSpan } : {})}
      {...(colSpan > 1 ? { colSpan } : {})}
    >
      {children}
    </th>
  );
}

/**
 * Default component to render a data cell, i.e. a cell that is not a header cell.
 * @param rowSpan - The number of rows this cell spans
 * @param colSpan - The number of columns this cell spans
 * @param children - The content of the cell
 */
function DefaultDataCell({
  rowSpan,
  colSpan,
  children,
}: {
  rowSpan: number;
  colSpan: number;
  children: string | number | React.ReactNode;
}) {
  return (
    <td
      className="border-b border-r border-panel bg-table-data-cell p-2 align-top last:border-r-0"
      {...(rowSpan > 1 ? { rowSpan } : {})}
      {...(colSpan > 1 ? { colSpan } : {})}
    >
      {children}
    </td>
  );
}

/**
 * Wraps header rows in a thead element.
 */
function HeaderRowsWrapper({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}

/**
 * Wraps non-header rows in a tbody element.
 */
function DataRowsWrapper({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

/**
 * Render a single HTML row of the table. This doesn't necessarily correspond to a single row in
 * the data because each row can have multiple child rows. That's why you pass in the cells that
 * comprise an HTML row and not the data rows themselves.
 * @param cells - The cells that make up the HTML row
 * @param isHeaderSegment - True if the HTML row is a header row
 */
function SingleRow({
  cells,
  isHeaderSegment,
}: {
  cells: Cell[];
  isHeaderSegment: boolean;
}) {
  return (
    <tr className="[&>td]:last:border-b-0 last:[&>td]:border-r-0">
      {cells.map((cell) => {
        const DefaultCellWrapper =
          isHeaderSegment || cell.isHeaderCell
            ? DefaultHeaderCell
            : DefaultDataCell;
        const CellComponent = cell.component || DefaultCellWrapper;

        return (
          <CellComponent
            key={cell.id}
            rowSpan={cell._rowSpan}
            colSpan={cell.colSpan}
            {...cell.componentProps}
          >
            {cell.content}
          </CellComponent>
        );
      })}
    </tr>
  );
}

/**
 * Main component to render a data table.
 * @param data - The data to render including the rows and their child rows
 */
export function DataTable({ data }: { data: DataTableFormat }) {
  const rowsSegments = splitRowsIntoSegments(data);

  return (
    <div className="max-h-[90vh] w-fit overflow-auto border border-panel">
      <table className="min-w-max table-fixed">
        {rowsSegments.map((rows) => {
          const { rows: flattenedCells } = flattenCells(rows);
          const htmlTableRows = _.groupBy(flattenedCells, "_htmlRowId");

          // Now we're in a contiguous segment of rows that are all header rows or all data rows.
          const isHeaderSegment = rows[0].isHeaderRow;
          const SegmentWrapper = isHeaderSegment
            ? HeaderRowsWrapper
            : DataRowsWrapper;

          return (
            <SegmentWrapper key={rows[0].id}>
              {Object.entries(htmlTableRows).map(([rowId, rowCells]) => {
                return (
                  <SingleRow
                    key={rowId}
                    cells={rowCells}
                    isHeaderSegment={isHeaderSegment}
                  />
                );
              })}
            </SegmentWrapper>
          );
        })}
      </table>
    </div>
  );
}
