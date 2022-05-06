/**
 * Wrap a single data item containing a label and value. This normally gets used like:
 *
 * <DataArea>
 *   <DataItem>
 *     <DataItemLabel>Lab</DataItemLabel>
 *     <DataItemValue>{lab.title}</DataItemValue>
 *   </DataItem>
 *   <DataItem>
 *   ...
 * </DataArea>
 */

import PropTypes from "prop-types"

/**
 * Wrapper for an area containing <DataItem>s.
 */
export const DataArea = ({ children }) => {
  return (
    <div className="border border-data-border bg-data-background p-4">
      {children}
    </div>
  )
}

/**
 * Displays the title above a data area
 */
export const DataAreaTitle = ({ children }) => {
  return (
    <h2 className="mt-4 mb-1 text-lg font-semibold uppercase text-data-title">
      {children}
    </h2>
  )
}

/**
 * Display a single data item containing a label and value.
 */
export const DataItem = ({ className = "", children }) => {
  return (
    <div className={`my-6 first:mt-0 last:mb-0 ${className}`}>{children}</div>
  )
}

DataItem.propTypes = {
  // Additional Tailwind CSS classes to apply to the <div> element
  className: PropTypes.string,
}

/**
 * Display the label of a <DataItem>.
 */
export const DataItemLabel = ({ children }) => {
  return (
    <div className="mb-1 font-semibold uppercase text-data-label dark:text-gray-400">
      {children}
    </div>
  )
}

/**
 * Display the value of a <DataItem>.
 */
export const DataItemValue = ({ children }) => {
  return <div className="text-sm text-data-value">{children}</div>
}
