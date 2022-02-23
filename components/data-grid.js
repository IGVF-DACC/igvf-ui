/**
 * The <DataGrid> component renders a generic grid (table, matrix, etc.) of data that allows row
 * and column spans, and using the CSS grid feature rather than HTML tables.
 *
 * DATA FORMAT
 * You must format the data for the grid (henceforth referred to as "data-grid format") as an array
 * of objects in this high-level form:
 *
 * [
 *   { data for first row of the grid },
 *   { data for second row of the grid },
 *   ...
 * ]
 *
 * Define each row's data object this way:
 *
 * {
 *   id: "unique ID for each row; used as React key",
 *   cells: [
 *     { data for first cell in the row },
 *     { data for second cell in the row },
 *     ...
 *   ],
 * }
 *
 * Define each cell's data object this way:
 *
 * {
 *   id: "unique ID for each cell within a row; used as React key",
 *   content: { content of the cell },
 * }
 *
 * The cell `id` must have a unique value only within a single row. Cells on different rows can
 * have the same `id` value.
 *
 * The `content` of a cell can comprise a string, a number, a JSX element, or React component. Pass
 * any data in any props you need to your own React components. This shows an example of a two-by-
 * two grid in data-grid format.
 *
 * [
 *   {
 *     id: "first-row",
 *     cells: [
 *       { id: "first-cell", content: "1" },
 *       { id: "second-cell", content: <div>2</div> },
 *     ],
 *   },
 *   {
 *     id: "second-row",
 *     cells: [
 *       { id: "first-cell", content: <ExampleCellComponent data={1} />,
 *       { id: "second-cell", content: <ExampleCellComponent data={2} />,
 *     ],
 *   },
 * ]
 *
 * COLUMN SPANS
 * Individual cells can span multiple columns using the `columns` property, as the third, optional
 * property on a cell object, e.g. with this `cells` array:
 *
 * cells: [
 *   { id: "normal-cell", content: "1" },
 *   { id: "three-column-cell, content: "2", columns: 3 },
 * ]
 *
 * ROW SPANS
 * A row can span multiple rows using a `children` property that itself contains multiple rows,
 * such as this example that has three columns, with the first column spanning two rows:
 *
 * [
 *   {
 *     id: "two-row-span",
 *     cells: [
 *       { id: "span-cell", content: "Spans two rows" },
 *     ],
 *     children: [
 *       {
 *         id: "first-sub-row",
 *         cells: [
 *           { id: "sub-row-cell-1", content: "1" },
 *           { id: "sub-row-cell-2", content: "2" },
 *         ],
 *       },
 *       {
 *         id: "second-sub-row",
 *         cells: [
 *           { id: "sub-row-cell-1", content: "3" },
 *           { id: "sub-row-cell-2", content: "4" },
 *         ],
 *       },
 *     ],
 *   }
 * ]
 *
 * This produces a grid that looks like:
 * +----------------+-------+
 * |                | 1 | 2 |
 * | Spans two rows +-------+
 * |                | 3 | 4 |
 * +----------------+-------+
 *
 * ROW COMPONENTS
 * Custom React components can render individual cells as seen above, but you can define a single
 * component that renders each cell within an entire row through the `RowComponent` property of a
 * row object, as in this single-row data-grid format array:
 *
 * [
 *   {
 *     id: "header-row",
 *     cells: [
 *       { id: "header-left", content: "Left" },
 *       { id: "header-right", content: "Right" },
 *     ],
 *     RowComponent: HeaderRowComponent,
 *   },
 * ]
 *
 * `RowComponent` receives several props to help it render data. This shows an example
 * `RowComponent` React component:
 *
 * const HeaderRowComponent = ({ rowId, cells, cellIndex, meta, children }) => {
 *   // rowId: `id` property of the row this component renders
 *   // cells: `cells` property of the current row
 *   // cellIndex: 0-based index into `cells` of the currently rendering cell
 *   // meta: Instance-specific metadata for the row
 *   // children: Contents of cell; usually simply render inside a wrapper
 *   return {rendered cell}
 * }
 *
 * WHOLE-GRID COMPONENTS
 * By default every cell in the data grid gets rendered with the <DefaultCell> component,
 * overridable on a cell or row basis. If you have specific requirements for a default cell for
 * most of your data grid, you can define that component and pass it in the CellComponent property
 * to <DataGrid>. It should expect a single {children} property for it to render in whatever wrapper
 * it needs.
 *
 * TYPICAL USAGE
 * You normally pass only the `data` property to the <DataGrid> component, containing your data-
 * grid format array. You should also wrap <DataGrid data={data} /> in a <div> that sets up the
 * borders and background. You likely need a border on this wrapper, and fill it with a background
 * color to peek through the gaps between the cells. You can just use the <DefaultDataGridContainer>
 * component to do this, or you can supply your own that does something similar.
 *
 * return (
 *   <DefaultDataGridContainer>
 *    <DataGrid data={data} />
 *  </DefaultDataGridContainer>
 * )
 */
import PropTypes from "prop-types"

/**
 * Default data grid cell. Custom data grid cells can use wrap or replace this; whatever they
 * choose.
 */
export const DefaultCell = ({ children }) => {
  return (
    <div className="flex h-full w-full bg-white p-2 dark:bg-gray-900">
      {children}
    </div>
  )
}

/**
 * Surround the <DataGrid> component with this wrapper component, or a custom one like it.
 */
export const DefaultDataGridContainer = ({ className = "", children }) => {
  return (
    <div
      className={`grid w-full gap-px overflow-auto border border-gray-300 bg-gray-300 text-sm dark:border-gray-700 dark:bg-gray-700 ${className}`}
    >
      {children}
    </div>
  )
}

DefaultDataGridContainer.propTypes = {
  // Extra Tailwind CSS classes to apply to the container
  className: PropTypes.string,
}

/**
 * Main data-grid interface.
 */
export const DataGrid = ({
  data,
  CellComponent = DefaultCell,
  startingRow = 1,
  startingCol = 1,
}) => {
  let rowLine = startingRow
  return data.reduce((acc, row) => {
    // Render the cells of a row.
    let colLine = startingCol
    const childCount = row.children?.length || 1
    const CellWrapper = row.RowComponent || CellComponent
    const rowRenders = row.cells.map((cell, index) => {
      // Render a single cell.
      const rowRender = (
        <div
          key={`${row.id}-${cell.id}`}
          style={{
            gridRow: `${rowLine} / ${rowLine + childCount}`,
            gridColumn: `${colLine} / ${colLine + (cell.columns || 1)}`,
          }}
        >
          <CellWrapper
            rowId={row.id}
            cells={row.cells}
            cellIndex={index}
            meta={row.meta}
          >
            {cell.content}
          </CellWrapper>
        </div>
      )
      colLine += cell.columns || 1
      return rowRender
    })

    // Render the child rows of the row, if any, recursively.
    const children = row.children ? (
      <DataGrid
        key={`${row.id}-children`}
        data={row.children}
        Cell={CellComponent}
        startingRow={rowLine}
        startingCol={colLine}
      />
    ) : null
    rowLine += childCount
    return acc.concat(rowRenders).concat(children)
  }, [])
}

DataGrid.propTypes = {
  // The data to render in the data-grid form
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
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
}
