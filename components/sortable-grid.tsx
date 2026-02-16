/**
 * Displays a sortable grid of data comprising an array of objects. The displayed grid uses CSS
 * grid (https://developer.mozilla.org/en-US/docs/Web/CSS/grid). See
 * components/docs/sortable-grid.md for documentation. As you make changes to this file, please
 * keep the documentation up to date.
 */

// node_modules
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import {
  Children,
  cloneElement,
  ComponentType,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
// components
import DataGrid, { DataGridContainer } from "./data-grid";
import Pager, { TablePagerContainer } from "./pager";
import GridScrollIndicators from "./grid-scroll-indicators";
import TableCount from "./table-count";
// lib
import {
  type Cell,
  type CellContent,
  type CellContentProps,
  type DataGridFormat,
  type Row,
  type RowComponentProps,
} from "../lib/data-grid";

/**
 * The default maximum number of items in the table before the pager gets displayed.
 */
const MAX_ITEMS_PER_PAGE = 10;

/**
 * Defines the possible sort directions for a column in the sortable grid.
 */
type SortDirection = "asc" | "desc";

/**
 * Configuration for one column in a `SortableGrid`.
 */
export interface SortableGridConfig<TItem, TMeta = unknown> {
  id: string;
  title: ReactNode | string | number;
  display?: (props: CellContentProps<TItem, TMeta>) => ReactNode;
  isSortable?: boolean;
  sorter?: (item: TItem, meta?: TMeta) => string | number;
  value?: (item: TItem) => string | number;
  hide?: (
    data: TItem[],
    columns: SortableGridConfig<TItem, TMeta>[],
    meta: TMeta | undefined
  ) => boolean;
}

/**
 * Metadata passed to the `DataGrid` component from `SortableGrid`.
 *
 * @property sortBy - ID of the currently sorted column
 * @property sortDirection - Direction of the current sort
 * @property columns - Column definitions given to <SortableGrid>
 * @property handleSortClick - Callback to handle a click in a header cell
 * @property dataLength - Number of rows in the grid
 */
interface SortableGridMeta<TItem, TMeta> {
  sortBy: string;
  sortDirection: SortDirection;
  columns: SortableGridConfig<TItem, TMeta>[];
  handleSortClick: (columnId: string) => void;
  dataLength: number;
}

/**
 * Props injected into custom header cell title components when a React component is used as the
 * column title.
 *
 * @property columnId - ID of the current column
 * @property sortBy - ID of the currently sorted column
 * @property sortDirection - Direction of the current sort
 */
interface HeaderCellInjectedProps {
  columnId?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
}

/**
 * Defines the initial sorting configuration for `SortableGrid`.
 *
 * @property columnId - ID of the column to sort by initially
 * @property direction - Initial sort direction
 * @property isSortingSuppressed - Prevent any sorting of the table at all. Use this to handle
 *                                 sorting in the parent component.
 */
export interface InitialSortConfig {
  columnId?: string;
  direction?: SortDirection;
  isSortingSuppressed?: boolean;
}

/**
 * Convert the array of items to include in the table to a form that `DataGrid` can render.
 *
 * @param items - Array of objects to render in a sortable grid
 * @param columns - Column definitions for the sortable grid
 * @param keyProp - Property of each item to use as the React key; index used if not provided
 * @returns `items` contents in a form suitable for passing to <DataGrid>
 */
function convertObjectArrayToDataGrid<
  TItem extends Record<string, unknown>,
  TMeta,
>(
  items: TItem[],
  columns: SortableGridConfig<TItem, TMeta>[],
  keyProp: string
): DataGridFormat {
  return items.map((item, index) => {
    return {
      id: keyProp ? String(item[keyProp]) : String(index),
      cells: columns.map((column) => {
        // `value` overrides `display` if both are provided. Call `value` if it exists to assign
        // the cell value to the content.
        const content: CellContent =
          (column.value ? column.value(item) : null) ??
          column.display ??
          ((item as Record<string, unknown>)[column.id] as CellContent) ??
          null;

        return { id: column.id, content, source: item };
      }),
    } satisfies Row;
  });
}

/**
 * Sort the data according to the provided column and direction.
 *
 * @param data - Array of objects to sort
 * @param meta - Metadata for the grid
 * @param sortBy - ID of the column to sort by
 * @param sortDirections - Sort direction; asc or desc
 * @returns Sorted copy of incoming array of objects
 */
function sortData<TItem, TMeta>(
  data: TItem[],
  meta: TMeta | undefined,
  columns: SortableGridConfig<TItem, TMeta>[],
  sortBy: string,
  sortDirection: SortDirection
) {
  const sortedColumnConfig = columns.find((column) => column.id === sortBy);

  if (sortedColumnConfig?.sorter) {
    return _.orderBy(
      data,
      (item) => sortedColumnConfig.sorter!(item, meta),
      sortDirection
    );
  }

  // If the sorted column's configuration includes a `value` transform function, use it to sort
  // the transformed data.
  if (sortedColumnConfig?.value) {
    return _.orderBy(
      data,
      (item: TItem) => sortedColumnConfig.value(item).toString().toLowerCase(),
      sortDirection
    );
  }

  // No `sorter` nor `value` transform function; sort by the primitive data value.
  return _.orderBy(data, [sortBy], sortDirection);
}

/**
 * Display the sorting icon (including a blank icon for currently sorted and non-sortable columns)
 * for the current sortable table-header cell.
 *
 * @param columnId - Current column ID
 * @param sortBy - ID of the currently sorted column
 * @param sortDirection - Direction of the current sort
 */
function HeaderSortIcon({
  columnId,
  sortBy,
  sortDirection,
}: {
  columnId: string;
  sortBy: string;
  sortDirection: SortDirection;
}) {
  // Determine the appearance of the sorting icon based on the sort direction.
  const SortIcon = sortDirection === "asc" ? ChevronUpIcon : ChevronDownIcon;

  return (
    <SortIcon className={`h-5 w-5 ${sortBy === columnId ? "" : "invisible"}`} />
  );
}

/**
 * Renders a sortable table header cell; one that reacts to clicks to sort the column.
 *
 * @param columnId - ID of the current column
 * @param sortBy - ID of the currently sorted column
 * @param sortDirection - Direction of the current sort
 * @param onClick - Function to call when the header cell is clicked
 * @param className - Tailwind CSS classes to apply to the header cell
 */
function SortableHeaderCell({
  columnId,
  sortBy,
  sortDirection,
  onClick,
  className,
  children,
}: {
  columnId: string;
  sortBy: string;
  sortDirection: SortDirection;
  onClick: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer justify-between hover:bg-gray-300 dark:hover:bg-gray-700 ${className}`}
    >
      <div className="flex-auto">{children}</div>
      <div className="flex-initial">
        <HeaderSortIcon
          columnId={columnId}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      </div>
    </button>
  );
}

/**
 * Renders a non-sortable table header cell.
 *
 * @param className - Tailwind CSS classes to apply to the header cell
 * @param children - Child elements to render within the header cell
 */
function NonSortableHeaderCell({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return <div className={className}>{children}</div>;
}

/**
 * Default renderer for each header cell in a sortable grid, called by `DataGrid`. This gets
 * overridden with the `CustomHeaderCell` prop for `SortableGrid`.
 *
 * @param rowId - ID of the row (unused)
 * @param cells - Cell data for the grid header row
 * @param cellIndex - 0-based index of the current header cell within `cells`
 * @param meta - Metadata for the header row
 * @param children - Child elements to render within the header cell
 */
function HeaderCell<TItem, TMeta>({
  cells,
  cellIndex,
  meta,
  children,
}: RowComponentProps<HeaderCellInjectedProps> & {
  cells: Cell[];
  cellIndex: number;
  meta: SortableGridMeta<TItem, TMeta>;
}) {
  // Get the definition for the current column.
  const columnConfiguration = meta.columns[cellIndex];

  // Add potentially useful props to the cell children referencing React components for custom
  // header cell title renderers.
  const headerCellChildren = Children.map(children, (child) =>
    cloneElement<HeaderCellInjectedProps>(child, {
      columnId: columnConfiguration.id,
      sortBy: meta.sortBy,
      sortDirection: meta.sortDirection,
    })
  );

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
      columnId={columnConfiguration.id}
      sortBy={meta.sortBy}
      sortDirection={meta.sortDirection}
      onClick={() => meta.handleSortClick(cells[cellIndex].id)}
      className="flex h-full w-full items-center bg-gray-200 p-2 text-left font-semibold dark:bg-gray-800"
    >
      {headerCellChildren}
    </HeaderCellRenderer>
  );
}

/**
 * Displays a pager control intended for a table, often used with `<SortableGrid>`. The pager only
 * appears when the number of items in the table exceeds the maximum number of items per page.
 *
 * @param data - Data to display in the table
 * @param currentPageIndex - Currently displayed page; 0-based index
 * @param setCurrentPageIndex - Function to call when the user selects a new page
 * @param maxItemsPerPage - Max number of items to display in the table before the pager appears
 */
function TablePager<TItem>({
  data,
  currentPageIndex,
  setCurrentPageIndex,
  maxItemsPerPage,
}: {
  data: TItem[];
  currentPageIndex: number;
  setCurrentPageIndex: (newPageIndex: number) => void;
  maxItemsPerPage: number;
}) {
  const totalPages = Math.ceil(data.length / maxItemsPerPage);
  if (totalPages > 1) {
    return (
      <TablePagerContainer>
        <Pager
          currentPage={currentPageIndex + 1}
          totalPages={totalPages}
          onClick={(newCurrentPage) => setCurrentPageIndex(newCurrentPage - 1)}
        />
      </TablePagerContainer>
    );
  }
  return null;
}

/**
 * Display a sortable grid of data according to the provided columns. The data has to be an array
 * of objects requiring no column nor row spans. It uses the provided `columns` configurations to
 * convert `data` to data-grid format. To help the header cells know how to react to the user's
 * clicks for sorting, plus any additional information custom header cells need, it passes the cell
 * configuration for each column in its data-grid format `meta` property.
 *
 *
 */
export default function SortableGrid<
  TItem extends Record<string, unknown>,
  TMeta,
>({
  data,
  columns,
  keyProp = "",
  initialSort = {},
  meta,
  isTotalCountHidden = false,
  isPagerHidden = false,
  CustomHeaderCell = HeaderCell,
}: {
  data: TItem[];
  columns: SortableGridConfig<TItem, TMeta>[];
  keyProp?: string;
  initialSort?: InitialSortConfig;
  meta?: TMeta;
  isTotalCountHidden?: boolean;
  isPagerHidden?: boolean;
  CustomHeaderCell?: ComponentType<RowComponentProps<HeaderCellInjectedProps>>;
}) {
  // id of the currently sorted column
  const [sortBy, setSortBy] = useState(initialSort.columnId || columns[0].id);
  // Whether the currently sorted column is sorted in ascending or descending order
  const [sortDirection, setSortDirection] = useState(
    initialSort.direction || "asc"
  );
  const gridRef = useRef(null);

  // Current page if the table has a pager and not managed by the parent
  const [pageIndex, setPageIndex] = useState(0);

  // Filter the columns to only include those that have a hide() function that returns false, or
  // that don't have a hide() function at all.
  const visibleColumns = columns.filter(
    (column) => !column.hide || !column.hide(data, columns, meta)
  );

  // Make sure the `sortBy` column actually exists in the columns. Sort by the first column if not.
  const sortByColumn = visibleColumns.find((column) => column.id === sortBy);
  const safeSortBy = sortByColumn ? sortBy : visibleColumns[0].id;

  /**
   * Called when the user clicks a column header to set its sorting.
   * @param {string} column - id of the column to sort by.
   */
  function handleSortClick(column: string) {
    if (safeSortBy === column) {
      // Sorted column clicked. Reverse the sort direction.
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Unsorted column clicked; sort by this column ascending.
      setSortBy(column);
      setSortDirection("asc");
    }
  }

  useEffect(() => {
    // Reset to the first page whenever the number of data items changes.
    setPageIndex(0);
  }, [data.length]);

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
  const headerRow: Row[] = [
    {
      id: "header",
      cells: headerCells,
      RowComponent: CustomHeaderCell,
    },
  ];

  // Convert the data (simple array of objects) into a data grid array and render the table.
  const sortedData = initialSort.isSortingSuppressed
    ? data
    : sortData(data, meta, visibleColumns, safeSortBy, sortDirection);

  // Extract the current page of data from sortedData if the table has a pager.
  const pagedData = !isPagerHidden
    ? sortedData.slice(
        pageIndex * MAX_ITEMS_PER_PAGE,
        (pageIndex + 1) * MAX_ITEMS_PER_PAGE
      )
    : sortedData;
  const dataRows = convertObjectArrayToDataGrid(
    pagedData,
    visibleColumns,
    keyProp
  );

  return (
    <div>
      {!isTotalCountHidden && <TableCount count={data.length} />}
      {!isPagerHidden && (
        <TablePager
          data={data}
          currentPageIndex={pageIndex}
          setCurrentPageIndex={setPageIndex}
          maxItemsPerPage={MAX_ITEMS_PER_PAGE}
        />
      )}
      <GridScrollIndicators gridRef={gridRef}>
        <DataGridContainer ref={gridRef}>
          <DataGrid
            data={headerRow.concat(dataRows)}
            meta={{
              ...meta,
              sortBy: safeSortBy,
              columns: visibleColumns,
              sortDirection,
              handleSortClick,
              dataLength: data.length,
            }}
          />
        </DataGridContainer>
      </GridScrollIndicators>
    </div>
  );
}
