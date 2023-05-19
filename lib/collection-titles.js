// libs
import FetchRequest from "./fetch-request";

/**
 * Loads the mapping of schema name, @type, and collection names to human-readable titles.
 * @param {object} session Authentication session object
 * @returns {Promise} Promise that resolves to the /collection-titles/ object
 */
export default async function getCollectionTitles(session) {
  const request = new FetchRequest({ session });
  return request.getObject("/collection-titles/", null);
}
