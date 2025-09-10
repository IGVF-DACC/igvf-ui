/**
 * This API route is used to fetch the dataset summary from the data provider, and caching it in
 * redis on the NextJS server.
 */

// node_modules
import type { NextApiRequest, NextApiResponse } from "next";
// lib
import { getCachedDataFetch } from "../../lib/cache";
import { requestDatasetSummary } from "../../lib/common-requests";
import FetchRequest, { HTTP_STATUS_CODE } from "../../lib/fetch-request";
import { type LabData } from "../../lib/home";
import { getQueryStringFromServerQuery } from "../../lib/query-utils";

/**
 * Server cache key for the home page lab chart.
 */
const LAB_CHART_DATA_KEY = "lab-chart-data";

/**
 * TTL time for home-page redis cache in seconds.
 */
const LAB_CHART_DATA_TTL = 15 * 60; // 15 minutes

/**
 * Generate a cache key for the lab chart data for the given type. The data for the given type gets
 * cached under this key.
 * @param type Type of data being queried, e.g. `MeasurementSet`
 * @returns Cache key for the lab chart data for the given type
 */
function genLabChartDataCacheKey(type: string): string {
  return `${LAB_CHART_DATA_KEY}-${type}`;
}

/**
 * Fetches the the home-page lab chart data on a cache miss, and returns it for caching in the
 * Redis cache.
 *
 * @param cookie - Cookie to use for the request to the data provider
 * @param queryString - Query string to use for the request to the data provider
 * @returns Promise that resolves to the lab chart data for the home page, or null if not found
 */
async function fetchHomePageData(
  cookie: string,
  queryString: string
): Promise<LabData | null> {
  const request = new FetchRequest({ cookie: cookie || undefined });
  const datasetSummary = await requestDatasetSummary(request, queryString);
  return datasetSummary.matrix?.y || null;
}

/**
 * Endpoint for fetching the dataset summary for the home page.
 * @param req Request from NextJS
 * @param res Response object from NextJS
 */
export default async function datasetSummary(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Get the specified object type for the query from the query string and make sure it exists.
  const queryString = getQueryStringFromServerQuery(req.query);
  const queryType = typeof req.query.type === "string" ? req.query.type : "";
  if (!queryType) {
    res
      .status(HTTP_STATUS_CODE.BAD_REQUEST)
      .json({ error: "Missing or invalid query type" });
    return;
  }

  // Get the cookie from the request headers. Use empty string if missing to allow unauthenticated requests.
  const cookie = req.headers.cookie || "";

  // Request the lab chart data from the cache, or fetch it if it's not in the cache.
  const labData = await getCachedDataFetch<LabData>(
    genLabChartDataCacheKey(queryType),
    async () => fetchHomePageData(cookie, queryString),
    LAB_CHART_DATA_TTL
  );

  // Return either the cached or fetched data, or a 404 if something went wrong.
  if (labData) {
    res.status(HTTP_STATUS_CODE.OK).json(labData);
  } else {
    res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ error: "Not Found" });
  }
}
