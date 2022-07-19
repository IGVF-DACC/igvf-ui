/**
 * This file contains the functions to easily use the access-key API. These all require a session object that you can get using:
 * const { session } = useContext(SessionContext)
 */

// lib
import { API_URL } from "./constants";

/**
 * Creates an access key for the currently logged-in user. It returns the response object including
 * the new access key object in the object's `@graph` property.
 * @returns {object} Access-key response
 */
export const createAccessKey = async (session) => {
  const response = await fetch(`${API_URL}/access-keys/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": session._csrft_,
    },
    body: JSON.stringify({}),
  });
  return response.json();
};

/**
 * Resets the access key secret for the given access key ID. It returns the response object
 * including the new access key object in the object's `@graph` property.
 * @param {string} accessKeyId - Access key ID to reset
 * @param {object} session - Current signed-in user's session
 * @returns {object} Access-key response
 */
export const resetAccessKey = async (accessKeyId, session) => {
  const response = await fetch(
    `${API_URL}/access-keys/${accessKeyId}/reset-secret`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": session._csrft_,
      },
    }
  );
  return response.json();
};

/**
 * Deletes the access key secret for the given access key ID. It returns the response object
 * including the new access key object in the object's `@graph` property.
 * @param {string} accessKeyId - Access key ID to delete
 * @param {object} session - Current signed-in user's session
 * @returns {object} Access-key response
 */
export const deleteAccessKey = async (accessKeyId, session) => {
  const response = await fetch(
    `${API_URL}/access-keys/${accessKeyId}/?render=false`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": session._csrft_,
      },
      body: JSON.stringify({ status: "deleted" }),
    }
  );
  return response.json();
};
