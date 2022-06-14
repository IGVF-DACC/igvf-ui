// node_modules
import Router from "next/router"
// components
import useSessionStorage from "./session-storage"

/**
 * Establishes the context to hold the back-end session record for the currently logged-in user.
 * You have to do this within the <Auth0Provider> component so that we can get the current Auth0
 * login state. The session record has only a random CSFR token while signed out from the server.
 * While signed in, it also has an auth.userid with your email address.
 *
 * This module also handles signing the user in and out of the server. It does this by detecting
 * transitions in the authorization provider signed-in state.
 */

// node_modules
import { useAuth0 } from "@auth0/auth0-react"
import { createContext, useEffect, useRef, useState } from "react"
// components
import { useAuthenticated } from "./authentication"
// libs
import {
  getSession,
  loginToServer,
  logoutFromServer,
} from "../libs/authentication"
import { BACKEND_URL } from "../libs/constants"

/**
 * Establishes the context to hold the back-end session record for the currently signed-in user.
 * Other modules needing the session record can get it from this context.
 */
const SessionContext = createContext({
  session: {},
})

export default SessionContext

/**
 * This only gets used in the <App> component to encapsulate the session context. Place this within
 * the <Auth0Provider> context so that <Session> can access the current authentication state.
 */
export const Session = ({ children }) => {
  // Tracks the back-end session object
  const [session, setSession] = useState(null)
  // Auth0 information
  const { getAccessTokenSilently, logout } = useAuth0()
  // Stable authenticated state
  const isAuthenticated = useAuthenticated()
  // Previous authenticated state so we can track transitions
  const prevAuthenticated = useRef(isAuthenticated)
  // Set to true once we start the process of signing out of the server
  const isServerAuthPending = useRef(false)
  // Session storage for the post-sign-in redirect URL
  const [postSigninUrl] = useSessionStorage("auth0returnurl", "/")

  // Detects and handles the authorization provider changing from signed out to signed in by
  // signing into the server.
  useEffect(() => {
    if (
      !isServerAuthPending.current &&
      isAuthenticated &&
      isAuthenticated !== prevAuthenticated.current
    ) {
      // The authentication provider has just authenticated the user. Send a login request to the
      // server.
      isServerAuthPending.current = true
      prevAuthenticated.current = isAuthenticated

      // Signing into the server requires the signed-out version of the session object, so retrieve
      // that first, then use that to log into the server. We usually can't rely on the session
      // state because the authentication provider reloads the page, erasing the state.
      const serverSessionPromise = session
        ? Promise.resolve(session)
        : getSession()
      serverSessionPromise
        .then((signedOutSession) => {
          setSession(signedOutSession)
          // Initiate the request to sign the user into the server.
          return loginToServer(signedOutSession, getAccessTokenSilently)
        })
        .then((sessionProperties) => {
          if (!sessionProperties) {
            // Auth0 authenticated successfully, but we couldn't authenticate with the server.
            // Log back out of Auth0 and go to an error page.
            logout({ returnTo: `${BACKEND_URL}/auth-error` })
            isServerAuthPending.current = false
          } else {
            // Auth0 and the server authenticated successfully. Get the signed-in session object.
            getSession().then((sessionResponse) => {
              setSession(sessionResponse)
              isServerAuthPending.current = false
              Router.replace(postSigninUrl || "/")
            })
          }
        })
    }
    // Once the user has logged into auth0, turn around and log into the server.
  }, [
    getAccessTokenSilently,
    isAuthenticated,
    logout,
    session,
    setSession,
    postSigninUrl,
  ])

  // Detects and handles the authorization provider changing from signed in to signed out by
  // signing out of the server.
  useEffect(() => {
    if (!isServerAuthPending.current) {
      const serverSessionPromise = session
        ? Promise.resolve(session)
        : getSession()
      serverSessionPromise.then((serverSession) => {
        setSession(serverSession)
        if (
          serverSession["auth.userid"] &&
          !isAuthenticated &&
          !isServerAuthPending.current
        ) {
          // We have a signed-in session object but the authorization provider has signed the user out,
          // so we now need to sign out of the server.
          isServerAuthPending.current = true
          logoutFromServer()
            .then(() => {
              // Now signed out of the server. Get the signed-out session object.
              return getSession()
            })
            .then((sessionResponse) => {
              setSession(sessionResponse)
              isServerAuthPending.current = false
            })
        }
      })
    }
  }, [isAuthenticated, session, setSession])

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  )
}
