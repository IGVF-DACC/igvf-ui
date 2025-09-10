/**
 * Code to manage the profiles object. Only call this code from the NextJS server.
 */

// lib
import { getObjectCached } from "./cache";
// root
import type { Profiles } from "../globals.d";

/**
 * Server cache key for the profiles object.
 */
const PROFILES_KEY = "profiles";

/**
 * Server cache key for the collection-titles object.
 */
const COLLECTION_TITLES_KEY = "collection-titles";

/**
 * Retrieve the profiles object either from the server cache or by fetching it from the data
 * provider. Profiles from the data provider get cached. Only call this function from code running
 * on the NextJS server.
 *
 * @param [cookie] - Cookie to use for the request to the data provider
 * @returns Promise that resolves to the profiles object; null if something went wrong
 */
export async function retrieveProfiles(
  cookie?: string
): Promise<Profiles | null> {
  return await getObjectCached<Profiles>(
    cookie || "",
    PROFILES_KEY,
    "/profiles/"
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
  cookie?: string
): Promise<Record<string, string> | null> {
  return await getObjectCached<Record<string, string>>(
    cookie || "",
    COLLECTION_TITLES_KEY,
    "/collection-titles/"
  );
}
