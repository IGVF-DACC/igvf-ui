/**
 * Authentication comprises a two-step process:
 * 1. Authenticate through Auth0
 * 2. Send the access token to the IGVF server so future requests use browser cookies to
 *    authenticate each request.
 * Most of the code in this file handles the server authentication step.
 */
// lib
import { AUTH0_CLIENT_ID, AUTH_ERROR_URI } from "./constants";
import FetchRequest from "./fetch-request";

/**
 * Request the session object from the server, which contains the browser CSRF token.
 * @param {string} dataProviderUrl URL of the data provider instance
 * @returns {object} Session object including the CSRF token
 */
export async function getSession(dataProviderUrl) {
  const request = new FetchRequest();
  return request.getObjectByUrl(`${dataProviderUrl}/session`, null);
}

/**
 * Request the session-properties object from the server, which contains the current logged-in
 * user's information.
 * @param {string} dataProviderUrl URL of the data provider instance
 * @returns {object} session-properties object
 */
export async function getSessionProperties(dataProviderUrl) {
  const request = new FetchRequest();
  return request.getObjectByUrl(`${dataProviderUrl}/session-properties`, null);
}

/**
 * Request the URL of the data provider from the UI API. The FetchRequest module normally gets this
 * from environment variables, but in some unusual cases NextJS doesn't supply them (e.g. 404
 * pages).
 * @returns {string} URL of the data provider; null if unavailable
 */
export async function getDataProviderUrl() {
  const request = new FetchRequest({ backend: true });
  const response = (await request.getObject("/api/data-provider")).optional();
  return response?.dataProviderUrl || null;
}

/**
 * Log the current user into the data provider.
 * @param {object} loggedOutSession Logged-out /session object from the server
 * @param {function} getAccessTokenSilently Auth0-react function to get the current access token
 * @returns {object} session-properties object for the signed-in user
 */
export async function loginDataProvider(
  loggedOutSession,
  getAccessTokenSilently
) {
  const accessToken = await getAccessTokenSilently();
  const request = new FetchRequest({ session: loggedOutSession });
  return request.postObject("/login", { accessToken });
}

/**
 * Log the current user out of the data provider after logging out of Auth0.
 * @returns {object} Empty object, because async functions have to return something
 */
export async function logoutDataProvider() {
  const request = new FetchRequest();
  return (await request.getObject("/logout?redirect=false")).union();
}

/**
 * Log the user into the authentication provider.
 * @param {function} loginWithRedirect Auth0-react function to login
 */
export function loginAuthProvider(loginWithRedirect) {
  // Get a URL to return to after logging in. If we're already on the error page, just return to
  // the home page so that the user doesn't see an authentication error page after successfully
  // logging in.
  const returnUrl =
    window.location.pathname === AUTH_ERROR_URI
      ? "/"
      : `${window.location.pathname}${window.location.search}`;

  // Trigger the login process. Pass the current URL as the returnTo parameter so that Auth0
  // redirects back to the current page after login.
  loginWithRedirect({
    appState: {
      returnTo: returnUrl,
    },
  });
}

/**
 * Log the user out of the authentication provider. Redirect to the home page by default, or to
 * the specified path.
 * @param {function} logout Auth0-react function to logout of the authentication provider
 * @param {string} altPath Optional path to redirect to after logging out; "/" by default
 */
export function logoutAuthProvider(logout, altPath = "") {
  logout({
    clientId: AUTH0_CLIENT_ID,
    logoutParams: {
      returnTo: `${window.location.origin}${altPath}`,
    },
  });
}
