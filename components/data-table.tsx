// node_modules
import _ from "lodash";
import { twMerge } from "tailwind-merge";
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
 *
 * @param className - Extra Tailwind CSS classes to apply to the cell
 */
export function DataCellWithClasses({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <td className={`border-panel min-w-40 border p-2 align-top ${className}`}>
      {children}
    </td>
  );
}

/**
 * Default component to render a header cell.
 *
 * @param rowSpan - Number of rows this cell spans
 * @param colSpan - Number of columns this cell spans
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
      className="border-panel bg-table-header-cell sticky top-0 z-2 border-r border-b p-2 text-left align-bottom last:border-r-0"
      {...(rowSpan > 1 ? { rowSpan } : {})}
      {...(colSpan > 1 ? { colSpan } : {})}
    >
      {children}
    </th>
  );
}

/**
 * Default component to render a data cell, i.e. a cell that is not a header cell.
 *
 * @param rowSpan - Number of rows this cell spans
 * @param colSpan - Number of columns this cell spans
 * @param children - Content of the cell
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
      className="border-panel bg-table-data-cell border-r border-b p-2 align-top last:border-r-0"
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
 *
 * @param cells - Cells that make up the HTML row
 * @param isHeaderSegment - True if the HTML row is a header row
 * @param isLastTableRow - True if this is the final rendered row in the table
 * @param meta - Metadata object passed through to custom cell components
 */
function SingleRow<TMeta = unknown>({
  cells,
  isHeaderSegment,
  isLastTableRow,
  meta,
}: {
  cells: Cell[];
  isHeaderSegment: boolean;
  isLastTableRow: boolean;
  meta?: TMeta;
}) {
  return (
    <tr
      className={`[&>td]:last:border-r-0 ${isLastTableRow ? "[&>td]:border-b-0" : ""}`}
    >
      {cells.map((cell) => {
        const DefaultCellWrapper =
          isHeaderSegment || cell.isHeaderCell
            ? DefaultHeaderCell
            : DefaultDataCell;
        const CellComponent = cell.component || DefaultCellWrapper;

        // Pass meta only to custom components, not to default components
        const cellProps = cell.component
          ? {
              rowSpan: cell._rowSpan,
              colSpan: cell.colSpan,
              meta,
              ...cell.componentProps,
            }
          : {
              rowSpan: cell._rowSpan,
              colSpan: cell.colSpan,
              ...cell.componentProps,
            };

        return (
          <CellComponent key={cell.id} {...cellProps}>
            {cell.content}
          </CellComponent>
        );
      })}
    </tr>
  );
}

/**
 * Main component to render a data table.
 *
 * @param data - The data to render including the rows and their child rows
 * @param meta - Metadata object passed through to custom cell components
 * @param className - Additional CSS classes to apply to the `<table>` element
 */
export function DataTable<TMeta = unknown>({
  data,
  meta,
  className,
}: {
  data: DataTableFormat;
  meta?: TMeta;
  className?: string;
}) {
  const rowsSegments = splitRowsIntoSegments(data);

  return (
    <div className="border-panel max-h-[90vh] w-fit overflow-auto border">
      <table
        className={twMerge(
          "min-w-max table-fixed border-separate border-spacing-0",
          className
        )}
      >
        {rowsSegments.map((rows, segmentIndex) => {
          const { rows: flattenedCells } = flattenCells(rows);
          const htmlTableRows = _.groupBy(flattenedCells, "_htmlRowId");
          const tableRows = Object.entries(htmlTableRows);

          // Now we're in a contiguous segment of rows that are all header rows or all data rows.
          const isHeaderSegment = rows[0].isHeaderRow;
          const SegmentWrapper = isHeaderSegment
            ? HeaderRowsWrapper
            : DataRowsWrapper;

          return (
            <SegmentWrapper key={rows[0].id}>
              {tableRows.map(([rowId, rowCells], rowIndex) => {
                return (
                  <SingleRow
                    key={rowId}
                    cells={rowCells}
                    isHeaderSegment={isHeaderSegment}
                    isLastTableRow={
                      segmentIndex === rowsSegments.length - 1 &&
                      rowIndex === tableRows.length - 1
                    }
                    meta={meta}
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
