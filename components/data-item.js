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
 * Display a single data item containing a label and value.
 */
export const DataItem = ({ children }) => {
  return <div className="my-6 first:mt-0 last:mb-0">{children}</div>
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
