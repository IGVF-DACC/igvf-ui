// node_modules
import PropTypes from "prop-types";
import { useRef, useState } from "react";
// components
import { DataGridContainer } from "./data-grid";
import Pager from "./pager";
import ScrollIndicators from "./scroll-indicators";
import TableCount from "./table-count";

/**
 * The default maximum number of items in the table before the pager gets displayed.
 */
const DEFAULT_MAX_ITEMS_PER_PAGE = 20;

/**
 * Displays a pager control intended for a table, often used with `<SortableGrid>`. The pager only
 * appears when the number of items in the table exceeds the maximum number of items per page.
 */
function TablePager({
  data,
  currentPageIndex,
  setCurrentPageIndex,
  maxItemsPerPage,
}) {
  const totalPages = Math.ceil(data.length / maxItemsPerPage);
  if (totalPages > 1) {
    return (
      <div
        className="flex justify-center border-l border-r border-panel bg-gray-100 py-0.5 dark:bg-gray-900"
        data-testid="table-pager"
      >
        <Pager
          currentPage={currentPageIndex + 1}
          totalPages={totalPages}
          onClick={(newCurrentPage) => setCurrentPageIndex(newCurrentPage - 1)}
        />
      </div>
    );
  }
  return null;
}

TablePager.propTypes = {
  // Data to display in the table
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Currently displayed page; 0-based index
  currentPageIndex: PropTypes.number.isRequired,
  // Function to call when the user selects a new page; new page index passed as argument
  setCurrentPageIndex: PropTypes.func.isRequired,
  // Maximum number of items to display in the table before the pager gets displayed
  maxItemsPerPage: PropTypes.number.isRequired,
};

/**
 * Similar to `<SortableGrid>`, but with a `<TableCount>` above it and a pager when the table has
 * enough items to require one. You control the number of items in `data` before you get a pager
 * with `maxItemsPerPage`, or just leave the default from `DEFAULT_MAX_ITEMS_PER_PAGE` above.
 *
 * This component has two modes of operation:
 * 1. Automatically Managed: Select this mode by not providing a `parentManaged` property. In this
 *    mode, `<PageDataGrid>` keeps track of the current page, and it extracts the current page's
 *    data from `data` and passes it to `children` -- you have to provide a function in `children`
 *    to accept this data. This function uses just that data to render the table. Example:
 *
 * return (
 *   <PagedDataGrid data={data}>
 *     {(pageData) => {
 *       return (
 *         <SortableGrid
 *           data={pageData}
 *           columns={columns}
 *           keyProp="id"
 *         />
 *       );
 *     }}
 *   </PagedDataGrid>
 * );
 *
 * 2. Parent Managed: Select this mode by providing the current page index and a function to call
 *    when the user selects a new page. In this mode, the parent component is responsible for
 *    keeping track of the current page index and extracting the current page's data from `data`.
 *    Example:
 *
 * const [currentPageIndex, setCurrentPageIndex] = useState(0);
 *
 * function onCurrentPageIndexChange(newCurrentPageIndex) {
 *   setCurrentPageIndex(newCurrentPageIndex);
 * }
 *
 * const start = currentPageIndex * maxItemsPerPage;
 * const end = start + maxItemsPerPage;
 * return (
 *   <PagedDataGrid data={data} parentManaged={{ currentPageIndex, onCurrentPageIndexChange }}>
 *     <SortableGrid
 *       data={data.slice(start, end)}
 *       columns={columns}
 *       keyProp="id"
 *     />
 *   </PagedDataGrid>
 * );
 */
export default function PagedDataGrid({
  data,
  maxItemsPerPage = DEFAULT_MAX_ITEMS_PER_PAGE,
  parentManaged,
  children,
}) {
  const gridRef = useRef(null);
  // 0-based current page index. Not used with `parentManaged`
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  /**
   * Called when the user selects a new page, whether by clicking on the arrows of the pager or a
   * button for a specific page.
   * @param {number} newCurrentPageIndex The new current page index, 0-based.
   */
  function onPageChange(newCurrentPageIndex) {
    if (parentManaged) {
      parentManaged.onCurrentPageIndexChange(newCurrentPageIndex);
    } else {
      setCurrentPageIndex(newCurrentPageIndex);
    }
  }

  // If the parent component doesn't provide parent-management data, extract the items from the
  // `data` array that are relevant to the current page.
  let currentPageData = data;
  if (!parentManaged) {
    const start = currentPageIndex * maxItemsPerPage;
    const end = start + maxItemsPerPage;
    currentPageData = data.slice(start, end);
  }

  return (
    <>
      <TableCount count={data.length} />
      <TablePager
        data={data}
        currentPageIndex={currentPageIndex}
        setCurrentPageIndex={onPageChange}
        maxItemsPerPage={maxItemsPerPage}
      />
      <ScrollIndicators gridRef={gridRef}>
        {parentManaged ? (
          <DataGridContainer ref={gridRef}>{children}</DataGridContainer>
        ) : (
          <DataGridContainer ref={gridRef}>
            {children(currentPageData)}
          </DataGridContainer>
        )}
      </ScrollIndicators>
    </>
  );
}

PagedDataGrid.propTypes = {
  // Objects to display on each row of the table
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Maximum number of items to display in the table before the pager gets displayed
  maxItemsPerPage: PropTypes.number,
  // Data used when pages managed by parent
  parentManaged: PropTypes.exact({
    // The current page index from the parent component
    currentPageIndex: PropTypes.number.isRequired,
    // Function to call when the user selects a new page; new page index passed as argument
    onCurrentPageIndexChange: PropTypes.func.isRequired,
  }),
};
