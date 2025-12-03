/**
 * API endpoint to fetch the current UI and server version information at /api/versions. The server
 * version comes from a request to the data provider root endpoint. The UI version comes from the
 * UI build and is constant, so the code running in the browser already has access to the UI
 * version as well, but it seemed cleaner to retrieve both versions from the same endpoint.
 */

// node_modules
import type { NextApiRequest, NextApiResponse } from "next";
// lib
import { getCachedDataFetch } from "../../lib/cache";
import { UI_VERSION } from "../../lib/constants";
import FetchRequest, {
  HTTP_STATUS_CODE,
  isHttpMethod,
} from "../../lib/fetch-request";
import { type VersionsInfo } from "../../lib/site-versions";
// root
import type {
  ApiErrorObject,
  ApiObject,
  DataProviderObject,
} from "../../globals";

/**
 * Server cache key for the versions object.
 */
const VERSIONS_KEY = "versions";

/**
 * Time-to-live for the versions cache in seconds.
 */
const VERSIONS_TTL = 30 * 60; // 30 minutes

/**
 * Unknown version string used when a version cannot be determined.
 */
const UNKNOWN_VERSION = "unknown";

/**
 * Type guard to check if a DataProviderObject is an ApiObject.
 *
 * @param obj - Object to check
 * @returns True if the object is an ApiObject
 */
function isApiObject(obj: DataProviderObject): obj is ApiObject {
  return "app_version" in obj && typeof obj.app_version === "string";
}

/**
 * Fetches the version data for the UI and data provider (server). `uiVersion` could return
 * `unknown` if the UI_VERSION environment variable is not set -- a highly unlikely scenario.
 * `serverVersion` will return `unknown` if the data provider root endpoint fails or does not
 * provide an app_version.
 *
 * @param cookie - Cookie to use for the request to the data provider
 * @returns Promise that resolves to the versions info
 */
async function fetchVersionsInfoData(cookie?: string): Promise<VersionsInfo> {
  let uiVersion = UNKNOWN_VERSION;
  let serverVersion = UNKNOWN_VERSION;
  const request = new FetchRequest({ cookie });
  const response = (await request.getObject("/")).optional();

  // Retrieve the server version from the data provider root endpoint.
  if (response && isApiObject(response)) {
    // TypeScript now knows response is ApiObject with app_version property
    serverVersion = response.app_version;
  } else if (response) {
    console.warn("API root response missing expected ApiObject properties");
  } else {
    console.error("API root endpoint request failed");
  }

  // Retrieve the UI version from an environment variable. This should always be set during
  // build time, but handle the case where it isn't just in case.
  if (UI_VERSION) {
    uiVersion = UI_VERSION;
  } else {
    console.warn("UI_VERSION environment variable is not set");
  }

  return {
    uiVersion,
    serverVersion,
  };
}

/**
 * This endpoint is used to determine the current UI and server software release versions. These
 * are cached to reduce requests to the data provider.
 *
 * @param req {NextApiRequest} NextJS API request object.
 * @param res {NextApiResponse} NextJS API response object.
 */
export default async function versions(
  req: NextApiRequest,
  res: NextApiResponse<VersionsInfo | ApiErrorObject>
): Promise<void> {
  let statusCode: number;
  let responseBody: VersionsInfo | ApiErrorObject;

  if (isHttpMethod(req.method, "GET")) {
    // Fetch the versions info from the cache, or fetch from the data provider if it's not in the
    // cache.
    const versionsInfo = await getCachedDataFetch<VersionsInfo>(
      VERSIONS_KEY,
      async () => fetchVersionsInfoData(req.headers.cookie),
      VERSIONS_TTL
    );

    // Return the cached or fetched versions info, or handle error case.
    if (versionsInfo) {
      statusCode = HTTP_STATUS_CODE.OK;
      responseBody = versionsInfo;
    } else {
      statusCode = HTTP_STATUS_CODE.SERVICE_UNAVAILABLE;
      responseBody = { error: "Versions info temporarily unavailable" };
    }
  } else {
    statusCode = HTTP_STATUS_CODE.METHOD_NOT_ALLOWED;
    responseBody = { error: `${req.method} method not allowed` };
  }

  res.status(statusCode).json(responseBody);
}
