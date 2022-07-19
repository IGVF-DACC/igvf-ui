// node_modules
import { useContext } from "react"
// components
import { DataPanel } from "./data-area"
import GlobalContext from "./global-context"

/**
 * Display a message on a collection page indicating that no viewable collection data exists.
 */
const NoCollectionData = () => {
  const { page } = useContext(GlobalContext)

  return (
    <DataPanel>
      <div className="text-center italic">No {page.title} to display</div>
    </DataPanel>
  )
}

export default NoCollectionData
