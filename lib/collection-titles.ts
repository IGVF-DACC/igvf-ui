// libs
import { DataProviderObject } from "../globals";
import FetchRequest from "./fetch-request";

/**
 * Loads the mapping of schema name, @type, and collection names to human-readable titles.
 * @param {string} session Authentication session object
 * @returns {Promise<DataProviderObject | null>} Promise that resolves to the /collection-titles/ object
 */
export default async function getCollectionTitles(
  dataProviderUrl: string
): Promise<DataProviderObject | null> {
  const request = new FetchRequest();
  return (
    await request.getObjectByUrl(`${dataProviderUrl}/collection-titles/`)
  ).optional();
}
