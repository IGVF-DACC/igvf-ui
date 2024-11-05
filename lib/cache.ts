/**
 * This module provides a class for caching server data in a Redis database. The primary purpose is
 * to reduce the requests to the data provider. It does not reduce traffic between the NextJS
 * server and the browser.
 *
 * An alternate use for the cache is to temporarily persist data specific to a user between sessions
 * so they see the same data on different browsers or devices. Don't rely on this persistence
 * however. Losing this data shouldn't significantly affect the user experience.
 *
 * Use this code only on the Next.js server.
 */

// node_modules
import type { RedisClientType } from "redis";
// lib
import { getCacheClient } from "./cache-client";
import FetchRequest from "./fetch-request";

/**
 * Default time to live for cache entries in seconds.
 */
const DEFAULT_CACHE_TTL = 3600;

/**
 * Callback to fetch data when it's not in the cache. The code using the cache provides this
 * callback. The callback must return a string or null, so it should convert any numbers it returns
 * to strings, and any objects or arrays it returns to stringified JSON. It returns null if the data
 * can't be fetched for any reason.
 */
export type CacheFetchCallback = (
  request: FetchRequest,
  meta?: Record<string, any>
) => Promise<string | null>;

/**
 * Options to pass to the `getData` method of `ServerCache`.
 */
type GetDataOptions = {
  /** True to fetch the data instead of getting it from the cache. The fetched data gets cached. */
  forceFetch?: boolean;
};

/**
 * Class to handle caching of server data. It's intended to cache data from the data provider
 * server to reduce load on that server.
 */
export class ServerCache {
  private redisClient: RedisClientType | null;
  private key: string;
  private ttl: number;
  private fetchData: CacheFetchCallback;
  private request: FetchRequest;
  private fetchMeta: Record<string, any> | null;
  private isFetched: boolean;

  /**
   * Creates an instance of ServerCache.
   * @param key - Key to identify the cached data; normally shishkebab case
   * @param [fetchData] - Callback function to fetch the data if it's not in the cache
   * @param [request] - FetchRequest object to pass to the fetch callback
   * @param [ttl] - Number of seconds before this cache item expires
   * @throws {Error} - If any of the required parameters are missing
   */
  constructor(key: string, ttl: number = DEFAULT_CACHE_TTL) {
    this.redisClient = getCacheClient();
    this.key = key;
    this.ttl = ttl;
    this.isFetched = false;
  }

  /**
   * For cache items filled with data from the data provider, set the fetch callback and request
   * object to fetch the data if it's not in the cache.
   * @param fetchData - Callback function to fetch the data if it's not in the cache
   * @param request - FetchRequest object to pass to the fetch callback
   * @param meta - Metadata to pass to the fetch callback
   */
  setFetchConfig(
    fetchData: CacheFetchCallback,
    request: FetchRequest,
    meta: Record<string, any> = null
  ): void {
    this.fetchData = fetchData;
    this.request = request;
    this.fetchMeta = meta;
    this.isFetched = true;
  }

  /**
   * Clear the fetch configuration so the cache item doesn't fetch data from the data provider when
   * the cache doesn't have it.
   */
  clearFetchConfig(): void {
    this.fetchData = null;
    this.request = null;
    this.fetchMeta = null;
    this.isFetched = false;
  }

  /**
   * Retrieve requested data from the cache, or fetch it if it's not in the cache and the fetch
   * configuration has been set. Fetched data gets cached.
   * @param [options] - Options to adjust the behavior of the method
   */
  async getData(options: GetDataOptions = {}): Promise<unknown> {
    if (this.redisClient) {
      const forceFetch = this.isFetched && Boolean(options.forceFetch);
      if (!forceFetch) {
        const cachedData = await this.redisClient.get(this.key);
        if (cachedData) {
          return JSON.parse(cachedData);
        }
      }

      // Requested data not in the cache. Fetch it if the cache is set up to do so.
      if (this.isFetched) {
        const fetchedData = await this.fetchData(this.request, this.fetchMeta);
        if (fetchedData) {
          this.redisClient.set(this.key, fetchedData, { EX: this.ttl });
          return JSON.parse(fetchedData);
        }
      }
    }
    return null;
  }

  /**
   * Cache the provided data. Use this when you have data to cache that doesn't come from the data
   * provider.
   * @param data - Data to cache
   */
  async setData(data: unknown): Promise<void> {
    if (this.redisClient && !this.isFetched) {
      await this.redisClient.set(this.key, JSON.stringify(data), {
        EX: this.ttl,
      });
    }
  }
}

/**
 * Callback for `retrieveCacheBackedData` to fetch the requested data from the data provider.
 * @param request - FetchRequest object to use to fetch the profiles object
 * @returns The profiles object as a JSON string or null if it couldn't be fetched
 */
async function fetchCacheBackedData(
  request: FetchRequest,
  meta: { path: string }
): Promise<string | null> {
  const data = (await request.getObject(meta.path)).optional();
  return data ? JSON.stringify(data) : null;
}

/**
 * Convenience function to retrieve data from the cache or fetch it from the data provider if it's not
 * in the cache. Use this for simple cases where you have a path to a data provider endpoint and
 * simply want to return the data from that endpoint, caching it as it's fetched. Subsequent calls
 * with the same `key` will return the cached data until the `key`'s cache expires.
 * @param cookie - Cookie to use for the request to the data provider
 * @param key - Key to use to identify the cache item
 * @param path - Path to use for the request to the data provider
 * @param [ttl] - Number of seconds before this cache item expires
 * @returns Promise for the data from the data provider, or null if it couldn't be fetched
 */
export async function retrieveCacheBackedData(
  cookie: string,
  key: string,
  path: string,
  ttl?: number
): Promise<unknown> {
  const request = new FetchRequest({ cookie });
  const cacheRef = new ServerCache(key, ttl);
  cacheRef.setFetchConfig(fetchCacheBackedData, request, { path });
  return await cacheRef.getData();
}
