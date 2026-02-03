/**
 * /api/facet-optional endpoint for storing and retrieving the optional facets configuration for a
 * user and object type. This allows users to customize which optional facets are shown or hidden
 * for each object type search results.
 *
 * The endpoint supports GET and POST methods. The GET method retrieves the optional facets
 * configuration for the currently authenticated user and for a specific `@type`, and the POST
 * method stores the optional facets configuration for the user and for a specific `@type`. The
 * configuration is stored in the Redis cache.
 *
 * The endpoint expects an object `@type` at the end of the path to accommodate each object type
 * search results. The data is stored in the cache with the user's UUID as part of the storage key.
 * The endpoint itself requests the current user's session properties to get their UUID, and caches
 * it in memory for a short time to reduce load on the data provider. This should make corrupting
 * someone else's optional facets configuration quite difficult.
 *
 * The facet states are stored as an array of facet property names in the order they should appear.
 *
 * In addition to the Redis cache for saving the optional facets configuration per user, an
 * in-memory cache is used to store user UUIDs derived from session-properties requests. This
 * reduces redundant requests to the data provider for the same user's session properties within
 * a short time window.
 */

// node_modules
import { NextApiRequest, NextApiResponse } from "next";
// lib
import { getCachedData, setCachedData } from "../../../lib/cache";
import {
  isValidOptionalFacetConfig,
  isValidOptionalFacetConfigForType,
  MAX_TYPES_IN_CONFIG,
} from "../../../lib/facets";
import FetchRequest, {
  HTTP_STATUS_CODE,
  isHttpMethod,
} from "../../../lib/fetch-request";
import XXH from "xxhashjs";
// root
import type { SessionPropertiesObject, UserObject } from "../../../globals";

/**
 * Random seed for user UUID cache hashing.
 */
const USER_UUID_CACHE_SEED = 0x3a7b9c4d;

/**
 * Time-to-live for user UUID cache entries in milliseconds.
 */
const USER_UUID_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Time-to-live for facet optional configuration in the Redis cache in seconds.
 */
const FACET_OPTIONAL_CONFIG_TTL = 90 * 24 * 60 * 60; // 90 days

/**
 * Each entry in the user UUID cache.
 *
 * @property userUuid - The user's UUID
 * @property timestamp - Timestamp when the entry was created
 */
interface UserUuidCacheEntry {
  uuid: string;
  timestamp: number;
}

/**
 * In-memory cache that maps cookie hashes to user UUIDs with timestamps to manage expiration. This
 * reduces the load on the data provider for requests for the current user's session properties.
 * Expired entries don't get cleaned up using a periodic process. Each entry instead gets validated
 * for expiration upon access.
 */
const userUuidCache = new Map<string, UserUuidCacheEntry>();

/**
 * Request the current user object from the data provider.
 *
 * @param cookie - Current user browser cookie
 * @returns Current user object from session-properties; null if not authenticated
 */
async function requestSessionProperties(
  cookie: string
): Promise<UserObject | null> {
  const request = new FetchRequest({ cookie });
  const response = (await request.getObject("/session-properties")).optional();
  if (!response) {
    return null;
  }

  // Extract the user object from the session properties.
  const sessionProperties = response as SessionPropertiesObject;
  return sessionProperties.user || null;
}

/**
 * Test whether a user UUID cache entry exists and hasn't yet expired.
 *
 * @param entry - User UUID cache entry; can be unknown in case it doesn't exist
 * @returns True if the User UUID cache entry exists and hasn't yet expired
 */
function isValidUserUuidCacheEntry(
  entry: UserUuidCacheEntry | undefined
): boolean {
  return Boolean(entry) && Date.now() - entry.timestamp <= USER_UUID_CACHE_TTL;
}

