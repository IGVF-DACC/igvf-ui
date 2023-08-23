/**
 * Displays a sortable grid of data comprising an array of objects. The displayed grid uses CSS
 * grid (https://developer.mozilla.org/en-US/docs/Web/CSS/grid). See
 * components/docs/sortable-grid.md for documentation. As you make changes to this file, please
 * keep the documentation up to date.
 */

// node_modules
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import PropTypes from "prop-types";
import { Children, cloneElement, useState } from "react";
// components
import DataGrid from "./data-grid";

// enums for the column-sorting directions.
const SORT_DIRECTIONS = {
  ASC: "asc", // Ascending sort
  DESC: "desc", // Descending sort
};

/**
 * `SortableGrid` renders an array of objects of a type. This function converts the contents of
 * this array to a form that `DataGrid` can render.
 * @param {array} items Array of objects to render in a sortable grid
 * @param {array} columns Column definitions for the sortable grid
 * @param {string} keyProp Property of each item to use as the React key; index used if not provided
 * @returns {array} `items` contents in a form suitable for passing to <DataGrid>
 */
function convertObjectArrayToDataGrid(items, columns, keyProp) {
  return items.map((item, index) => {
    return {
      id: keyProp ? item[keyProp] : index,
      cells: columns.map((column) => {
        let content = column.display || item[column.id] || null;

        // If the column configuration `value()` specified for the current column, call it to
        // extract the cell's value.
        if (column.value) {
          content = column.value(item);
        }
        return { id: column.id, content, source: item };
      }),
    };
  });
}

/**
 * Sort the data according to the provided column and direction.
 * @param {array} data Array of objects to sort
 * @param {string} sortBy ID of the column to sort by
 * @param {string} sortDirections Sort direction; asc or desc
 * @returns {array} Sorted copy of incoming array of objects
 */
function sortData(data, columns, sortBy, sortDirections) {
  const sortedColumnConfig = columns.find((column) => column.id === sortBy);
  if (sortedColumnConfig.sorter) {
    return _.orderBy(
      data,
      (item) => sortedColumnConfig.sorter(item),
      sortDirections
    );
  }

  // If the sorted column's configuration includes a `value` transform function, use it to sort
  // the transformed data.
  if (sortedColumnConfig.value) {
    return _.orderBy(
      data,
      (item) => sortedColumnConfig.value(item).toString().toLowerCase(),
      [sortDirections]
    );
  }

  // No `sorter` nor `value` transform function; sort by the primitive data value.
  return _.orderBy(data, [sortBy], [sortDirections]);
}

/**
 * Display the sorting icon (including a blank icon for currently sorted and non-sortable columns)
 * for the current sortable table-header cell.
 */
function HeaderSortIcon({ columnConfiguration, sortBy, sortDirection }) {
  // Determine the appearance of the sorting icon based on the sort direction.
  const SortIcon =
    sortDirection === SORT_DIRECTIONS.ASC ? ChevronUpIcon : ChevronDownIcon;

  return (
    <SortIcon
      className={`h-5 w-5${
        sortBy === columnConfiguration.id ? "" : " invisible"
      }`}
    />
  );
}

HeaderSortIcon.propTypes = {
  // Entry in the column configuration array for the current column
  columnConfiguration: PropTypes.shape({
    // Unique ID for the column
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }),
  // id of the currently sorted column
  sortBy: PropTypes.string.isRequired,
  // Direction of the current sort
  sortDirection: PropTypes.oneOf(Object.values(SORT_DIRECTIONS)).isRequired,
};

/**
 * Renders a sortable table header cell; one that reacts to clicks to sort the column.
 */
function SortableHeaderCell({
  columnConfiguration,
  sortBy,
  sortDirection,
  onClick,
  className,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`justify-between hover:bg-gray-300 dark:hover:bg-gray-700 ${className}`}
    >
      <div className="flex-auto">{children}</div>
      <div className="flex-initial">
        <HeaderSortIcon
          columnConfiguration={columnConfiguration}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      </div>
    </button>
  );
}

SortableHeaderCell.propTypes = {
  // Entry in the column configuration array for the current column
  columnConfiguration: PropTypes.shape({
    // Unique ID for the column
    id: PropTypes.string.isRequired,
  }),
  // id of the currently sorted column
  sortBy: PropTypes.string.isRequired,
  // Direction of the current sort
  sortDirection: PropTypes.oneOf(Object.values(SORT_DIRECTIONS)),
  // Function to call when the header cell is clicked.
  onClick: PropTypes.func.isRequired,
  // Tailwind CSS classes to apply to the header cell.
  className: PropTypes.string.isRequired,
};

/**
 * Renders a non-sortable table header cell.
 */
function NonSortableHeaderCell({ className, children }) {
  return <div className={className}>{children}</div>;
}

NonSortableHeaderCell.propTypes = {
  // Tailwind CSS classes to apply to the header cell.
  className: PropTypes.string.isRequired,
};

/**
 * Default renderer for each header cell in a sortable grid, called by `DataGrid`. This gets
 * overridden with the `CustomHeaderCell` prop for `SortableGrid`.
 */
