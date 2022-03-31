/**
 * Establishes the global context for the application. This holds information usable at any level
 * of the application.
 */
import React from "react"

// Add more sub-objects to the global context if they make sense.
const GlobalContext = React.createContext({
  site: {},
  page: {},
  breacrumbs: [],
})

export default GlobalContext
