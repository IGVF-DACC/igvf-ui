/**
 * Clears any hashtag from the URL.
 * @param {string} url - The URL to clean
 * @returns {string} `url` with any hashtag removed
 */
export const clearHiddenColumnsFromUrl = (url) => {
  const parsedUrl = new URL(url)
  parsedUrl.hash = ""
  return parsedUrl.toString()
}

/**
 * Extract a list of hidden column IDs from the URL. Hidden column get specified as:
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
 * Copy the columns array intended for <SortableGrid> but with any columns with ids matching an
 * entry in `hiddenColumns` omitted.
 * @param {array} columns Sortable grid columns to filter
 * @param {array} hiddenColumns Ids of columns to hide
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
 * Generate a URL that includes the hashtag that specifies the hidden columns. If the
 * `hiddenColumns` array is empty, just the normal URL gets returned. Components calling this
 * function must have mounted before calling this function.
 * @param {array} hiddenColumns Array of IDS of columns to hide
 * @returns {string} URL with hashtag of hidden columns, if any
 */
export const generateHiddenColumnsUrl = (url, hiddenColumns) => {
  const parsedUrl = new URL(url)
  parsedUrl.hash =
    hiddenColumns.length > 0 ? `#hidden=${hiddenColumns.join()}` : ""
  return parsedUrl.toString()
}
