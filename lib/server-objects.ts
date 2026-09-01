/**
 * Code to manage the profiles object. Only call this code from the NextJS server.
 */

// lib
import { getObjectCached } from "./cache";
// root
import type { CollectionTitles, Profiles } from "../globals";

/**
 * Server cache key for the profiles object.
 */
const PROFILES_KEY = "profiles";

/**
 * Server cache key for the collection-titles object.
 */
const COLLECTION_TITLES_KEY = "collection-titles";

/**
 * Server cache key for the collection-names object.
 */
const COLLECTION_NAMES_KEY = "collection-names";

/**
 * Time-to-live for the profiles object in the server cache in seconds.
 */
const PROFILE_CACHE_TTL = 60 * 15; // 15 minutes

/**
 * Retrieve the profiles object either from the server cache or by fetching it from the data
 * provider. Profiles from the data provider get cached. Only call this function from code running
 * on the NextJS server.
 *
 * @param [cookie] - Cookie to use for the request to the data provider
 * @returns Promise that resolves to the profiles object; null if something went wrong
 */
export async function retrieveProfiles(cookie = ""): Promise<Profiles | null> {
  return await getObjectCached<Profiles>(
    cookie,
    PROFILES_KEY,
    "/profiles/",
    PROFILE_CACHE_TTL
  );
}

/**
 * Retrieve the /collection-titles object either from the server cache or by fetching it from the
 * data provider. Collection titles from the data provider get cached. Only call this function from code
 * running on the NextJS server.
 *
 * @param [cookie] - Cookie to use for the request to the data provider
 * @returns Promise that resolves to the collection-titles object; null if something went wrong
 */
export async function retrieveCollectionTitles(
  cookie = ""
): Promise<CollectionTitles | null> {
  return await getObjectCached<CollectionTitles>(
    cookie,
    COLLECTION_TITLES_KEY,
    "/collection-titles/"
  );
}

/**
 * Retrieve the /collection-names object either from the server cache or by fetching it from the
 * data provider. Collection names from the data provider get cached. Only call this function from code
 * running on the NextJS server.
 *
 * @param [cookie] - Cookie to use for the request to the data provider
 * @returns Promise that resolves to the collection-names object; null if something went wrong
 */
export async function retrieveCollectionNames(
  cookie = ""
): Promise<Record<string, string> | null> {
  return await getObjectCached<Record<string, string>>(
    cookie,
    COLLECTION_NAMES_KEY,
    "/collection-names/"
  );
}
