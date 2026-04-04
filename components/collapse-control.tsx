/**
 * Some lists of items might be so long that people don't want to see the whole thing by default.
 * This module lets you display a truncated list of items with an expand/collapse control, but only
 * if the list is long enough to need one. In this example, we show the list of items within a <ul>
 * and have a collapse button appear if the list is long enough to need one.
 *
 * ```jsx
 * const collapser = useCollapseControl(
 *   items,
 *   maxItemsBeforeCollapse,
 *   isCollapsible
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
import { useState } from "react";

/**
 * Result returned by the `useCollapseControl` hook that contains the collapsed state, the setter
 * for the collapsed state, a boolean indicating whether the collapse control should be visible,
 * and the truncated list of items to display
 *
 * @property isCollapsed - True if the list appears collapsed; applies if `isCollapsible` is true
 * @property setIsCollapsed - Function to set the collapsed state
 * @property isCollapseControlVisible - True if the list has enough items to need a collapse control
 * @property items - Truncated list of items to display
 */
export interface CollapseControlResult<T> {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapseControlVisible: boolean;
  items: T[];
}

/**
 * Hook to control the collapsed state of a list. It keeps the collapsed/expanded state and
 * handles the truncation of the list of items while collapsed.
 *
 * @param items - List of items to display
 * @param maxItemsBeforeCollapse - Max number of items before the list appears collapsed
 * @param isCollapsible - True if the list should be collapsible
 * @returns Object containing the collapsed state, the collapsed/expanded state setter, a boolean
 *   indicating whether the collapse control should be visible, and the truncated list of items
 */
export function useCollapseControl<T>(
  items: T[],
  maxItemsBeforeCollapse = DEFAULT_MAX_COLLAPSE_ITEMS_INLINE,
  isCollapsible = true
): CollapseControlResult<T> {
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
 *
 * @param length - Total number of items in the list
 * @param isCollapsed - True if the list appears collapsed
 * @param setIsCollapsed - Function to set the collapsed state
 */
export function CollapseControlInline({
  length,
  isCollapsed,
  setIsCollapsed,
}: {
  length: number;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const label = isCollapsed
    ? `Show all ${length} items in list`
    : `Show fewer items in list`;

  return (
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="border-collapse-ctrl bg-collapse-ctrl text-collapse-ctrl ml-1 inline items-center rounded-xs border pr-1 pl-1.5 text-xs font-bold"
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

/**
 * Displays the expand/collapse control for `<DataItemList>`.
 *
 * @param length - Total number of items in the list
 * @param isCollapsed - True if the list appears collapsed
 * @param setIsCollapsed - Function to set the collapsed state
 * @param isFullBorder - True to have all four sides of the button have a border; false to have all but the top border
 */
export function CollapseControlVertical({
  length,
  isCollapsed,
  setIsCollapsed,
  isFullBorder = false,
}: {
  length: number;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isFullBorder?: boolean;
}) {
  const label = isCollapsed
    ? `Show all ${length} items in list`
    : `Show fewer items in list`;
  const borderClass = isFullBorder
    ? "border rounded-xs"
    : "border-b border-l border-r rounded-b-sm";

  return (
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={`border-collapse-ctrl bg-collapse-ctrl text-collapse-ctrl flex items-center py-0.5 pr-1.5 pl-2.5 text-xs font-bold ${borderClass}`}
      data-testid="collapse-control-vertical"
      aria-label={label}
    >
      {isCollapsed ? (
        <>
          {"ALL "}
          {length}
          <ArrowDownIcon className="ml-0.5 h-3 w-3" />
        </>
      ) : (
        <>
          {"FEWER "}
          <ArrowUpIcon className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
