/**
 * Wrappers to display data items, typically used on pages that display a single object.
 *
 * <DataPanel>
 *   <DataArea>
 *     <DataItemLabel>Lab</DataItemLabel>
 *     <DataItemValue>{lab.title}</DataItemValue>
 *     ...
 *   </DataArea>
 * </DataPanel>
 */

// node_modules
import { BarsArrowDownIcon, BarsArrowUpIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useState } from "react";
// components
import { Button } from "./form-elements";

/**
 * Displays a panel -- typically to display data items for an object, but you can use this for
 * anything that should appear in a panel on the page.
 */
export function DataPanel({ className = "", children }) {
  return (
    <div
      className={`border border-panel bg-panel p-4 @container ${className}`}
      data-testid="datapanel"
    >
      {children}
    </div>
  );
}

DataPanel.propTypes = {
  // Additional Tailwind CSS classes to add to the panel
  className: PropTypes.string,
};

/**
 * Wrapper for an area containing data items, setting up a grid to display labels on the left and
 * their values to their right on desktop. You only need this to wrap these kinds of data items.
 * Any display not comprising labels and their values can appear outside a <DataAre>.
 */
export function DataArea({ children }) {
  return (
    <div
      className="@md:grid @md:grid-cols-data-item @md:gap-4"
      data-testid="dataarea"
    >
      {children}
    </div>
  );
}

/**
 * Displays the title above a data panel or table.
 */
export function DataAreaTitle({ children }) {
  return (
    <h2 className="mb-1 mt-4 text-2xl font-light" data-testid="dataareatitle">
      {children}
    </h2>
  );
}

/**
 * Display the label of a data item label/value pair.
 */
export function DataItemLabel({ className = "", children }) {
  return (
    <div
      className={`mt-4 break-words font-semibold text-data-label first:mt-0 @md:mt-0 dark:text-gray-400 ${className}`}
      data-testid="dataitemlabel"
    >
      {children}
    </div>
  );
}

DataItemLabel.propTypes = {
  // Additional Tailwind CSS classes to apply to the <div> element
  className: PropTypes.string,
};

/**
 * Display the value of a data item label/value pair.
 */
export function DataItemValue({ className = "", children }) {
  return (
    <div
      className={`mb-4 font-medium text-data-value last:mb-0 @md:mb-0 @md:min-w-0 ${className}`}
      data-testid="dataitemvalue"
    >
      {children}
    </div>
  );
}

DataItemValue.propTypes = {
  // Additional Tailwind CSS classes to apply to the <div> element
  className: PropTypes.string,
};

/**
 * Display the value of a data item that consists of a URL. This will break the URL at any
 * character so it doesn't overflow the data panel.
 */
export function DataItemValueUrl({ className = "", children }) {
  return (
    <DataItemValue className={`break-all ${className}`}>
      {children}
    </DataItemValue>
  );
}

DataItemValueUrl.propTypes = {
  // Additional Tailwind CSS classes to apply to the <div> element
  className: PropTypes.string,
};

/**
 * Default number of items to display in a collapsible/expandable data area before considering it
 * collapsible. A data area with fewer than this number of items will not appear collapsible.
 */
const DEFAULT_COLLAPSE_LIMIT = 3;

