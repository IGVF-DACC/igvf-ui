/**
 * Renders a sortable table of data with a header. Pass in an array of objects to render -- one
 * object per row -- as well as a column-configuration object that defines the column headers (this
 * will expand to other capabilities shortly). Example:
 *
 * const data = [
 *   {
 *     name: "First item",
 *     count: 5,
 *     uuid="84ec63e4-2c0b-4860-a47b-0a42b07b0c4e",
 *   },
 *   {
 *     name: "Second item",
 *     count: 2,
 *     uuid="f0186254-504a-4f75-9489-aa1162e05d60",
 *   },
 * ]
 *
 * const columns = [
 *   {
 *     id: "name"
 *     title: "Name",
 *   },
 *   {
 *     id: "count",
 *     title: "Count",
 *   },
 * }
 *
 * return (
 *   <DefaultDataGridContainer>
 *     <SortableGrid data={data} columns={columns} keyProp="uuid" />
 *   </DefaultDataGridContainer>
 * )
 *
 * // Expected output
 * +-----------+-----+
 * |Name       |Count|
 * +-----------+-----+
 * |First item |5    |
 * +-----------+-----+
 * |Second item|2    |
 * +-----------+-----+
 *
 * COLUMN CONFIGURATION
 * You define the appearance and existence of columns with the column configuration array. Each
 * entry in the array represents a column in the displayed table. Use these properties for each
 * column:
 *
 * id: the property within each data object to display in the column.
 *
 * title: The title to display in the column header.
 */

// node_modules
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid"
import _ from "lodash"
import PropTypes from "prop-types"
import { useState } from "react"
// compoonents
import { DataGrid } from "./data-grid"

// enums for the column-sorting directions.
const SORT_DIRECTIONS = {
  ASC: "asc", // Ascending sort
  DESC: "desc", // Descending sort
}

/**
 * <SortableGrid>'s normally renders an array of objects of a type. Convert the contents of this
 * array to a form that <DataGrid> can render. Exported for Jest testing, though not otherwise
 * likely useful externally.
 * @param {array} items - array of objects to render in a sortable grid
 * @param {array} columns - column definitions for the sortable grid
 * @param {string} keyProp - property of each item to use as the React key
 * @returns {array} - `items` contents in a form suitable for passing to <DataGrid>
 */
export const convertObjectArrayToDataGrid = (items, columns, keyProp) => {
  return items.map((item) => {
    return {
      id: item[keyProp],
      cells: columns.map((column) => {
        return { id: column.id, content: item[column.id] || null }
      }),
    }
  })
}

/**
 * Sort the data according to the provided column and direction.
 * @param {array} data - array of objects to sort
 * @param {string} sortBy - id of the column to sort by
 * @param {string} sortDirections - sort direction; asc or desc
 * @returns {array} - sorted copy of incoming array of objects
 */
const sortData = (data, sortBy, sortDirections) => {
  return _.orderBy(data, [sortBy], [sortDirections])
}

/**
 * Renders each header cell in a sortable grid.
 */
const SortableGridHeaderCells = ({ cells, cellIndex, meta, children }) => {
  // Determine the appearance of the sorting icon based on the sort direction.
  const SortIcon =
    meta.sortDirection === SORT_DIRECTIONS.ASC ? ChevronUpIcon : ChevronDownIcon

  return (
    <button
      type="button"
      onClick={() => meta.handleSortClick(cells[cellIndex].id)}
      className="flex h-full w-full items-center justify-between bg-gray-200 p-2 text-left font-semibold hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      {children}
      {meta.sortBy === cells[cellIndex].id ? (
        <SortIcon className="h-6 w-6 min-w-max" />
      ) : (
        <div className="h-6 w-6 min-w-max" />
      )}
    </button>
  )
}

SortableGridHeaderCells.propTypes = {
  // Cell data for one row in the grid
  cells: PropTypes.arrayOf(
    PropTypes.exact({
      id: PropTypes.string.isRequired,
      content: PropTypes.any,
    })
  ).isRequired,
  // 0-based index of the current header cell within the row
  cellIndex: PropTypes.number.isRequired,
  // Metadata for the header row
  meta: PropTypes.exact({
    // The id of the column currently being sorted by
    sortBy: PropTypes.string,
    // The direction of the current sort
    sortDirection: PropTypes.oneOf(Object.values(SORT_DIRECTIONS)),
    // Callback to handle a sort click
    handleSortClick: PropTypes.func.isRequired,
  }).isRequired,
}

/**
 * Display a sortable grid of data according to the provided columns. The data has to be an array
 * of objects requiring no column nor row spans.
 */
export const SortableGrid = ({
  data,
  columns,
  keyProp,
  initialSort = {},
  CustomHeaderCell,
}) => {
  // id of the currently sorted column.
  const [sortBy, setSortBy] = useState(initialSort.columnId || columns[0].id)
  // Whether the currently sorted column is sorted in ascending or descending order.
  const [sortDirection, setSortDirection] = useState(
    initialSort.direction || SORT_DIRECTIONS.ASC
  )

  /**
   *
   * @param {string} column - id of the column to sort by.
   */
  const handleSortClick = (column) => {
    if (sortBy === column) {
      // Sorted column clicked. Reverse the sort direction.
      setSortDirection(
        sortDirection === SORT_DIRECTIONS.ASC
          ? SORT_DIRECTIONS.DESC
          : SORT_DIRECTIONS.ASC
      )
    } else {
      // Unsorted column clicked; sort by this column ascending.
      setSortBy(column)
      setSortDirection(SORT_DIRECTIONS.ASC)
    }
  }

  // Generate the cells within the header row.
  const headerCells = columns.map((column) => {
    return {
      id: column.id,
      content: column.title,
    }
  })

  // Generate the header row itself, containing the cells.
  const headerRow = [
    {
      id: "header",
      cells: headerCells,
      meta: { sortBy, sortDirection, handleSortClick },
      RowComponent: CustomHeaderCell || SortableGridHeaderCells,
    },
  ]

  // Convert the data (simple array of objects) into a data grid array and render the table.
  const sortedData = sortData(data, sortBy, sortDirection)
  const dataRows = convertObjectArrayToDataGrid(sortedData, columns, keyProp)
  return <DataGrid data={headerRow.concat(dataRows)} />
}

SortableGrid.propTypes = {
  // Data to display in the sortable grid
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Column definitions for the grid
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Which prop of the objects in the data array to use as the React key
  keyProp: PropTypes.string.isRequired,
  // Optional initial sorting of the grid
  initialSort: PropTypes.exact({
    // id of the column to sort by
    columnId: PropTypes.string,
    // sort direction
    direction: PropTypes.oneOf(Object.values(SORT_DIRECTIONS)),
  }),
  // Optional component to render a header cell, overriding the default
  CustomHeaderCell: PropTypes.elementType,
}
