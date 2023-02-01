/**
 * This module refers to "breadcrumb data." This constitutes an array of objects, with each object
 * representing an element within the breadcrumb trail. Each object has a title that gets displayed
 * as an element in the breadcrumb trail, and an `href` property that links to the page
 * that the breadcrumb element links to.
 */

// lib
import FetchRequest from "./fetch-request";

/**
 * Codes for special actions for the front end to perform when rendering breadcrumbs.
 */
// Replace object type with the corresponding profile title
export const REPLACE_TYPE = "REPLACE_TYPE";

/**
 * Given an item object from the server, return breadcrumb data for this item.
 * @param {object} item Item data from the server
 * @param {string} titleProp Name of the item property to use as the breadcrumb title
 * @param {string} cookie Server cookie to authenticate the request
 * @returns {array} Breadcrumb data for the given item
 */
const buildItemBreadcrumbs = async (item, titleProp, cookie) => {
  let itemType = item["@type"][0];

  // Retrieve the mapping to map the item's `@type` to the corresponding title.
  const request = new FetchRequest({ cookie });
  const profilesTitles = await request.getObject("/profiles-titles/");
  const parentTitle =
    profilesTitles && !profilesTitles["@type"].includes("Error")
      ? profilesTitles[itemType] || itemType
      : itemType;

  // Build the breadcrumb data from the collection and item.
  const breadcrumbs = [
    {
      title: parentTitle,
      href: `/search?type=${item["@type"][0]}`,
    },
    {
      title: item[titleProp],
      href: item["@id"],
    },
  ];
  return breadcrumbs;
};

/**
 * From a path, generate a list of paths to the path's parents, e.g. /help/abc/123 generates
 * ["/help/abc", "/help"]. Export for Jest testing.
 * @param {string} path Path for a page
 * @returns {array} Array of paths that are parents of the given path
 */
export const generateParentPaths = (path) => {
  const pathElements = path.split("/").filter((path) => path !== "");
  const pathHierarchy = pathElements.reduce((acc, element, index) => {
    if (index === 0) {
      return [`/${element}/`];
    } else {
      return acc.concat([`${acc[index - 1]}${element}/`]);
    }
  }, []);
  return pathHierarchy.length > 1 ? pathHierarchy.slice(0, -1) : [];
};

/**
 * Generate the breadcrumb data for a page. Pages can have any path, so each breadcrumb element
 * represents one element of the path.
 * @param {object} page Object for the displayed page
 * @param {string} cookie Server cookie to authenticate the request
 * @returns {array} Breadcrumb data for the given page
 */
const buildPageBreadcrumbs = async (page, cookie) => {
  const pagePaths = generateParentPaths(page["@id"]);

  // Retrieve the page objects for the given page's parents so we can get their titles.
  const request = new FetchRequest({ cookie });
  const pathObjects = await request.getMultipleObjects(pagePaths, null, {
    filterErrors: true,
  });

  // Build the breadcrumb data from the collection and item.
  const breadcrumbs = pathObjects.map((pathObject) => {
    return { title: pathObject.title, href: pathObject["@id"] };
  });

  // Removed the current page path to avoid requesting it from the server when we already have
  // it. Add it back here.
  return breadcrumbs.concat({ title: page.title, href: page["@id"] });
};

/**
 * Generate the breadcrumb data for a search-result page -- both the list and report.
 * @param {object} data Search results data from the server
 * @returns {array} Breadcrumb data for the given search results
 */
const buildSearchResultBreadcrumbs = (data) => {
  // Get all the type filters from the search results to determine what to display in the
  // breadcrumb.
  const types = data.filters
    .filter((filter) => filter.field === "type")
    .map((filter) => filter.term);
  if (types.length > 0) {
    return [
      {
        title: types.length > 1 ? "Multiple" : types[0],
        href: data["@id"],
        operation: REPLACE_TYPE,
      },
    ];
  }

  // No types; maybe a searchTerm= search.
  return [];
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
 * Given data from the server, return breadcrumb data appropriate for that data. In some cases we
 * have to retrieve additional data from the server to build the breadcrumb data.
 * @param {object} data Object from the server
 * @param {string} titleProp Name of the item property to use as the breadcrumb title
 * @param {string} cookie Server cookie to authenticate the request
 * @returns {array} Breadcrumb data for the given item or collection
 */
const buildBreadcrumbs = async (data, titleProp = "", cookie = null) => {
  let breadcrumbs = [];
  if (data["@type"].includes("Page")) {
    breadcrumbs = await buildPageBreadcrumbs(data, cookie);
  } else if (
    data["@type"].includes("Search") ||
    data["@type"].includes("Report")
  ) {
    breadcrumbs = buildSearchResultBreadcrumbs(data);
  } else if (data["@type"].includes("Item")) {
    breadcrumbs = await buildItemBreadcrumbs(data, titleProp, cookie);
  } else if (
    data["@type"].includes("JSONSchemas") ||
    data["@type"].includes("JSONSchema")
  ) {
    // To handle the schema pages...
    breadcrumbs = buildSchemaBreadcrumbs(data, titleProp);
  }
  return breadcrumbs;
};

export default buildBreadcrumbs;
