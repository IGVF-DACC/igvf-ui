/**
 * Displays a grid of data when given an array specially formatted for this purpose. The displayed
 * grid uses CSS * grid (https://developer.mozilla.org/en-US/docs/Web/CSS/grid). See
 * components/docs/data-grid.md for documentation. As you make changes to this file, please keep
 * the documentation up to date.
 */

import PropTypes from "prop-types";
import { forwardRef } from "react";

/**
 * Default data grid cell. Custom data grid cells can use wrap or replace this; whatever they
 * choose.
 */
function DefaultCell({ children }) {
  return (
    <div className="flex h-full w-full bg-white p-2 dark:bg-gray-900">
      {children}
    </div>
  );
}

/**
 * Surround the <DataGrid> component with this wrapper component, or a custom one like it. Note
 * the use of CSS outlines instead of borders as all other panels use. This prevents Safari (12.4
 * at the time of writing) from allowing the table to scroll horizontally even if you can see the
 * entire table.
 */
export const DataGridContainer = forwardRef(function DataGridContainer(
  { className = "", children },
  ref
) {
  return (
    <div
      ref={ref}
      role="table"
      className={`border-1 grid w-full gap-px overflow-x-auto border border-panel bg-gray-300 text-sm dark:outline-gray-700 dark:bg-gray-700${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </div>
  );
});

DataGridContainer.propTypes = {
  // Extra Tailwind CSS classes to apply to the container
  className: PropTypes.string,
};

/**
 * Main data-grid interface.
 */
export default function DataGrid({
  data,
  CellComponent = DefaultCell,
  startingRow = 1,
  startingCol = 1,
  meta = {},
}) {
  let rowLine = startingRow;
  return data.reduce((acc, row) => {
    // Render the cells of a row.
    let colLine = startingCol;
    const childCount = row.children?.length || 1;
    const CellWrapper = row.RowComponent || CellComponent;
    const rowRenders = row.cells.map((cell, index) => {
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
          <CellWrapper
            rowId={row.id}
            cells={row.cells}
            cellIndex={index}
            meta={meta}
          >
            {typeof cell.content === "function"
              ? cell.content(cell, meta)
              : cell.content}
          </CellWrapper>
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
        Cell={CellComponent}
        startingRow={rowLine}
        startingCol={colLine}
      />
    ) : null;
    rowLine += childCount;
    return acc.concat(rowRenders).concat(children);
  }, []);
}

DataGrid.propTypes = {
  // The data to render in the data-grid form
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      cells: PropTypes.arrayOf(
        PropTypes.shape({
          content: PropTypes.any,
          columns: PropTypes.number,
        })
      ).isRequired,
      children: PropTypes.array,
    })
  ).isRequired,
  // Component to render all cells in matrix unless specifically overridden
  CellComponent: PropTypes.func,
  // Starting CSS grid row number; used for recursive rendering
  startingRow: PropTypes.number,
  // Starting CSS grid column number; used for recursive rendering
  startingCol: PropTypes.number,
  // Extra metadata to pass to custom cell renderers
  meta: PropTypes.object,
};
