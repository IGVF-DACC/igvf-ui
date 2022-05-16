// libs
import { API_URL } from "../libs/constants"

/**
 * Creates an access key for the currently logged-in user. It returns the response object including
 * the new access key object in the object's `@graph` property.
 * @returns {object} User access-key response
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
  })
  return response.json()
}

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
  )
  return response.json()
}

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
  )
  return response.json()
}
