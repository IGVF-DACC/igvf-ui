// node_modules
import {
  CheckIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
// components
import { Button } from "../form-elements";
import Checkbox from "../checkbox";
import CopyButton from "../copy-button";
import { DataGridContainer } from "../data-grid";
import Icon from "../icon";
import Instruction from "../instruction";
import Modal from "../modal";
import SessionContext from "../session-context";
import SortableGrid from "../sortable-grid";
// components/collection
import generateTableColumns from "./generate-table-columns";
import CollectionCount from "./count";
import CollectionDownload from "./download";
import ScrollIndicators from "./scroll-indicators";
// lib
import {
  clearHiddenColumnsFromUrl,
  extractHiddenColumnIdsFromUrl,
  filterHiddenColumns,
  generateHiddenColumnsUrl,
  getCollectionType,
  loadStoredHiddenColumns,
  saveStoredHiddenColumns,
  sortColumns,
} from "../../lib/collection-table";

/**
 * Displays the buttons to hide or show all columns at once.
 */
const ChangeAllControls = ({ onChangeAllHiddenColumns }) => {
  const className = "flex-grow md:flex-grow-0";
  return (
    <div className="flex gap-1">
      <Button
        className={className}
        onClick={() => onChangeAllHiddenColumns(false)}
      >
        Show All Columns
      </Button>
      <Button
        className={className}
        onClick={() => onChangeAllHiddenColumns(true)}
      >
        Hide All Columns
      </Button>
    </div>
  );
};

ChangeAllControls.propTypes = {
  // Called when the user wants to hide or show all columns at once
  onChangeAllHiddenColumns: PropTypes.func.isRequired,
};

/**
 * Display an icon showing whether any columns are hidden or not.
 */
const HiddenColumnsIndicator = ({ isAnyColumnHidden }) => {
  const className = "ml-1.5 h-5 w-5";
  return (
    <>
      {isAnyColumnHidden ? (
        <Icon.TableColumnsHidden className={className} />
      ) : (
        <Icon.TableColumnsVisible className={className} />
      )}
    </>
  );
};

HiddenColumnsIndicator.propTypes = {
  // True if at least one column is hidden
  isAnyColumnHidden: PropTypes.bool.isRequired,
};

/**
 * Display the actuator button to display the modal for the user to select which columns to
 * display and which to hide. This also displays that modal.
 */
const ColumnSelector = ({
  columns,
  hiddenColumns,
  onChange,
  onChangeAllHiddenColumns,
}) => {
  // True if the column-selection modal is open.
  const [isOpen, setIsOpen] = useState(false);

  // Display the columns sorted by title, except for the ID column.
  const sortedColumns = sortColumns(columns);

  return (
    <>
      <Button className="w-full sm:w-auto" onClick={() => setIsOpen(true)}>
        Show / Hide Columns
        <HiddenColumnsIndicator isAnyColumnHidden={hiddenColumns.length > 0} />
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Header onClose={() => setIsOpen(false)}>
          <h2 className="flex items-center font-semibold">
            Show / Hide Columns
            <HiddenColumnsIndicator
              isAnyColumnHidden={hiddenColumns.length > 0}
            />
          </h2>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-3 md:flex md:items-center">
            <ChangeAllControls
              onChangeAllHiddenColumns={onChangeAllHiddenColumns}
            />
            <div className="text-center text-sm text-gray-700 dark:text-gray-300 md:ml-2 md:flex-grow md:text-left">
              The <i>ID</i> column cannot be hidden
            </div>
          </div>
          <fieldset>
            <div className="md:flex md:flex-wrap">
              {sortedColumns.map((column) => {
                if (column.id !== "@id") {
                  const isHidden = hiddenColumns.includes(column.id);
                  return (
                    <Checkbox
                      key={column.id}
                      name={column.id}
                      checked={!isHidden}
                      onChange={() => onChange(column.id, !isHidden)}
                      className="block md:basis-1/2 lg:basis-1/3"
                    >
                      {column.title}
                    </Checkbox>
                  );
                }

                // Don't include @id property; @id is always visible.
                return null;
              })}
            </div>
          </fieldset>
        </Modal.Body>

        <Modal.Footer>
          <Button type="primary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

ColumnSelector.propTypes = {
  // All available columns
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Columns to hide
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Called when the user changes individual columns to show or hide
  onChange: PropTypes.func.isRequired,
  // Called when the user wants to show or hide all columns at once
  onChangeAllHiddenColumns: PropTypes.func.isRequired,
};

/**
 * Displays a button to copy the current collection URL along with a hashtag for the currently
 * hidden columns so the user can share the collection view with selected columns hidden.
 */
const ColumnUrlCopy = ({ hiddenColumns }) => {
  // True if the browser URL is available
  const [isHrefAvailable, setIsHrefAvailable] = useState(false);

  useEffect(() => {
    setIsHrefAvailable(true);
  }, []);

  const hiddenColumnsUrl = isHrefAvailable
    ? generateHiddenColumnsUrl(window.location.href, hiddenColumns)
    : "";
  return (
    <CopyButton
      target={hiddenColumnsUrl}
      disabled={!isHrefAvailable}
      className="grow sm:grow-0"
    >
      {(isCopied) => {
        return (
          <>
            Copy URL Columns
            <div className="ml-1 h-4 w-4">
              {isCopied ? (
                <CheckIcon data-testid="icon-check" />
              ) : (
                <ClipboardDocumentCheckIcon data-testid="icon-clipboard-document-check" />
              )}
            </div>
          </>
        );
      }}
    </CopyButton>
  );
};

ColumnUrlCopy.propTypes = {
  // Array of column IDs of the hidden columns
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
};

/**
 * Shows and handles the controls to manage the URL columns controls that let the user copy a URL
 * containing the currently hidden columns.
 */
const UrlColumnControls = ({
  collectionType,
  hiddenColumns,
  onClearedUrlHiddenColumns,
}) => {
  const router = useRouter();

  /**
   * Called to clear the URL columns hashtag and restore the ones from localStorage.
   */
  const clearHashtagHiddenColumns = () => {
    onClearedUrlHiddenColumns();
    const urlWithoutHiddenColumns = clearHiddenColumnsFromUrl(
      window.location.href
    );
    router.push(urlWithoutHiddenColumns);
  };

  /**
   * Called when the user clicks the button to save the hashtag-specified hidden columns to
   * localStorage. It also redirects to the same URL without the hashtag.
   */
  const saveHashtagHiddenColumns = () => {
    saveStoredHiddenColumns(collectionType, hiddenColumns);
    onClearedUrlHiddenColumns();
    const urlWithoutUrlHiddenColumns = clearHiddenColumnsFromUrl(
      window.location.href
    );
    router.push(urlWithoutUrlHiddenColumns);
  };

  return (
    <>
      <Button onClick={saveHashtagHiddenColumns}>
        Save URL Columns to Browser
      </Button>
      <Button onClick={clearHashtagHiddenColumns}>Clear URL Columns</Button>
      <Instruction
        className="prose dark:prose-invert"
        title="Help for saving and clearing URL columns"
      >
        <p>
          <strong>Save URL Columns to Browser</strong> saves the hidden columns
          in your URL to your browser, overwriting any shown and hidden columns
          you had previously saved.
        </p>
        <p>
          <strong>Clear URL Columns</strong> restores the shown and hidden
          columns you have saved to your browser, clearing the URL of hidden
          columns.
        </p>
      </Instruction>
    </>
  );
};

UrlColumnControls.propTypes = {
  // Type of collection being displayed
  collectionType: PropTypes.string.isRequired,
  // IDs of the hidden columns
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Called once the user clears the URL columns
  onClearedUrlHiddenColumns: PropTypes.func.isRequired,
};

/**
 * Shows and handles the controls to manage the modal to let the user show and hide individual
 * columns, and to copy a URL with the currently hidden columns.
 */
const BrowserColumnControls = ({
  columns,
  hiddenColumns,
  onChange,
  onChangeAllHiddenColumns,
}) => {
  const className = "mx-1.5 inline h-5 w-5";
  return (
    <>
      <ColumnSelector
        columns={columns}
        hiddenColumns={hiddenColumns}
        onChange={onChange}
        onChangeAllHiddenColumns={onChangeAllHiddenColumns}
      />
      <ColumnUrlCopy hiddenColumns={hiddenColumns} />
      <Instruction
        className="prose dark:prose-invert"
        title="Help for viewing and hiding columns, and copying URL columns"
      >
        <p>
          <strong>Show / Hide Columns</strong> lets you choose which individual
          columns to show and hide, and lets you show or hide all columns at
          once, except for the <i>ID</i> column. The
          <Icon.TableColumnsHidden className={className} />
          symbol indicates at least one column is hidden. The
          <Icon.TableColumnsVisible className={className} />
          symbol indicates all columns are shown.
        </p>
        <p>
          <strong>Copy URL Columns</strong> copies a URL with your currently
          hidden columns attached to it. You can share this URL with others so
          they can see this collection with the same columns hidden, or you can
          paste it into another browser.
        </p>
      </Instruction>
    </>
  );
};

BrowserColumnControls.propTypes = {
  // All available columns
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Column IDs of the hidden columns
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Called when the user changes individual columns to show or hide
  onChange: PropTypes.func.isRequired,
  // Called when the user shows or hides all columns at once
  onChangeAllHiddenColumns: PropTypes.func.isRequired,
};

/**
 * Wraps the table-view column controls, such as the hidden-column selector.
 */
const ColumnControls = ({ children }) => {
  return (
    <div className="my-1 flex flex-wrap items-stretch gap-1">{children}</div>
  );
};

/**
 * Displays the table view for a collection page, instead of a list view.
 */
const CollectionTable = ({ collection, pagerStatus }) => {
  // All schemas from which we extract the columns for the current collection type
  const { profiles } = useContext(SessionContext);
  // Holds the IDs of the hidden columns
  const [hiddenColumns, setHiddenColumns] = useState([]);
  // True if hidden columns are determined by hashtag instead of localStorage
  const [isHiddenColumnsFromUrl, setIsHiddenColumnsFromUrl] = useState(false);
  // Get the collection type from the first collection item, if any
  const collectionType = getCollectionType(collection);
  // Unfiltered table columns for the current collection type; memoize for useEffect dependency
  const columns = useMemo(
    () => (profiles ? generateTableColumns(profiles, collectionType) : []),
    [profiles, collectionType]
  );
  // Keep a ref of the scrollable table DOM <div> so we can detect scroll position
  const gridRef = useRef(null);

  // Calculate the start and end index of the items to display based on the pager status. Show all
  // items if the items per page is zero (view all items).
  let startIndex = 0;
  let endIndex = collection.length;
  if (pagerStatus.itemsPerPage > 0) {
    startIndex = (pagerStatus.pageIndex - 1) * pagerStatus.itemsPerPage;
    endIndex = startIndex + pagerStatus.itemsPerPage;
  }

  /**
   * Called when the user changes which columns are visible and hidden through the column selector.
   * @param {string} selectedColumnId The id of the column that was hidden or shown
   * @param {boolean} isNowHidden True if the column is now hidden; false if it is now visible
   */
  const updateHiddenColumns = (selectedColumnId, isNowHidden) => {
    let newHiddenColumns = [];
    if (isNowHidden) {
      newHiddenColumns = hiddenColumns.concat(selectedColumnId);
    } else {
      newHiddenColumns = hiddenColumns.filter(
        (columnId) => columnId !== selectedColumnId
      );
    }
    setHiddenColumns(newHiddenColumns);
    saveStoredHiddenColumns(collectionType, newHiddenColumns);
  };

  /**
   * Handle the user selecting all columns to hide or show at once.
   * @param {boolean} isNowHidden True if all columns now hidden; false if all columns now visible
   */
  const changeAllHiddenColumns = (isNowHidden) => {
    const newHiddenColumns = isNowHidden
      ? columns
          .filter((column) => column.id !== "@id")
          .map((column) => column.id)
      : [];
    setHiddenColumns(newHiddenColumns);
    saveStoredHiddenColumns(collectionType, newHiddenColumns);
  };

  /**
   * Called when the user clears the URL columns. It clears localStorage which causes all columns
   * to show, but the useEffect below then restores the saved hidden columns, if any.
   */
  const clearUrlColumns = () => {
    setHiddenColumns([]);
    setIsHiddenColumnsFromUrl(false);
  };

  useEffect(() => {
    // Determine whether the URL hashtag specifies hidden columns, overriding the hidden columns in
    // localStorage.
    const hashedHiddenColumns = extractHiddenColumnIdsFromUrl(
      window.location.href
    );
    if (hashedHiddenColumns?.length >= 0) {
      // Current browser URL has a #hidden= hashtag. Ignore localStorage and use the hidden columns
      // specified here instead.
      setHiddenColumns(hashedHiddenColumns);
      setIsHiddenColumnsFromUrl(true);
    } else {
      // Load the hidden columns for the current collection type from localStorage.
      const storedHiddenColumns = loadStoredHiddenColumns(collectionType);
      if (storedHiddenColumns) {
        // Make sure the stored hidden columns are valid for the current collection type. If not,
        // save the valid ones in localStorage. This can happen if the schema changes a property
        // name after the user saved the old property name to localStorage.
        const validHiddenColumns = storedHiddenColumns.filter(
          (columnId) =>
            columnId !== "@id" &&
            columns.find((column) => column.id === columnId)
        );
        if (validHiddenColumns.length !== storedHiddenColumns.length) {
          saveStoredHiddenColumns(collectionType, validHiddenColumns);
        }
        setHiddenColumns(validHiddenColumns);
      }
    }
  }, [collectionType, columns, isHiddenColumnsFromUrl]);

  if (collectionType && profiles) {
    const filteredColumns = filterHiddenColumns(columns, hiddenColumns);
    const sortedColumns = sortColumns(filteredColumns);
    return (
      <>
        <ColumnControls>
          {isHiddenColumnsFromUrl ? (
            <UrlColumnControls
              collectionType={collectionType}
              hiddenColumns={hiddenColumns}
              onClearedUrlHiddenColumns={clearUrlColumns}
            />
          ) : (
            <BrowserColumnControls
              columns={columns}
              hiddenColumns={hiddenColumns}
              onChange={updateHiddenColumns}
              onChangeAllHiddenColumns={changeAllHiddenColumns}
            />
          )}
          <CollectionDownload
            collection={collection}
            columns={sortedColumns}
            hiddenColumns={hiddenColumns}
            collectionType={collectionType}
          />
        </ColumnControls>
        <CollectionCount count={collection.length} />
        <ScrollIndicators gridRef={gridRef}>
          <DataGridContainer ref={gridRef}>
            <SortableGrid
              data={collection}
              columns={sortedColumns}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </DataGridContainer>
        </ScrollIndicators>
      </>
    );
  }

  // Profiles haven't loaded yet, or for some reason we couldn't determine the collection type.
  return null;
};

CollectionTable.propTypes = {
  // Collection to display in a table
  collection: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Collection pager status
  pagerStatus: PropTypes.shape({
    // Number of items per page
    itemsPerPage: PropTypes.number.isRequired,
    // Index of the page of items to display
    pageIndex: PropTypes.number.isRequired,
  }).isRequired,
};

export default CollectionTable;
