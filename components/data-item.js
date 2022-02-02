const DataItem = ({ children }) => {
  return <div className="my-6">{children}</div>
}

export default DataItem

export const DataItemLabel = ({ children }) => {
  return (
    <div className="mb-1 font-semibold uppercase text-gray-500 dark:text-gray-400">
      {children}
    </div>
  )
}

export const DataItemValue = ({ children }) => {
  return <div className="text-sm">{children}</div>
}
