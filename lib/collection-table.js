// node_modules
import _ from "lodash";

// Maximum number of characters in a cell that Excel accepts in a TSV file.
const MAX_CELL_LENGTH = 490;

/**
 * Clears any hashtag from the URL.
 * @param {string} url The URL to clean
 * @returns {string} `url` with any hashtag removed
 */
export const clearHiddenColumnsFromUrl = (url) => {
  const parsedUrl = new URL(url);
  parsedUrl.hash = "";
  return parsedUrl.toString();
};

/**
 * Extract a list of hidden column IDs from the URL. Hidden columns get specified as:
 * path#hidden=column_id_1,column_id_2,column_id_3
 * The column IDs have to contain only alphanumeric characters and underscores.
 * @param {string} url URL to extract hidden columns from
 * @returns {array} Hidden column IDs; [] if #hidden= present but no columns; null if no #hidden=
 */
export const extractHiddenColumnIdsFromUrl = (url) => {
  const hashtag = new URL(url).hash;
  if (hashtag) {
    const columnSpecifiers = hashtag.match(/#hidden=(.*)/);
    if (columnSpecifiers) {
      const commaSeparatedColumnIds =
        columnSpecifiers[1].match(/([a-zA-Z0-9_@]+)/g);
      return commaSeparatedColumnIds || [];
    }
  }

  // URL doesn't have a form of path#hidden=column1,column2,column3
  return null;
};

/**
 * Copy the columns array intended for <SortableGrid> but with any columns with an `id` property
 * matching an entry in `hiddenColumns` omitted.
 * @param {array} columns Sortable grid columns to filter
 * @param {array} hiddenColumns IDs of columns to hide
 * @returns {array} `columns` copy but with hidden columns removed
 */
export const filterHiddenColumns = (columns, hiddenColumns) => {
  return columns.filter((column) => {
    return !hiddenColumns.includes(column.id);
  });
};

/**
 * Given a collection, determine the type of objects within it. All items in the collection assumed
 * to have the same type. Returns "" for zero-length collections or if we can't determine the type
 * for whatever reason.
 * @param {array} collection Collection to determine type of
 * @returns {string} Type of objects in the collection
 */
export const getCollectionType = (collection) => {
  if (collection.length > 0) {
    return collection[0]["@type"] ? collection[0]["@type"][0] : "";
  } else {
    return "";
  }
};

/**
 * Generate a URL that includes the hashtag that specifies the hidden columns. If the
 * `hiddenColumns` array is empty, just the normal URL gets returned.
 * @param {string} url URL to generate a URL with #hidden= hashtag
 * @param {array} hiddenColumns Array of IDS of columns to hide
 * @returns {string} URL with hashtag of hidden columns, if any
 */
export const generateHiddenColumnsUrl = (url, hiddenColumns) => {
  const parsedUrl = new URL(url);
  parsedUrl.hash =
    hiddenColumns.length > 0 ? `#hidden=${hiddenColumns.join()}` : "";
  return parsedUrl.toString();
};

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
  ]);
};

/**
 * Retrieve the array of hidden columns from localStorage for the given type.
 * @param {string} type The @type of the object whose hidden columns we need from localStorage
 * @returns {array} Array of column IDs to hide for the given @type; null if nothing stored
 */
export const loadStoredHiddenColumns = (type) => {
  const hiddenColumns = localStorage.getItem(`hidden-columns-${type}`);
  if (hiddenColumns) {
    return JSON.parse(hiddenColumns);
  }
  return null;
};

/**
 * Save the array of hidden columns to localStorage for the given type.
 * @param {string} type The @type of the object whose hidden columns we save to localStorage
 * @param {array} hiddenColumns Array of column ids to hide for the given @type
 */
export const saveStoredHiddenColumns = (type, hiddenColumns) => {
  localStorage.setItem(`hidden-columns-${type}`, JSON.stringify(hiddenColumns));
};

/**
 * Convert collection data from the server to an encoded string to write to a TSV file compatible
 * with Microsoft Excel, Google Sheets, and Apple Numbers.
 * @param {array} collection Collection data for a specific type
 * @param {string} collectionType The @type of the collection
 * @param {array} columns Columns to include in the TSV data
 * @param {array} hiddenColumns Array of currently hidden columns
 * @returns {object} File name and encode TSV content
 * @returns {string} fileName Name of the file to download
 * @returns {string} encodedTsvContent Encoded TSV data
 */
export const generateTsvFromCollection = (
  collection,
  collectionType,
  columns,
  hiddenColumns
) => {
  // Convert collection to array of arrays.
  const rows = collection.map((row) => {
    return columns.map((column) => {
      const cellValue = String(row[column.id] ?? "");
      return cellValue.slice(0, MAX_CELL_LENGTH);
    });
  });

  // Generate data for a row with date and URL to view the table on the site.
  const dateTime = new Date().toISOString();
  const formattedDateTime = dateTime.replace(
    /(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d).\d\d\dZ/,
    "$1_$2_$3_$4h_$5m_$6s_UTC"
  );
  const hiddenColumnsUrl = generateHiddenColumnsUrl(
    window.location.href,
    hiddenColumns
  );

  // Generate the row of column titles and prepend it to the data rows.
  const columnTitles = columns.map((column) => column.title);
  const columnTitlesAndRows = [columnTitles, ...rows];
  const tsvContents = encodeURIComponent(
    `${formattedDateTime}\t${hiddenColumnsUrl}\n${columnTitlesAndRows
      .map((row) => row.join("\t"))
      .join("\n")}`
  );

  // Generate the filename, converting spaces and : to underscores.
  const filename = `${collectionType.toLowerCase()}-${formattedDateTime}.tsv`;

  // Build the contents of the TSV file comprising a single string with all column titles and
  // rows, tab separated and encoded for a TSV file.
  // https://stackoverflow.com/questions/37176770/generate-tsv-file-given-the-table-headers-in-javascript#answer-37177111
  const encodedTsvContent = `data:text/tab-separated-values; charset=utf-8,${tsvContents}`;
  return { filename, encodedTsvContent };
};
