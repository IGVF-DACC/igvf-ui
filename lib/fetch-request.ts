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

// TYPES
// root
import type {
  DatabaseObject,
  DataProviderObject,
  SessionObject,
} from "../globals.d";
// lib
import { ok, err, Result, Ok } from "./result";

// node_modules
import pako from "pako";
// lib
import { API_URL, SERVER_URL, BACKEND_URL, MAX_URL_LENGTH } from "./constants";

/**
 * Node.js HTTP/HTTPS Agent classes for persistent connections.
 * These remain undefined in browser environments and are set once during module initialization.
 *
 * ⚠️ IMPORTANT: Do not reassign these variables after initialization as it will break HTTP
 * connection pooling for all subsequent requests.
 */
let HttpsAgent: typeof import("https").Agent | undefined;
let HttpAgent: typeof import("http").Agent | undefined;

/*
 * Server-side module loading for persistent connections. Browser environments don't need this.
 * Agent classes are assigned once at module load time and should remain unchanged thereafter.
 */
/* istanbul ignore if: Server-side module loading cannot be tested in Jest jsdom environment */
if (typeof window === "undefined") {
  try {
    const { Agent } = require("https");
    const { Agent: HttpAgentClass } = require("http");
    HttpsAgent = Agent;
    HttpAgent = HttpAgentClass;
  } catch (_error) {
    // Import failed - agents will remain undefined and requests will use default behavior.
  }
}

/**
 * Possible request methods for a fetch request.
 */
export type FetchMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE"
  | "PATCH";

/**
 * Arguments for a FetchRequest constructor.
 */
export interface FetchRequestInitializer {
  cookie?: string;
  session?: SessionObject;
  backend?: boolean;
}

/**
 * Extended RequestInit that includes Node.js-specific `agent` property.
 */
interface RequestInitWithAgent extends RequestInit {
  agent?:
    | InstanceType<typeof import("https").Agent>
    | InstanceType<typeof import("http").Agent>;
}

/**
 * Format of standard error responses.
 */
export interface ErrorObject {
  isError: true;
  "@type": Array<string>;
  code: number;
  description: string;
  detail: string;
  status: string;
  title: string;
}

/**
 * fetch() methods that allow a `body` in the options object.
 */
const METHODS_ALLOWING_BODY: Array<FetchMethod> = ["POST", "PUT", "PATCH"];
Object.freeze(METHODS_ALLOWING_BODY);

