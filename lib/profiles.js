// libs
import FetchRequest from "./fetch-request";

/**
 * Loads the schemas for all object types, with each key of the object being the @type for each
 * schema.
 * @param {object} session Authentication session object
 * @returns {Promise} Promise that resolves to the /profiles object
 */
const getProfiles = async (session) => {
  const request = new FetchRequest({ session });
  return request.getObject("/profiles", null);
};

export default getProfiles;