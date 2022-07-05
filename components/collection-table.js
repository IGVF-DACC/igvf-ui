// node_modules
import { motion } from "framer-motion"
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardCopyIcon,
} from "@heroicons/react/solid"
import { useRouter } from "next/router"
import PropTypes from "prop-types"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
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
  const className = "flex-grow md:flex-grow-0"
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
  const className = "ml-1.5 h-5 w-5"
  return (
    <>
      {isAnyColumnHidden ? (
        <Icon.TableColumnsHidden className={className} />
      ) : (
        <Icon.TableColumnsVisible className={className} />
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
            <div className="text-center text-sm text-gray-700 dark:text-gray-300 md:ml-2 md:flex-grow md:text-left">
              The <i>ID</i> column cannot be hidden
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
  // Array of all available columns
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Array of columns to hide
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Called when the user changes which columns are shown or hidden
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
 * Shows and handles the controls to manage the URL columns controls that let the user copy a URL
 * containing the currently hidden columns.
 */
const UrlColumnControls = ({
  collectionType,
  hiddenColumns,
  onClearedUrlHiddenColumns,
}) => {
  const router = useRouter()

  /**
   * Called to clear the URL columns hashtag and restore the ones from localStorage.
   */
  const clearHashtagHiddenColumns = () => {
    onClearedUrlHiddenColumns()
    const urlWithoutColumns = clearHiddenColumnsFromUrl(window.location.href)
    router.push(urlWithoutColumns)
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
          in your URL to your browser, overwriting any shown and hidden columns
          you had previously saved.
        </Paragraph>
        <Paragraph>
          <strong>Clear URL Columns</strong> restores the shown and hidden
          columns you have saved to your browser, clearing the URL of hidden
          columns.
        </Paragraph>
      </Instruction>
    </>
  )
}

UrlColumnControls.propTypes = {
  // Type of collection being displayed
  collectionType: PropTypes.string.isRequired,
  // Array of column IDs of the hidden columns
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Called once the user clears the URL columns
  onClearedUrlHiddenColumns: PropTypes.func.isRequired,
}

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
  const className = "mx-1.5 inline h-5 w-5"
  return (
    <>
      <ColumnSelector
        columns={columns}
        hiddenColumns={hiddenColumns}
        onChange={onChange}
        onChangeAllHiddenColumns={onChangeAllHiddenColumns}
      />
      <ColumnUrlCopy hiddenColumns={hiddenColumns} />
      <Instruction title="Show / Hide Columns and Copy URL Columns">
        <Paragraph>
          <strong>Show / Hide Columns</strong> lets you choose which individual
          columns to show and hide, and lets you show or hide all columns at
          once, except for the <i>ID</i> column. The
          <Icon.TableColumnsHidden className={className} />
          symbol indicates at least one column is hidden. The
          <Icon.TableColumnsVisible className={className} />
          symbol indicates all columns are shown.
        </Paragraph>
        <Paragraph>
          <strong>Copy URL Columns</strong> copies a URL with your currently
          hidden columns attached to it. You can share this URL with others so
          they can see this collection with the same columns hidden, or you can
          paste it into another browser.
        </Paragraph>
      </Instruction>
    </>
  )
}

BrowserColumnControls.propTypes = {
  // Array of all available columns
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Array of column IDs of the hidden columns
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Called when the user changes individual columns to show or hide
  onChange: PropTypes.func.isRequired,
  // Called when the user changes which columns are shown or hidden
  onChangeAllHiddenColumns: PropTypes.func.isRequired,
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
 * Renders a single left- or right-pointing scroll indicator.
 */
const ScrollIndicator = ({ direction, children }) => {
  return (
    <motion.div
      initial="visible"
      animate="hidden"
      variants={{ visible: { opacity: 1 }, hidden: { opacity: 0 } }}
      transition={{ duration: 2 }}
      className={`absolute top-5 h-10 w-10 bg-slate-500 ${
        direction === "left" ? "left-5" : "right-5"
      }`}
    >
      {children}
    </motion.div>
  )
}

ScrollIndicator.propTypes = {
  // Direction of the scroll indicator
  direction: PropTypes.oneOf(["left", "right"]).isRequired,
}

/**
 * Wrapper around the data grid to show scroll indicators when the table is horizontally scrollable.
 */
const ScrollIndicators = ({ gridRef, children }) => {
  // True if the table can be scrolled to the right
  const [isScrollableRight, setIsScrollableRight] = useState(false)
  // True if the table can be scrolled to the left
  const [isScrollableLeft, setIsScrollableLeft] = useState(false)

  /**
   * Called when the mouse enters anywhere in the table.
   */
  const onPointerEnter = () => {
    // Determine if any portion of the table exists to the right of the visible portion.
    const isRightScrollable =
      gridRef.current.scrollWidth - Math.round(gridRef.current.scrollLeft) !==
      gridRef.current.clientWidth
    setIsScrollableRight(isRightScrollable)

    // Determine if any portion of the table exists to the left of the visible portion.
    const isLeftScrollable = gridRef.current.scrollLeft > 0
    setIsScrollableLeft(isLeftScrollable)
  }

  /**
   * Called when the mouse exits the table. Remove the scroll indicators from the DOM.
   */
  const onPointerLeave = () => {
    setIsScrollableRight(false)
    setIsScrollableLeft(false)
  }

  return (
    <div
      className="relative"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {isScrollableLeft && (
        <ScrollIndicator direction="left">
          <ChevronLeftIcon className="fill-white" />
        </ScrollIndicator>
      )}
      {isScrollableRight && (
        <ScrollIndicator direction="right">
          <ChevronRightIcon className="fill-white" />
        </ScrollIndicator>
      )}
      {children}
    </div>
  )
}

ScrollIndicators.propTypes = {
  // Reference to the table DOM element
  gridRef: PropTypes.object.isRequired,
}

/**
 * Displays the table view for a collection of objects on a collection page.
 */
const CollectionTable = ({ collection }) => {
  const { profiles } = useContext(GlobalContext)
  // Track the user's selected hidden columns
  const [hiddenColumns, setHiddenColumns] = useState([])
  // True if hidden columns determine by hashtag instead of localStorage
  const [isHiddenColumnsFromUrl, setIsHiddenColumnsFromUrl] = useState(false)
  // Get the collection type from the first collection item, if any
  const collectionType = collection[0]?.["@type"][0] || ""
  // Unfiltered table columns for the current collection type; memoize for useEffect dependency
  const columns = useMemo(
    () => (profiles ? generateTableColumns(profiles[collectionType]) : []),
    [profiles, collectionType]
  )
  const gridRef = useRef(null)

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
    saveStoredHiddenColumns(collectionType, newHiddenColumns)
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
            <UrlColumnControls
              collectionType={collectionType}
              hiddenColumns={hiddenColumns}
              onChange={updateHiddenColumns}
              onClearedUrlHiddenColumns={() => setIsHiddenColumnsFromUrl(false)}
            />
          ) : (
            <BrowserColumnControls
              columns={columns}
              hiddenColumns={hiddenColumns}
              onChange={updateHiddenColumns}
              onChangeAllHiddenColumns={changeAllHiddenColumns}
            />
          )}
        </ColumnControls>
        <ScrollIndicators gridRef={gridRef}>
          <DataGridContainer ref={gridRef}>
            <SortableGrid data={flattenedCollection} columns={sortedColumns} />
          </DataGridContainer>
        </ScrollIndicators>
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
