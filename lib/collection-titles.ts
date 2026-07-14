// libs
import type { CollectionTitles } from "../globals";
import FetchRequest from "./fetch-request";

/**
 * Loads the mapping of schema name, @type, and collection names to human-readable titles.
 * @returns Promise that resolves to the /collection-titles/ object
 */
export default async function getCollectionTitles(): Promise<CollectionTitles | null> {
  const request = new FetchRequest({ backend: true });
  return (
    await request.getObject<CollectionTitles>("/api/collection-titles/")
  ).optional();
}

/**
 * Get a human-readable collection title by key.
 * @param collectionTitles Mapping of collection identifiers to titles
 * @param key Collection identifier to look up
 * @returns Collection title if the key maps to one
 */
export function getCollectionTitle(
  collectionTitles: CollectionTitles | null | undefined,
  key: string
): string | undefined {
  const title = collectionTitles?.[key];
  return typeof title === "string" ? title : undefined;
}
