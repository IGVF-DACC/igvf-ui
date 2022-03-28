import { getCollectionPathFromItemPath } from "./paths"
import { getObject } from "./request"

/**
 * Given a collection object from the server, return a breadcrumb context for this collection.
 * @param {object} collection Collection data from the server
 * @returns {array} Breadcrumb context for the given collection
 */
const buildCollectionBreadcrumbContext = (collection) => {
  return [
    {
      title: collection.title,
      path: collection["@id"],
    },
  ]
}

/**
 * Given an item object from the server, return a breadcrumb context for this item.
 * @param {object} item Item data from the server
 * @returns {array} Breadcrumb context for the given item
 */
const buildItemBreadcrumbContext = async (item) => {
  const collection = await getObject(getCollectionPathFromItemPath(item["@id"]))
  const breadcrumbContext = buildCollectionBreadcrumbContext(collection).concat(
    {
      title: item.title,
      path: item["@id"],
    }
  )
  return breadcrumbContext
}

/**
 * Given an item or collection object from the server, return a breadcrumb context for this object.
 * @param {object} itemOrCollection Item or collection data from the server
 * @returns {array} Breadcrumb context for the given item or collection
 */
export const buildBreadcrumbContext = async (itemOrCollection) => {
  let breadcrumbContext = []
  if (itemOrCollection["@type"].includes("Collection")) {
    breadcrumbContext = buildCollectionBreadcrumbContext(itemOrCollection)
  } else if (itemOrCollection["@type"].includes("Item")) {
    breadcrumbContext = await buildItemBreadcrumbContext(itemOrCollection)
  }
  return breadcrumbContext
}
