
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
    "Accept": "application/json",
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

  async updateObject(path, method, body) {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: buildHeaders(this.session, true),
      body: JSON.stringify(body),
    }).then((response) => {
      return response
    })
    .catch(() => {
      return {
        errors: [
          {
            description: "Network error while updating",
            names: ["unknown"],
          },
        ],
      }
    })
    return response
  }

  async getObject(path, method) {
    const response = await fetch(`${API_URL}${path}`, {
      method: method,
      credentials: "include",
      headers: buildHeaders(this.session, false),
    }).then((response) => {
      return response
    })
    .catch(() => {
      return {
        errors: [
          {
            description: "Network error while updating",
            names: ["unknown"],
          },
        ],
      }
    })
    return response
  }
}