/**
 * Hook to manage the collapsed/expanded state of a data area value. We have chosen certain array
 * data items to appear with fewer than their full number of items, with a button to expand them to
 * their full number. This hook manages the state of the data area, including whether it appears
 * collapsed or expanded, and whether it has enough items to collapse at all. Here's an example
 * where we want to display a collapsible list of samples, and display a button to expand or
 * collapse the list. The last item of the list is the button to expand or collapse the list (which
 * just one way to handle this):
 *
 * const samplesCollapser = useDataAreaCollapser(samples || []);
 * {samplesCollapser.displayedData.length > 0 && (
 *   <>
 *     <DataItemLabel className="flex items-baseline">Samples</DataItemLabel>
 *     <DataItemValue>
 *       <SeparatedList>
 *         {samplesCollapser.displayedData.map((sample, index) => (
 *            <Fragment key={sample.accession}>{sample.accession}</Fragment>
 *         ))}
 *         {index === samplesCollapser.displayedData.length - 1 && (
 *           <DataItemValueCollapseControl key="collapse" collapser={samplesCollapser} />
 *         )}
 *       </SeparatedList>
 *     </DataItemValue>
 *   </>
 * )}
 *
 * For consistency, the object `useDataAreaCollapser` returns we often call a "collapser" preceded
 * by the name of the property it controls.
 *
 * @param {Array<any>} data Data to display as either a collapsed or full list
 * @param {number} collapseLimit Number of items to display when collapsed
 * @param {boolean} defaultIsCollapsed True if the data should appear collapsed by default
 * @returns {object} Contains the following properties:
 *   isCollapsed: True if the data is collapsed; invalid if `isCollapsible` is false
 *   setIsCollapsed: Function to set the collapsed/expanded states
 *   isCollapsible: True if the data has more than `collapseLimit` items
 *   isDataTruncated: True if `displayedData` has been truncated to `collapseLimit` items
 *   displayedData: The data to display -- either the full or truncated list
 *   hiddenDataCount: Number of items hidden when `isDataTruncated` is true
 */
export function useDataAreaCollapser(
  data,
  collapseLimit = DEFAULT_COLLAPSE_LIMIT,
  defaultIsCollapsed = true
) {
  const [isCollapsed, setIsCollapsed] = useState(defaultIsCollapsed);
  const isCollapsible = data.length > collapseLimit;
  const isDataTruncated = isCollapsible && isCollapsed;
  const displayedData = isDataTruncated ? data.slice(0, collapseLimit) : data;
  const hiddenDataCount = isDataTruncated ? data.length - collapseLimit : 0;

  return {
    isCollapsed,
    setIsCollapsed,
    isCollapsible,
    isDataTruncated,
    displayedData,
    hiddenDataCount,
  };
}

/**
 * Displays a button to expand or collapse a data item value. This button only appears if the
 * `isExpandable` property of the given collapser object holds true. Place this button within a
 * <DataItemValue> element. This takes an optional child element to display next to the button, and
 * typically you would use <DataItemValueControlLabel> for this.
 */
export function DataItemValueCollapseControl({
  collapser,
  className = null,
  children,
}) {
  return (
    <>
      {collapser.isCollapsible && (
        <div className={className}>
          <Button
            type="secondary"
            size="sm"
            hasIconOnly
            onClick={() => collapser.setIsCollapsed(!collapser.isCollapsed)}
          >
            {collapser.isCollapsed ? (
              <BarsArrowDownIcon
                data-testid="data-item-value-expand-icon"
                className="h-4 w-4"
              />
            ) : (
              <BarsArrowUpIcon
                data-testid="data-item-value-collapse-icon"
                className="h-4 w-4"
              />
            )}
            {children}
          </Button>
        </div>
      )}
    </>
  );
}

DataItemValueCollapseControl.propTypes = {
  // Object returned by `useDataAreaCollapser`
  collapser: PropTypes.shape({
    isCollapsed: PropTypes.bool.isRequired,
    setIsCollapsed: PropTypes.func.isRequired,
    isCollapsible: PropTypes.bool.isRequired,
  }).isRequired,
  // Additional Tailwind CSS classes to apply to the wrapping div
  className: PropTypes.string,
};

/**
 * You can place this component as a child of <DataItemValueCollapseControl> to display a label
 * indicating how many items are hidden while the data is collapsed, or just the word "fewer"
 * while the data is expanded.
 */
export function DataItemValueControlLabel({ collapser }) {
  return (
    <div className="ml-1 text-xs">
      {collapser.hiddenDataCount > 0 ? (
        <>{`${collapser.hiddenDataCount} more`}</>
      ) : (
        <>fewer</>
      )}
    </div>
  );
}

DataItemValueControlLabel.propTypes = {
  // Collapser object returned by `useDataAreaCollapser`
  collapser: PropTypes.shape({
    isCollapsed: PropTypes.bool.isRequired,
    setIsCollapsed: PropTypes.func.isRequired,
    isCollapsible: PropTypes.bool.isRequired,
    hiddenDataCount: PropTypes.number.isRequired,
  }).isRequired,
};
