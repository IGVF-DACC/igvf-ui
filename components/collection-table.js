// node_modules
import { XIcon } from "@heroicons/react/solid"
import _ from "lodash"
import Link from "next/link"
import Router from "next/router"
import PropTypes from "prop-types"
import { useContext, useEffect, useState } from "react"
import url from "url"
// components
import Button from "./button"
import Checkbox from "./checkbox"
import CopyButton from "./copy-button"
import { DataGridContainer } from "./data-grid"
import GlobalContext from "./global-context"
import Modal from "./modal"
import SortableGrid from "./sortable-grid"

/**
 * Copy the columns array intended for <SortableGrid> but with any columns with ids matching an
 * entry in `hiddenColumns` omitted.
 * @param {array} columns Sortable grid columns to filter
 * @param {array} hiddenColumns Ids of columns to hide
 * @returns {array} `columns` copy but with hidden columns removed
 */
const filterHiddenColumns = (columns, hiddenColumns) => {
  return columns.filter((column) => {
    return !hiddenColumns.includes(column.id)
  })
}

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
 * Extract a list of hidden column IDs from the URL. Hidden column get specified as:
 * path#hidden=column_id_1,column_id_2,column_id_3
 * Export for Jest testing.
 * @param {string} urlHash Hashtag from browser URL
 * @returns {array} Hidden column IDs
 */