function HeaderCell({ cells, cellIndex, meta, children }) {
  // Get the definition for the current column.
  const columnConfiguration = meta.columns[cellIndex];

  // Add potentially useful props to the cell children referencing React components for custom
  // header cell title renderers. A child of type "object" indicates a React component, while
  // anything else gets treated as a primitive type which can't accept any extra properties.
  const headerCellChildren = Children.map(children, (child) => {
    return typeof child === "object"
      ? cloneElement(child, {
          columnConfiguration,
          sortBy: meta.sortBy,
          sortDirection: meta.sortDirection,
        })
      : child;
  });

  // Determine whether to render a sortable (`isSortable` true or not used) or non-sortable
  // (`isSortable` false) header cell.
  const HeaderCellRenderer =
    (columnConfiguration.isSortable ||
      columnConfiguration.isSortable === undefined) &&
    meta.dataLength > 1
      ? SortableHeaderCell
      : NonSortableHeaderCell;

  return (
    <HeaderCellRenderer
      columnConfiguration={columnConfiguration}
      sortBy={meta.sortBy}
      sortDirection={meta.sortDirection}
      onClick={() => meta.handleSortClick(cells[cellIndex].id)}
      className="flex h-full w-full items-center bg-gray-200 p-2 text-left font-semibold dark:bg-gray-800"
    >
      {headerCellChildren}
    </HeaderCellRenderer>
  );
}

HeaderCell.propTypes = {
  // Cell data for the grid header row
  cells: PropTypes.arrayOf(
    PropTypes.exact({
      // Unique id for each header cell
      id: PropTypes.string.isRequired,
      // Content to display in the header cell
      content: PropTypes.any.isRequired,
      // Role for the cell -- "columnheader" for column headers; default "cell"
      role: PropTypes.string,
    })
  ).isRequired,
  // 0-based index of the current header cell within `cells`
  cellIndex: PropTypes.number.isRequired,
  // Metadata for the header row
  meta: PropTypes.shape({
    // ID of the currently currently sorted column
    sortBy: PropTypes.string.isRequired,
    // Direction of the current sort
    sortDirection: PropTypes.oneOf(Object.values(SORT_DIRECTIONS)).isRequired,
    // Column definitions given to <SortableGrid>
    columns: PropTypes.arrayOf(PropTypes.object).isRequired,
    // Callback to handle a click in a header cell
    handleSortClick: PropTypes.func.isRequired,
    // Number of rows in the grid
    dataLength: PropTypes.number.isRequired,
  }).isRequired,
};

/**
 * Display a sortable grid of data according to the provided columns. The data has to be an array
 * of objects requiring no column nor row spans. It uses the provided `columns` configurations to
 * convert `data` to data-grid format. To help the header cells know how to react to the user's
 * clicks for sorting, plus any additional information custom header cells need, it passes the cell
 * configuration for each column in its data-grid format `meta` property.
 */
export default function SortableGrid({
  data,
  columns,
  keyProp = "",
  initialSort = {},
  meta = {},
  CustomHeaderCell = HeaderCell,
}) {
  // id of the currently sorted column
  const [sortBy, setSortBy] = useState(initialSort.columnId || columns[0].id);
  // Whether the currently sorted column is sorted in ascending or descending order
  const [sortDirection, setSortDirection] = useState(
    initialSort.direction || SORT_DIRECTIONS.ASC
  );

  /**
   * Called when the user clicks a column header to set its sorting.
   * @param {string} column - id of the column to sort by.
   */
  function handleSortClick(column) {
    if (sortBy === column) {
      // Sorted column clicked. Reverse the sort direction.
      setSortDirection(
        sortDirection === SORT_DIRECTIONS.ASC
          ? SORT_DIRECTIONS.DESC
          : SORT_DIRECTIONS.ASC
      );
    } else {
      // Unsorted column clicked; sort by this column ascending.
      setSortBy(column);
      setSortDirection(SORT_DIRECTIONS.ASC);
    }
  }

  // Filter the columns to only include those that have a hide() function that returns false, or
  // that don't have a hide() function at all.
  const visibleColumns = columns.filter(
    (column) => !column.hide || !column.hide(data, columns, meta)
  );

  // Generate the cells within the header row. The column title can contain a string or a React
  // component.
  const headerCells = visibleColumns.map((column) => {
    return {
      id: column.id,
      content: column.title,
      role: "columnheader",
    };
  });

  // Generate the header row itself, containing the cells, as well as sorting information and the
  // column configuration.
  const headerRow = [
    {
      id: "header",
      cells: headerCells,
      RowComponent: CustomHeaderCell,
    },
  ];

  // Make sure the `sortBy` column actually exists in the columns. Sort by the first column if not.
  const sortByColumn = visibleColumns.find((column) => column.id === sortBy);
  if (!sortByColumn) {
    setSortBy(visibleColumns[0].id);
    return null;
  }

  // Convert the data (simple array of objects) into a data grid array and render the table.
  const sortedData = initialSort.isSortingSuppressed
    ? data
    : sortData(data, visibleColumns, sortBy, sortDirection);
  const dataRows = convertObjectArrayToDataGrid(
    sortedData,
    visibleColumns,
    keyProp
  );
  return (
    <DataGrid
      data={headerRow.concat(dataRows)}
      meta={{
        ...meta,
        sortBy,
        columns: visibleColumns,
        sortDirection,
        handleSortClick,
        dataLength: dataRows.length,
      }}
    />
  );
}

SortableGrid.propTypes = {
  // Data to display in the sortable grid
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Column configurations for the grid
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Which prop of the objects in the data array to use as the React key
  keyProp: PropTypes.string,
  // Optional initial sorting of the grid
  initialSort: PropTypes.exact({
    // id of the column to sort by
    columnId: PropTypes.string,
    // sort direction
    direction: PropTypes.oneOf(Object.values(SORT_DIRECTIONS)),
    // True to not sort the data
    isSortingSuppressed: PropTypes.bool,
  }),
  // meta property for the data cells
  meta: PropTypes.object,
  // Optional component to render a header cell, overriding the default
  CustomHeaderCell: PropTypes.elementType,
};
