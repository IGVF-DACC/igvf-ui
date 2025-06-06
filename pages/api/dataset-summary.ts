/**
 * This API route is used to fetch the dataset summary from the data provider, and caching it in
 * redis on the NextJS server.
 */

// node_modules
import type { NextApiRequest, NextApiResponse } from "next";
// lib
import { ServerCache } from "../../lib/cache";
import { requestDatasetSummary } from "../../lib/common-requests";
import FetchRequest from "../../lib/fetch-request";
import { type LabData } from "../../lib/home";
import { getQueryStringFromServerQuery } from "../../lib/query-utils";

/**
 * Server cache key for the home page lab chart.
 */
const LAB_CHART_DATA_KEY = "lab-chart-data";

/**
 * TTL time for home-page redis cache in seconds.
 */
const LAB_CHART_DATA_TTL = 15 * 60;

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
 * Callback to pass to `new ServerCache(..)` to fetch the home-page data when we don't have it in
 * the Redis cache.
 * @param request Result of `new FetchRequest(..)`
 * @returns JSON stringified props for the home page.
 */
async function fetchHomePageData(request, meta): Promise<string> {
  const datasetSummary = await requestDatasetSummary(request, meta.queryString);
  const props = datasetSummary.matrix?.y || {};
  return JSON.stringify(props);
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
  const queryType = req.query.type;
  if (!queryType) {
    res.status(400).json({ error: "Missing query type" });
    return;
  }

  // Request the lab chart data from the cache, or fetch it if it's not in the cache.
  const serverRequest = new FetchRequest({ cookie: req.headers.cookie });
  const cacheRef = new ServerCache(
    genLabChartDataCacheKey(queryType as string),
    LAB_CHART_DATA_TTL
  );
  cacheRef.setFetchConfig(fetchHomePageData, serverRequest, { queryString });
  const labData = await cacheRef.getData<LabData>();

  if (labData) {
    res.status(200).json(labData);
  } else {
    res.status(404).json({ error: "Not Found" });
  }
}
