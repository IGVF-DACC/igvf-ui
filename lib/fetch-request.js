/**
 * Use the FetchRequest class to send requests to a server, whether the NextJS server or the data
 * provider, for example GET or POST requests.
 *
 * const request = new FetchRequest();
 * const response = await request.getObject('/api/users/1');
 * *
 * Generally, the last part of the method names reflects the type of data resolved by the returned
 * promise, e.g. getObject() resolves to an object, while getText() resolves to a string. Methods
 * relying on these fundamental methods might not follow this naming convention.
 *
 * Handle authentication when calling the FetchRequest constructor. For requests from the server
 * code, pass the browser cookie in the `cookie` property:
 *
 * const request = new FetchRequest({ cookie: req.headers.cookie });
 *
 * For requests from the client code, pass the session object in the `session` property:
 *
 * const request = new FetchRequest({ session });
 *
 * You can also pass nothing to the constructor for requests not requiring authentication.
 *
 * Many methods accept an optional `defaultErrorValue` parameter. If the request fails, this value
 * gets returned. If you instead want requests that fail to return an error object, don't pass
 * `defaultErrorValue`.
 */

// lib
import { API_URL, SERVER_URL, BACKEND_URL, MAX_URL_LENGTH } from "./constants";

const FETCH_METHOD = {
  GET: "GET",
  HEAD: "HEAD",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  CONNECT: "CONNECT",
  OPTIONS: "OPTIONS",
  TRACE: "TRACE",
  PATCH: "PATCH",
};
Object.freeze(FETCH_METHOD);

/**
 * fetch() methods that allow a `body` in the options object.
 */
const METHODS_ALLOWING_BODY = [
  FETCH_METHOD.POST,
  FETCH_METHOD.PUT,
  FETCH_METHOD.PATCH,
];
Object.freeze(METHODS_ALLOWING_BODY);

const PAYLOAD_FORMAT = {
  JSON: "application/json",
  HTML: "text/html",
  TEXT: "text/plain",
  XML: "application/xml",
  FORM: "application/x-www-form-urlencoded",
  FORM_DATA: "multipart/form-data",
  JSON_PATCH: "application/json-patch+json",
  JSON_MERGE_PATCH: "application/json-merge-patch+json",
  JSON_PATCH_JSON: "application/json-patch+json",
  JSON_MERGE_PATCH_JSON: "application/json-merge-patch+json",
};
Object.freeze(PAYLOAD_FORMAT);

export const HTTP_STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  PARTIAL_CONTENT: 206,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  SWITCH_PROXY: 306,
  TEMPORARY_REDIRECT: 307,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  REQUEST_ENTITY_TOO_LARGE: 413,
  REQUEST_URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  REQUESTED_RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
};
Object.freeze(HTTP_STATUS_CODE);

/**
 * Standard returned response for a network error.
 */
const NETWORK_ERROR_RESPONSE = {
  "@type": ["NetworkError", "Error"],
  status: "error",
  code: "NETWORK",
  title: "Unknown error",
  description: "An unknown error occurred.",
  detail: "An unknown error occurred.",
};
Object.freeze(NETWORK_ERROR_RESPONSE);

/**
 * Estimate of the maximum size of an @id=path query-string element.
 */
const MAX_PATH_QUERY_LENGTH_ESTIMATE = 50;

/**
 * Log a request from the NextJS server to igvfd.
 * @param {string} method FetchRequest method that performs the request
 * @param {string} path Path or paths to requested resource
 * @returns {void}
 */
function logRequest(method, path) {
  const date = new Date().toISOString();
  console.log(`SVRREQ [${date}] ${method} ${path}`);
}

/**
 * Make requests to the server or data provider.
 * @param {object} {
 *   cookie: Cookie from NextJS request object; used to authenticate server-side requests
 *   session: Session object from the data server for authenticating client-side requests
 * }
 */
export default class FetchRequest {
  #headers = {};
  #backend = false;

