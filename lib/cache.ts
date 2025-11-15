/**
 * This module provides utilities for caching server data in a Redis database. The primary purpose
 * is to reduce the requests to the data provider. It does not reduce traffic between the NextJS
 * server and the browser.
 *
 * An alternate use for the cache is to temporarily persist data specific to a user between sessions
 * so they see the same data on different browsers or devices. Don't rely on this persistence
 * however. Losing this data shouldn't significantly affect the user experience.
 *
 * Use this code only on the Next.js server. Documentation in lib/docs/cache.md.
 */

// lib
import { getCacheClient } from "./cache-client";
import FetchRequest from "./fetch-request";

/**
 * Default TTL time for cache entries in seconds.
 */
const DEFAULT_CACHE_TTL = 3600; // 1 hour

/**
 * Tracks active request promises to prevent duplicating requests, thereby preventing the
 * thundering-herd problem. When a promise resolves with fetched data, it gets removed from this
 * map.
 */
const activeRequests = new Map<string, Promise<unknown>>();

/**
 * Callback to fetch data when it's not in the cache. The function should return the data, or null
 * if something went wrong. If this function uses the `FetchRequest` class, it should create a new
 * instance of it for each call, and it should unwrap the result appropriately, e.g. by calling
 * `.optional()` on the result of `getObject()`.
 */
export type CacheFetcher<T = unknown> = () => Promise<T | null>;

/**
 * Get data from cache or fetch it using the provided fetcher function. Cache the fetched data.
 *
 * @param key - Key identifying the data in the cache
 * @param fetcher - Function to call to fetch the data if it's not in the cache
 * @param [ttl] - Time to live for the cached data in seconds. Default is one hour
 * @returns Promise that resolves to the cached or fetched data; null if something went wrong
 */
export async function getCachedDataFetch<T = unknown>(
  key: string,
  fetcher: CacheFetcher<T>,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<T | null> {
  // Check for an active request promise for the same key. If found, wait for that request's
  // fetcher function and return its cached result. This deduplicates requests for the same key
  // that arrive while the first request processes but before caching completes.
  if (activeRequests.has(key)) {
    return (await activeRequests.get(key)) as T;
  }

  // Get a reference to the Redis client. If Redis fails to load, just fetch the data directly.
  // Don't bother tracking this request because we can't cache it.
  const redisClient = await getCacheClient();
  if (!redisClient) {
    return await fetcher();
  }

  // Retrieve the data corresponding to the key from Redis if cached.
  const cachedData = await redisClient.get(key);
  if (cachedData) {
    try {
      return JSON.parse(cachedData);
    } catch {
      // Could not parse cached data, maybe because of corruption. Fall through to fetch it again.
    }
  }

  // Calls the provided fetcher function and caches the result. Also tracks the promise in the
  // `activeRequests` map so other requests for the same key can wait for the fetcher function to
  // complete to return its data.
  async function fetchAndCache(): Promise<T | null> {
    try {
      const data = await fetcher();
      if (data !== null && redisClient) {
        await redisClient.set(key, JSON.stringify(data), { EX: ttl });
      }
      return data;
    } catch (error) {
      console.error(`Cache fetch error for key ${key}:`, error);
      return null;
    } finally {
      // We don't need to track this request anymore because it completed, successfully or not.
      activeRequests.delete(key);
    }
  }

  // Core of the fetch-and-cache process. `fetchAndCache()` immediately returns a promise that we
  // track in the `activeRequests` map, preventing other requests for the same key from arriving
  // between the initiation of the request and the adding of its key to `activeRequests`.
  const fetchPromise = fetchAndCache();
  activeRequests.set(key, fetchPromise);

  // Wait for the fetcher function to complete and return its data. This function can return data
  // from `fetcher()` at multiple points in this function. This particular return handles the case
  // where we called `fetcher()` because the data wasn't in the Redis cache.
  return await fetchPromise;
}

/**
 * Convenience function for API endpoint caching. Use this for caching data fetched from the data
 * provider API's `getObject()` method.
 *
 * @param cookie - Cookie to use for the request to the data provider
 * @param key - Key identifying the data in the cache
 * @param path - Path to pass to `FetchRequest.getObject()`
 * @param [ttl] - Time to live for the cached data in seconds. Default is one hour
 * @returns Promise that resolves to the cached or fetched data; null if something went wrong
 */
export async function getObjectCached<T = unknown>(
  cookie: string,
  key: string,
  path: string,
  ttl?: number
): Promise<T | null> {
  return await getCachedDataFetch<T>(
    key,
    async () => {
      const request = new FetchRequest({ cookie: cookie || undefined });
      const data = (await request.getObject(path)).optional();
      return data as T;
    },
    ttl
  );
}

/**
 * Get data directly from cache without a fetcher fallback. Use this to retrieve data that was
 * previously stored with `setCachedData()`. Returns null if the key doesn't exist or Redis is
 * unavailable.
 *
 * @param key - Key identifying the data in the cache
 * @returns Promise that resolves to the cached data, or null if not found or error occurred
 */
export async function getCachedData<T = unknown>(
  key: string
): Promise<T | null> {
  const redisClient = await getCacheClient();
  if (redisClient) {
    try {
      const cachedData = await redisClient.get(key);
      return cachedData ? (JSON.parse(cachedData) as T) : null;
    } catch (error) {
      console.error(`Cache retrieval error for key ${key}:`, error);
      return null;
    }
  }
  return null;
}

/**
 * Set data directly in cache (for non-API data). Use this for caching data that doesn't come from
 * the data-provider API, perhaps a user preference or the result of a complex computation.
 *
 * @param key - Key identifying the data in the cache
 * @param data - Data to cache
 * @param [ttl] - Time to live for the cached data in seconds. Default is one hour
 * @returns Promise that resolves when the data has been cached
 */
export async function setCachedData(
  key: string,
  data: unknown,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<void> {
  const redisClient = await getCacheClient();
  if (redisClient) {
    await redisClient.set(key, JSON.stringify(data), { EX: ttl });
  }
}

/**
 * Get data from a Redis hash field. Use this for retrieving related data stored under a single key
 * where each field can be accessed independently.
 *
 * @param key - Hash key in the cache
 * @param field - Field name within the hash
 * @returns Promise that resolves to the cached data, or null if not found or error occurred
 */
export async function getCachedDataWithField<T = unknown>(
  key: string,
  field: string
): Promise<T | null> {
  const redisClient = await getCacheClient();
  if (redisClient) {
    try {
      const cachedData = await redisClient.hGet(key, field);
      return cachedData ? (JSON.parse(cachedData) as T) : null;
    } catch (error) {
      console.error(
        `Cache hash retrieval error for key ${key}, field ${field}:`,
        error
      );
    }
  }
  return null;
}

/**
 * Set data in a Redis hash field with TTL. Use this for storing related data under a single key
 * where each field can be accessed independently.
 *
 * @param key - Hash key in the cache
 * @param field - Field name within the hash
 * @param data - Data to cache
 * @param [ttl] - Time to live for the entire hash in seconds. Default is one hour
 * @returns Promise that resolves when the data has been cached
 */
export async function setCachedDataWithField(
  key: string,
  field: string,
  data: unknown,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<void> {
  const redisClient = await getCacheClient();
  if (redisClient) {
    try {
      await redisClient.hSet(key, field, JSON.stringify(data));
      await redisClient.expire(key, ttl);
    } catch (error) {
      console.error(
        `Cache hash set error for key ${key}, field ${field}:`,
        error
      );
    }
  }
}