/**
 * Handler for the /api/facet-optional endpoint. This manages storing and retrieving an optional
 * facets configuration for the authenticated user using the Redis cache.
 *
 * Supports GET (retrieve config) and POST (store config) methods. Authentication is derived from
 * session cookies -- no UUID is passed in the URL to prevent other users from accessing another
 * user's facet-optional configuration. The current user's UUID is cached in-memory with a TTL to
 * reduce redundant session-properties lookups.
 *
 * GET: Returns the user's optional facets configuration or 404 if not found.
 * POST: Validates and stores the configuration from the request body.

 * @param req - Next.js parameter with details about the request
 * @param res - Next.js parameter with details about the response
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (!isHttpMethod(req.method, "POST") && !isHttpMethod(req.method, "GET")) {
    res.status(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED).end();
    return;
  }

  // The user UUID cache key is a hash of the cookie string to avoid incredibly long cache keys.
  const cookieHash = XXH.h64(
    req.headers.cookie || "",
    USER_UUID_CACHE_SEED
  ).toString(16);

  // Handle a POST request to store the facet optional configuration. Get the type from the
  // request path `type` query parameter.
  const selectedType = req.query.type;
  if (typeof selectedType !== "string" || selectedType.length === 0) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      error:
        "Missing or invalid 'type' parameter (/api/facet-optional/[type]).",
    });
    return;
  }

  // Retrieve the user UUID from the in-memory cache or fetch the user UUID from their session
  // properties if not present or expired.
  let userUuid: string;
  let userUuidEntry = userUuidCache.get(cookieHash);
  if (!isValidUserUuidCacheEntry(userUuidEntry)) {
    // If the cache entry exists but not valid, then it has passed its TTL so delete it.
    if (userUuidEntry) {
      userUuidCache.delete(cookieHash);
    }

    // Get the logged-in user's session to verify they're authenticated.
    const userProps = await requestSessionProperties(req.headers.cookie || "");
    if (!userProps) {
      res
        .status(HTTP_STATUS_CODE.UNAUTHORIZED)
        .json({ error: "Authentication required." });
      return;
    }

    // Extract the user ID from the session properties.
    userUuid = userProps.uuid;
    if (!userUuid) {
      res
        .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: "User's UUID not found in session." });
      return;
    }

    // Update the user UUID cache with the new user UUID and timestamp.
    userUuidEntry = {
      uuid: userUuid,
      timestamp: Date.now(),
    };
    userUuidCache.set(cookieHash, userUuidEntry);
  } else {
    // Use the memory-cached user UUID.
    userUuid = userUuidEntry.uuid;
  }

  // Generate the facet optional configuration Redis store key for the current user.
  const facetStoreKey = `facet-optional-${userUuid}`;

  // Handle the save or retrieve requests based on the HTTP method.
  if (isHttpMethod(req.method, "POST")) {
    // Make sure the new configuration for the type is valid.
    if (!isValidOptionalFacetConfigForType(req.body)) {
      res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ error: "Invalid optional facets configuration." });
      return;
    }

    // Get the existing config for all types to update only the selected type.
    let created = true;
    let optionalFacetConfig = await getCachedData(facetStoreKey);
    if (!isValidOptionalFacetConfig(optionalFacetConfig)) {
      // The saved config is either missing or invalid, so start fresh.
      optionalFacetConfig = {};
    } else {
      created = false;
    }

    // Update the config for the selected type.
    optionalFacetConfig[selectedType] = req.body;

    // Validate we haven't now exceeded the maximum number of types in the config.
    const typeNames = Object.keys(optionalFacetConfig);
    if (typeNames.length > MAX_TYPES_IN_CONFIG) {
      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        error:
          "Exceeded maximum number of types in optional facets configuration.",
      });
      return;
    }

    // Store the updated config back in the Redis cache.
    await setCachedData(
      facetStoreKey,
      optionalFacetConfig,
      FACET_OPTIONAL_CONFIG_TTL
    );
    if (created) {
      res.status(HTTP_STATUS_CODE.CREATED).json(req.body);
    } else {
      res.status(HTTP_STATUS_CODE.OK).json(req.body);
    }
  } else if (isHttpMethod(req.method, "GET")) {
    // Handle a GET request to retrieve the facet optional configuration.
    const value = await getCachedData(facetStoreKey);
    if (isValidOptionalFacetConfig(value)) {
      res.status(HTTP_STATUS_CODE.OK).json(value[selectedType] || []);
    } else {
      // No configuration found or invalid config. Return 404 to indicate this so the UI can write
      // a new configuration.
      res.status(HTTP_STATUS_CODE.NOT_FOUND).end();
    }
  }
}