  /**
   * Determine whether the response object indicates an error of any kind occurred, whether an
   * error detected by the server, or a network error. Objects without an `@type` property return
   * true (success).
   * @param {object} response Response object from fetch()
   * @returns {boolean} True if response is a successful response
   */
  static isResponseSuccess(response) {
    return !response["@type"]?.includes("Error");
  }

  constructor(authentication) {
    let cookie;
    let session;
    let backend;

    if (authentication) {
      ({ cookie, session, backend } = authentication);
      if (cookie && session) {
        throw new Error(
          "Must authenticate with either cookie (server-side requests) or session (client-side requests) but not both"
        );
      }
      if (!backend) {
        if (this.#isServer && session) {
          throw new Error(
            "Server-side requests requires a cookie, but a session was provided."
          );
        }
        if (!this.#isServer && cookie) {
          throw new Error(
            "Client-side requests requires a session, but a cookie was provided."
          );
        }
      }
    }
    if (cookie || session) {
      if (this.#isServer) {
        this.#headers.Cookie = cookie;
      } else if (!backend) {
        this.#headers["X-CSRF-Token"] = session._csrft_;
      }
    }

    if (backend) {
      this.#backend = true;
    }
  }

  /**
   * Take an array of paths to database objects, and break it into groups of paths to fit within
   * the maximum size of a query string -- each group an array of paths with a maximum calculated
   * size. This function returns an array of these groups -- an array of arrays of paths, with no
   * sub-array having a length greater than the amount that would fit within a URL.
   * @param {Array<string>} paths Path of each object to request
   * @param {number} adjustment Number of characters to subtract from the URL length for other
   *     query-string elements
   * @returns {Array<Array<string>>} Array of arrays (groups) of paths
   */
  #pathsIntoPathGroups(paths, adjustment) {
    // Calculate the maximum number of paths that can fit into a query string.
    const maxGroupSize = Math.floor(
      (MAX_URL_LENGTH - adjustment) / MAX_PATH_QUERY_LENGTH_ESTIMATE
    );

