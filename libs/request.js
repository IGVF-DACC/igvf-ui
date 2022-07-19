// node_modules
import _ from "lodash";
// libs
import { SERVER_URL } from "./constants";

/**
 * Build a header for fetch, including the cookie if available.
 * @param {string} cookie - Cookie to include in xhttp header, if available
 * @returns {object} Xhttp header object
 */
const buildHeaders = (cookie) => {
  const headers = {
    Accept: "application/json",
  };
  if (cookie) {
    headers.Cookie = cookie;
  }
  return headers;
};

/**
 * Request object for server requests.
 * @param {string} cookie - Cookie to set from NextJS request object; used to authenticate with the server
 */
export default class Request {
  #cookie = "";

  constructor(cookie) {
    if (cookie) {
      this.#cookie = cookie;
    }
  }

  /**
   * Request markdown file string with the given path from the server
   * @param {string} path - Path to requested resource
   * @returns {string} Requested string
   */
  async getMarkdown(path) {
    try {
      const response = await fetch(`${SERVER_URL}${path}`);
      return response.text();
    } catch (error) {
      return `${SERVER_URL}${path}`;
    }
  }

  /**
   * Request the object with the given path from the server without any embedded properties.
   * @param {string} path - Path to requested resource
   * @returns {object} Requested object
   */
  async getObject(path) {
    const headers = buildHeaders(this.#cookie);
    try {
      const response = await fetch(`${SERVER_URL}${path}`, {
        method: "GET",
        credentials: "include",
        headers,
      });
      return response.json();
    } catch (error) {
      return null;
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
      : [];
  }

  /**
   * Given an array of objects containing paths to other objects, request all these objects from
   * the server and embed them in place of the paths, mutating the objects in `items`.
   * @param {array} items - Objects containing non-embedded properties to fetch and embed
   * @param {string} prop - Property of each item to fetch and embed
   */
  async getAndEmbedCollectionObjects(items, embedProp) {
    // Retrieve the specified non-embedded objects from the server.
    const paths = _.uniq(items.map((item) => item[embedProp]));
    const objects = await this.getMultipleObjects(paths);

    // Embed the retrieved objects in the given items.
    const cache = {};
    items.forEach((item) => {
      const objectPath = item[embedProp];
      let cachedObject = cache[objectPath];
      if (!cachedObject) {
        // Cache miss: add requested object to the cache with its path as key.
        cache[objectPath] = objects.find(
          (object) => object["@id"] === objectPath
        );
        cachedObject = cache[objectPath];
      }
      item[embedProp] = cachedObject;
    });
  }

  /**
   * Request the collection (e.g. "users") with the given path from the server.
   * @param {string} collection - Name of the collection to request
   * @returns {object} Collection data including all its members in @graph
   */
  async getCollection(collection) {
    const headers = buildHeaders(this.#cookie);
    const response = await fetch(`${SERVER_URL}/${collection}/`, {
      method: "GET",
      credentials: "include",
      headers,
    });
    return response.json();
  }
}
