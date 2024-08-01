/**
 * This module refers to "breadcrumb data." This constitutes an array of objects, with each object
 * representing an element within the breadcrumb trail. Each object has a title that gets displayed
 * as an element in the breadcrumb trail, and an `href` property that links to the page
 * that the breadcrumb element links to. A missing `href` causes a disabled link to appear, which
 * is common for the last element in the breadcrumb trail.
 */

// lib
import type {
  CollectionTitles,
  DatabaseObject,
  Schema,
  SearchResults,
} from "../globals.d";
import FetchRequest from "./fetch-request";
import {
  getPageBreadcrumbMeta,
  getPageTitleAndCodes,
  type PageObject,
} from "./page";

/**
 * Each element of the breadcrumb trail is represented by an object with a title and an optional
 * href. The title is the text that gets displayed in the breadcrumb trail, and the href is the URL
 * that the breadcrumb element links to. If the href is missing, the breadcrumb element is disabled.
 */
type Breadcrumb = {
  title: string;
  href?: string;
};

/**
 * Additional metadata that can be used to determine how to render the breadcrumbs. The exact
 * format depends on the type of page that displays breadcrumbs. Both the NextJS server and the
 * client-side code can pass this data to the breadcrumb rendering code.
 */
export interface BreadcrumbMeta {
  [key: string]: unknown;
}

/**
 * Meta for the breadcrumbs on an object summary page indicates whether the logged-in user has
 * admin privileges or not.
 */

export interface ItemBreadcrumbMeta extends BreadcrumbMeta {
  isAdmin: boolean;
}

/**
 * Meta for the breadcrumbs on a page indicates the parent pages that the current page is nested
 * under. We need these just for the parent-page titles, so this array contains partial page
 * objects.
 */
export interface PageBreadcrumbMeta extends BreadcrumbMeta {
  parentPages: PageObject[];
}

/**
 * Given an item object from the server, return breadcrumb data for this item.
 * @param item Item data from the server
 * @param title Name of the item to use as the breadcrumb title
 * @param meta Contains current user's admin status
 * @param collectionTitles Maps collection names to their human-readable titles
 * @returns Breadcrumb data for the given item
 */
function buildItemBreadcrumbs(
  item: DatabaseObject,
  title: string,
  meta: BreadcrumbMeta,
  collectionTitles?: CollectionTitles
): Breadcrumb[] {
  const itemMeta = meta as ItemBreadcrumbMeta;
  const itemType = item["@type"][0];
  const parentTitle = collectionTitles?.[itemType] || itemType;
  const statusQuery = itemMeta.isAdmin ? "&status!=deleted" : "";

  // Build the breadcrumb data from the collection and item.
  const breadcrumbs = [
    {
      title: parentTitle,
      href: `/search/?type=${item["@type"][0]}${statusQuery}`,
    },
    {
      title,
    },
  ];
  return breadcrumbs;
}

/**
 * Generate the breadcrumb data for a page. Pages can have any path, so each breadcrumb element
 * represents one element of the path.
 * @param {object} page Object for the displayed page
 * @param {string} cookie Server cookie to authenticate the request
 * @returns {array} Breadcrumb data for the given page
 */
function buildPageBreadcrumbs(
  page: PageObject,
  meta: BreadcrumbMeta
): Breadcrumb[] {
  const pageObjects = (meta.parentPages as PageObject[]) || [];

  // Build the breadcrumb data from the collection and item.
  const breadcrumbs = pageObjects.map((pathObject) => {
    const { title } = getPageTitleAndCodes(pathObject) as {
      title: string;
      codes?: string[];
    };
    return { title, href: pathObject["@id"] } as Breadcrumb;
  });

  return breadcrumbs.concat({ title: page.title } as Breadcrumb);
}

/**
 * Generate the breadcrumb data for a search-result page -- both the list and report.
 * @param data Search results data from the servers
 * @param collectionTitles Maps collection names to their human-readable titles
 * @returns Breadcrumb data for the given search results
 */
function buildSearchResultBreadcrumbs(
  data: SearchResults,
  collectionTitles?: CollectionTitles
): Breadcrumb[] {
  // Get all the type filters from the search results to determine what to display in the
  // breadcrumb.
  const types = data.filters
    .filter((filter) => filter.field === "type")
    .map((filter) => filter.term);
  if (types.length > 0) {
    const title =
      types.length > 1 ? "Multiple" : collectionTitles?.[types[0]] || types[0];
    return [{ title }];
  }
  return [];
}

/**
 * Generate the breadcrumb data for a schema page.
 * @param schema {DatabaseObject} The schema object, or null for the schema index page
 * @param title {string} The data type associated with a schema, e.g. "Biomarker"
 * @returns {Breadcrumb[]} Breadcrumb data for the given schema
 */
function buildSchemaBreadcrumbs(schema: Schema, title: string): Breadcrumb[] {
  if (!schema.title) {
    return [
      {
        title,
      },
    ];
  }
  return [
    {
      title: "Schema Directory",
      href: "/profiles",
    },
    {
      title: schema.title,
    },
  ];
}

/**
 * Given data from the server, return breadcrumb data appropriate for that data. In some cases we
 * have to retrieve additional data from the server to build the breadcrumb data.
 * @param data Object from the server
 * @param title Name of the item to use as the breadcrumb title
 * @param cookie Server cookie to authenticate the request
 * @returns Breadcrumb data for the given item or collection
 */
export default function buildBreadcrumbs(
  data: DatabaseObject,
  title: string,
  meta: BreadcrumbMeta = {},
  collectionTitles?: CollectionTitles
): Breadcrumb[] {
  let breadcrumbs: Breadcrumb[] = [];
  if (data["@type"]) {
    if (data["@type"].includes("Page")) {
      breadcrumbs = buildPageBreadcrumbs(data as PageObject, meta);
    } else if (
      data["@type"].includes("Search") ||
      data["@type"].includes("Report")
    ) {
      breadcrumbs = buildSearchResultBreadcrumbs(
        data as unknown as SearchResults,
        collectionTitles
      );
    } else if (data["@type"].includes("Item")) {
      breadcrumbs = buildItemBreadcrumbs(
        data,
        title,
        meta as { isAdmin: boolean },
        collectionTitles
      );
    } else if (
      data["@type"].includes("JSONSchemas") ||
      data["@type"].includes("JSONSchema")
    ) {
      // To handle the schema pages...
      breadcrumbs = buildSchemaBreadcrumbs(data as unknown as Schema, title);
    }
  }
  return breadcrumbs;
}

/**
 * Get the breadcrumb meta for a given data object. This is used to provide additional information
 * to the front end about how to render the breadcrumbs.
 * @param data Object from the data provider to retrieve meta for
 * @param request FetchRequest object to use for fetching data
 * @returns BreadcrumbMeta object for the given data
 */
export async function getBreadcrumbMeta(
  data: DatabaseObject,
  request: FetchRequest
): Promise<BreadcrumbMeta> {
  if (data["@type"].includes("Page")) {
    return getPageBreadcrumbMeta(data as PageObject, request);
  }
  return {};
}