    // Break the paths into groups of maxGroupSize. Each group gets converted to a query string
    // and sent as a single request.
    const pathGroups = paths.reduce(
      (groups, path) => {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup.length < maxGroupSize) {
          // The last group in the array of groups still has room for a new path.
          lastGroup.push(path);
          return groups;
        }

        // No room for another path in the last group. Make a new last group at the end.
        return [...groups, [path]];
      },
      [[]]
    );
    return pathGroups;
  }

  /**
   * Determine whether this class object is being used on the server or not.
   * @returns {boolean} True if this class object exists on server, false for client
   */
  get #isServer() {
    return typeof window === "undefined";
  }

  /**
   * Client and server requests have to go through different URLs. Call this to get the URL
   * appropriate for the current request.
   */
  get #baseUrl() {
    if (this.#backend) {
      return SERVER_URL;
    }
    return this.#isServer ? BACKEND_URL : API_URL;
  }

  /**
   * Build the complete request URL for the given path, appropriate for client and server requests.
   * @param {string} path Path to append to the base URL
   * @param {boolean} isDbRequest True to get data from database instead of search engine
   * @returns {string} Complete URL for the given path
   */
  #pathUrl(path, isDbRequest) {
    const pathHasQuery = path.includes("?");
    const dbRequestQuery = isDbRequest
      ? `${pathHasQuery ? "&" : "?"}datastore=database`
      : "";
    return `${this.#baseUrl}${path}${dbRequestQuery}`;
  }

  /**
   * Build the options object for a fetch() request, including the headers.
   * @param {string} method Method to use for the request
   * @param {object} options Unnamed parameter indicating request options
   * @param {object} options.payload Object to send as the request body
   * @param {string} options.accept Accept header to send with the request
   * @param {string} options.contentType Content-Type header to send with the request
   * @returns {object} Options object for fetch()
   */
  #buildOptions(method, { payload, accept, contentType }) {
    const headers = this.#headers;
    if (accept) {
      headers.Accept = accept;
    }
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    const options = {
      method,
      credentials: "include",
      headers,
    };
    if (payload && METHODS_ALLOWING_BODY.includes(method)) {
      options.body = JSON.stringify(payload);
    }
    return options;
  }

  /**
   * Request the object with the given path.
   * @param {string} path Path to requested resource
   * @param {*} defaultErrorValue Value to return if the request fails; error object if not given
   * @param {object} options indicating request options
   * @param {boolean} options.isDbRequest True to get data from database instead of search engine
   * @returns {object} Requested object or error object
   */
  async getObject(path, defaultErrorValue, options = {}) {
    const headerOptions = this.#buildOptions(FETCH_METHOD.GET, {
      accept: PAYLOAD_FORMAT.JSON,
      redirect: "follow",
    });
    try {
      logRequest("getObject", path);
      const response = await fetch(
        this.#pathUrl(path, options.isDbRequest),
        headerOptions
      );
      if (!response.ok && defaultErrorValue !== undefined) {
        return defaultErrorValue;
      }
      return response.json();
    } catch (error) {
      console.log(error);
      return defaultErrorValue === undefined
        ? NETWORK_ERROR_RESPONSE
        : defaultErrorValue;
    }
  }

  /**
   * Request the object with the given URL, including protocol and domain.
   * @param {string} url Full URL to requested resource
   * @param {*} defaultErrorValue Value to return if the request fails; error object if not given
   * @returns {object} Requested object or error object
   */
  async getObjectByUrl(url, defaultErrorValue) {
    const headerOptions = this.#buildOptions(FETCH_METHOD.GET, {
      accept: PAYLOAD_FORMAT.JSON,
      redirect: "follow",
    });
    try {
      logRequest("getObjectByUrl", url);
      const response = await fetch(url, headerOptions);
      if (!response.ok && defaultErrorValue !== undefined) {
        return defaultErrorValue;
      }
      return response.json();
    } catch (error) {
      console.log(error);
      return defaultErrorValue === undefined
        ? NETWORK_ERROR_RESPONSE
        : defaultErrorValue;
    }
  }

  /**
   * Request a number of objects with the given paths, returning each path's resource in an array
   * in the same order as their paths in the given array. If you provide `defaultErrorValue`, any
   * paths that result in a request error places this default value in that array entry,
   * otherwise those entries are filled with the error object.
   * @param {array} paths Array of paths to requested resources
   * @param {*} defaultErrorValue Value to return if the request fails; error object if not given
   * @param {object} options Options for these requests
   * @param {boolean} options.filterErrors True to filter errored requests from the returned array
   * @returns {array} Array of requested objects
   */
  async getMultipleObjects(paths, defaultErrorValue, options = {}) {
    logRequest("getMultipleObjects", `[${paths.join(", ")}]`);
    const results =
      paths.length > 0
        ? await Promise.all(
            paths.map((path) => this.getObject(path, defaultErrorValue))
          )
        : [];
    return options.filterErrors
      ? results.filter((result) => result !== defaultErrorValue)
      : results;
  }

  /**
   * Same as the `getMultipleObjects()` method, but instead of requesting each individual object in
   * parallel, it instead requests a `/search`, passing in the `@id` of every requested object, as
   * well as the fields needed for each object.
   * @param {Array<string>} paths Path of each object to request
   * @param {<any>} defaultErrorValue Value to return if the request fails; error object if not given
   * @param {Array<string>} fields Properties of each object to retrieve
   * @returns {Array<object>} Array of requested objects
   */
  async getMultipleObjectsBulk(paths, defaultErrorValue, fields) {
    logRequest("getMultipleObjectsBulk", `[${paths.join(", ")}]`);

    if (paths.length > 0) {
      // Generate the query string for the needed fields of each object.
      const fieldQuery = fields.map((field) => `field=${field}`).join("&");

      // Break the paths into groups of MAX_PATH_GROUP_SIZE, each group mapping to a data-provider
      // request. This reduces the lengths of the query strings to fit within the data provider's
      // limits.
      const pathGroups = this.#pathsIntoPathGroups(paths, fieldQuery.length);

      // For each group of paths, request the objects as search results. Send these requests in
      // parallel.
      const results = await Promise.all(
        pathGroups.map(async (group) => {
          const pathQuery = group.map((path) => `@id=${path}`).join("&");
          const query = `${fieldQuery ? `${fieldQuery}&` : ""}${pathQuery}`;
          const response = await this.getObject(
            `/search/?${query}&limit=${group.length}`,
            null
          );
          if (response?.["@graph"]) {
            // Add the results to the array of results.
            return response["@graph"];
          }

          // The response was an error. Add an empty array to the path groups, so that segment of
          // results gets skipped.
          return null;
        })
      );

      // Flatten the results array of arrays into a single array.
      const flattenedResults = results.flat();
      return flattenedResults.includes(null)
        ? defaultErrorValue
        : flattenedResults;
    }
    return [];
  }

  /**
   * Request the collection (e.g. "users") with the given path.
   * @param {string} collection Name of the collection to request
   * @param {*} defaultErrorValue Value to return if the request fails; error object if not given
   * @returns {object} Collection data including all its members in @graph
   */
  async getCollection(collection, defaultErrorValue) {
    return this.getObject(`/${collection}/?limit=all`, defaultErrorValue);
  }

  /**
   * Request text file string with the given path.
   * @param {string} path Path to the requested resource
   * @param {*} defaultErrorValue Value to return if the request fails; error object if not given
   * @returns {string/object} Requested string, or error object if `defaultErrorValue` not given
   */
  async getText(path, defaultErrorValue) {
    const options = this.#buildOptions(FETCH_METHOD.GET, {
      accept: PAYLOAD_FORMAT.TEXT,
    });
    try {
      logRequest("getText", path);
      const response = await fetch(this.#pathUrl(path), options);
      if (!response.ok && defaultErrorValue !== undefined) {
        return defaultErrorValue;
      }
      return response.text();
    } catch (error) {
      console.log(error);
      return defaultErrorValue === undefined
        ? NETWORK_ERROR_RESPONSE
        : defaultErrorValue;
    }
  }

  /**
   * Send a POST request with the given object.
   * @param {string} path Path to resource to post to
   * @param {object} payload Object to post
   * @returns Response from POST request
   */
  async postObject(path, payload) {
    logRequest("postObject", path);
    const options = this.#buildOptions(FETCH_METHOD.POST, {
      accept: PAYLOAD_FORMAT.JSON,
      contentType: PAYLOAD_FORMAT.JSON,
      payload,
    });
    try {
      const response = await fetch(this.#pathUrl(path), options);
      return response.json();
    } catch (error) {
      console.log(error);
      return NETWORK_ERROR_RESPONSE;
    }
  }

  /**
   * Write the given object with a PUT request.
   * @param {string} path Path to resource to put
   * @param {*} payload Object to put at the given path
   * @returns {object} Response from PUT request
   */
  async putObject(path, payload) {
    const options = this.#buildOptions(FETCH_METHOD.PUT, {
      accept: PAYLOAD_FORMAT.JSON,
      contentType: PAYLOAD_FORMAT.JSON,
      payload,
    });
    try {
      logRequest("putObject", path);
      const response = await fetch(this.#pathUrl(path), options);
      return response.json();
    } catch (error) {
      console.log(error);
      return NETWORK_ERROR_RESPONSE;
    }
  }

  /**
   * Patch the object at the given path with the given payload.
   * @param {string} path Path to resource to patch
   * @param {object} payload Object to merge into patched object
   * @returns Response from PATCH request
   */
  async patchObject(path, payload) {
    const options = this.#buildOptions(FETCH_METHOD.PATCH, {
      accept: PAYLOAD_FORMAT.JSON,
      contentType: PAYLOAD_FORMAT.JSON,
      payload,
    });
    try {
      logRequest("patchObject", path);
      const response = await fetch(this.#pathUrl(path), options);
      return response.json();
    } catch (error) {
      console.log(error);
      return NETWORK_ERROR_RESPONSE;
    }
  }
}
