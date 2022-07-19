/**
 * This module refers to "breadcrumb data." This constitutes an array of objects, with each object
 * representing an element within the breadcrumb trail. Each object has a title that gets displayed
 * as an element in the breadcrumb trail, and an `href` property that links to the page
 * that the breadcrumb element links to.
 */
// lib
import { getCollectionPathFromItemPath } from "./paths";
import FetchRequest from "./fetch-request";

/**
 * Given a collection object from the server, return breadcrumb data for this collection.
 * @param {object} collection Collection data from the server
 * @returns {array} Breadcrumb data for the given collection
 */
const buildCollectionBreadcrumbs = (collection) => {
  return [
    {
      title: collection.title,
      href: collection["@id"],
    },
  ];
};

/**
 * Given an item object from the server, return breadcrumb data for this item.
 * @param {object} item Item data from the server
 * @param {string} titleProp Name of the item property to use as the breadcrumb title
 * @param {string} cookie Server cookie to authenticate the request
 * @returns {array} Breadcrumb data for the given item
 */
const buildItemBreadcrumbs = async (item, titleProp, cookie) => {
  // Retrieve the collection object that the item belongs to so that we can get the collection's
  // title.
  const request = new FetchRequest(cookie && { cookie });
  const collection = await request.getObject(
    getCollectionPathFromItemPath(item["@id"]),
    null
  );

  // Build the breadcrumb data from the collection and item.
  const breadcrumbs = collection
    ? buildCollectionBreadcrumbs(collection).concat({
        title: item[titleProp],
        href: item["@id"],
      })
    : [];
  return breadcrumbs;
};

const buildSchemaBreadcrumbs = (schema, profile) => {
  if (!profile) {
    return [
      {
        title: "Schemas",
        href: "/profiles",
      },
    ];
  } else {
    return [
      {
        title: "Schemas",
        href: "/profiles",
      },
      {
        title: schema.title,
        href: `/profiles/${profile}`,
      },
    ];
  }
};

/**
 * Given an item or collection object from the server, return breadcrumb data for this object. You
 * don't have to supply `titleProp` if you pass a collection object in `itemOrCollection` because
 * collections always use `title`.
 * @param {object} itemOrCollection Item or collection data from the server
 * @param {string} titleProp Name of the item property to use as the breadcrumb title
 * @param {string} cookie Server cookie to authenticate the request
 * @returns {array} Breadcrumb data for the given item or collection
 */
const buildBreadcrumbs = async (
  itemOrCollection,
  titleProp = "",
  cookie = null
) => {
  let breadcrumbs = [];
  if (itemOrCollection["@type"].includes("Collection")) {
    // To handle the case in which `itemOrCollection` is a collection...
    breadcrumbs = buildCollectionBreadcrumbs(itemOrCollection);
  } else if (itemOrCollection["@type"].includes("Item")) {
    // To handle the case in which `itemOrCollection` is an item...
    breadcrumbs = await buildItemBreadcrumbs(
      itemOrCollection,
      titleProp,
      cookie
    );
  } else if (
    itemOrCollection["@type"].includes("JSONSchemas") ||
    itemOrCollection["@type"].includes("JSONSchema")
  ) {
    // To handle the schema pages...
    breadcrumbs = buildSchemaBreadcrumbs(itemOrCollection, titleProp);
  }
  return breadcrumbs;
};

export default buildBreadcrumbs;