const PAYLOAD_FORMAT: { [key: string]: string } = {
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

export const HTTP_STATUS_CODE: { [key: string]: number } = {
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
const NETWORK_ERROR_RESPONSE: ErrorObject = {
  isError: true,
  "@type": ["NetworkError", "Error"],
  status: "error",
  code: HTTP_STATUS_CODE.SERVICE_UNAVAILABLE,
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
 * Maximum number of bytes to read from a gzipped text file. This must have a value enough for
 * successful decompression.
 */
const MAX_READ_SIZE = 50_000_000;

/**
 * Default maximum number of lines to return from the text file preview methods. Make sure this has
 * a value less than `MAX_READ_LINES`.
 */
const DEFAULT_MAX_TEXT_LINES = 100;

/**
 * Maximum number of sockets to allow in the connection pool for persistent connections.
 */
const MAX_SOCKETS = 10;

/**
 * Maximum number of idle connections to keep open per host (connection pooling).
 */
const MAX_FREE_SOCKETS = 5;

/**
 * Timeout in milliseconds for socket inactivity before closing the connection.
 */
const SOCKET_TIMEOUT = 60000; // 60 seconds

/**
 * Log request details with connection type indicator
 */
export function logRequest(
  method: string,
  path: string,
  usingAgent: boolean
): void {
  console.log(
    `SVRREQ [${new Date().toISOString()}] [${
      usingAgent ? "PERSISTENT" : "DEFAULT"
    }] ${method} ${path}`
  );
}

/**
 * Type-safe HTTP method comparison utility. Compares string method with a FetchMethod union type.
 *
 * @param method - Method to check against a `FetchMethod` union type
 * @param expectedMethod - Expected HTTP method
 * @returns True if the methods match
 */
export function isHttpMethod(
  method: string | undefined,
  expectedMethod: FetchMethod
): boolean {
  return method === expectedMethod;
}

/**
 * Type guard to check if `item` is an `ErrorObject`. Pass the result of the `union()` method to
 * this function so items that are `ErrorObject` type are automatically treated as that type.
 * @param item Item to check whether it's an ErrorObject or actual data
 * @returns True if `item` is an `ErrorObject`
 */
export function isErrorObject(
  item: DataProviderObject | ErrorObject
): item is ErrorObject {
  return (item as ErrorObject).isError === true;
}

/**
 * Make requests to the server or data provider.
 * @param {object} {
 *   cookie: Cookie from NextJS request object; used to authenticate server-side requests
 *   session: Session object from the data server for authenticating client-side requests
 * }
 */
export default class FetchRequest {
  private headers = new Headers();
  private backend = false;

  // Static connection pool for persistent connections (Node only). Imports only import Typescript
  // types, not code. This holds an actual instance of the agent class once initialized, so we need
  // to use `InstanceType<>` to represent the instance of the class.
  private static httpsAgent:
    | InstanceType<typeof import("https").Agent>
    | undefined;
  private static httpAgent:
    | InstanceType<typeof import("http").Agent>
    | undefined;
  private static connectionPoolInitialized = false;

  /**
   * Determine whether the response object indicates an error of any kind occurred, whether an
   * error detected by the server, or a network error. Objects without an `@type` property return
   * true (success).
   * @param {DataProviderObject|ErrorObject} response Response object from fetch()
   * @returns {boolean} True if response is a successful response
   */
  static isResponseSuccess(
    response: DataProviderObject | ErrorObject
  ): response is DataProviderObject {
    if (
      typeof response === "object" &&
      response !== null &&
      "@type" in response
    ) {
      const types = (response as DatabaseObject)["@type"];
      return !types.includes("Error");
    }
    return true;
  }

  constructor(authentication?: FetchRequestInitializer) {
    let cookie: string | undefined;
    let session: SessionObject | undefined;
    let backend: boolean | undefined;

    if (authentication) {
      ({ cookie, session, backend } = authentication);
      if (cookie && session) {
        throw new Error(
          "Must authenticate with either cookie (server-side requests) or session (client-side requests) but not both"
        );
      }
      if (!backend) {
        if (this.isServer && session) {
          throw new Error(
            "Server-side requests requires a cookie, but a session was provided."
          );
        }
        if (!this.isServer && cookie) {
          throw new Error(
            "Client-side requests requires a session, but a cookie was provided."
          );
        }
      }
    }

    // Initialize the HTTP request headers.
    if (cookie && this.isServer) {
      this.headers.append("Cookie", cookie);
    }
    if (session && !this.isServer && !backend) {
      this.headers.append("X-CSRF-Token", session._csrft_);
    }

    if (backend) {
      this.backend = true;
    }

    // Initialize persistent connection pool for server-side requests
    this.initializeConnectionPool();
  }

  /**
   * Initialize persistent connection pool for server-side requests. This improves performance by
   * reusing TCP/TLS connections.
   */
  private initializeConnectionPool(): void {
    // Initialize if we're on Node.js but not already initialized.
    /* istanbul ignore if: Server-side connection pool initialization cannot be tested in Jest jsdom environment */
    if (this.isServer && !FetchRequest.connectionPoolInitialized) {
      try {
        if (HttpsAgent && HttpAgent) {
          // Shared configuration for both HTTP and HTTPS agents. Define here instead of globally
          // because this isn't needed in the browser.
          const agentConfig = {
            // Keep TCP/TLS connections alive between requests instead of closing them.
            keepAlive: true,
            // Maximum number of concurrent connections to any single host.
            maxSockets: MAX_SOCKETS,
            // Maximum number of idle connections to keep open per host (connection pooling).
            maxFreeSockets: MAX_FREE_SOCKETS,
            // Timeout in milliseconds for socket inactivity before closing the connection
            timeout: SOCKET_TIMEOUT,
          };

          // Configure HTTPS and HTTP agents with persistent connections.
          FetchRequest.httpsAgent = new HttpsAgent(agentConfig);
          FetchRequest.httpAgent = new HttpAgent(agentConfig);

          FetchRequest.connectionPoolInitialized = true;
        }
      } catch (_error) {
        // Failed to initialize connection pool -- fall back to default behavior. Requests still
        // work without persistent connections.
      }
    }
  }

  /**
   * Return true if persistent connections are available for use.
   */
  private get usingPersistentConnections(): boolean {
    return this.isServer && FetchRequest.connectionPoolInitialized;
  }

  /**
   * Get the appropriate HTTP agent for persistent connections based on URL protocol.
   *
   * @param url - The URL to determine the protocol for
   * @returns HTTP agent for the protocol, or undefined if not available
   */
  private getConnectionAgent(
    url: string
  ):
    | InstanceType<typeof import("https").Agent>
    | InstanceType<typeof import("http").Agent>
    | undefined {
    if (this.usingPersistentConnections) {
      try {
        const protocol = new URL(url).protocol;
        return protocol === "https:"
          ? FetchRequest.httpsAgent
          : FetchRequest.httpAgent;
      } catch (_error) {
        // Invalid URL or other error - return undefined for default behavior
        return undefined;
      }
    }
    return undefined;
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
  private pathsIntoPathGroups(
    paths: Array<string>,
    adjustment: number
  ): Array<Array<string>> {
    // Calculate the maximum number of paths that can fit into a query string.
    const maxGroupSize = Math.floor(
      (MAX_URL_LENGTH - adjustment) / MAX_PATH_QUERY_LENGTH_ESTIMATE
    );

    // Break the paths into groups of maxGroupSize. Each group gets converted to a query string
    // and sent as a single request.
    const pathGroups = paths.reduce(
      (groups: Array<Array<string>>, path: string) => {
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
  private get isServer(): boolean {
    return typeof window === "undefined";
  }

  /**
   * Client and server requests have to go through different URLs. Call this to get the URL
   * appropriate for the current request.
   * @returns {string} URL to use for the current request
   */
  private get baseUrl(): string {
    if (this.backend) {
      return SERVER_URL;
    }
    return this.isServer ? BACKEND_URL : API_URL;
  }

  /**
   * Build the complete request URL for the given path, appropriate for client and server requests.
   * @param {string} path Path to append to the base URL
   * @param {boolean} isDbRequest? True to get data from database instead of search engine
   * @returns {string} Complete URL for the given path
   */
  private pathUrl(path: string, isDbRequest = false): string {
    const pathHasQuery = path.includes("?");
    const dbRequestQuery = isDbRequest
      ? `${pathHasQuery ? "&" : "?"}datastore=database`
      : "";
    return `${this.baseUrl}${path}${dbRequestQuery}`;
  }

  /**
   * Build the options object for a fetch() request, including the headers.
   * @param {string} method Method to use for the request
   * @param {object} options Unnamed parameter indicating request options
   * @param {object} options.payload? Object to send as the request body
   * @param {string} options.accept? Accept header to send with the request
   * @param {string} options.contentType? Content-Type header to send with the request
   * @returns {RequestInit} Options object for fetch()
   */
  private buildOptions(
    method: FetchMethod,
    additional: {
      payload?: object;
      accept?: string;
      range?: string;
      contentType?: string;
      acceptEncoding?: string;
    },
    includeCredentials = true
  ): RequestInitWithAgent {
    if (additional.accept) {
      this.headers.set("Accept", additional.accept);
    }
    if (additional.range) {
      this.headers.set("Range", additional.range);
    }
    if (additional.contentType) {
      this.headers.set("Content-Type", additional.contentType);
    }
    const options: RequestInit = {
      method,
      redirect: "follow",
      headers: this.headers,
      ...(includeCredentials && { credentials: "include" }),
    };
    if (additional.payload && METHODS_ALLOWING_BODY.includes(method)) {
      options.body = JSON.stringify(additional.payload);
    }
    return options;
  }

  /**
   * Build the options object for a fetch() request with persistent connection agent.
   *
   * @param url  - The URL for the request (to determine the agent)
   * @param method  - Method to use for the request
   * @param additional  - Additional options object
   * @param includeCredentials  - Whether to include credentials
   * @returns Options object for fetch() with agent if available
   */
  private buildOptionsWithAgent(
    url: string,
    method: FetchMethod,
    additional: {
      payload?: object;
      accept?: string;
      range?: string;
      contentType?: string;
      acceptEncoding?: string;
    },
    includeCredentials = true
  ): RequestInitWithAgent {
    const baseOptions = this.buildOptions(
      method,
      additional,
      includeCredentials
    );

    // Add persistent connection agent for server-side requests.
    const agent = this.getConnectionAgent(url);
    if (agent) {
      baseOptions.agent = agent;
    }

    return baseOptions;
  }

  /**
   * Request the object with the given path.
   * @param {string} path Path to requested resource
   * @param {object} options? indicating request options
   * @param {boolean} options.isDbRequest True to get data from database instead of search engine
   * @returns {Promise<DataProviderObject|ErrorObject>} Requested object, error object, or
   *  `defaultErrorValue` if given and the request fails
   */
  public async getObject(
    path: string,
    options = { isDbRequest: false }
  ): Promise<Result<DataProviderObject, ErrorObject>> {
    const url = this.pathUrl(path, options.isDbRequest);
    const headerOptions = this.buildOptionsWithAgent(url, "GET", {
      accept: PAYLOAD_FORMAT.JSON,
    });
    try {
      logRequest("getObject", url, this.usingPersistentConnections);
      const response = await fetch(url, headerOptions);
      if (!response.ok) {
        const error = {
          ...(await response.json()),
          isError: true,
        } as ErrorObject;
        return err(error);
      }
      const results = (await response.json()) as DataProviderObject;
      return ok(results);
    } catch (error) {
      console.log("NETWORK ERROR: ", error);
      return err(NETWORK_ERROR_RESPONSE);
    }
  }

  /**
   * Request the object with the given URL, including protocol and domain.
   * @param {string} url Full URL to requested resource
   * @param {string} [accept] Accept header to send with the request; application/json by default
   * @returns {Promise<DataProviderObject|ErrorObject>} Requested object or error object
   */
  public async getObjectByUrl(
    url: string
  ): Promise<Result<DataProviderObject, ErrorObject>> {
    const headerOptions = this.buildOptionsWithAgent(url, "GET", {
      accept: PAYLOAD_FORMAT.JSON,
    });
    try {
      logRequest("getObjectByUrl", url, this.usingPersistentConnections);
      const response = await fetch(url, headerOptions);
      if (!response.ok) {
        const error = {
          ...(await response.json()),
          isError: true,
        } as ErrorObject;
        return err(error);
      }
      const results = (await response.json()) as DataProviderObject;
      return ok(results);
    } catch (error) {
      console.log(error);
      return err(NETWORK_ERROR_RESPONSE);
    }
  }

  /**
   * Request a number of objects with the given paths, returning each path's resource in an array
   * in the same order as their paths in the given array. Any paths that result in an error
   * get placed that array entry.
   * @param {array} paths Array of paths to requested resources
   * @param {object} options? Options for these requests
   * @param {boolean} options.filterErrors True to filter errored requests from the returned array
   * @returns {Promise<Array<DataProviderObject|ErrorObject|T>>} Array of requested objects
   */
  public async getMultipleObjects(
    paths: Array<string>,
    options = { filterErrors: false }
  ): Promise<Array<Result<DataProviderObject, ErrorObject>>> {
    logRequest(
      "getMultipleObjects",
      `[${paths.join(", ")}]`,
      this.usingPersistentConnections
    );
    const results =
      paths.length > 0
        ? await Promise.all(paths.map((path) => this.getObject(path)))
        : await Promise.resolve([]);

    return options.filterErrors
      ? results.filter((result) => result.isOk())
      : results;
  }

  /**
   * Same as the `getMultipleObjects()` method, but instead of requesting each individual object in
   * parallel, it instead requests a `/search`, passing in the `@id` of every requested object, as
   * well as the fields needed for each object. This can cause a query string too long to fit in a
   * URL, so break the paths into groups of paths, each group mapping to an individual request.
   * request. Unlike `getMultipleObjects()`, this method never returns an array that could contain
   * entries for failed requests. It instead either returns an array of successfully requested
   * objects, or a single error value.
   * @param {Array<string>} paths Path of each object to request
   * @param {Array<string>} fields Properties of each object to retrieve; if none; all properties
   * @param {string} type? Type of objects to request; if given, adds `type=` to the query string
   * @returns {Promise<Result<Array<DataProviderObject>, ErrorObject>>} Array of requested objects
   */
  async getMultipleObjectsBulk(
    paths: Array<string>,
    fields: Array<string>,
    types: string[] = []
  ): Promise<Result<Array<DataProviderObject>, ErrorObject>> {
    logRequest(
      "getMultipleObjectsBulk",
      `types:${types.join()} [${paths.join(", ")}]`,
      this.usingPersistentConnections
    );

    if (paths.length === 0) {
      return ok([]);
    }

    // Generate the query string for the needed fields of each object.
    const fieldQuery =
      fields.length > 0
        ? fields.map((field) => `field=${field}`).join("&")
        : "";

    // Break the paths into groups of MAX_PATH_GROUP_SIZE, each group mapping to a data-provider
    // request. This reduces the lengths of the query strings to fit within the data provider's
    // limits.
    const pathGroups = this.pathsIntoPathGroups(paths, fieldQuery.length);

    // If the type is given, add it to the query string.
    const typeQuery =
      types.length > 0 ? types.map((type) => `type=${type}&`).join("") : "";

    // For each group of paths, request the objects as search results. Send these requests in
    // parallel.
    const results = await Promise.all(
      pathGroups.map(async (group) => {
        const pathQuery = group.map((path) => `@id=${path}`).join("&");
        const query = `${fieldQuery ? `${fieldQuery}&` : ""}${pathQuery}`;
        const response = await this.getObject(
          `/search-quick/?${typeQuery}${query}&limit=${group.length}`
        );
        return response.map((g) => g["@graph"] as Array<DataProviderObject>);
      })
    );

    const firstError = results.find((r) => r.isErr());
    if (firstError !== undefined) {
      // If we found an error, then bail, and we know it's not undefined
      return firstError;
    }

    // We know that all the Results in the results list are Ok
    // so we can safely turn them all into Array<DataProviderObject>
    // Return the the flattened list wrapped in an Ok
    return ok(Ok.all(results).flat());
  }

  /**
   * Request multiple objects by searching for them by a query string or by a property and
   * values for that property.
   * @param type Database object type to search (e.g. MeasurementSet)
   * @param fields Fields to retrieve for each object
   * @param options Search options, comprising:
   * @param options.query - Query string to search (mutually exclusive with property/values)
   * @param options.property - Property name to search on (requires values array)
   * @param options.values - Array of values for `property` to search for
   * @returns Promise that resolves to an array of requested objects or an error
   */
  async getMultipleObjectsBySearch(
    type: string,
    fields: string[],
    options: { query: string } | { property: string; values: string[] }
  ): Promise<Result<Array<DataProviderObject>, ErrorObject>> {
    if (!type.trim()) {
      throw new Error("`type` parameter required");
    }

    // Get all possible properties within `options`.
    const { query, property, values } =
      "query" in options
        ? { query: options.query.trim(), property: "", values: [] }
        : {
            query: "",
            property: options.property.trim(),
            values: options.values
              .map((v) => v.trim())
              .filter((v) => v.length > 0),
          };

    logRequest(
      "getMultipleObjectsBySearch",
      `type:${type} query:${query} property:${property} values:${values.join(
        ","
      )}`,
      this.usingPersistentConnections
    );

    // Ensure we have either `query` or `property` with `values`.
    if (!query && (!property || values.length === 0)) {
      throw new Error(
        "Invalid search options: provide either a query string or property with values"
      );
    }

    // Either use the given query string or build one from the property/values.
    const searchQuery =
      query ||
      values
        .map((value) => `${property}=${encodeURIComponent(value)}`)
        .join("&");

    // Include the fields to retrieve in the search query.
    const searchFields =
      fields.length > 0
        ? fields.map((field) => `field=${encodeURIComponent(field)}`).join("&")
        : "";

    // Build the query string using the search elements as well as the object fields, if any.
    const queryParts = [`type=${type}`, searchFields, searchQuery]
      .filter(Boolean)
      .join("&");
    const finalUri = `/search-quick/?${queryParts}`;
    if (finalUri.length > MAX_URL_LENGTH) {
      throw new Error("Search query URI exceeds maximum length");
    }

    // Make the request to the search endpoint and extract the searched objects from the response.
    const response = await this.getObject(finalUri);
    return response.map(
      (data) => (data["@graph"] || []) as Array<DataProviderObject>
    );
  }

  /**
   * Request the collection (e.g. "users") with the given path.
   * @param {string} collection Name of the collection to request
   * @returns {Promise<Result<DataProviderObject, ErrorObject>>} Collection data including all its members in @graph
   */
  public async getCollection(
    collection: string
  ): Promise<Result<DataProviderObject, ErrorObject>> {
    return this.getObject(`/${collection}/?limit=all`);
  }

  /**
   * Request text file string with the given path.
   * @param {string} path Path to the requested resource
   * @param {T} defaultErrorValue? Value to return if the request fails; error object if not given
   * @returns {Promise<string|DataProviderObject|T>} Requested string, or error object if
   *   `defaultErrorValue` not given
   */
  public async getText<T>(
    path: string,
    defaultErrorValue?: T
  ): Promise<string | ErrorObject | T> {
    const url = this.pathUrl(path);
    const options = this.buildOptionsWithAgent(url, "GET", {
      accept: PAYLOAD_FORMAT.TEXT,
    });
    try {
      logRequest("getText", path, this.usingPersistentConnections);
      const response = await fetch(url, options);
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
   * Request a text file hosted in an AWS bucket with the given full URL. This method returns just
   * the first `maxLines` lines of the text file, limited to `MAX_READ_LINES`. We expect
   * the file to have gzip compression. Very large files work fine with this method, as we only
   * read up to `MAX_READ_LINES` lines of the file, and decompress the file in chunks.
   * @param url Full URL to a gzipped text file in an AWS bucket
   * @param maxLines Maximum number of lines to return from the text file
   * @returns First decompressed `maxLines` lines of the text file
   */
  public async getZippedPreviewText(
    url: string,
    maxLines = DEFAULT_MAX_TEXT_LINES
  ) {
    const options = this.buildOptionsWithAgent(
      url,
      "GET",
      {
        accept: PAYLOAD_FORMAT.TEXT,
        range: `bytes=0-${MAX_READ_SIZE - 1}`,
      },
      false
    );
    const response = await fetch(url, options);
    if (!response.body) {
      throw new Error("ReadableStream not supported in this browser");
    }

    // Set up for streamed reads and decompression by streamed chunks.
    const reader = response.body.getReader();
    const inflator = new pako.Inflate({ to: "string" });

    // Read the stream by chunks and decompress the chunks until it ends or the number of lines of
    // text reaches `maxLines`.
    let done = false;
    let decompressedText = "";
    let compressedReadCount = 0;
    let lineCount = 0;
    while (!done && compressedReadCount < MAX_READ_SIZE) {
      const { value, done: readerDone } = await reader.read();
      if (value) {
        compressedReadCount += value.length;
        // Unzip the chunk of text into the pako buffer and add it to our text accumulator. In some
        // cases pako can return `undefined`, so ignore those.
        inflator.push(value, readerDone);
        if (inflator.err) {
          done = true;
        } else if (inflator.result) {
          decompressedText += inflator.result;
          if (decompressedText) {
            // If lineCount exceeds maxLines, stop after the `maxLines` line.
            const lines = decompressedText.split("\n");
            lineCount += lines.length;
            if (lineCount >= maxLines) {
              // Trim the accumulated decompressed text to just the first `maxLines` lines
              const linesToKeep = lines.slice(0, maxLines);
              decompressedText = linesToKeep.join("\n");
              done = true;
            }
          }

          // Clear inflator result to reset state and prevent growing memory usage.
          inflator.result = "";
        }
      }
      done = readerDone;
    }

    if (inflator.err) {
      console.error(inflator.err);
      return `ERROR: ${inflator.msg}`;
    }

    // Now `decompressedText` contains up to `maxLines` lines
    const lines = decompressedText.split("\n");
    const linesToKeep = lines.slice(0, maxLines);
    return linesToKeep.join("\n").trim();
  }

  /**
   * Send a POST request with the given object.
   * @param {string} path Path to resource to post to
   * @param {object} payload Object to post
   * @returns {Promise<DataProviderObject|ErrorObject>} Response from POST request
   */
  public async postObject(
    path: string,
    payload: object
  ): Promise<DataProviderObject | ErrorObject> {
    const url = this.pathUrl(path);
    logRequest("postObject", path, this.usingPersistentConnections);
    const options = this.buildOptionsWithAgent(url, "POST", {
      accept: PAYLOAD_FORMAT.JSON,
      contentType: PAYLOAD_FORMAT.JSON,
      payload,
    });
    try {
      const response = await fetch(url, options);
      return response.json();
    } catch (error) {
      console.log(error);
      return NETWORK_ERROR_RESPONSE;
    }
  }

  /**
   * Write the given object with a PUT request.
   * @param {string} path Path to resource to put
   * @param {object} payload Object to put at the given path
   * @returns {Promise<DataProviderObject|ErrorObject>} Response from PUT request
   */
  public async putObject(
    path: string,
    payload: object
  ): Promise<DataProviderObject | ErrorObject> {
    const url = this.pathUrl(path);
    const options = this.buildOptionsWithAgent(url, "PUT", {
      accept: PAYLOAD_FORMAT.JSON,
      contentType: PAYLOAD_FORMAT.JSON,
      payload,
    });
    try {
      logRequest("putObject", path, this.usingPersistentConnections);
      const response = await fetch(url, options);
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
   * @returns {DataProviderObject|ErrorObject} Response from PATCH request
   */
  public async patchObject(
    path: string,
    payload: object
  ): Promise<DataProviderObject | ErrorObject> {
    const url = this.pathUrl(path);
    const options = this.buildOptionsWithAgent(url, "PATCH", {
      accept: PAYLOAD_FORMAT.JSON,
      contentType: PAYLOAD_FORMAT.JSON,
      payload,
    });
    try {
      logRequest("patchObject", path, this.usingPersistentConnections);
      const response = await fetch(url, options);
      return response.json();
    } catch (error) {
      console.log(error);
      return NETWORK_ERROR_RESPONSE;
    }
  }
}
