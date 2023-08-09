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
 * Displays a button to expand or collapse a data item value. This button only appears if `isExpandable`
 * holds true. Place this button within a <DataItemLabel> element, just after the label text.
 */
export function DataItemValueExpandButton({
  isExpandable,
  isExpanded,
  onClick,
}) {
  return (
    <>
      {isExpandable && (
        <Button
          type="secondary"
          size="sm"
          hasIconOnly
          className="ml-1"
          onClick={() => onClick(!isExpanded)}
        >
          {isExpanded ? (
            <BarsArrowUpIcon
              data-testid="data-item-value-collapse-icon"
              className="h-4 w-4"
            />
          ) : (
            <BarsArrowDownIcon
              data-testid="data-item-value-expand-icon"
              className="h-4 w-4"
            />
          )}
        </Button>
      )}
    </>
  );
}

DataItemValueExpandButton.propTypes = {
  // True if the data area is expandable
  isExpandable: PropTypes.bool.isRequired,
  // True if the data area is expanded
  isExpanded: PropTypes.bool.isRequired,
  // Function called when the user clicks the expand/collapse button
  onClick: PropTypes.func.isRequired,
};
