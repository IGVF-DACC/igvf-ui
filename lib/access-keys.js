/**
 * This file contains the functions to easily use the access-key API. These all require a session object that you can get using:
 * const { session } = useContext(SessionContext)
 */

// lib
import FetchRequest from "../lib/fetch-request";

/**
 * Creates an access key for the currently logged-in user. It returns the response object including
 * the new access key object in the object's `@graph` property.
 * @returns {object} Access-key response
 */
export async function createAccessKey(session) {
  const request = new FetchRequest({ session });
  return request.postObject("/access-keys", {});
}

/**
 * Resets the access key secret for the given access key ID. It returns the response object
 * including the new access key object in the object's `@graph` property.
 * @param {string} accessKeyId - Access key ID to reset
 * @param {object} session - Current signed-in user's session
 * @returns {object} Access-key response
 */
export async function resetAccessKey(accessKeyId, session) {
  const request = new FetchRequest({ session });
  return request.postObject(`/access-keys/${accessKeyId}/reset-secret`, {});
}

/**
 * Deletes the access key secret for the given access key ID. It returns the response object
 * including the new access key object in the object's `@graph` property.
 * @param {string} accessKeyId - Access key ID to delete
 * @param {object} session - Current signed-in user's session
 * @returns {object} Access-key response
 */
export async function deleteAccessKey(accessKeyId, session) {
  const request = new FetchRequest({ session });
  return request.patchObject(`/access-keys/${accessKeyId}/?render=false`, {
    status: "deleted",
  });
}
