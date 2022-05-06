// node_modules
import { useContext } from "react"
// components
import { DataArea } from "./data-area"
import GlobalContext from "./global-context"

/**
 * Display a message on a collection page indicating that no viewable collection data exists.
 */
const NoCollectionData = () => {
  const { page } = useContext(GlobalContext)

  return (
    <DataArea>
      <div className="text-center italic">No {page.title} to display</div>
    </DataArea>
  )
}

export default NoCollectionData
