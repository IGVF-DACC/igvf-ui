/**
 * Convert an item path (e.g. /labs/uuid/) to the path to its collection (e.g. /labs/).
 * @param {string} itemPath Path to an item
 * @returns {string} Path to collection
 */
export const getCollectionPathFromItemPath = (itemPath) => {
  // Result of split is ["", "collection type", "item identifier", ""]
  const itemPathElements = itemPath.split("/")
  return `/${itemPathElements[1]}/`
}
