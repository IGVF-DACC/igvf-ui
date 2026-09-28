// node
import type { ParsedUrlQuery } from "querystring";
// lib
import { encodeUriElement } from "./query-encoding";
// types
import type { NextJsServerQuery, SessionPropertiesObject } from "../globals";

/**
 * Keys that should not be included in the query string. These keys can appear spuriously from
 * internal routing and should not get included in our igvfd queries.
 */
const excludedKeys = ["path", "id"];

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
 *
 * @param searchQuery - Query string keys and values as object
 * @param additionalExcludedKeys - Array of additional keys to exclude from the query string
 * @returns Composed query string
 */
export function getQueryStringFromServerQuery(
  serverQuery: ParsedUrlQuery,
  additionalExcludedKeys: string[] = []
): string {
  const allExcludedKeys = [...excludedKeys, ...additionalExcludedKeys];
  const queryKeys = Object.keys(serverQuery).filter(
    (key) => !allExcludedKeys.includes(key)
  );
  return queryKeys
    .map((queryKey) => {
      const value = serverQuery[queryKey];
      if (Array.isArray(value)) {
        // A query key appears multiple times, so its value is an array of values. Deduplicate the
        // values and flatten for the query string.
        const encodedValues = value.map((val) => encodeUriElement(val));
        const uniqueValues = [...new Set(encodedValues)];
        return uniqueValues.map((val) => `${queryKey}=${val}`).join("&");
      }

      // A query key appears only once, so its value is a string.
      return `${queryKey}=${encodeUriElement(value)}`;
    })
    .join("&");
}

/**
 * From a URL or relative URI, extract the path portion and query string portion without the
 * leading question mark. This replaces the most common usage of the "url" npm package.
 *
 * @param pathMaybeWithQuery - Current URL or relative URI that might include a query string
 * @returns Object with path and query string properties
 * @returns `.path` Path or URL portion without query string
 * @returns `.queryString` Query-string portion of path without leading question mark
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
      firstQuestionMarkIndex + 1
    );
    return { path, queryString };
  }

  // No query string in path so just return the original path.
  return { path: pathMaybeWithQuery, queryString: "" };
}

/**
 * Check if the NextJS server query specifies format=JSON.
 *
 * @param query - NextJS query for a server-side request
 * @returns True if the format is JSON
 */
export function isJsonFormat(query: NextJsServerQuery): boolean {
  return query.format === "json";
}

/**
 * Compose a query string to append to other queries based on the user's session properties. Varies
 * depending on whether the user is logged in and whether they are an admin.
 *
 * @param sessionProperties - /session-properties object; might be empty object or null
 * @returns Composed query string ready to append to other queries; starts with & if non-empty
 */
export function getUserQueryExtras(sessionProperties: SessionPropertiesObject) {
  // Add status=released to the query string for non-logged-in users.
  const releaseQuery = sessionProperties?.["auth.userid"]
    ? ""
    : "status=released";

  // Add status!=deleted to the query string if the authenticated user is an admin.
  const notDeletedQuery = sessionProperties?.admin ? "status!=deleted" : "";

  const composedQuery = [releaseQuery, notDeletedQuery]
    .filter((query) => query)
    .join("&");
  return composedQuery ? `&${composedQuery}` : "";
}

/**
 * Merge additional query parameters into an existing query string. Pass `params` as the object
 * returned from `ParsedUrlQuery` in Next.js, or you can construct a simple object of key-value
 * pairs representing query parameters.
 *
 * @param queryString - Existing query string to merge additional parameters into
 * @param params - Additional query parameters to merge into the existing query string
 * @returns Merged query string including the additional parameters
 */
export function mergeQueryStringParams(
  queryString: string,
  params: ParsedUrlQuery
): string {
  const mergedParams = new URLSearchParams(queryString);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    // Treat positive and negative forms of a parameter as the same key when replacing it. For
    // example, `status!=deleted` should replace an existing `status=released` parameter.
    const normalizedKey = key.endsWith("!") ? key.slice(0, -1) : key;
    Array.from(mergedParams.keys()).forEach((existingKey) => {
      const normalizedExistingKey = existingKey.endsWith("!")
        ? existingKey.slice(0, -1)
        : existingKey;
      if (normalizedExistingKey === normalizedKey) {
        mergedParams.delete(existingKey);
      }
    });

    if (Array.isArray(value)) {
      value.forEach((item) => mergedParams.append(key, item));
    } else {
      mergedParams.append(key, value);
    }
  });

  return mergedParams.toString();
}
