/**
 * Authentication comprises a two-step process:
 * 1. Authenticate through Auth0
 * 2. Send the access token to the IGVF server so future requests use browser cookies to
 *    authenticate each request.
 * Most of the code in this file handles the server authentication step.
 */
// lib
import FetchRequest from "./fetch-request";

/**
 * Request the session object from the server, which contains the browser CSRF token.
 * @returns {object} Session object including the CSRF token
 */
export async function getSession() {
  const request = new FetchRequest();
  return request.getObject("/session", null);
}

/**
 * POST to the server to log the user in.
 * @param {string} accessToken Auth0 access token for Auth0-authorized user
 * @param {object} session Signed-out session object from igvfd server
 * @returns {object} session-properties object for the signed-in user
 */
async function reqLogin(accessToken, session) {
  const request = new FetchRequest({ session });
  return request.postObject("/login", { accessToken });
}

/**
 * Handle the process of logging the user into the server. It first retrieves the CSRF token from
 * the current server session and the user's access token from auth0.
 * @param {object} session Session object from the server
 * @param {function} getAccessTokenSilently Auth0 function to retrieve the current access token
 * @returns {object} session-properties object for the signed-in user
 */
export async function loginToServer(session, getAccessTokenSilently) {
  const accessToken = await getAccessTokenSilently();
  return reqLogin(accessToken, session);
}

/**
 * Handle logging out of the server after logging out of Auth0.
 * @returns {object} Empty object, because async functions have to return something
 */
export async function logoutFromServer() {
  const request = new FetchRequest();
  return request.getObject("/logout?redirect=false");
}
