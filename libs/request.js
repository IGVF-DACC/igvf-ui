import { SERVER_URL } from "./constants"

/**
 * Build a header for fetch, including the cookie if available.
 * @param {string} cookie Cookie to include in xhttp header, if available
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

export default class Request {
  #cookie = ""

  constructor(cookie) {
    if (cookie) {
      this.#cookie = cookie
    }
  }

  /**
   * Request the object with the given path from the server without any embedded properties.
   * @param {string} path Path to requested resource
   * @param {string} cookie Cookie to use for authentication, if available
   * @returns {object} Requested object
   */
  async getObject(path) {
    const headers = buildHeaders(this.#cookie)
    try {
      const response = await fetch(`${SERVER_URL}${path}?frame=object`, {
        method: "GET",
        credentials: "include",
        headers,
      })
      return response.json()
    } catch (error) {
      return null
    }
  }

  /**
   * Request a number of objects with the given paths from the server without any embedded properties.
   * @param {array} paths Array of paths to requested resources
   * @param {string} cookie Cookie to use for authentication if available
   * @returns {array} Array of requested objects
   */
  async getMultipleObjects(paths) {
    return paths.length > 0
      ? Promise.all(paths.map((path) => this.getObject(path)))
      : []
  }

  /**
   * Request the collection (e.g. "users") with the given path from the server.
   * @param {string} collection Name of the collection to request
   * @param {string} cookie Cookie to use for authentication if available
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
