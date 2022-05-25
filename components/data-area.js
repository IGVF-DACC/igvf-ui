/**
 * Wrap a single data item containing a label and value. This normally gets used like:
 *
 * <DataArea>
 *   <DataItemLabel>Lab</DataItemLabel>
 *   <DataItemValue>{lab.title}</DataItemValue>
 *   ...
 * </DataArea>
 */

import PropTypes from "prop-types"

/**
 * Wrapper for an area containing data items.
 */
export const DataArea = ({ children }) => {
  return (
    <div className="border border-data-border bg-data-background p-4 md:grid md:grid-cols-data-item md:gap-4">
      {children}
    </div>
  )
}

/**
 * Displays the title above a data area
 */
export const DataAreaTitle = ({ children }) => {
  return <h2 className="mt-4 mb-1 text-2xl font-light">{children}</h2>
}

/**
 * Display the label of a data item.
 */
export const DataItemLabel = ({ className = "", children }) => {
  return (
    <div
      className={`mt-4 break-words font-semibold text-data-label first:mt-0 dark:text-gray-400 md:mt-0 ${className}`}
    >
      {children}
    </div>
  )
}

DataItemLabel.propTypes = {
  // Additional Tailwind CSS classes to apply to the <div> element
  className: PropTypes.string,
}

/**
 * Display the value of a data item.
 */
export const DataItemValue = ({ children }) => {
  return (
    <div className="mb-4 font-medium text-data-value last:mb-0 md:mb-0">
      {children}
    </div>
  )
}
