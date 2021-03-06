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
export const DataPanel = ({ children }) => {
  return (
    <div className="border border-data-border bg-data-background p-4">
      {children}
    </div>
  );
};

/**
 * Wrapper for an area containing data items, setting up a grid to display labels on the left and
 * their values to their right on desktop. You only need this to wrap these kinds of data items.
 * Any display not comprising labels and their values can appear outside a <DataAre>.
 */
export const DataArea = ({ children }) => {
  return (
    <div className="md:grid md:grid-cols-data-item md:gap-4">{children}</div>
  );
};

/**
 * Displays the title above a data panel or table.
 */
export const DataAreaTitle = ({ children }) => {
  return <h2 className="mt-4 mb-1 text-2xl font-light">{children}</h2>;
};

/**
 * Display the label of a data item label/value pair.
 */
export const DataItemLabel = ({ className = "", children }) => {
  return (
    <div
      className={`mt-4 break-words font-semibold text-data-label first:mt-0 dark:text-gray-400 md:mt-0 ${className}`}
    >
      {children}
    </div>
  );
};

DataItemLabel.propTypes = {
  // Additional Tailwind CSS classes to apply to the <div> element
  className: PropTypes.string,
};

/**
 * Display the value of a data item label/value pair.
 */
export const DataItemValue = ({ children }) => {
  return (
    <div className="mb-4 font-medium text-data-value last:mb-0 md:mb-0">
      {children}
    </div>
  );
};
