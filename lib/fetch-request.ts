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

// node_modules
import pako from "pako";
// lib
import { API_URL, SERVER_URL, BACKEND_URL, MAX_URL_LENGTH } from "./constants";

// TYPES
// root
import type {
  DatabaseObject,
  DataProviderObject,
  SessionObject,
} from "../globals.d";
// lib
import type {
  ErrorObject,
  FetchMethod,
  FetchRequestInitializer,
} from "./fetch-request.d";
import { ok, err, Result, Ok } from "./result";

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
 * Maximum number of lines to read from a gzipped text file. This must have a value enough for
 * successful decompression.
 */
const MAX_READ_LINES = 400;

/**
 * Default maximum number of lines to return from the text file preview methods. Make sure this has
 * a value less than `MAX_READ_LINES`.
 */
const DEFAULT_MAX_TEXT_LINES = 100;

/**
 * Log a request from the NextJS server to igvfd.
 * @param {string} method FetchRequest method that performs the request
 * @param {string} path Path or paths to requested resource
 * @returns {void}
 */
function logRequest(method: string, path: string): void {
  const date = new Date().toISOString();
  console.log(`SVRREQ [${date}] ${method} ${path}`);
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

  /**
   * Determine whether the response object indicates an error of any kind occurred, whether an
   * error detected by the server, or a network error. Objects without an `@type` property return
   * true (success).
   * @param {DataProviderObject|ErrorObject} response Response object from fetch()
   * @returns {boolean} True if response is a successful response
   */
  static isResponseSuccess(
    response: DataProviderObject | ErrorObject
  ): boolean {
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
      contentType?: string;
      acceptEncoding?: string;
    },
    includeCredentials = true
  ): RequestInit {
    if (additional.accept) {
      this.headers.set("Accept", additional.accept);
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
    const headerOptions = this.buildOptions("GET", {
      accept: PAYLOAD_FORMAT.JSON,
    });
    try {
      logRequest("getObject", this.pathUrl(path));
      const response = await fetch(
        this.pathUrl(path, options.isDbRequest),
        headerOptions
      );
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
    const headerOptions = this.buildOptions("GET", {
      accept: PAYLOAD_FORMAT.JSON,
    });
    try {
      logRequest("getObjectByUrl", url);
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
    logRequest("getMultipleObjects", `[${paths.join(", ")}]`);
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
   * @param {Array<string>} fields Properties of each object to retrieve
   * @returns {Promise<Result<Array<DataProviderObject>, ErrorObject>>} Array of requested objects
   */
  async getMultipleObjectsBulk(
    paths: Array<string>,
    fields: Array<string>
  ): Promise<Result<Array<DataProviderObject>, ErrorObject>> {
    logRequest("getMultipleObjectsBulk", `[${paths.join(", ")}]`);

    if (paths.length === 0) {
      return ok([]);
    }

    // Generate the query string for the needed fields of each object.
    const fieldQuery = fields.map((field) => `field=${field}`).join("&");

    // Break the paths into groups of MAX_PATH_GROUP_SIZE, each group mapping to a data-provider
    // request. This reduces the lengths of the query strings to fit within the data provider's
    // limits.
    const pathGroups = this.pathsIntoPathGroups(paths, fieldQuery.length);

    // For each group of paths, request the objects as search results. Send these requests in
    // parallel.
    const results = await Promise.all(
      pathGroups.map(async (group) => {
        const pathQuery = group.map((path) => `@id=${path}`).join("&");
        const query = `${fieldQuery ? `${fieldQuery}&` : ""}${pathQuery}`;
        const response = await this.getObject(
          `/search/?${query}&limit=${group.length}`
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
    const options = this.buildOptions("GET", {
      accept: PAYLOAD_FORMAT.TEXT,
    });
    try {
      logRequest("getText", path);
      const response = await fetch(this.pathUrl(path), options);
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
  /* istanbul ignore next */
  public async getZippedPreviewText(url, maxLines = DEFAULT_MAX_TEXT_LINES) {
    const options = this.buildOptions(
      "GET",
      {
        accept: PAYLOAD_FORMAT.TEXT,
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
    let lineCount = 0;
    while (!done && lineCount < MAX_READ_LINES) {
      const { value, done: readerDone } = await reader.read();
      console.log(
        "************** READ:%s-%s--%s",
        lineCount,
        value?.length || "NO READ",
        readerDone
      );
      if (value) {
        // Unzip the chunk of text into the pako buffer and add it to our text accumulator. In some
        // cases pako can return `undefined`, so ignore those.
        inflator.push(value, readerDone);
        if (inflator.err) {
          done = true;
        } else if (inflator.result) {
          console.log(
            "************** INFLATOR:%s",
            inflator.result?.length || "NO INFLATOR"
          );
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
    const linesToKeep = lines.slice(0, DEFAULT_MAX_TEXT_LINES);
    return linesToKeep.join("\n");
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
    logRequest("postObject", path);
    const options = this.buildOptions("POST", {
      accept: PAYLOAD_FORMAT.JSON,
      contentType: PAYLOAD_FORMAT.JSON,
      payload,
    });
    try {
      const response = await fetch(this.pathUrl(path), options);
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
    const options = this.buildOptions("PUT", {
      accept: PAYLOAD_FORMAT.JSON,
      contentType: PAYLOAD_FORMAT.JSON,
      payload,
    });
    try {
      logRequest("putObject", path);
      const response = await fetch(this.pathUrl(path), options);
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
    const options = this.buildOptions("PATCH", {
      accept: PAYLOAD_FORMAT.JSON,
      contentType: PAYLOAD_FORMAT.JSON,
      payload,
    });
    try {
      logRequest("patchObject", path);
      const response = await fetch(this.pathUrl(path), options);
      return response.json();
    } catch (error) {
      console.log(error);
      return NETWORK_ERROR_RESPONSE;
    }
  }
}
