// node_modules
import { CheckIcon, ClipboardCopyIcon, XIcon } from "@heroicons/react/solid"
import _ from "lodash"
import Link from "next/link"
import { useRouter } from "next/router"
import PropTypes from "prop-types"
import { useContext, useEffect, useMemo, useState } from "react"
// components
import Button from "./button"
import Checkbox from "./checkbox"
import CopyButton from "./copy-button"
import { DataGridContainer } from "./data-grid"
import GlobalContext from "./global-context"
import Modal from "./modal"
import SortableGrid from "./sortable-grid"
// libs
import {
  clearHiddenColumnsFromUrl,
  extractHiddenColumnIdsFromUrl,
  filterHiddenColumns,
  generateHiddenColumnsUrl,
} from "../libs/collection-table"

/**
 * Copy the given collection with any non-simple properties of the collection objects converted to
 * a JSON string. Any functions or undefined properties get omitted from the returned copy.
 * @param {array} collection Collection to copy to an array of objects with flattened properties
 * @returns {array} Copy of collection, but with objects with flattened properties
 */
const flattenCollection = (collection) => {
  const flattenedCollection = collection.map((item) => {
    const flattenedItem = {}
    Object.keys(item).forEach((key) => {
      const propType = typeof item[key]
      if (propType === "object") {
        // Generally, object, array, or null (which is OK to stringify to 'null').
        flattenedItem[key] = JSON.stringify(item[key])
      } else if (propType !== "function" && propType !== "undefined") {
        // Generally, any simple value.
        flattenedItem[key] = item[key]
      }
      // Anything else (function, undefined) gets ignored.
    })
    return flattenedItem
  })
  return flattenedCollection
}

/**
 * Sort the array of table columns by their titles, except for the column for the @id property.
 * That one always sorts first.
 * @param {array} columns Array of table columns to sort
 * @returns {array} Copy of `columns` sorted by title, but with @id always first
 */
const sortColumns = (columns) => {
  return _.sortBy(columns, [
    (column) => column.id !== "@id",
    (column) => (column.id === "@id" ? 0 : column.title),
  ])
}

/**
 * Retrieve the array of hidden columns from localStorage for the given type.
 * @param {string} type The @type of the object whose hidden columns we need from localStorage
 * @returns {array} Array of column ids to hide for the given @type; null if nothing stored
 */
const loadStoredHiddenColumns = (type) => {
  const hiddenColumns = localStorage.getItem(`hidden-columns-${type}`)
  if (hiddenColumns) {
    return JSON.parse(hiddenColumns)
  }
  return null
}

/**
 * Save the array of hidden columns to localStorage for the given type.
 * @param {string} type The @type of the object whose hidden columns we save to localStorage
 * @param {array} hiddenColumns Array of column ids to hide for the given @type
 */
const saveStoredHiddenColumns = (type, hiddenColumns) => {
  localStorage.setItem(`hidden-columns-${type}`, JSON.stringify(hiddenColumns))
}

/**
 * Display a list of buttons for the hidden columns, and clicking a button removes that column
 * from the hidden columns list, causing it to appear again.
 */
const HiddenColumnViewer = ({
  hiddenColumns,
  columns,
  onChange,
  isHiddenColumnsFromUrl,
}) => {
  if (hiddenColumns.length > 0) {
    const sortedHiddenColumns = _.sortBy(hiddenColumns)
    return (
      <div className="mb-3">
        <div className="text-sm font-semibold ">
          {isHiddenColumnsFromUrl ? (
            <>URL-Specified Hidden Columns</>
          ) : (
            <>Saved Hidden Columns</>
          )}
        </div>
        <ul className="flex flex-wrap gap-0.5 border border-data-border bg-data-background p-1">
          {sortedHiddenColumns.map((columnId) => {
            const column = columns.find((column) => column.id === columnId)
            if (column) {
              return (
                <li key={columnId}>
                  <Button
                    type={isHiddenColumnsFromUrl ? "warning" : "success"}
                    label={`Remove ${column.title} from hidden columns`}
                    onClick={() => onChange(columnId, false)}
                    size="sm"
                  >
                    {column.title}
                    <XIcon className="ml-1 h-3 w-3" />
                  </Button>
                </li>
              )
            }
            return null
          })}
        </ul>
      </div>
    )
  }

  return null
}

HiddenColumnViewer.propTypes = {
  // Columns to hide
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  // <SortTable> definitions for all columns, hidden and visible
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Called to clear the hidden column (make it visible)
  onChange: PropTypes.func.isRequired,
  // True if hidden columns are specified in the URL
  isHiddenColumnsFromUrl: PropTypes.bool.isRequired,
}

/**
 * Generate a list of report columns for the sortable grid.
 * @param {object} profile Profile for one schema object type
 * @returns {object} Sortable grid columns
 */
const tableColumns = (profile) => {
  return Object.keys(profile.properties).map((property) => {
    const column = {
      id: property,
      title: profile.properties[property].title,
    }

    // @id property should display a link to the object displayed in the collection table.
    if (property === "@id") {
      column.display = ({ source }) => {
        return (
          <Link href={source["@id"]}>
            <a>{source["@id"]}</a>
          </Link>
        )
      }
    }
    return column
  })
}

/**
 * Displays the buttons to hide or show all columns at once.
 */
const ChangeAllControls = ({ onChangeAllHiddenColumns }) => {
  return (
    <div className="flex gap-1">
      <Button onClick={() => onChangeAllHiddenColumns(true)}>
        Hide All Columns
      </Button>
      <Button onClick={() => onChangeAllHiddenColumns(false)}>
        Hide No Columns
      </Button>
    </div>
  )
}

ChangeAllControls.propTypes = {
  // Called when the user wants to hide or show all columns at once
  onChangeAllHiddenColumns: PropTypes.func.isRequired,
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
        Select Hidden Columns
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Header>Select columns to hide</Modal.Header>
        <Modal.Body>
          <ChangeAllControls
            onChangeAllHiddenColumns={onChangeAllHiddenColumns}
          />
          <div className="mb-3 text-sm text-gray-700">
            The <em>ID</em> column cannot be hidden
          </div>
          <fieldset>
            <div className="md:flex md:flex-wrap">
              {sortedColumns.map((column) => {
                if (column.id !== "@id") {
                  const isHidden = hiddenColumns.includes(column.id)
                  return (
                    <Checkbox
                      key={column.id}
                      checked={isHidden}
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
            Copy Hidden-Columns URL{" "}
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
        Save URL-Specified Hidden Columns
      </Button>
      <Button onClick={clearHashtagHiddenColumns}>
        Clear URL-Specified Hidden Columns
      </Button>
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
  return <div className="my-1 flex flex-wrap gap-1">{children}</div>
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
    () => (profiles ? tableColumns(profiles[collectionType]) : []),
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
        <HiddenColumnViewer
          columns={columns}
          hiddenColumns={hiddenColumns}
          onChange={updateHiddenColumns}
          isHiddenColumnsFromUrl={isHiddenColumnsFromUrl}
        />
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
