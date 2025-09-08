// node_modules
import PropTypes from "prop-types";
// components
import ItemLink from "../item-link";

/**
 * This directory contains components and functions for displaying the contents of search-list
 * pages. The `@type`-specific item renderers exist in the `list-renderer` directory.
 */

import {
  generateAccessoryDataPropertyMap,
  getAccessoryData,
  getAccessoryDataPaths,
  getItemListsByType,
  getSearchListItemRenderer,
} from "./list-renderer";

/**
 * Displays a single item on a search-list view.
 */
function SearchListItem({ href, testid, children }) {
  return (
    <li
      className="border-data-border bg-data-background my-0.5 flex border px-2 first:mt-0 last:mb-0"
      data-testid={`search-list-item-${testid}`}
    >
      <ItemLink href={href} label={`View details for ${testid}`} />
      <div className="grow px-2 py-4 sm:px-4">{children}</div>
    </li>
  );
}

SearchListItem.propTypes = {
  // Path to item this item links to
  href: PropTypes.string.isRequired,
  // Usually same as component key; unique on page
  testid: PropTypes.string.isRequired,
};

export {
  generateAccessoryDataPropertyMap,
  getAccessoryData,
  getAccessoryDataPaths,
  getItemListsByType,
  getSearchListItemRenderer,
  SearchListItem,
};

/* istanbul ignore file */
