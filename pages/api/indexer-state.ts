// node_modules
import type { NextApiRequest, NextApiResponse } from "next";
// lib
import { ServerCache } from "../../lib/cache";
import FetchRequest from "../../lib/fetch-request";
// types
import type { ErrorObject } from "../../lib/fetch-request.d";

/**
 * Time-to-live for the indexer-state cache in seconds.
 */
const INDEXER_STATE_TTL = 60;

/**
 * Reflects the data returned by the data provider's /indexer-info endpoint.
 */
type IndexerInfo = {
  invalidation_queue: {
    ApproximateNumberOfMessages: number;
    ApproximateNumberOfMessagesDelayed: number;
    ApproximateNumberOfMessagesNotVisible: number;
  };
  is_indexing: boolean;
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
 * ServerCache callback to Fetch the BE indexer state on a cache miss.
 * @param request Result of `new FetchRequest(..)` to the data provider
 * @returns JSON stringified `IndexerState` object
 */
async function fetchIndexerInfoData(request: FetchRequest): Promise<string> {
  let response;

  try {
    response = (await request.getObject("/indexer-info")).union();
    if (response.isError) {
      throw new Error((response as ErrorObject).description);
    }
  } catch (err) {
    console.error("Failed to fetch indexer info:", err);
    return JSON.stringify({ isIndexing: false, indexingCount: 0 });
  }

  const stateFromDataProvider = response as IndexerInfo;
  const state: IndexerState = {
    isIndexing: stateFromDataProvider.is_indexing,
    indexingCount:
      stateFromDataProvider.invalidation_queue.ApproximateNumberOfMessages,
  };
  return JSON.stringify(state);
}

/**
 * This endpoint is used to determine if the indexer is currently indexing and how many
 * transactions are remaining in the invalidation queue. Request the indexer state from the data
 * provider. Convert this to the simplified `IndexerState` format.
 * @param req {NextApiRequest} NextJS API request object.
 * @param res {NextApiResponse} NextJS API response object.
 */
export default async function indexerState(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const cacheRef = new ServerCache("indexer-info", INDEXER_STATE_TTL);
  cacheRef.setFetchConfig(fetchIndexerInfoData, request);
  const indexerInfo = await cacheRef.getData<IndexerState>();
  res.status(200).json(indexerInfo);
}
