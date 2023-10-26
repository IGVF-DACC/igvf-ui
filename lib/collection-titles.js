// libs
import FetchRequest from "./fetch-request";

/**
 * Loads the mapping of schema name, @type, and collection names to human-readable titles.
 * @param {object} session Authentication session object
 * @returns {Promise<object>} Promise that resolves to the /collection-titles/ object
 */
export default async function getCollectionTitles(dataProviderUrl) {
  const request = new FetchRequest();
  return (
    await request.getObjectByUrl(`${dataProviderUrl}/collection-titles/`)
  ).optional();
}
