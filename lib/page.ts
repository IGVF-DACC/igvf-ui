// lib
import FetchRequest from "./fetch-request";
import { requestPages } from "./common-requests";
// type
import type { BreadcrumbMeta } from "./breadcrumbs";
import type { ErrorObject } from "./fetch-request.d";
import type {
  DatabaseObject,
  DatabaseWriteResponse,
  DataProviderObject,
  SessionObject,
} from "../globals.d";

/**
 * Tracks the parts of a page object that the user can modify when editing a page.
 */
export type PageMeta = {
  award: string;
  lab: string;
  name: string;
  parent: string;
  status: string;
  title: string;
};

/**
 * Contents of the blocks array within the layout property of a page object.
 */
export type PageLayoutComponent = {
  "@id": string;
  "@type": string;
  body: string;
  direction: string;
};

/**
 * Extend DatabaseObject for Page objects that include a title property.
 */
export interface PageObject extends DatabaseObject {
  award?: string;
  lab?: string;
  layout?: {
    blocks: PageLayoutComponent[];
  };
  name: string;
  parent?: string;
  summary?: string;
  title: string;
}

/**
 * Page titles can have embedded codes to control some aspect of the page's display. These codes
 * are enclosed in square brackets and are removed from the title before displaying it. This
 * function takes the page and returns the page title without the codes. It also returns the codes
 * themselves as an array of strings. If the title contains no codes, the `codes` array is empty.
 * @param page Page object
 * @returns Page title and codes
 * @returns Object.title Page title without ordering number
 * @returns Object.codes Array of strings representing the codes in the title
 */
export function getPageTitleAndCodes(item: DataProviderObject): {
  title: string;
  codes: string[];
} {
  const page = item as PageObject;

  // Match the page title with a regex that captures the displayable title and one or more square-
  // bracket-delimited codes. The displayable title gets captured in the first group, and all the
  // square-bracket-delimited codes get captured in the second group.
  const match = page.title.match(/^(.*?) *((?:\[.+?\])*)$/);
  const combinedCodes = match?.[2] || "";
  const title = match?.[1] || "";
  if (combinedCodes) {
    // Extract the codes from the combined codes string and return them as an array without the
    // square brackets.
    const regex = /\[(.*?)\]/g;
    let codeMatch;
    const codes = [];
    while ((codeMatch = regex.exec(combinedCodes)) !== null) {
      if (codeMatch[1]) {
        codes.push(codeMatch[1]);
      }
    }
    return { title, codes };
  }

  // No codes found in the title. Return the title as is.
  return { title: page.title, codes: [] };
}

/**
 * Returns true if the given name conflicts with another page's name.
 * @param name The name to check against existing pages
 * @param pages The page objects to check against
 */
export function detectConflictingName(
  name: string,
  pages: PageObject[]
): boolean {
  return !!pages.find((page) => page.name === name);
}

/**
 * Save the new page contents to the database.
 * @param page Page object to save
 * @param blocks New markdown content for the page
 * @param pageMeta New metadata for the page
 * @param session System session object
 * @param isNewPage True if the page is being added
 * @returns The updated page object, or error object if the save failed
 */
export async function savePage(
  page: PageObject,
  blocks: PageLayoutComponent[],
  pageMeta: PageMeta,
  session: SessionObject,
  isNewPage: boolean
): Promise<PageObject | ErrorObject> {
  let writeablePage: PageObject;

  /**
   * Utility to set a property in the writeable page object if it exists in the page metadata. If
   * the property does not exist in the page metadata, delete it from the writeable page object.
   * This mutates the writeable page object.
   * @param {string} property The property to update or delete
   */
  function setOrDeleteProperty(property: keyof PageMeta) {
    if (pageMeta[property]) {
      writeablePage[property] = pageMeta[property];
    } else {
      delete writeablePage[property];
    }
  }

  // Get a writeable version of the page object. This object doesn't have the @type property so
  // you can't check for network/permission errors in the usual way.
  const request = new FetchRequest({ session });
  if (!isNewPage) {
    writeablePage = (
      await request.getObject(`${page["@id"]}?frame=edit`)
    ).union() as PageObject;
    if (writeablePage["@type"]?.includes("Error")) {
      return writeablePage;
    }
  } else {
    writeablePage = { ...page };
    writeablePage.layout = { ...page.layout };
    writeablePage.layout.blocks = [...page.layout.blocks];
  }

  // Update the page object layout with the new content.
  writeablePage.name = pageMeta.name;
  writeablePage.title = pageMeta.title;
  writeablePage.status = pageMeta.status;
  setOrDeleteProperty("award");
  setOrDeleteProperty("lab");
  setOrDeleteProperty("parent");
  writeablePage.layout.blocks = blocks;

  let result;
  if (!isNewPage) {
    result = await request.putObject(page["@id"], writeablePage);
  } else {
    result = await request.postObject("/pages", writeablePage);
  }
  const updatedResults = result as unknown as DatabaseWriteResponse;
  if (updatedResults.status === "success") {
    return updatedResults["@graph"][0] as PageObject;
  }
  return updatedResults as unknown as ErrorObject;
}

/**
 * Set new block IDs for every block in the page. This mutates the given array of blocks.
 * @param blocks Blocks to update
 */
export function rewriteBlockIds(blocks: PageLayoutComponent[]): void {
  blocks.forEach((block, index) => {
    block["@id"] = `#block${index + 1}`;
  });
}

/**
 * Takes a segment of the `blocks` array (from `page.layout` from props) and copies it to a new
 * array, and the blocks within also get copied so that you can mutate them without affecting the
 * contents of `blocks`. The strings within each block do *not* get copied. If you don't specify a
 * `start` and `end` index, all the blocks get copied. If you specify only a `start`, then the
 * blocks get copied from there to the end.
 * @param {array} blocks The `blocks` property of page.layout
 * @param {number} start The index of the first block to copy
 * @param {number} end The index of the last block to copy
 * @returns {array} Copy of a segment of the `blocks` array
 */
export function sliceBlocks(
  blocks: PageLayoutComponent[],
  start = 0,
  end = blocks.length
): PageLayoutComponent[] {
  const blocksSegment = blocks.slice(start, end);
  return blocksSegment.map((block) => ({ ...block }));
}

/**
 * From a Page path, generate a list of paths to the path's parents, e.g. /help/abc/123 generates
 * ["/help/abc", "/help"].
 * @param {string} path Path for a page
 * @returns {array} Array of paths that are parents of the given path
 */
export function generatePageParentPaths(path: string): string[] {
  // For non-help pages, generate paths for every parent of the current page's path.
  const pathElements = path.split("/").filter((path) => path !== "");
  const pathHierarchy = pathElements.reduce((acc: string[], element, index) => {
    if (index === 0) {
      return [`/${element}/`];
    }
    return acc.concat([`${acc[index - 1]}${element}/`]);
  }, []);

  // If the first element is "/help/", remove it
  if (pathHierarchy[0] === "/help/") {
    pathHierarchy.shift();
  }

  return pathHierarchy.length > 1 ? pathHierarchy.slice(0, -1) : [];
}

/**
 * Fetch the parent pages of the given page and return them in the breadcrumb metadata object.
 * @param page Page object to get the breadcrumb metadata for
 * @param request FetchRequest object to use for the request
 * @returns Breadcrumb metadata for the given page
 */
export async function getPageBreadcrumbMeta(
  page: PageObject,
  request: FetchRequest
): Promise<BreadcrumbMeta> {
  const parentPaths = generatePageParentPaths(page["@id"]);
  const parentPages = await requestPages(parentPaths, request);
  return {
    parentPages,
  };
}
