/**
 * Some lists of items might be so long that people don't want to see the whole thing by default.
 * This module lets you display a truncated list of items with an expand/collapse control, but only
 * if the list is long enough to need one. In this example, we show the list of items within a <ul>
 * and have a collapse button appear if the list is long enough to need one.
 *
 * ```jsx
 * const collapser = useCollapseControl(
 *   items,
 *   isCollapsible,
 *   maxItemsBeforeCollapse
 * );
 *
 * return (
 *   <div>
 *     <ul className={className} data-testid={testid}>
 *       {collapser.items.map((location) => (
 *         <li key={index}>
 *           {location}
 *         </li>
 *       ))}
 *     </ul>
 *     {collapser.isCollapseControlVisible && (
 *       <CollapseControlVertical
 *         length={locations.length}
 *         isCollapsed={collapser.isCollapsed}
 *         setIsCollapsed={collapser.setIsCollapsed}
 *       />
 *     )}
 *   </div>
 * );
 * ```
 */

// node_modules
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useState } from "react";

/**
 * Hook to control the collapsed state of a list. It keeps the collapsed/expanded state and
 * handles the truncation of the list of items while collapsed.
 * @param {Array} items List of items to display
 * @param {boolean} isCollapsible True if the list should be collapsible
 * @param {number} maxItemsBeforeCollapse Max number of items before the list appears collapsed
 * @returns {Object} Object containing the collapsed state, the collapsed/expanded state setter,
 *   and the truncated list of items
 */
export function useCollapseControl(
  items,
  isCollapsible,
  maxItemsBeforeCollapse
) {
  // True if the list appears collapsed
  const [isCollapsed, setIsCollapsed] = useState(true);

  const isCollapseControlVisible =
    isCollapsible && items.length > maxItemsBeforeCollapse;
  const truncatedItems =
    isCollapseControlVisible && isCollapsed
      ? items.slice(0, maxItemsBeforeCollapse)
      : items;

  return {
    // True if the list appears collapsed; only applies if `isCollapsible` is true
    isCollapsed,
    // Function to set the collapsed state
    setIsCollapsed,
    // True if the list is collapsable and has enough items to need one
    isCollapseControlVisible,
    // Truncated list of items to display
    items: truncatedItems,
  };
}

/**
 * Default maximum number of inline items before the list appears collapsed, and an expand/collapse
 * control appears.
 */
export const DEFAULT_MAX_COLLAPSE_ITEMS_INLINE = 10;

/**
 * Default maximum number of vertical items before the list appears collapsed, and an
 * expand/collapse control appears.
 */
export const DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL = 5;

/**
 * Displays the expand/collapse control for a collapsible list.
 */
export function CollapseControlInline({ length, isCollapsed, setIsCollapsed }) {
  const label = isCollapsed
    ? `Show all ${length} items in list`
    : `Show fewer items in list`;

  return (
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="ml-1 inline items-center rounded-sm border border-collapse-ctrl bg-collapse-ctrl pl-1.5 pr-1 text-xs font-bold text-collapse-ctrl"
      data-testid="collapse-control-inline"
      aria-label={label}
    >
      {isCollapsed ? (
        <>
          {"ALL "}
          {length}
          <ArrowRightIcon className="inline-block h-3 w-3" />
        </>
      ) : (
        <>
          {"FEWER "}
          <ArrowLeftIcon className="inline h-4 w-4" />
        </>
      )}
    </button>
  );
}

CollapseControlInline.propTypes = {
  // Total length of the list
  length: PropTypes.number.isRequired,
  // True if the list appears collapsed
  isCollapsed: PropTypes.bool.isRequired,
  // Function to set the collapsed state
  setIsCollapsed: PropTypes.func.isRequired,
};

/**
 * Displays the expand/collapse control for `<DataItemList>`.
 */
export function CollapseControlVertical({
  length,
  isCollapsed,
  setIsCollapsed,
}) {
  const label = isCollapsed
    ? `Show all ${length} items in list`
    : `Show fewer items in list`;

  return (
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="block items-center rounded-b-sm border-b border-l border-r border-collapse-ctrl bg-collapse-ctrl py-0.5 pl-2.5 pr-1.5 text-xs font-bold text-collapse-ctrl"
      data-testid="collapse-control-vertical"
      aria-label={label}
    >
      {isCollapsed ? (
        <>
          {"ALL "}
          {length}
          <ArrowDownIcon className="ml-0.5 inline-block h-3 w-3" />
        </>
      ) : (
        <>
          {"FEWER "}
          <ArrowUpIcon className="inline h-4 w-4" />
        </>
      )}
    </button>
  );
}

CollapseControlVertical.propTypes = {
  // Total length of the list
  length: PropTypes.number.isRequired,
  // True if the list appears collapsed
  isCollapsed: PropTypes.bool.isRequired,
  // Function to set the collapsed state
  setIsCollapsed: PropTypes.func.isRequired,
};
