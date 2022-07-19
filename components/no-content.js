// node_modules
import PropTypes from "prop-types"
import { useContext } from "react"
// components
import { DataPanel } from "./data-area"
import GlobalContext from "./global-context"

const NoContent = ({ message }) => {
  return (
    <DataPanel>
      <div className="text-center italic">{message}</div>
    </DataPanel>
  )
}

NoContent.propTypes = {
  // Message to display when we have no content
  message: PropTypes.string.isRequired,
}

export default NoContent

/**
 * Display a message on a collection page indicating that no viewable collection data exists.
 */
export const NoCollectionData = () => {
  const { page } = useContext(GlobalContext)

  return <NoContent message={`No ${page.title} to display`} />
}
