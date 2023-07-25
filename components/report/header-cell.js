// node_modules
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";

/**
 * Display the sorting icon in report header cells for the currently sorted column. Render
 * nothing for other columns.
 */
function HeaderSortIcon({ column, sortedColumn }) {
  const isDescending = sortedColumn.startsWith("-");
  const sortedColumnId = isDescending ? sortedColumn.slice(1) : sortedColumn;
  const SortIcon = isDescending ? ChevronDownIcon : ChevronUpIcon;

  if (column === sortedColumnId) {
    return (
      <SortIcon
        data-testid={`header-sort-icon-${
          isDescending ? "descending" : "ascending"
        }`}
        className="h-5 w-5"
      />
    );
  }
  return null;
}

HeaderSortIcon.propTypes = {
  // Column ID for the current cell
  column: PropTypes.string.isRequired,
  // Column ID for the currently sorted column; starts with "-" for descending sort
  sortedColumn: PropTypes.string.isRequired,
};

/**
 * Renders the header cells for the report table. Click events navigate to the report page with
 * that cell as the sorting key.
 */
export default function ReportHeaderCell({ cells, cellIndex, meta, children }) {
  const columnId = cells[cellIndex].id;

  function onClick() {
    meta.onHeaderCellClick(columnId);
  }

  return (
    <button
      onClick={onClick}
      className="flex h-full w-full items-center justify-between bg-gray-200 p-2 text-left font-semibold hover:bg-gray-300 disabled:hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:disabled:hover:bg-gray-800"
      disabled={meta.nonSortableColumnIds.includes(columnId)}
    >
      <div className="flex-auto">{children}</div>
      <div className="flex-initial">
        <HeaderSortIcon column={columnId} sortedColumn={meta.sortedColumnId} />
      </div>
    </button>
  );
}

ReportHeaderCell.propTypes = {
  // Cell data for the grid header row
  cells: PropTypes.arrayOf(
    PropTypes.shape({
      // ID for each header cell
      id: PropTypes.string.isRequired,
    }),
  ).isRequired,
  // 0-based index of the current header cell within `cells`
  cellIndex: PropTypes.number.isRequired,
  // Metadata for the header row
  meta: PropTypes.shape({
    // Calls the parent component when the user clicks the column header
    onHeaderCellClick: PropTypes.func.isRequired,
    // ID of the currently sorted column; empty string if no column is sorted
    sortedColumnId: PropTypes.string,
    // IDs of non-sortable columns
    nonSortableColumnIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
};
