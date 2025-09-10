// node_modules
import type { NextApiRequest, NextApiResponse } from "next";
// lib
import { getCachedDataFetch } from "../../lib/cache";
import FetchRequest, {
  HTTP_STATUS_CODE,
  isHttpMethod,
  type ErrorObject,
} from "../../lib/fetch-request";

/**
 * Server cache key for the indexer-state object.
 */
const INDEXER_STATE_KEY = "indexer-state";

/**
 * Time-to-live for the indexer-state cache in seconds. Short because the indexer state can
 * change frequently, but balance against making too many requests to the data provider.
 */
const INDEXER_STATE_TTL = 60; // 1 minute

/**
 * Reflects the data returned by the data provider's /indexer-info endpoint.
 */
type IndexerInfo = {
  deduplication_dead_letter_queue: {
    ApproximateNumberOfMessages: number;
    ApproximateNumberOfMessagesNotVisible: number;
    ApproximateNumberOfMessagesDelayed: number;
  };
  deduplication_queue: {
    ApproximateNumberOfMessages: number;
    ApproximateNumberOfMessagesNotVisible: number;
    ApproximateNumberOfMessagesDelayed: number;
  };
  has_indexing_errors: boolean;
  invalidation_dead_letter_queue: {
    ApproximateNumberOfMessages: number;
    ApproximateNumberOfMessagesNotVisible: number;
    ApproximateNumberOfMessagesDelayed: number;
  };
  invalidation_queue: {
    ApproximateNumberOfMessages: number;
    ApproximateNumberOfMessagesDelayed: number;
    ApproximateNumberOfMessagesNotVisible: number;
  };
  is_indexing: boolean;
  transaction_dead_letter_queue: {
    ApproximateNumberOfMessages: number;
    ApproximateNumberOfMessagesNotVisible: number;
    ApproximateNumberOfMessagesDelayed: number;
  };
  transaction_queue: {
    ApproximateNumberOfMessages: number;
    ApproximateNumberOfMessagesDelayed: number;
    ApproximateNumberOfMessagesNotVisible: number;
  };
};

/**
 * The indexer state returned by this API endpoint.
 */
export type IndexerState = {
  // True if the data provider is currently indexing.
  isIndexing: boolean;
  // The number of transactions remaining in the indexer's invalidation queue.
  indexingCount: number;
};

/**
 * Fetches the indexer-info data from the data provider and converts it to the simplified
 * IndexerState format used to display the indexer's status on the UI. Adding a trailing slash to
 * `/indexer-info` causes a 404.
 *
 * @param cookie - Cookie to use for the request to the data provider
 * @returns Promise that resolves to the indexer state or null if not found
 */
async function fetchIndexerInfoData(
  cookie?: string
): Promise<IndexerState | null> {
  const request = new FetchRequest({ cookie });

  try {
    const response = (await request.getObject("/indexer-info")).union();
    if (response.isError) {
      const error = response as ErrorObject;
      if (error.code === HTTP_STATUS_CODE.NOT_FOUND) {
        console.warn(
          "Indexer info endpoint not found - might be normal during deployment"
        );
      } else if (error.code >= HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR) {
        console.error(
          "Data provider server error for indexer info:",
          error.description
        );
      } else {
        console.error("Client error fetching indexer info:", error.description);
      }
      return null;
    }

    // Build the IndexerState object from the valid IndexerInfo response.
    const indexerInfo = response as IndexerInfo;
    return {
      isIndexing: indexerInfo.is_indexing,
      indexingCount: indexerInfo.invalidation_queue.ApproximateNumberOfMessages,
    };
  } catch (err) {
    console.error("Network or parsing error fetching indexer info:", err);
    return null;
  }
}

/**
 * This endpoint is used to determine if the indexer is currently indexing and how many
 * transactions are remaining in the invalidation queue. Request the indexer state from the data
 * provider. Convert this to the simplified `IndexerState` format.
 *
 * @param req {NextApiRequest} NextJS API request object.
 * @param res {NextApiResponse} NextJS API response object.
 */
export default async function indexerState(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Only allow GET requests for this endpoint.
  if (!isHttpMethod(req.method, "GET")) {
    res.status(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED).json({
      error: "Method not allowed",
    });
    return;
  }

  // Request the indexer state from the cache, or fetch it if it's not in the cache.
  const indexerInfo = await getCachedDataFetch<IndexerState>(
    INDEXER_STATE_KEY,
    async () => fetchIndexerInfoData(req.headers.cookie),
    INDEXER_STATE_TTL
  );

  // Return the cached or fetched indexer state, or a 503 if something went wrong.
  if (indexerInfo) {
    res.status(HTTP_STATUS_CODE.OK).json(indexerInfo);
  } else {
    res
      .status(HTTP_STATUS_CODE.SERVICE_UNAVAILABLE)
      .json({ error: "Indexer state temporarily unavailable" });
  }
}
