// node_modules
import { CheckIcon, ClipboardCopyIcon } from "@heroicons/react/solid"
import { useRouter } from "next/router"
import PropTypes from "prop-types"
import { useContext, useEffect, useMemo, useState } from "react"
// components
import Button from "./button"
import Checkbox from "./checkbox"
import CopyButton from "./copy-button"
import { DataGridContainer } from "./data-grid"
import GlobalContext from "./global-context"
import Icon from "./icon"
import Instruction from "./instruction"
import Modal from "./modal"
import Paragraph from "./paragraph"
import SortableGrid from "./sortable-grid"
// libs
import {
  clearHiddenColumnsFromUrl,
  extractHiddenColumnIdsFromUrl,
  filterHiddenColumns,
  flattenCollection,
  generateHiddenColumnsUrl,
  loadStoredHiddenColumns,
  saveStoredHiddenColumns,
  sortColumns,
  generateTableColumns,
} from "../libs/collection-table"

/**
 * Displays the buttons to hide or show all columns at once.
 */
const ChangeAllControls = ({ onChangeAllHiddenColumns }) => {
  return (
    <div className="flex gap-1">
      <Button
        className="flex-grow md:flex-grow-0"
        onClick={() => onChangeAllHiddenColumns(false)}
      >
        Show All Columns
      </Button>
      <Button
        className="flex-grow md:flex-grow-0"
        onClick={() => onChangeAllHiddenColumns(true)}
      >
        Hide All Columns
      </Button>
    </div>
  )
}

ChangeAllControls.propTypes = {
  // Called when the user wants to hide or show all columns at once
  onChangeAllHiddenColumns: PropTypes.func.isRequired,
}

/**
 * Display an icon showing whether any columns are hidden or not.
 */
const HiddenColumnsIndicator = ({ isAnyColumnHidden }) => {
  return (
    <>
      {isAnyColumnHidden ? (
        <Icon.TableColumnsHidden className="ml-1.5 h-5 w-5" />
      ) : (
        <Icon.TableColumnsVisible className="ml-1.5 h-5 w-5" />
      )}
    </>
  )
}

HiddenColumnsIndicator.propTypes = {
  // True if at least one column is hidden
  isAnyColumnHidden: PropTypes.bool.isRequired,
}

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
  const [isOpen, setIsOpen] = useState(false)

  // Display the selectable columns sorted by title.
  const sortedColumns = sortColumns(columns)

  return (
    <>
      <Button className="grow sm:grow-0" onClick={() => setIsOpen(true)}>
        Show / Hide Columns
        <HiddenColumnsIndicator isAnyColumnHidden={hiddenColumns.length > 0} />
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Header onClose={() => setIsOpen(false)}>
          <div className="flex items-center">
            Show / Hide Columns
            <HiddenColumnsIndicator
              isAnyColumnHidden={hiddenColumns.length > 0}
            />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3 md:flex md:items-center">
            <ChangeAllControls
              onChangeAllHiddenColumns={onChangeAllHiddenColumns}
            />
            <div className="text-center text-sm text-gray-700 md:ml-2 md:flex-grow md:text-left">
              The <em>ID</em> column cannot be hidden
            </div>
          </div>
          <fieldset>
            <div className="md:flex md:flex-wrap">
              {sortedColumns.map((column) => {
                if (column.id !== "@id") {
                  const isHidden = hiddenColumns.includes(column.id)
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
                  )
                }

                // Don't include @id property; @id is always visible.
                return null
              })}
            </div>
          </fieldset>
        </Modal.Body>
        <Modal.Footer>
          <Button type="primary-outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

ColumnSelector.propTypes = {
  // Array of columns to display
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Array of columns to hide
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Called when the user changes the selected columns
  onChange: PropTypes.func.isRequired,
  // Called when the user wants to hide or show all columns at once
  onChangeAllHiddenColumns: PropTypes.func.isRequired,
}

/**
 * Displays a button to copy the current collection URL along with a hashtag for the currently
 * hidden columns so the user can share the collection view with selected columns hidden.
 */
