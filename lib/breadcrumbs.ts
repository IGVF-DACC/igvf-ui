/**
 * This module refers to "breadcrumb data." This constitutes an array of objects, with each object
 * representing an element within the breadcrumb trail. Each object has a title that gets displayed
 * as an element in the breadcrumb trail, and an `href` property that links to the page
 * that the breadcrumb element links to.
 */

// lib
import type {
  DatabaseObject,
  DataProviderObject,
  Schema,
  SearchResults,
} from "../globals.d";
import type { ErrorObject } from "./fetch-request.d";
import FetchRequest from "./fetch-request";
import { getPageTitleAndOrdering } from "./page";
import { Ok } from "./result";

type Breadcrumb = {
  title: string;
  href: string;
  operation?: string;
};

type ProfilesTitles = {
  "@type": string[];
} & {
  [key: string]: string;
};

/**
 * Codes for special actions for the front end to perform when rendering breadcrumbs.
 */
// Replace object type with the corresponding profile title
export const REPLACE_TYPE = "REPLACE_TYPE";

/**
 * Given an item object from the server, return breadcrumb data for this item.
 * @param {object} item Item data from the server
 * @param {string} title Name of the item to use as the breadcrumb title
 * @param {string} cookie Server cookie to authenticate the request
 * @returns {array} Breadcrumb data for the given item
 */
async function buildItemBreadcrumbs(
  item: DatabaseObject,
  title: string,
  cookie?: string
): Promise<Breadcrumb[]> {
  const itemType = item["@type"][0];

  // Retrieve the mapping to map the item's `@type` to the corresponding title.
  const request = new FetchRequest({ cookie });
  const result: DataProviderObject | ErrorObject = (
    await request.getObject("/profiles-titles/")
  ).union();
  const maybeError = result as ErrorObject;
  const profilesTitles = result as ProfilesTitles;
  const parentTitle = maybeError?.["@type"].includes("Error")
    ? itemType
    : profilesTitles?.[itemType] || itemType;

  // Build the breadcrumb data from the collection and item.
  const breadcrumbs = [
    {
      title: parentTitle,
      href: `/search?type=${item["@type"][0]}`,
    },
    {
      title,
      href: item["@id"],
    },
  ];
  return breadcrumbs;
}

/**
 * From a Page path, generate a list of paths to the path's parents, e.g. /help/abc/123 generates
 * ["/help/abc", "/help"]. Export for Jest testing.
 * @param {string} path Path for a page
 * @returns {array} Array of paths that are parents of the given path
 */
export function generatePageParentPaths(path: string): string[] {
  // For pages beginning with /help, just use "/help" as the parent page regardless of the help
  // page's depth so that breadcrumbs don't contain links to empty intermediate pages.
  if (path.startsWith("/help")) {
    return ["/help"];
  }

  // For non-help pages, generate paths for every parent of the current page's path.
  const pathElements = path.split("/").filter((path) => path !== "");
  const pathHierarchy = pathElements.reduce((acc: string[], element, index) => {
    if (index === 0) {
      return [`/${element}/`];
    }
    return acc.concat([`${acc[index - 1]}${element}/`]);
  }, []);
  return pathHierarchy.length > 1 ? pathHierarchy.slice(0, -1) : [];
}

/**
 * Generate the breadcrumb data for a page. Pages can have any path, so each breadcrumb element
 * represents one element of the path.
 * @param {object} page Object for the displayed page
 * @param {string} cookie Server cookie to authenticate the request
 * @returns {array} Breadcrumb data for the given page
 */
async function buildPageBreadcrumbs(
  page: DatabaseObject,
  cookie?: string
): Promise<Breadcrumb[]> {
  const pagePaths = generatePageParentPaths(page["@id"]);

  // Retrieve the page objects for the given page's parents so we can get their titles.
  const request = new FetchRequest({ cookie });
  const pathObjects = Ok.all(
    await request.getMultipleObjects(pagePaths, {
      filterErrors: true,
    })
  );

  // Build the breadcrumb data from the collection and item.
  const breadcrumbs = pathObjects.map((pathObject) => {
    return { title: pathObject.title, href: pathObject["@id"] } as Breadcrumb;
  });

  // Removed the current page path to avoid requesting it from the server when we already have
  // it. Add it back here.
  const { title } = getPageTitleAndOrdering(page) as {
    title: string;
    ordering?: number;
  };
  return breadcrumbs.concat({ title, href: page["@id"] } as Breadcrumb);
}

/**
 * Generate the breadcrumb data for a search-result page -- both the list and report.
 * @param {object} data Search results data from the server
 * @returns {array} Breadcrumb data for the given search results
 */
function buildSearchResultBreadcrumbs(data: SearchResults): Breadcrumb[] {
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

  // No types; maybe a query= search.
  return [];
}

/**
 * Generate the breadcrumb data for a schema page.
 * @param schema {DatabaseObject} The schema object, or null for the schema index page
 * @param title {string} The data type associated with a schema, e.g. "Biomarker"
 * @returns {Breadcrumb[]} Breadcrumb data for the given schema
 */
function buildSchemaBreadcrumbs(schema: Schema, title: string): Breadcrumb[] {
  if (!title) {
    return [
      {
        title: "Schemas",
        href: "/profiles",
      },
    ];
  }
  return [
    {
      title: "Schemas",
      href: "/profiles",
    },
    {
      title: schema.title,
      href: `/profiles/${title}`,
    },
  ];
}

/**
 * Given data from the server, return breadcrumb data appropriate for that data. In some cases we
 * have to retrieve additional data from the server to build the breadcrumb data.
 * @param {object} data Object from the server
 * @param {string} title Name of the item to use as the breadcrumb title, or in the case of
 * schema breadcrumb, this is the URL path of the schema page
 * @param {string} cookie Server cookie to authenticate the request
 * @returns {array} Breadcrumb data for the given item or collection
 */
export default async function buildBreadcrumbs(
  data: DataProviderObject,
  title: string,
  cookie?: string
): Promise<Breadcrumb[]> {
  const databaseObject = data as DatabaseObject;
  let breadcrumbs: Breadcrumb[] = [];
  if (databaseObject["@type"].includes("Page")) {
    breadcrumbs = await buildPageBreadcrumbs(databaseObject, cookie);
  } else if (
    databaseObject["@type"].includes("Search") ||
    databaseObject["@type"].includes("Report")
  ) {
    breadcrumbs = buildSearchResultBreadcrumbs(
      data as unknown as SearchResults
    );
  } else if (databaseObject["@type"].includes("Item")) {
    breadcrumbs = await buildItemBreadcrumbs(databaseObject, title, cookie);
  } else if (
    databaseObject["@type"].includes("JSONSchemas") ||
    databaseObject["@type"].includes("JSONSchema")
  ) {
    // To handle the schema pages...
    breadcrumbs = buildSchemaBreadcrumbs(data as unknown as Schema, title);
  }
  return breadcrumbs;
}
