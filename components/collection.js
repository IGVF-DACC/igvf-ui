// node_modules
import { TableCellsIcon, Bars4Icon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useContext, useEffect } from "react";
// components
import AddObjectTrigger from "./add-object-trigger";
import Button from "./button";
import CollectionTable from "./collection-table";
import GlobalContext from "./global-context";
import Icon from "./icon";
import ItemLink from "./item-link";
import NoContent from "./no-content";
import SeparatedList from "./separated-list";
import Status from "./status";
// lib
import {
  clearHiddenColumnsFromUrl,
  extractHiddenColumnIdsFromUrl,
} from "../lib/collection-table";

/**
 * States for the collection view display
 */
export const COLLECTION_VIEW = {
  LIST: "list", // Display as a list
  TABLE: "table", // Display as a table
};

/**
 * Displays the number of items in a collection.
 */
export const CollectionCount = ({ count }) => {
  if (count > 0) {
    return (
      <div>
        {count} item{count === 1 ? "" : "s"}
      </div>
    );
  }
  return null;
};

CollectionCount.propTypes = {
  // Number of items in the collection
  count: PropTypes.number.isRequired,
};

/**
 * Displays an entire collection of items.
 */
export const Collection = ({ children }) => {
  return <div>{children}</div>;
};

/**
 * Displays a single item in a collection.
 */
export const CollectionItem = ({
  href,
  testid,
  label = "",
  status = "",
  children,
}) => {
  return (
    <div
      className="my-0.5 flex border border-data-border bg-data-background px-2"
      data-testid={`collection-list-item-${testid}`}
    >
      <ItemLink href={href} label={label} />
      <div className="grow sm:flex">
        <div className="grow p-4">{children}</div>
        {status && (
          <div className="shrink justify-end self-center p-2">
            <Status status={status} />
          </div>
        )}
      </div>
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
export const CollectionItemName = ({ children }) => {
  return (
    <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">
      {children}
    </div>
  );
};

/**
 * Display the buttons to view the collection as a table or list.
 */
export const CollectionViewSwitch = () => {
  // Get the current collection view from the global context.
  const { collectionView } = useContext(GlobalContext);
  const router = useRouter();

  const isListSelected =
    collectionView.currentCollectionView === COLLECTION_VIEW.LIST;
  const isTableSelected =
    collectionView.currentCollectionView === COLLECTION_VIEW.TABLE;

  /**
   * Called when the user selects the list view to clear any URL-specified hidden columns before
   * switching to the list view
   */
  const onListViewSelect = () => {
    collectionView.setCurrentCollectionView(COLLECTION_VIEW.LIST);
    const urlWithoutUrlHiddenColumns = clearHiddenColumnsFromUrl(
      window.location.href
    );
    router.push(urlWithoutUrlHiddenColumns);
  };

  return (
    <div className="flex gap-1" data-testid="collection-view-switch">
      <Button.Icon
        type={isListSelected ? "primary" : "primary-outline"}
        label={`Select collection list view${
          isListSelected ? " (selected)" : ""
        }`}
        onClick={onListViewSelect}
      >
        <Bars4Icon />
      </Button.Icon>
      <Button.Icon
        type={isTableSelected ? "primary" : "primary-outline"}
        label={`Select collection table view${
          isTableSelected ? " (selected)" : ""
        }`}
        onClick={() =>
          collectionView.setCurrentCollectionView(COLLECTION_VIEW.TABLE)
        }
      >
        <TableCellsIcon />
      </Button.Icon>
    </div>
  );
};

/**
 * Displays information above the collection display.
 */
export const CollectionHeader = ({ count, addSpec }) => {
  return (
    <div className="flex justify-between">
      <CollectionCount count={count} />
      <div className="flex items-center gap-1">
        <AddObjectTrigger addSpec={addSpec} />
        <CollectionViewSwitch />
      </div>
    </div>
  );
};

CollectionHeader.propTypes = {
  // Number of items in the collection
  count: PropTypes.number.isRequired,
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
 * and `children` isn’t used.
 */
export const CollectionContent = ({ collection, children }) => {
  // Collection view setting and /profiles content
  const { collectionView } = useContext(GlobalContext);
  // True if the user has selected the list view
  const isListView =
    collectionView.currentCollectionView === COLLECTION_VIEW.LIST;
  // True if the user has selected the table view
  const isTableView =
    collectionView.currentCollectionView === COLLECTION_VIEW.TABLE;

  useEffect(() => {
    // If the page loads with a URL that specifies hidden columns, set the table view.
    const hashedHiddenColumns = extractHiddenColumnIdsFromUrl(
      window.location.href
    );
    if (hashedHiddenColumns?.length >= 0) {
      collectionView.setCurrentCollectionView(COLLECTION_VIEW.TABLE);
    }
  }, [collectionView]);

  if (isListView) {
    // Display list view.
    return <>{children}</>;
  }

  if (isTableView) {
    return <CollectionTable collection={collection} />;
  }

  // No profiles loaded or no collection type in the collection data.
  return <NoContent>No displayable collection data</NoContent>;
};

CollectionContent.propTypes = {
  // Collection of items to display in a list or table
  collection: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/**
 * Displays the data line below the name in a collection item.
 */
export const CollectionData = ({ children }) => {
  return (
    <SeparatedList
      separator={
        <div className="mx-2 h-1.5 w-1.5 self-center">
          <Icon.Circle className="fill-gray-300 dark:fill-gray-500" />
        </div>
      }
      className="flex flex-wrap [&>*]:text-gray-500 [&>*]:dark:text-gray-400"
    >
      {children}
    </SeparatedList>
  );
};

/**
 * Displays one linked item in the collection data line.
 */
export const CollectionDataLink = ({ title = "", value, href }) => {
  return (
    <div key="term_name">
      {title && <span>{title} </span>}
      <Link href={href}>
        <a>{value}</a>
      </Link>
    </div>
  );
};

CollectionDataLink.propTypes = {
  // Title of the data item
  title: PropTypes.string,
  // Value of the data item
  value: PropTypes.string.isRequired,
  // Link to the data item
  href: PropTypes.string.isRequired,
};
