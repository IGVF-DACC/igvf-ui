// node_modules
import { Bars4Icon, TableCellsIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { useContext } from "react";
// components
import Button from "../button";
import GlobalContext from "../global-context";
// components/collection
import { COLLECTION_VIEW_LIST, COLLECTION_VIEW_TABLE } from "./constants";
// lib
import { clearHiddenColumnsFromUrl } from "../../lib/collection-table";

/**
 * Display the buttons to view the collection as a table or list.
 */
const CollectionViewSwitch = () => {
  // Get the current collection view from the global context.
  const { collectionView } = useContext(GlobalContext);
  const router = useRouter();

  const isListSelected =
    collectionView.currentCollectionView === COLLECTION_VIEW_LIST;
  const isTableSelected =
    collectionView.currentCollectionView === COLLECTION_VIEW_TABLE;

  /**
   * Called when the user selects the list view to clear any URL-specified hidden columns before
   * switching to the list view
   */
  const onListViewSelect = () => {
    collectionView.setCurrentCollectionView(COLLECTION_VIEW_LIST);
    const urlWithoutUrlHiddenColumns = clearHiddenColumnsFromUrl(
      window.location.href
    );
    router.push(urlWithoutUrlHiddenColumns);
  };

  return (
    <div
      className="mb-4 flex gap-1 sm:mb-0"
      data-testid="collection-view-switch"
    >
      <Button.Icon
        type={isListSelected ? "primary" : "primary-outline"}
        label={`Select collection list view${
          isListSelected ? " (selected)" : ""
        }`}
        onClick={onListViewSelect}
        className="h-8 w-8 sm:h-6 sm:w-6"
      >
        <Bars4Icon />
      </Button.Icon>
      <Button.Icon
        type={isTableSelected ? "primary" : "primary-outline"}
        label={`Select collection table view${
          isTableSelected ? " (selected)" : ""
        }`}
        onClick={() =>
          collectionView.setCurrentCollectionView(COLLECTION_VIEW_TABLE)
        }
        className="h-8 w-8 sm:h-6 sm:w-6"
      >
        <TableCellsIcon />
      </Button.Icon>
    </div>
  );
};

export default CollectionViewSwitch;
