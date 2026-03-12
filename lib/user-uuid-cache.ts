/**
 * This module reduces the load on the data provider when the authenticated user's UUID is needed
 * frequently. It uses an in-memory cache to store recently requested user UUIDs based on their
 * request cookies, with a short expiration time to ensure that stale data is not returned.
 */

// node_modules
import { createHash } from "crypto";
// lib
import { requestAuthenticatedUser } from "./common-requests";

/**
 * Number of milliseconds to keep the user UUID in the cache before it expires and needs to be
 * fetched again.
 */
const USER_UUID_CACHE_TTL = 5 * 60 * 1000;

/**
 * Length of the hashed cookie string used as the cache key. This is a fixed length to ensure that the
 * cache keys have a manageable length.
 */
const HASH_LENGTH = 16;

/**
 * In-memory cache for storing authenticated user UUIDs based on their request cookies. The cache maps
 * a hashed version of the user's cookie to their UUID and the expiration time of that cache entry. This
 * allows for quick retrieval of the user's UUID on subsequent requests without needing to make a
 * request to the data provider every time, while also ensuring that stale data is not returned by
 * expiring cache entries after a certain amount of time.
 *
 * @property uuid - Authenticated user's UUID
 * @property expiresAt - Timestamp indicating when the cache entry expires
 */
type UserUuidCacheEntry = {
  uuid: string;
  expiresAt: number;
};

const cache = new Map<string, UserUuidCacheEntry>();
const pending = new Map<string, Promise<string | null>>();

/**
 * Retrieves the authenticated user's UUID from the cache if it exists and is valid, or fetches it
 * from the data provider if not. The function also handles concurrent requests for the same cookie
 * by storing pending promises in a separate map to avoid making multiple requests for the same
 * user UUID simultaneously.
 *
 * @param cookie - Cookie from Next.js network request
 * @returns Authenticated user's user object UUID
 */
export async function getCachedUserUuid(
  cookie: string
): Promise<string | null> {
  if (!cookie) {
    return null;
  }

  // Sweep expired entries on every access to prevent unbounded cache growth.
  clearExpiredCachedUserUuids();

  // Get the user's UUID from the cache if it exists and hasn't expired.
  const cookieHash = hashCookie(cookie);
  const cached = cache.get(cookieHash);
  if (isValidCacheEntry(cached)) {
    return cached.uuid;
  }

  // We have to request the user's UUID from the data provider. If a pending request for the same
  // cookie exists, wait for that request to complete and return its result instead of making a new
  // request.
  const existingPending = pending.get(cookieHash);
  if (existingPending !== undefined) {
    return existingPending;
  }

  // No pending request exists, so make a new request and store it in the pending map until it
  // completes to avoid concurrent requests to the data provider for the same cookie.
  const pendingRequestPromise = fetchAndCache(cookieHash, cookie);
  pending.set(cookieHash, pendingRequestPromise);

  try {
    // Await pending request to avoid returning before the cache is updated, which would cause
    // multiple requests for the same cookie if multiple requests come in at the same time and the
    // cache is empty or expired.
    return await pendingRequestPromise;
  } finally {
    // Request is complete, so remove it from the pending map.
    pending.delete(cookieHash);
  }
}

/**
 * Clears all entries from the user UUID cache. This is useful for testing purposes to ensure a clean
 * slate between tests, and to prevent stale data from affecting test results.
 */
export function clearCachedUserUuids(): void {
  cache.clear();
  pending.clear();
}

/**
 * Clears expired entries from the user UUID cache by iterating through the cache and removing any entries
 * that have an expiration time that has passed based on the current timestamp. This helps to prevent
 * the cache from returning stale data and to free up memory by removing entries that are no longer
 * valid.
 */
export function clearExpiredCachedUserUuids(): void {
  const now = Date.now();

  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= now) {
      cache.delete(key);
    }
  }
}

/**
 * Fetches the user's UUID and stores it in the cache with an expiration time. Call this on a cache
 * miss.
 *
 * @param cookieHash - Hashed cookie cache key
 * @param cookie - Cookie from the Next.js network request
 * @returns Currently authenticated user's UUID; null if the user hasn't authenticated
 */
async function fetchAndCache(
  cookieHash: string,
  cookie: string
): Promise<string | null> {
  const uuid = await fetchUserUuid(cookie);

  if (uuid) {
    cache.set(cookieHash, {
      uuid,
      expiresAt: Date.now() + USER_UUID_CACHE_TTL,
    });
  }

  return uuid;
}

/**
 * Hashes the cookie value to create a cache key without exposing the actual cookie value, and to
 * make a more manageable key by using only a portion of the hash.
 *
 * @param cookie - Cookie from Next.js request
 * @returns Hashed cookie for hiding actual cookie and to use as hash key
 */
function hashCookie(cookie: string): string {
  return createHash("sha256")
    .update(cookie)
    .digest("hex")
    .slice(0, HASH_LENGTH);
}

/**
 * Checks if a cache entry is valid by verifying that it exists and has not expired based on the
 * current timestamp.
 *
 * @param entry - Cache entry to check for validity
 * @returns True if the cache entry is valid (exists and has not expired)
 */
function isValidCacheEntry(
  entry: UserUuidCacheEntry | undefined
): entry is UserUuidCacheEntry {
  return entry !== undefined && entry.expiresAt > Date.now();
}

/**
 * Fetches the authenticated user's UUID by making a request to the authenticated user endpoint with
 * the provided cookie. Returns the user's UUID if the request is successful and the user is
 * authenticated, or null if the user is not authenticated or if there is an error during the
 * request.
 *
 * @param cookie - Cookie from Next.js network request
 * @returns Authenticated user's UUID from their user object
 */
async function fetchUserUuid(cookie: string): Promise<string | null> {
  const userProps = await requestAuthenticatedUser(cookie);
  return userProps?.uuid ?? null;
}
