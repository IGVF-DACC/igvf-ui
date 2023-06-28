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

import PropTypes from "prop-types";

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
export function DataItemValue({ children }) {
  return (
    <div
      className="mb-4 font-medium text-data-value last:mb-0 @md:mb-0 @md:min-w-0"
      data-testid="dataitemvalue"
    >
      {children}
    </div>
  );
}
