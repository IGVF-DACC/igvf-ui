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
export const getSession = async () => {
  const request = new FetchRequest();
  return request.getObject("/session", null);
};

/**
 * POST to the server to log the user in.
 * @param {string} accessToken Auth0 access token for Auth0-authorized user
 * @param {string} csrfToken CSRF token from the server
 * @returns {object} User session information
 */
const reqLogin = async (accessToken, session) => {
  const request = new FetchRequest({ session });
  return request.postObject("/login", { accessToken });
};

/**
 * Handle the process of logging the user into the server. It first retrieves the CSRF token from
 * the server session and the user's access token from auth0.
 * @param {function} getAccessTokenSilently Auth0 function to retrieve the current access token
 * @returns {object} Session object including the CSRF token
 */
export const loginToServer = async (session, getAccessTokenSilently) => {
  const accessToken = await getAccessTokenSilently();
  return await reqLogin(accessToken, session);
};

/**
 * Handle logging out of the server after logging out of Auth0.
 * @returns {object} Empty object, because async functions have to return something
 */
export const logoutFromServer = async () => {
  const request = new FetchRequest();
  return request.getObject("/logout?redirect=false");
};
