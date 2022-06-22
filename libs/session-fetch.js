import { API_URL } from "./constants"

/**
 * Build a header for fetch using the session token
 * @param {string} session - The csrft session token provided by
 * the useContext(SessionContext) hook
 * @param {boolean} hasBody - If the request has a request body (like in
 * PUT, POST, etc) then this may be true. If the request will not contain
 * a body (GET, etc) then this should be false
 * @returns {object} Headers used to make a fetch
 */
const buildHeaders = (session, hasBody) => {
  const header = {
    Accept: "application/json",
  }
  if (session != null) {
    header["X-CSRF-Token"] = session._csrft_
  }
  if (hasBody) {
    header["Content-Type"] = "application/json"
  }
  return header
}

/**
 * Fetch class for server requests
 */
export default class Fetch {
  constructor(session) {
    this.session = session
  }

  /**
   * Update a database object on the backend
   * @param {String} path path to the database object
   * @param {String} method HTTP method, should be any of the "unsafe" methods:
   * PUT, POST, PATCH
   * @param {JSON} body the body of the request as a JSON object
   * @returns A response from fetch, or a json object reprsenting an error
   */
  async updateObject(path, method, body) {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method,
        credentials: "include",
        headers: buildHeaders(this.session, true),
        body: JSON.stringify(body),
      })
      return response
    } catch (err) {
      return {
        ok: false,
        errors: [
          {
            description: err.message,
            names: ["unknown"],
          },
        ],
      }
    }
  }

  /**
   * Retrieve a database object on the backend
   * @param {String} path path to the database object
   * @param {String} method HTTP method, should be any of the "safe" methods:
   * GET (the default), HEAD, OPTIONS, TRACE
   * @returns A response from fetch, or a json object reprsenting an error
   */
  async getObject(path, method = "GET") {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: method,
        credentials: "include",
        headers: buildHeaders(this.session, false),
      })
      return response
    } catch (err) {
      return {
        ok: false,
        errors: [
          {
            description: err.message,
            names: ["unknown"],
          },
        ],
      }
    }
  }
}