export const extractHiddenColumnIdsFromHastag = (urlHash) => {
  // First detect we have "hidden=something" in the hashtag.
  const columnSpecifier = urlHash.match(/#hidden=(.+)/)
  if (columnSpecifier) {
    // Now get the comma-separated list of column IDs after the "hidden=".
    const commaSeparatedColumnIds = columnSpecifier[1].match(/([a-zA-Z0-9]+)/g)
    return commaSeparatedColumnIds || []
  }

  // URL doesn't have a form of path#hidden=column1,column2,column3
  return []
}

/**
 * Displays a button to copy the current collection URL along with a hashtag for the currently
 * hidden columns so the user can share the collection view with selected columns hidden.
 */
const TableViewColumnUrlCopy = ({ hiddenColumns }) => {
  const parsedUrl = url.parse(window.location.href)
  const hashtag = `#hidden=${hiddenColumns.join()}`
  parsedUrl.hash = hashtag
  const hiddenColumnsUrl = url.format(parsedUrl)

  return (
    <CopyButton target={hiddenColumnsUrl}>
      {() => {
        return <>Copy Hidden Columns URL</>
      }}
    </CopyButton>
  )
}

TableViewColumnUrlCopy.propTypes = {
  // Array of column IDs of the hidden columns
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
}

/**
 * Display a list of buttons for the hidden columns, and clicking a button removes that column
 * from the hidden columns list, causing it to appear again.
 */
const TableHiddenColumnViewer = ({ hiddenColumns, columns, onChange }) => {
  const sortedHiddenColumns = _.sortBy(hiddenColumns)
  return (
    <div className="flex flex-wrap gap-0.5">
      {sortedHiddenColumns.map((columnId) => {
        const column = columns.find((column) => column.id === columnId)
        if (column) {
          return (
            <Button
              key={columnId}
              type="success"
              onClick={() => onChange(columnId, false)}
              size="sm"
            >
              {column.title}
              <XIcon className="ml-1 h-3 w-3" />
            </Button>
          )
        }
        return null
      })}
    </div>
  )
}

TableHiddenColumnViewer.propTypes = {
  // Columns to hide
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  // <SortTable> definitions for all columns, hidden and visible
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Called to clear the hidden column (make it visible)
  onChange: PropTypes.func.isRequired,
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
 * Display the actuator button to display the modal for the user to select which columns to
 * display and which to hide. This also displays that modal.
 */
const TableViewColumnSelector = ({ columns, hiddenColumns, onChange }) => {
  // True if the column-selection modal is open.
  const [isOpen, setIsOpen] = useState(false)

  // Display the selectable columns sorted by title.
  const sortedColumns = sortColumns(columns)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Select Visible Columns</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Header>Select columns to display</Modal.Header>
        <Modal.Body>
          <fieldset>
            <div className="md:flex md:flex-wrap">
              {sortedColumns.map((column) => {
                if (column.id !== "@id") {
                  const isHidden = hiddenColumns.includes(column.id)
                  return (
                    <Checkbox
                      key={column.id}
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
          <Button type="info" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

TableViewColumnSelector.propTypes = {
  // Array of columns to display
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Array of columns to hide
  hiddenColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Called when the user changes the selected columns
  onChange: PropTypes.func.isRequired,
}

/**
 * Displays the table view for a collection of objects on a collection page.
 */
const CollectionTable = ({ collection }) => {
  // Track the user's selected hidden columns
  const [hiddenColumns, setHiddenColumns] = useState([])
  // True if hidden columns determine by hashtag instead of localStorage
  const [isHiddenColumnsFromHashtag, setIsHiddenColumnsFromHashtag] =
    useState(false)
  const { profiles } = useContext(GlobalContext)
  // Get the collection type from the first collection item, if any
  const collectionType = collection[0]?.["@type"][0] || ""

  /**
   * Called when the user changes which columns are visible and hidden through the column selector.
   * It updates the `hiddenColumns` state and saves the new state to localStorage.
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
   * Called when the user clicks the button to save the hashtag-specified hidden columns to
   * localStorage. It also redirects to the same URL without the hashtag.
   */
  const saveHashtagHiddenColumns = () => {
    // Save current hidden columns to localStorage.
    saveStoredHiddenColumns(collectionType, hiddenColumns)
    setIsHiddenColumnsFromHashtag(false)

    // Update the URL to remove the hashtag.
    const parsedUrl = url.parse(window.location.href)
    parsedUrl.hash = null
    const newUrl = url.format(parsedUrl)
    Router.replace(newUrl)
  }

  useEffect(() => {
    // Determine whether the URL hashtag specifies hidden columns, overriding the hidden columns in
    // localStorage.
    const hashtag = url.parse(window.location.href).hash || ""
    const hashedHiddenColumns = hashtag
      ? extractHiddenColumnIdsFromHastag(hashtag)
      : []
    if (hashedHiddenColumns.length > 0) {
      // Current browser URL has a list of hidden columns. Ignore localStorage and use these
      // instead.
      setHiddenColumns(hashedHiddenColumns)
      setIsHiddenColumnsFromHashtag(true)
    } else {
      // Load the hidden columns for the current collection type from localStorage.
      const storedHiddenColumns = loadStoredHiddenColumns(collectionType)
      if (storedHiddenColumns) {
        setHiddenColumns(storedHiddenColumns)
      }
    }
  }, [collectionType])

  // Display table view.
  const flattenedCollection = flattenCollection(collection)
  if (collectionType && profiles) {
    const columns = tableColumns(profiles[collectionType])
    const filteredColumns = filterHiddenColumns(columns, hiddenColumns)
    const sortedColumns = sortColumns(filteredColumns)
    return (
      <>
        {!isHiddenColumnsFromHashtag ? (
          <>
            <TableViewColumnSelector
              columns={columns}
              hiddenColumns={hiddenColumns}
              onChange={updateHiddenColumns}
            />
            <TableViewColumnUrlCopy hiddenColumns={hiddenColumns} />
          </>
        ) : (
          <Button onClick={saveHashtagHiddenColumns}>
            Save Hidden Columns
          </Button>
        )}
        <TableHiddenColumnViewer
          columns={columns}
          hiddenColumns={hiddenColumns}
          onChange={updateHiddenColumns}
        />
        <DataGridContainer>
          <SortableGrid data={flattenedCollection} columns={sortedColumns} />
        </DataGridContainer>
      </>
    )
  }
}

CollectionTable.propTypes = {
  // Collection to display in a table
  collection: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default CollectionTable
