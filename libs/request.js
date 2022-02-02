import { SERVER_URL } from "./constants"

/**
 * Request the object with the given path from the server without any embedded properties.
 * @param {string} path Path to requested resource
 * @returns {object} Requested object
 */
export const getObject = async (path) => {
  const response = await fetch(`${SERVER_URL}${path}?frame=object`)
  return response.json()
}

export const getCollection = async (collection) => {
  const response = await fetch(`${SERVER_URL}/${collection}/`)
  return response.json()
}
