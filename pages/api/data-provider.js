import { HTTP_STATUS_CODE } from "../../lib/fetch-request";
import { API_URL } from "../../lib/constants";

/**
 * Return the URL of the data provider instance that this UI instance connects to. Normally the
 * rest of the code can access this from environment variables, but in some cases (e.g. 404 pages)
 * NextJS hides environment variables except from API functions like this one. This simply returns
 * the value of the API_URL environment variable in the `dataProviderUrl` property of the response.
 * `req` and `res` are the NextJS request and response objects.
 * @returns {object} An object with the `dataProviderUrl` property set to data-provider URL.
 */
export default function dataProvider(req, res) {
  const props = {
    dataProviderUrl: API_URL,
  };
  return res.status(HTTP_STATUS_CODE.OK).json(props);
}
