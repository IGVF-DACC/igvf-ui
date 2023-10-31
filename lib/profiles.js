// libs
import FetchRequest from "./fetch-request";

/**
 * Loads the schemas for all object types, with each key of the object being the @type for each
 * schema.
 * @param {object} session Authentication session object
 * @returns {Promise<DataProviderObject | ErrorObject>} Promise that resolves to the /profiles object
 */
export default async function getProfiles(dataProviderUrl) {
  const request = new FetchRequest();
  return (
    await request.getObjectByUrl(`${dataProviderUrl}/profiles`)
  ).optional();
}
