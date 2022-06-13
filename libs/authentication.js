/**
 * Authentication comprises a two-step process:
 * 1. Authenticate through Auth0
 * 2. Send the access token to the IGVF server so future requests use browser cookies to
 *    authenticate each request.
 * Most of the code in this file handles the server authentication step.
 */
// node_modules
import Router from "next/router"
// libs
import { API_URL } from "../libs/constants"

/**
 * Called by Auth0 when the user is redirected back from the home page after signing into Auth0.
 * This redirects back to the page the user viewed before they signed in. `appState` gets set when
 * we call `loginWithRedirect()`.
 * @param {object} appState Auth0 app state saved when signing out
 */
export const onRedirectCallback = (appState) => {
  Router.replace(appState?.returnTo || "/")
}

/**
 * Request the session object from the server, which contains the browser CSRF token.
 * @returns {object} Session object including the CSRF token
 */
export const getSession = async () => {
  const session = await fetch(`${API_URL}/session`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  })
  return session.json()
}

/**
 * POST to the server to log the user in.
 * @param {string} accessToken Auth0 access token for Auth0-authorized user
 * @param {string} csrfToken CSRF token from the server
 * @returns {object} User session information
 */
const reqLogin = async (accessToken, csrfToken) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ accessToken }),
    })
    return await response.json()
  } catch {
    // Likely the Auth0-authenticated user has no user record in the igbfd database.
    return null
  }
}

/**
 * Handle the process of logging the user into the server. It first retrieves the CSRF token from
 * the server and the user's access token from auth0.
 * @param {function} getAccessTokenSilently Auth0 function to retrieve the current access token
 * @returns {object} Session object including the CSRF token
 */
export const loginToServer = async (session, getAccessTokenSilently) => {
  const accessToken = await getAccessTokenSilently()
  return await reqLogin(accessToken, session._csrft_)
}

/**
 * Handle logging out of the server after logging out of Auth0.
 * @returns {object} Empty object, because async functions have to return somethhng
 */
export const logoutFromServer = async () => {
  const response = await fetch(`${API_URL}/logout?redirect=false`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  })
  return response.json()
}
