// node_modules
import PropTypes from "prop-types"
import { useContext } from "react"
// components
import GlobalContext from "./global-context"

/**
 * Show a standard page title for the top of any page.
 */
const PageTitle = ({ pageTitle = "" }) => {
  const { page } = useContext(GlobalContext)

  return <h1 className="mb-5 text-4xl font-thin">{pageTitle || page.title}</h1>
}

PageTitle.propTypes = {
  // Page title for pages in which the server doesn't supply one
  pageTitle: PropTypes.string,
}

export default PageTitle
