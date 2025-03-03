// node_modules
import _ from "lodash";
// lib
import {
  flattenCells,
  splitRowsIntoSegments,
  type Cell,
  type DataTableFormat,
} from "../lib/data-table";

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
      className="sticky top-0 z-[2] min-w-40 border-b border-r border-panel bg-table-header-cell p-2 text-left align-bottom last:border-r-0"
      {...(rowSpan > 1 ? { rowSpan } : {})}
      {...(colSpan > 1 ? { colSpan } : {})}
    >
      {children}
    </th>
  );
}

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
      className="min-w-40 border-b border-r border-panel bg-table-data-cell p-2 align-top last:border-r-0"
      {...(rowSpan > 1 ? { rowSpan } : {})}
      {...(colSpan > 1 ? { colSpan } : {})}
    >
      {children}
    </td>
  );
}

function HeaderRowsWrapper({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}

function DataRowsWrapper({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

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

export function DataTable({ data }: { data: DataTableFormat }) {
  const rowsSegments = splitRowsIntoSegments(data);

  return (
    <div className="max-h-[90vh] overflow-auto border border-panel">
      <table>
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
