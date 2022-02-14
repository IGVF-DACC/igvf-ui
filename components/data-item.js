/**
 * Wrap a single data item containing a label and value. This normally gets used like:
 *
 * <DataItem>
 *   <DataItemLabel>Lab</DataItemLabel>
 *   <DataItemValue>{lab.title}</DataItemValue>
 * </DataItem>
 */
const DataItem = ({ children }) => {
  return <div className="my-6">{children}</div>
}

export default DataItem

/**
 * Display the label of a <DataItem>.
 */
export const DataItemLabel = ({ children }) => {
  return (
    <div className="mb-1 font-semibold uppercase text-gray-500 dark:text-gray-400">
      {children}
    </div>
  )
}

/**
 * Display the value of a <DataItem>.
 */
export const DataItemValue = ({ children }) => {
  return <div className="text-sm">{children}</div>
}
