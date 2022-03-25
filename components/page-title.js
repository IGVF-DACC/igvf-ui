// node_modules
import { useContext } from "react"
// components
import GlobalContext from "./global-context"

/**
 * Show a standard page title for the top of any page.
 */
const PageTitle = () => {
  const { page } = useContext(GlobalContext)

  return <h1 className="mb-5 text-4xl font-thin">{page.title}</h1>
}

export default PageTitle
