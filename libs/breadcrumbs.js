/**
 * This module refers to "breadcrumb context." This constitutes an array of objects, with each
 * object representing an element within the breadcrumb trail. Each object has a title that gets
 * displayed as an element in the breadcrumb trail, and an `href` property that links to the page
 * that the breadcrumb element links to.
 */
import { getCollectionPathFromItemPath } from "./paths"
import { getObject } from "./request"

/**
 * Given a collection object from the server, return a breadcrumb context for this collection.
 * @param {object} collection Collection data from the server
 * @param {string} titleProp Name of the collection property to use as the breadcrumb title
 * @returns {array} Breadcrumb context for the given collection
 */
const buildCollectionBreadcrumbContext = (collection, titleProp) => {
  return [
    {
      title: collection[titleProp],
      href: collection["@id"],
    },
  ]
}

/**
 * Given an item object from the server, return a breadcrumb context for this item.
 * @param {object} item Item data from the server
 * @param {string} titleProp Name of the item property to use as the breadcrumb title
 * @returns {array} Breadcrumb context for the given item
 */
const buildItemBreadcrumbContext = async (item, titleProp) => {
  // Retrieve the collection object that the item belongs to so that we can get the collection's
  // title.
  const collection = await getObject(getCollectionPathFromItemPath(item["@id"]))

  // Build the breadcrumb context from the collection and item.
  const breadcrumbContext = buildCollectionBreadcrumbContext(
    collection,
    titleProp
  ).concat({
    title: item[titleProp],
    href: item["@id"],
  })
  return breadcrumbContext
}

/**
 * Given an item or collection object from the server, return a breadcrumb context for this object.
 * @param {object} itemOrCollection Item or collection data from the server
 * @param {string} titleProp Name of the item property to use as the breadcrumb title
 * @returns {array} Breadcrumb context for the given item or collection
 */
const buildBreadcrumbContext = async (itemOrCollection, titleProp) => {
  let breadcrumbContext = []
  if (itemOrCollection["@type"].includes("Collection")) {
    // To handle the case in which `itemOrCollection` is a collection...
    breadcrumbContext = buildCollectionBreadcrumbContext(
      itemOrCollection,
      titleProp
    )
  } else if (itemOrCollection["@type"].includes("Item")) {
    // To handle the case in which `itemOrCollection` is an item...
    breadcrumbContext = await buildItemBreadcrumbContext(
      itemOrCollection,
      titleProp
    )
  }
  return breadcrumbContext
}

export default buildBreadcrumbContext
