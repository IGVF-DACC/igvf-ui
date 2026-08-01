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
import type {
  DataProviderObject,
  SessionObject,
  SessionPropertiesObject,
} from "../globals";

/**
 * Request the session object from the server, which contains the browser CSRF token.
 *
 * @param dataProviderUrl - URL of the data provider instance
 * @returns Session object including the CSRF token
 */
export async function getSession(
  dataProviderUrl: string
): Promise<SessionObject | null> {
  const request = new FetchRequest();
  const session = (
    await request.getObjectByUrl(`${dataProviderUrl}/session`)
  ).optional();

  return session as unknown as SessionObject | null;
}

/**
 * Request the session-properties object from the server, which contains the current logged-in
 * user's information.
 *
 * @param dataProviderUrl - URL of the data provider instance
 * @returns session-properties object
 */
export async function getSessionProperties(
  dataProviderUrl: string
): Promise<SessionPropertiesObject | null> {
  const request = new FetchRequest();
  const sessionProps = (
    await request.getObjectByUrl(`${dataProviderUrl}/session-properties`)
  ).optional();

  return sessionProps as SessionPropertiesObject | null;
}

/**
 * Request the URL of the data provider from the UI API. The FetchRequest module normally gets this
 * from environment variables, but in some unusual cases NextJS doesn't supply them (e.g. 404
 * pages).
 *
 * @returns URL of the data provider; null if unavailable
 */
export async function getDataProviderUrl(): Promise<string | null> {
  const request = new FetchRequest({ backend: true });
  const response = (
    await request.getObject<{ dataProviderUrl: string }>("/api/data-provider/")
  ).optional();
  return response?.dataProviderUrl || null;
}

/**
 * Log the current user into the data provider.
 *
 * @param loggedOutSession - Logged-out /session object from the server
 * @param getAccessTokenSilently - Auth0-react function to get the current access token
 * @returns session-properties object for the signed-in user
 */
export async function loginDataProvider(
  loggedOutSession: { _csrft_: string },
  getAccessTokenSilently: (o?: GetTokenSilentlyOptions) => Promise<string>
): Promise<SessionPropertiesObject | ErrorObject> {
  const accessToken = await getAccessTokenSilently();
  const request = new FetchRequest({ session: loggedOutSession });
  return request.postObject<SessionPropertiesObject>("/login", { accessToken });
}

/**
 * Log the current user out of the data provider after logging out of Auth0.
 *
 * @returns Empty object, because async functions have to return something
 */
export async function logoutDataProvider(): Promise<
  DataProviderObject | ErrorObject
> {
  const request = new FetchRequest();
  return (
    await request.getObject<DataProviderObject>("/logout?redirect=false")
  ).union();
}

/**
 * Log the user into the authentication provider.
 *
 * @param loginWithRedirect - Auth0-react function to login
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
 *
 * @param logout - Auth0-react function to logout of the authentication provider
 * @param altPath - Optional path to redirect to after logging out; "/" by default
 */
export function logoutAuthProvider(
  logout: (options?: LogoutOptions) => Promise<void>,
  altPath: string = ""
) {
  void logout({
    clientId: AUTH0_CLIENT_ID,
    logoutParams: {
      returnTo: `${window.location.origin}${altPath}`,
    },
  });
}

/**
 * Check if the given path is the same as the authentication error path. This matches regardless of
 * whether the path has a trailing slash or not.
 *
 * @param path - Path to check for the authentication error path
 * @returns True if the path is the same as the AUTH_ERROR_URI constant
 */
export function checkAuthErrorUri(path: string): boolean {
  return path.replace(/\/$/, "") === AUTH_ERROR_URI.replace(/\/$/, "");
}

/**
 * Create a new unverified account in the data provider. This is used when a user logs in with Auth0
 * but does not have an account in the data provider. The user will be prompted to create an account
 * in the data provider after logging in with Auth0.
 *
 * @param session - Session object from data provider
 * @param getAccessTokenSilently - Auth0-react function to get the current access token
 * @returns DataProviderObject for the newly created account, or an ErrorObject if the account
 *          creation failed
 */
export async function createUnverifiedAccount(
  session: SessionObject,
  getAccessTokenSilently: (options?: GetTokenSilentlyOptions) => Promise<string>
): Promise<DataProviderObject | ErrorObject> {
  const accessToken = await getAccessTokenSilently();
  const request = new FetchRequest({ session });
  return request.postObject<DataProviderObject>("/users/@@sign-up", {
    accessToken,
  });
}
