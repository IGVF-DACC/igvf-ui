/**
 * Establishes the context to hold the back-end session record for the currently logged-in user.
 * You have to do this within the <Auth0Provider> component so that we can get the current Auth0
 * login state. The session record gets retrieved from the server only after the authentication
 * mechanism has authorized the user.
 */

// node_modules
import { useAuth0 } from "@auth0/auth0-react"
import { createContext, useEffect, useState } from "react"
// libs
import { getSession } from "../libs/authentication"

const SessionContext = createContext({
  session: {},
})

export default SessionContext

/**
 * This only gets used in the <App> component to encapsulate the session context. Place this within
 * the <Auth0Provider> context so that <Session> can access the current authentication state.
 */
export const Session = ({ children }) => {
  // Tracks the back-end session record.
  const [session, setSession] = useState(null)

  const { isLoading, isAuthenticated } = useAuth0()

  useEffect(() => {
    // Once Auth0 has confirmed the user has logged in, get the session record from the back end
    // and then make it available to the rest of the app.
    if (!isLoading && isAuthenticated) {
      getSession().then((sessionResponse) => {
        setSession(sessionResponse)
      })
    }
  }, [isLoading, isAuthenticated])

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  )
}
