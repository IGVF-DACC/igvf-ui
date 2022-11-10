// node_modules
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
// components
import AddObjectTrigger from "../add-object-trigger";
import GlobalContext from "../global-context";
import Icon from "../icon";
import ItemLink from "../item-link";
import ItemsPerPageSelector from "../items-per-page-selector";
import NoContent from "../no-content";
import Pager from "../pager";
import SeparatedList from "../separated-list";
import Status from "../status";
// components/collection
import {
  COLLECTION_VIEW_LIST,
  COLLECTION_VIEW_TABLE,
  DEFAULT_ITEMS_PER_PAGE,
} from "./constants";
import CollectionCount from "./count";
import CollectionTable from "./table";
import CollectionViewSwitch from "./view-switch";
// lib
import { extractHiddenColumnIdsFromUrl } from "../../lib/collection-table";

/**
 * Displays an entire collection of items and tracks the pager status, such as the number of items
 * to display on each page and the index of the page of items currently displayed. It passes these
 * statuses and their setter functions to the children as render props.
 */
const Collection = ({ items, children }) => {
  // Number of items to display per page
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  // Index of the page of items to display
  const [pageIndex, setPageIndex] = useState(1);

  // Extract the current page's items from the collection. If the number of items per page holds
  // zero, then show all items.
  let pageItems = items;
  let totalPages = 1;
  if (itemsPerPage > 0) {
    const pageItemIndex = (pageIndex - 1) * itemsPerPage;
    pageItems = items.slice(pageItemIndex, pageItemIndex + itemsPerPage);
    totalPages = Math.ceil(items.length / itemsPerPage);
  }

  return (
    <div>
      {children({
        pageItems,
        pagerStatus: { itemsPerPage, pageIndex, totalPages },
        pagerAction: { setItemsPerPage, setPageIndex },
      })}
    </div>
  );
};

Collection.propTypes = {
  // Items to display in the collection children
  items: PropTypes.array.isRequired,
};

/**
 * Displays a single item in a collection.
 */
const CollectionItem = ({
  href,
  testid,
  label = "",
  status = "",
  children,
}) => {
  return (
    <div
      className="my-0.5 flex border border-panel bg-panel px-2 first:mt-0 last:mb-0"
      data-testid={`collection-list-item-${testid}`}
    >
      <ItemLink href={href} label={label} />
      <div className="grow py-4 px-2 sm:px-4">{children}</div>
      {status && (
        <div className="shrink justify-end self-center p-2">
          <Status status={status} />
        </div>
      )}
    </div>
  );
};

CollectionItem.propTypes = {
  // Path to item this links to
  href: PropTypes.string.isRequired,
  // Usually same as component key; unique on page
  testid: PropTypes.string.isRequired,
  // Voice label for item
  label: PropTypes.string,
  // Status of item
  status: PropTypes.string,
};

/**
 * Displays the name of the collection item.
 */
const CollectionItemName = ({ children }) => {
  return (
    <div className="text-base font-semibold text-gray-600 dark:text-gray-400 sm:text-xl">
      {children}
    </div>
  );
};

/**
 * Displays information above the collection display.
 */
export const CollectionHeader = ({ pagerStatus, pagerAction, addSpec }) => {
  return (
    <div className="sm:mb-1 sm:flex sm:items-center sm:justify-between">
      <CollectionViewSwitch />
      <div className="sm:flex sm:items-center sm:gap-1">
        <div className="mb-2 flex items-center gap-2 sm:mb-0">
          <AddObjectTrigger addSpec={addSpec} />
          <ItemsPerPageSelector
            itemsPerPage={pagerStatus.itemsPerPage}
            setItemsPerPage={pagerAction.setItemsPerPage}
            setPageIndex={pagerAction.setPageIndex}
          />
        </div>
        {pagerStatus.totalPages > 1 && (
          <Pager
            currentPage={pagerStatus.pageIndex}
            totalPages={pagerStatus.totalPages}
            onClick={pagerAction.setPageIndex}
            className="mb-2 flex justify-center sm:mb-0 sm:block sm:justify-start"
          />
        )}
      </div>
    </div>
  );
};

CollectionHeader.propTypes = {
  // Collection pager status
  pagerStatus: PropTypes.exact({
    // Number of items per page
    itemsPerPage: PropTypes.number.isRequired,
    // Index of the page of items to display
    pageIndex: PropTypes.number.isRequired,
    // Total number of pages
    totalPages: PropTypes.number.isRequired,
  }).isRequired,
  // Actions for the current page number and number of items per page
  pagerAction: PropTypes.exact({
    // Set the number of items the user wants to see per page
    setItemsPerPage: PropTypes.func.isRequired,
    // Set the current page index
    setPageIndex: PropTypes.func.isRequired,
  }).isRequired,
  addSpec: PropTypes.exact({
    // Object type to append to the Add button label
    label: PropTypes.string.isRequired,
    // Path to add the object
    path: PropTypes.string.isRequired,
  }),
};

/**
 * Display either a list or report view of the collection. For a list, the `children` provides the
 * content. For the table view, the content comes from this use of the <CollectionTable> component,
 * and `children` isn’t used. `pagerStatus` holds the current page number and number of items per
 * page. The list view takes care of these and so `pagerStatus` only gets used for the table view,
 * which uses `pagerStatus` to display only one page of items while sorting the entire collection.
 */
const CollectionContent = ({ collection, pagerStatus, children }) => {
  // Collection view setting and /profiles content
  const { collectionView } = useContext(GlobalContext);
  // True if the user has selected the list view
  const isListView =
    collectionView.currentCollectionView === COLLECTION_VIEW_LIST;
  // True if the user has selected the table view
  const isTableView =
    collectionView.currentCollectionView === COLLECTION_VIEW_TABLE;

  useEffect(() => {
    // If the page loads with a URL that specifies hidden columns, set the table view.
    const hashedHiddenColumns = extractHiddenColumnIdsFromUrl(
      window.location.href
    );
    if (hashedHiddenColumns?.length >= 0) {
      collectionView.setCurrentCollectionView(COLLECTION_VIEW_TABLE);
    }
  }, [collectionView]);

  if (isListView) {
    // Display list view.
    return (
      <>
        <CollectionCount count={collection.length} />
        <div>{children}</div>
      </>
    );
  }

  if (isTableView) {
    return (
      <CollectionTable collection={collection} pagerStatus={pagerStatus} />
    );
  }

  // No profiles loaded or no collection type in the collection data.
  return <NoContent>No displayable collection data</NoContent>;
};

CollectionContent.propTypes = {
  // Entire collection of items to display in a list or table, not just the current page
  collection: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Collection pager status
  pagerStatus: PropTypes.object.isRequired,
};

/**
 * Displays the data line below the name in a collection item. Separate each item with a
 * circle bullet.
 */
export const CollectionData = ({ children }) => {
  return (
    <SeparatedList
      separator={
        <div className="mx-2 h-1.5 w-1.5 self-center">
          <Icon.Circle className="fill-gray-300 dark:fill-gray-500" />
        </div>
      }
      className="flex flex-wrap text-sm [&>*]:text-gray-500 [&>*]:dark:text-gray-400"
    >
      {children}
    </SeparatedList>
  );
};

export {
  Collection,
  CollectionContent,
  CollectionItem,
  CollectionItemName,
  CollectionTable,
  CollectionViewSwitch,
  COLLECTION_VIEW_LIST,
  COLLECTION_VIEW_TABLE,
};
