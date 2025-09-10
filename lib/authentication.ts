/**
 * Authentication comprises a two-step process:
 * 1. Authenticate through Auth0
 * 2. Send the access token to the IGVF server so future requests use browser cookies to
 *    authenticate each request.
 * Most of the code in this file handles the server authentication step.
 */
// node_modules
import {
  RedirectLoginOptions,
  GetTokenSilentlyOptions,
  LogoutOptions,
} from "@auth0/auth0-react";
// lib
import { AUTH0_CLIENT_ID, AUTH_ERROR_URI } from "./constants";
import FetchRequest, { type ErrorObject } from "./fetch-request";
// root
import type { DataProviderObject } from "../globals";

/**
 * Request the session object from the server, which contains the browser CSRF token.
 * @param {string} dataProviderUrl URL of the data provider instance
 * @returns {object} Session object including the CSRF token
 */
export async function getSession(
  dataProviderUrl: string
): Promise<DataProviderObject | null> {
  const request = new FetchRequest();
  const session = (
    await request.getObjectByUrl(`${dataProviderUrl}/session`)
  ).optional();

  return session;
}

/**
 * Request the session-properties object from the server, which contains the current logged-in
 * user's information.
 * @param {string} dataProviderUrl URL of the data provider instance
 * @returns {object} session-properties object
 */
export async function getSessionProperties(
  dataProviderUrl: string
): Promise<DataProviderObject | null> {
  const request = new FetchRequest();
  const sessionProps = (
    await request.getObjectByUrl(`${dataProviderUrl}/session-properties`)
  ).optional();

  return sessionProps;
}

/**
 * Request the URL of the data provider from the UI API. The FetchRequest module normally gets this
 * from environment variables, but in some unusual cases NextJS doesn't supply them (e.g. 404
 * pages).
 * @returns {string} URL of the data provider; null if unavailable
 */
export async function getDataProviderUrl(): Promise<string | null> {
  const request = new FetchRequest({ backend: true });
  const response = (await request.getObject("/api/data-provider/")).optional();
  return (response?.dataProviderUrl as string) || null;
}

/**
 * Log the current user into the data provider.
 * @param {object} loggedOutSession Logged-out /session object from the server
 * @param {function} getAccessTokenSilently Auth0-react function to get the current access token
 * @returns {object} session-properties object for the signed-in user
 */
export async function loginDataProvider(
  loggedOutSession: { _csrft_: string },
  getAccessTokenSilently: (o?: GetTokenSilentlyOptions) => Promise<string>
) {
  const accessToken = await getAccessTokenSilently();
  const request = new FetchRequest({ session: loggedOutSession });
  return request.postObject("/login", { accessToken });
}

/**
 * Log the current user out of the data provider after logging out of Auth0.
 * @returns {object} Empty object, because async functions have to return something
 */
export async function logoutDataProvider(): Promise<
  DataProviderObject | ErrorObject
> {
  const request = new FetchRequest();
  return (await request.getObject("/logout?redirect=false")).union();
}

/**
 * Log the user into the authentication provider.
 * @param {function} loginWithRedirect Auth0-react function to login
 */
export async function loginAuthProvider(
  loginWithRedirect: (o?: RedirectLoginOptions) => Promise<void>
) {
  // Get a URL to return to after logging in. If we're already on the error page, just return to
  // the home page so that the user doesn't see an authentication error page after successfully
  // logging in.
  const returnUrl = checkAuthErrorUri(window.location.pathname)
    ? "/"
    : `${window.location.pathname}${window.location.search}`;

  // Trigger the login process. Pass the current URL as the returnTo parameter so that Auth0
  // redirects back to the current page after login.
  return await loginWithRedirect({
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
export function logoutAuthProvider(
  logout: (options?: LogoutOptions) => Promise<void>,
  altPath: string = ""
) {
  logout({
    clientId: AUTH0_CLIENT_ID,
    logoutParams: {
      returnTo: `${window.location.origin}${altPath}`,
    },
  });
}

/**
 * Check if the given path is the same as the authentication error path. This matches regardless of
 * whether the path has a trailing slash or not.
 * @param path Path to check for the authentication error path
 * @returns True if the path is the same as the AUTH_ERROR_URI constant
 */
export function checkAuthErrorUri(path: string): boolean {
  return path.replace(/\/$/, "") === AUTH_ERROR_URI.replace(/\/$/, "");
}
