// node
import type { ParsedUrlQuery } from "querystring";
// node_modules
import { type Redirect } from "next";
// lib
import {
  getQueryStringFromServerQuery,
  splitPathAndQueryString,
} from "./query-utils";
// root
import type { DatabaseObject, DataProviderObject } from "../globals";

/**
 * Type guard to check if a DataProviderObject is a DatabaseObject.
 *
 * @param obj - Database object to check
 * @returns True if the object is a DatabaseObject, false otherwise
 */
function isDatabaseObject(obj: DataProviderObject): obj is DatabaseObject {
  return (
    obj &&
    typeof obj === "object" &&
    "@id" in obj &&
    typeof obj["@id"] === "string"
  );
}

/**
 * Creates a canonical URL redirect if the object's `@id` doesn't match the resolved URL.
 * This handles cases where a URL might be accessed via an alias or non-canonical path,
 * ensuring users are redirected to the proper canonical URL for the object.
 *
 * Preserves query parameters from the original request. Uses a temporary redirect (302) to avoid
 * caching incorrect paths permanently.
 *
 * If a route-handling file has a name like [uuid].tsx, this could cause a query string parameter
 * of `uuid=some-value` to appear in the URL. For those cases, include `uuid` in the `excludedKeys`
 * array to prevent it from appearing in the redirected URL. `id` and `path` are already excluded
 * by default.
 *
 * @param serverObject - Object fetched from the server
 * @param resolvedUrl - URL that was actually requested in the URL bar
 * @param query - Next.js query parameters from getServerSideProps
 * @param excludedKeys - Additional query parameter keys to exclude from the redirect URL
 * @returns Next.js redirect object (temporary) if redirect is needed, null otherwise
 */
export function createCanonicalUrlRedirect(
  serverObject: DataProviderObject,
  resolvedUrl: string,
  query: ParsedUrlQuery,
  excludedKeys: string[] = []
): { redirect: Redirect } | null {
  const { path: resolvedPath } = splitPathAndQueryString(resolvedUrl);
  if (isDatabaseObject(serverObject) && serverObject["@id"] !== resolvedPath) {
    const queryString = getQueryStringFromServerQuery(query, excludedKeys);
    const destination = queryString
      ? `${serverObject["@id"]}?${queryString}`
      : serverObject["@id"];

    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  }

  return null;
}
