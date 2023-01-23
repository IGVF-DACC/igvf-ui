// node_modules
import { Bars4Icon, TableCellsIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { useContext } from "react";
// components
import { AttachedButtons, Button } from "../form-elements";
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
    <div data-testid="collection-view-switch">
      <AttachedButtons className="mb-4 flex sm:mb-0">
        <Button
          type={isListSelected ? "selected" : "secondary"}
          label={`Select collection list view${
            isListSelected ? " (selected)" : ""
          }`}
          onClick={onListViewSelect}
          hasIconOnly
        >
          <Bars4Icon />
        </Button>
        <Button
          type={isTableSelected ? "selected" : "secondary"}
          label={`Select collection table view${
            isTableSelected ? " (selected)" : ""
          }`}
          onClick={() =>
            collectionView.setCurrentCollectionView(COLLECTION_VIEW_TABLE)
          }
          hasIconOnly
        >
          <TableCellsIcon />
        </Button>
      </AttachedButtons>
    </div>
  );
};

export default CollectionViewSwitch;
