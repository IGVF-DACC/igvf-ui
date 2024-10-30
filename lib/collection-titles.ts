// libs
import { DataProviderObject } from "../globals";
import FetchRequest from "./fetch-request";

/**
 * Loads the mapping of schema name, @type, and collection names to human-readable titles.
 * @returns Promise that resolves to the /collection-titles/ object
 */
export default async function getCollectionTitles(): Promise<DataProviderObject | null> {
  const request = new FetchRequest({ backend: true });
  return (await request.getObject("/api/collection-titles")).optional();
}
