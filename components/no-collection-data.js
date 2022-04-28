// node_modules
import { useContext } from "react"
// components
import { DataArea } from "./data-item"
import GlobalContext from "./global-context"

/**
 * Display a message on a collection page indicating that no viewable collection data exists.
 */
const NoCollectionData = () => {
  const { page } = useContext(GlobalContext)

  return <DataArea>No {page.title} to display</DataArea>
}

export default NoCollectionData
