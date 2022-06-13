/**
 * Establishes the context to hold the back-end session record for the currently logged-in user.
 * You have to do this within the <Auth0Provider> component so that we can get the current Auth0
 * login state. The session record gets retrieved from the server only after the authentication
 * mechanism has authorized the user.
 */

// node_modules
import { createContext, useEffect, useRef, useState } from "react"
// components
import { useAuthenticated } from "./authentication"
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
  const isAuthenticated = useAuthenticated()
  const intervalId = useRef(null)
  const requestCount = useRef(0)

  useEffect(() => {
    console.log(
      "SESS AUTHENTICATED %s:%s:%o",
      isAuthenticated,
      intervalId.current,
      session
    )

    const requestSession = () => {
      requestCount.current += 1
      if (requestCount.current < 5) {
        console.log("SESSION INITIATE")
        getSession().then((sessionResponse) => {
          console.log("SESS RESPONSE %s:%o", isAuthenticated, sessionResponse)
          setSession(sessionResponse)
          clearInterval(intervalId.current)
          intervalId.current = null
        })
      } else {
        // Never got user ID from the session even though we signed in, or we kept getting a user
        // ID from the session even though we signed out. Give up.
        clearInterval(intervalId.current)
        intervalId.current = null
      }
    }

    // Once Auth0 has confirmed the user has logged in, get the session record from the back end
    // and then make it available to the rest of the app. Need to have a delay before requesting
    // the session to allow the back end time to generate the CSRF token.
    if (
      !session ||
      (isAuthenticated && !session["auth.userid"]) ||
      (!isAuthenticated && session["auth.userid"])
    ) {
      if (intervalId.current === null) {
        intervalId.current = setInterval(requestSession, 1000)
      }
    }
  }, [isAuthenticated, session])

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  )
}
