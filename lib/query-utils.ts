// types
import { NextJsServerQuery } from "../globals";

/**
 * Build a query string from the NextJS `serverQuery` object passed in server-side requests.
 * Repeated key=value pairs in `serverQuery` get deduplicated in the generated query string.
 *
 * Examples:
 * serverQuery: { a: "1", b: "2", c: "3" }
 * URL query string: a=1&b=2&c=3
 *
 * serverQuery: { a: "1", b: ["2", "3"], c: "4" }
 * URL query string: a=1&b=2&b=3&c=4
 * @param {NextJsServerQuery} searchQuery Query string keys and values as object
 * @returns {string} Composed query string
 */
export function getQueryStringFromServerQuery(
  serverQuery: NextJsServerQuery
): string {
  return Object.keys(serverQuery)
    .map((queryKey) => {
      const value = serverQuery[queryKey];
      if (Array.isArray(value)) {
        // A query key appears multiple times, so its value is an array of values. Deduplicate the
        // values and flatten for the query string.
        const uniqueValues = [...new Set(value)];
        return uniqueValues.map((val) => `${queryKey}=${val}`).join("&");
      }

      // A query key appears only once, so its value is a string.
      return `${queryKey}=${value}`;
    })
    .join("&");
}

/**
 * From a URL or relative URI, extract the path portion and query string portion without the
 * leading question mark. This replaces the most common usage of the "url" npm package.
 * @param {string} pathMaybeWithQuery Current URL or relative URI that might include a query string
 * @returns {object} Object with path and query string properties
 * @returns {string} `.path` Path or URL portion without query string
 * @returns {string} `.queryString` Query-string portion of path without leading question mark
 */
export function splitPathAndQueryString(pathMaybeWithQuery: string): {
  path: string;
  queryString: string;
} {
  // Done in this weird way in case a malformed URL with multiple question marks gets passed in.
  const firstQuestionMarkIndex = pathMaybeWithQuery.indexOf("?");
  if (firstQuestionMarkIndex !== -1) {
    const path = pathMaybeWithQuery.substring(0, firstQuestionMarkIndex);
    const queryString = pathMaybeWithQuery.substring(
      firstQuestionMarkIndex + 1,
    );
    return { path, queryString };
  }

  // No query string in path so just return the original path.
  return { path: pathMaybeWithQuery, queryString: "" };
}

/**
 * Check if the NextJS server query specifies format=JSON.
 * @param {NextJsServerQuery} query NextJS query for a server-side request
 * @returns {boolean} if the format is JSON
 */
export function isJsonFormat(query: NextJsServerQuery): boolean {
  return query.format === "json";
}