const ColumnUrlCopy = ({ hiddenColumns }) => {
  // True if the browser URL is available
  const [isHrefAvailable, setIsHrefAvailable] = useState(false)

  useEffect(() => {
    setIsHrefAvailable(true)
  }, [])

  const hiddenColumnsUrl = isHrefAvailable
    ? generateHiddenColumnsUrl(window.location.href, hiddenColumns)
    : ""
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
              {isCopied ? <CheckIcon /> : <ClipboardCopyIcon />}
            </div>
          </>
        )
      }}
    </CopyButton>
  )
}

ColumnUrlCopy.propTypes = {
  // Array of column IDs of the hidden columns
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
}

/**
 * Shows and handles the controls to manage the URL-specified hidden columns.
 */
const UrlSpecifiedControls = ({
  collectionType,
  hiddenColumns,
  onClearedUrlHiddenColumns,
}) => {
  const router = useRouter()

  /**
   * Called to clear the URL-specified hidden columns hashtag and restore the ones from
   * localStorage.
   */
  const clearHashtagHiddenColumns = () => {
    onClearedUrlHiddenColumns()
    const urlWithoutUrlHiddenColumns = clearHiddenColumnsFromUrl(
      window.location.href
    )
    router.push(urlWithoutUrlHiddenColumns)
  }

  /**
   * Called when the user clicks the button to save the hashtag-specified hidden columns to
   * localStorage. It also redirects to the same URL without the hashtag.
   */
  const saveHashtagHiddenColumns = () => {
    saveStoredHiddenColumns(collectionType, hiddenColumns)
    onClearedUrlHiddenColumns()
    const urlWithoutUrlHiddenColumns = clearHiddenColumnsFromUrl(
      window.location.href
    )
    router.push(urlWithoutUrlHiddenColumns)
  }

  return (
    <>
      <Button onClick={saveHashtagHiddenColumns}>
        Save URL Columns to Browser
      </Button>
      <Button onClick={clearHashtagHiddenColumns}>Clear URL Columns</Button>
      <Instruction title="Save and Clear URL Columns">
        <Paragraph>
          <strong>Save URL Columns to Browser</strong> saves the hidden columns
          in your URL to your browser, overwriting any hidden columns you have
          previously saved.
        </Paragraph>
        <Paragraph>
          <strong>Clear URL Columns</strong> restores the hidden columns you
          have saved to your browser.
        </Paragraph>
      </Instruction>
    </>
  )
}

UrlSpecifiedControls.propTypes = {
  // Type of collection being displayed
  collectionType: PropTypes.string.isRequired,
  // Array of column IDs of the hidden columns
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Called once the URL-specified hidden columns are cleared
  onClearedUrlHiddenColumns: PropTypes.func.isRequired,
}

/**
 * Wraps the table-view column controls, such as the hidden-column selector.
 */
const ColumnControls = ({ children }) => {
  return (
    <div className="my-1 flex flex-wrap items-center gap-1">{children}</div>
  )
}

/**
 * Displays the table view for a collection of objects on a collection page.
 */
