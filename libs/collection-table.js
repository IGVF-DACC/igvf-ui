// node_modules
import _ from "lodash"
import Link from "next/link"

/**
 * Clears any hashtag from the URL.
 * @param {string} url The URL to clean
 * @returns {string} `url` with any hashtag removed
 */
export const clearHiddenColumnsFromUrl = (url) => {
  const parsedUrl = new URL(url)
  parsedUrl.hash = ""
  return parsedUrl.toString()
}

/**
 * Extract a list of hidden column IDs from the URL. Hidden columns get specified as:
 * path#hidden=column_id_1,column_id_2,column_id_3
 * The column IDs have to contain only alphanumeric characters and underscores.
 * @param {string} url URL to extract hidden columns from
 * @returns {array} Hidden column IDs; [] if #hidden= present but no columns; null if no #hidden=
 */
export const extractHiddenColumnIdsFromUrl = (url) => {
  const hashtag = new URL(url).hash
  if (hashtag) {
    const columnSpecifiers = hashtag.match(/#hidden=(.*)/)
    if (columnSpecifiers) {
      const commaSeparatedColumnIds =
        columnSpecifiers[1].match(/([a-zA-Z0-9_]+)/g)
      return commaSeparatedColumnIds || []
    }
  }

  // URL doesn't have a form of path#hidden=column1,column2,column3
  return null
}

/**
 * Copy the columns array intended for <SortableGrid> but with any columns with an `id` property
 * matching an entry in `hiddenColumns` omitted.
 * @param {array} columns Sortable grid columns to filter
 * @param {array} hiddenColumns IDs of columns to hide
 * @returns {array} `columns` copy but with hidden columns removed
 */
export const filterHiddenColumns = (columns, hiddenColumns) => {
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
export const flattenCollection = (collection) => {
  const flattenedCollection = collection.map((item) => {
    const flattenedItem = {}
    Object.keys(item).forEach((key) => {
      const propType = typeof item[key]
      if (propType === "object" && item[key] !== null) {
        // Generally, objects and arrays get stringified.
        if (
          (Array.isArray(item[key]) && item[key].length !== 0) ||
          (!Array.isArray(item[key]) && Object.keys(item[key]).length !== 0)
        ) {
          flattenedItem[key] = JSON.stringify(item[key])
        }
      } else if (propType !== "function" && propType !== "undefined") {
        // Generally, any simple value get passed through unchanged.
        flattenedItem[key] = item[key]
      }
      // Anything else (function, undefined, null, etc.) gets ignored, as do empty arrays and
      // objects.
    })
    return flattenedItem
  })
  return flattenedCollection
}

/**
 * Generate a URL that includes the hashtag that specifies the hidden columns. If the
 * `hiddenColumns` array is empty, just the normal URL gets returned.
 * @param {string} url URL to generate a URL with #hidden= hashtag
 * @param {array} hiddenColumns Array of IDS of columns to hide
 * @returns {string} URL with hashtag of hidden columns, if any
 */
export const generateHiddenColumnsUrl = (url, hiddenColumns) => {
  const parsedUrl = new URL(url)
  parsedUrl.hash =
    hiddenColumns.length > 0 ? `#hidden=${hiddenColumns.join()}` : ""
  return parsedUrl.toString()
}

/**
 * Sort the array of table columns by their titles, except for the column for the @id property.
 * That one always sorts first.
 * @param {array} columns Array of table columns to sort
 * @returns {array} Copy of `columns` sorted by title, but with @id always first
 */
export const sortColumns = (columns) => {
  return _.sortBy(columns, [
    (column) => column.id !== "@id",
    (column) => (column.id === "@id" ? 0 : column.title),
  ])
}

/**
 * Retrieve the array of hidden columns from localStorage for the given type.
 * @param {string} type The @type of the object whose hidden columns we need from localStorage
 * @returns {array} Array of column IDs to hide for the given @type; null if nothing stored
 */
export const loadStoredHiddenColumns = (type) => {
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
export const saveStoredHiddenColumns = (type, hiddenColumns) => {
  localStorage.setItem(`hidden-columns-${type}`, JSON.stringify(hiddenColumns))
}

/**
 * Generate a list of report columns in a format suitable for <SortableGrid>.
 * @param {object} profile Profile for one schema object type
 * @returns {object} Sortable grid columns
 */
export const generateTableColumns = (profile) => {
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
