// libs
import { SERVER_URL } from "./constants"

/**
 * Build a header for fetch, including the cookie if available.
 * @param {string} cookie - Cookie to include in xhttp header, if available
 * @returns {object} Xhttp header object
 */
const buildHeaders = (cookie) => {
  const headers = {
    Accept: "application/json",
  }
  if (cookie) {
    headers.Cookie = cookie
  }
  return headers
}

/**
 * Request object for server requests.
 * @param {string} cookie - Cookie to set from NextJS request object; used to authenticate with the server
 */
export default class Request {
  #cookie = ""

  constructor(cookie) {
    if (cookie) {
      this.#cookie = cookie
    }
  }

  /**
   * Request the object with the given path from the server without any embedded properties.
   * @param {string} path - Path to requested resource
   * @param {object} options - Options to alter fetching data
   *   - includeEmbeds: Whether to include embedded properties in the response; default false
   * @returns {object} Requested object
   */
  async getObject(path, options = {}) {
    const headers = buildHeaders(this.#cookie)
    try {
      const response = await fetch(
        `${SERVER_URL}${path}${options.includeEmbeds ? "" : "?frame=object"}`,
        {
          method: "GET",
          credentials: "include",
          headers,
        }
      )
      return response.json()
    } catch (error) {
      return null
    }
  }

  /**
   * Request a number of objects with the given paths from the server without any embedded properties.
   * @param {array} paths - Array of paths to requested resources
   * @returns {array} Array of requested objects
   */
  async getMultipleObjects(paths) {
    return paths.length > 0
      ? Promise.all(paths.map((path) => this.getObject(path)))
      : []
  }

  /**
   * Request the collection (e.g. "users") with the given path from the server.
   * @param {string} collection - Name of the collection to request
   * @returns {object} Collection data including all its members in @graph
   */
  async getCollection(collection) {
    const headers = buildHeaders(this.#cookie)
    const response = await fetch(`${SERVER_URL}/${collection}/`, {
      method: "GET",
      credentials: "include",
      headers,
    })
    return response.json()
  }
}
