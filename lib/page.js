// lib
import FetchRequest from "../lib/fetch-request";

/**
 * Returns true if the given name conflicts with another page's name.
 * @param {string} name The name to check against existing pages
 * @param {array} pages The page objects to check against
 */
export const detectConflictingName = (name, pages) => {
  return !!pages.find((page) => page.name === name);
};

/**
 * Save the new page contents to the database.
 * @param {object} page Page object to save
 * @param {array} blocks New markdown content for the page
 * @param {object} pageMeta New metadata for the page
 * @param {object} session System session object
 * @param {boolean} isNewPage True if the page is being added
 * @returns {object} The updated page object
 */
export const savePage = async (page, blocks, pageMeta, session, isNewPage) => {
  let writeablePage;

  /**
   * Utility to set a property in the writeable page object if it exists in the page metadata. If
   * the property does not exist in the page metadata, delete it from the writeable page object.
   * This mutates the writeable page object.
   * @param {string} property The property to update or delete
   */
  const setOrDeleteProperty = (property) => {
    if (pageMeta[property]) {
      writeablePage[property] = pageMeta[property];
    } else {
      delete writeablePage[property];
    }
  };

  // Get a writeable version of the page object. This object doesn't have the @type property so
  // you can't check for network/permission errors in the usual way.
  const request = new FetchRequest({ session });
  if (!isNewPage) {
    writeablePage = await request.getObject(`${page["@id"]}?frame=edit`);
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
  return result.status === "success" ? result["@graph"][0] : result;
};

/**
 * Set new block IDs for every block in the page. This mutates the given array of blocks.
 * @param {array} blocks Blocks to update
 */
export const rewriteBlockIds = (blocks) => {
  blocks.forEach((block, index) => {
    block["@id"] = `#block${index + 1}`;
  });
};

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
export const sliceBlocks = (blocks, start = 0, end = blocks.length) => {
  const blocksSegment = blocks.slice(start, end);
  return blocksSegment.map((block) => ({ ...block }));
};