const CollectionTable = ({ collection }) => {
  // Track the user's selected hidden columns
  const [hiddenColumns, setHiddenColumns] = useState([])
  // True if hidden columns determine by hashtag instead of localStorage
  const [isHiddenColumnsFromUrl, setIsHiddenColumnsFromUrl] = useState(false)
  const { profiles } = useContext(GlobalContext)
  // Get the collection type from the first collection item, if any
  const collectionType = collection[0]?.["@type"][0] || ""
  // Unfiltered table columns for the current collection type; memoize for useEffect dependency
  const columns = useMemo(
    () => (profiles ? generateTableColumns(profiles[collectionType]) : []),
    [profiles, collectionType]
  )
  const router = useRouter()

  /**
   * Called when the user changes which columns are visible and hidden through the column selector.
   * @param {string} selectedColumnId The id of the column that was hidden or shown
   * @param {boolean} isNowHidden True if the column is now hidden; false if it is now visible
   */
  const updateHiddenColumns = (selectedColumnId, isNowHidden) => {
    let newHiddenColumns = []
    if (isNowHidden) {
      newHiddenColumns = hiddenColumns.concat(selectedColumnId)
    } else {
      newHiddenColumns = hiddenColumns.filter(
        (columnId) => columnId !== selectedColumnId
      )
    }
    setHiddenColumns(newHiddenColumns)

    // Update the URL with the new hidden columns.
    if (isHiddenColumnsFromUrl) {
      const hiddenColumnsUrl = generateHiddenColumnsUrl(
        window.location.href,
        newHiddenColumns
      )
      router.push(hiddenColumnsUrl)
    } else {
      saveStoredHiddenColumns(collectionType, newHiddenColumns)
    }
  }

  /**
   * Handle the user selecting all columns to hide or show at once.
   * @param {boolean} isNowHidden True if all columns now hidden; false if all columns now visible
   */
  const changeAllHiddenColumns = (isNowHidden) => {
    const newHiddenColumns = isNowHidden
      ? columns
          .filter((column) => column.id !== "@id")
          .map((column) => column.id)
      : []
    setHiddenColumns(newHiddenColumns)
    saveStoredHiddenColumns(collectionType, newHiddenColumns)
  }

  useEffect(() => {
    // Determine whether the URL hashtag specifies hidden columns, overriding the hidden columns in
    // localStorage.
    const hashedHiddenColumns = extractHiddenColumnIdsFromUrl(
      window.location.href
    )
    if (hashedHiddenColumns?.length >= 0) {
      // Current browser URL has a #hidden= hashtag. Ignore localStorage and use the hidden columns
      // specified here instead.
      setHiddenColumns(hashedHiddenColumns)
      setIsHiddenColumnsFromUrl(true)
    } else {
      // Load the hidden columns for the current collection type from localStorage.
      const storedHiddenColumns = loadStoredHiddenColumns(collectionType)
      if (storedHiddenColumns) {
        // Make sure the stored hidden columns are valid for the current collection type. If not,
        // save the valid ones in localStorage.
        const validHiddenColumns = storedHiddenColumns.filter(
          (columnId) =>
            columnId !== "@id" &&
            columns.find((column) => column.id === columnId)
        )
        if (validHiddenColumns.length !== storedHiddenColumns.length) {
          saveStoredHiddenColumns(collectionType, validHiddenColumns)
        }
        setHiddenColumns(validHiddenColumns)
      }
    }
  }, [collectionType, columns, isHiddenColumnsFromUrl])

  if (collectionType && profiles) {
    const flattenedCollection = flattenCollection(collection)
    const filteredColumns = filterHiddenColumns(columns, hiddenColumns)
    const sortedColumns = sortColumns(filteredColumns)
    return (
      <>
        <ColumnControls>
          {isHiddenColumnsFromUrl ? (
            <UrlSpecifiedControls
              collectionType={collectionType}
              hiddenColumns={hiddenColumns}
              onClearedUrlHiddenColumns={() => setIsHiddenColumnsFromUrl(false)}
            />
          ) : (
            <>
              <ColumnSelector
                columns={columns}
                hiddenColumns={hiddenColumns}
                onChange={updateHiddenColumns}
                onChangeAllHiddenColumns={changeAllHiddenColumns}
              />
              <ColumnUrlCopy hiddenColumns={hiddenColumns} />
              <Instruction title="Show / Hide Columns and Copy URL Columns">
                <Paragraph>
                  Your choices for columns to show and hide get saved to your
                  browser for each type of collection.
                </Paragraph>
                <Paragraph>
                  Copy URL Columns with your shown and hidden columns to share
                  with others, or to paste into another browser.
                </Paragraph>
              </Instruction>
            </>
          )}
        </ColumnControls>
        <DataGridContainer>
          <SortableGrid data={flattenedCollection} columns={sortedColumns} />
        </DataGridContainer>
      </>
    )
  }

  // Profiles haven't loaded yet, or for some reason we couldn't determine the collection type.
  return null
}

CollectionTable.propTypes = {
  // Collection to display in a table
  collection: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default CollectionTable
