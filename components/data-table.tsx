// node_modules
import { Fragment } from "react";
// lib
import {
  calculateRowSpan,
  splitRowsIntoSegments,
  type DataTableFormat,
  type Row,
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
  children,
}: {
  rowSpan: number;
  children: string | number | React.ReactNode;
}) {
  return (
    <th
      className="sticky top-0 z-[2] min-w-40 border-b border-r border-panel bg-table-header-cell p-2 text-left align-bottom last:border-r-0"
      {...(rowSpan > 1 ? { rowSpan } : {})}
    >
      {children}
    </th>
  );
}

function DefaultDataCell({
  rowSpan,
  children,
}: {
  rowSpan: number;
  children: string | number | React.ReactNode;
}) {
  return (
    <td
      className="min-w-40 border-b border-r border-panel bg-table-data-cell p-2 align-top last:border-r-0"
      {...(rowSpan > 1 ? { rowSpan } : {})}
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

function TableRow({ children }: { children: React.ReactNode }) {
  return <tr>{children}</tr>;
}

function RemainderRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function SingleRow({
  row,
  isFirstRow,
  isHeaderSegment,
}: {
  row: Row;
  isFirstRow: boolean;
  isHeaderSegment: boolean;
}) {
  const RowWrapper = isFirstRow ? RemainderRow : TableRow;
  return (
    <RowWrapper>
      {row.cells.map((cell) => {
        const DefaultCellWrapper =
          isHeaderSegment || cell.isHeaderCell
            ? DefaultHeaderCell
            : DefaultDataCell;
        const CellComponent = cell.component || DefaultCellWrapper;
        const rowSpan = calculateRowSpan(cell);

        return (
          <Fragment key={cell.id}>
            <CellComponent
              rowSpan={rowSpan}
              key={cell.id}
              {...cell.componentProps}
            >
              {cell.content}
            </CellComponent>
            {cell.childRows && (
              <>
                {cell.childRows.map((childRow, i) => {
                  return (
                    <SingleRow
                      key={childRow.id}
                      row={childRow}
                      isFirstRow={i === 0}
                      isHeaderSegment={isHeaderSegment}
                    />
                  );
                })}
              </>
            )}
          </Fragment>
        );
      })}
    </RowWrapper>
  );
}

export function DataTable({ data }: { data: DataTableFormat }) {
  const rowsSegments = splitRowsIntoSegments(data);

  return (
    <table>
      {rowsSegments.map((rows) => {
        // Now we're in a contiguous segment of rows that are all header rows or all data rows.
        const isHeaderSegment = rows[0].isHeaderRow;
        const SegmentWrapper = isHeaderSegment
          ? HeaderRowsWrapper
          : DataRowsWrapper;

        return (
          <SegmentWrapper key={rows[0].id}>
            {rows.map((row) => {
              return (
                <SingleRow
                  key={row.id}
                  row={row}
                  isFirstRow={false}
                  isHeaderSegment={isHeaderSegment}
                />
              );
            })}
          </SegmentWrapper>
        );
      })}
    </table>
  );
}
