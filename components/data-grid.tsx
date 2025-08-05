/**
 * Displays a grid of data when given an array specially formatted for this purpose. The displayed
 * grid uses CSS * grid (https://developer.mozilla.org/en-US/docs/Web/CSS/grid). See
 * components/docs/data-grid.md for documentation. As you make changes to this file, please keep
 * the documentation up to date.
 */

// node_modules
import { forwardRef } from "react";
// lib
import { type DataGridFormat } from "../lib/data-grid";

/**
 * Default data grid cell. Custom data grid cells can use wrap or replace this.
 */
function DefaultCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full bg-white p-2 dark:bg-gray-900">
      {children}
    </div>
  );
}

/**
 * Surround the `<DataGrid>` component with this wrapper component, or a custom one like it. Note
 * the use of CSS outlines instead of borders as all other panels use. This prevents Safari (12.4
 * at the time of writing) from allowing the table to scroll horizontally even if you can see the
 * entire table.
 */
export const DataGridContainer = forwardRef(function DataGridContainer(
  {
    className = "",
    role = "grid",
    children,
  }: { className?: string; role?: string; children: React.ReactNode },
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      role={role}
      className={`border-panel grid w-full gap-px overflow-x-auto border bg-gray-300 text-sm dark:outline-gray-700 dark:bg-gray-700${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </div>
  );
});

/**
 * Main data-grid interface.
 * @param data Data to render in the data grid
 * @param CellComponent Component to render all cells in matrix unless specifically overridden
 * @param startingRow Starting CSS grid row number; used for recursive rendering
 * @param startingCol Starting CSS grid column number; used for recursive rendering
 * @param meta Extra metadata to pass to custom cell renderers
 */
export default function DataGrid({
  data,
  CellComponent = DefaultCell,
  startingRow = 1,
  startingCol = 1,
  meta = {},
}: {
  data: DataGridFormat;
  CellComponent?: React.ComponentType<any>;
  startingRow?: number;
  startingCol?: number;
  meta?: object;
}) {
  let rowLine = startingRow;
  return data.reduce((acc, row) => {
    // Render the cells of a row.
    let colLine = startingCol;
    const childCount = row.children?.length || 1;
    const CellWrapper = row.RowComponent || CellComponent;
    const rowRenders = row.cells.map((cell, index) => {
      // The cell could contain a simple type or a React component.
      let CellRenderer;
      let cellContent;
      if (typeof cell.content === "function") {
        CellRenderer = cell.content;
        cellContent = (
          <CellRenderer id={cell.id} source={cell.source} meta={meta} />
        );
      } else {
        cellContent = cell.content;
      }

      // Render a single cell.
      const rowRender = (
        <div
          key={`${row.id}-${cell.id}`}
          style={{
            gridRow: `${rowLine} / ${rowLine + childCount}`,
            gridColumn: `${colLine} / ${colLine + (cell.columns || 1)}`,
          }}
          role={cell.role || "cell"}
        >
          {cell.noWrapper ? (
            cellContent
          ) : (
            <CellWrapper
              rowId={row.id}
              cells={row.cells}
              cellIndex={index}
              meta={meta}
            >
              <>{cellContent}</>
            </CellWrapper>
          )}
        </div>
      );
      colLine += cell.columns || 1;
      return rowRender;
    });

    // Render the child rows of the row, if any, recursively.
    const children = row.children ? (
      <DataGrid
        key={`${row.id}-children`}
        data={row.children}
        CellComponent={CellComponent}
        startingRow={rowLine}
        startingCol={colLine}
        meta={meta}
      />
    ) : null;
    rowLine += childCount;
    return acc
      .concat(
        <div key={row.id} className="group contents">
          {rowRenders}
        </div>
      )
      .concat(children);
  }, []);
}
