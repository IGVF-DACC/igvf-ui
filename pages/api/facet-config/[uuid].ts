/**
 * /facet-config endpoint for storing and retrieving the open/closed state of facets for a user for
 * each object type. Each type has its own set of facets that might overlap other types' facets.
 * But with this model, overlapping facets are treated as separate entities for different selected
 * types. This mechanism only works when the user selects a single type at a time.
 *
 * The endpoint supports GET and POST methods. The GET method retrieves the facet states for the
 * user, and the POST method stores the facet states for the user. The facet states are stored in the
 * redis cache.
 *
 * The endpoint expects a user UUID as part of the path. The UUID is used to identify the user whose
 * facet states are being retrieved or stored. The UUID is required for both GET and POST requests.
 * For POST requests, the facet states are expected in the request body, and a required `type` must
 * exist in the query string. The `type` is the object type for which the facet states are being
 * stored. Example path:
 *
 * /api/facet-config/12345678-1234-1234-1234-123456789012/?type=MeasurementSet
 *
 * The data is stored in the cache with the user's UUID as part of the storage key. This way, each
 * logged-in user can have their own set of facet states.
 *
 * The facet states are stored as an object with the type name as the key and the facet states as the
 * value. The facet states are stored as an object with the facet property as the key and a boolean
 * value indicating whether the facet is open (true) or closed (false). Example:
 *
 * {
 *   "MeasurementSet": {
 *     "auxiliary_sets.file_set_type": true,
 *     "auxiliary_sets.file_set_name": false
 *   },
 *   "InVitroSystem": {
 *     "lab.title": true,
 *     "status": false
 *   }
 * }
 */

// node_modules
import { NextApiRequest, NextApiResponse } from "next";
// lib
import {
  getCachedDataWithField,
  setCachedDataWithField,
} from "../../../lib/cache";
import { generateFacetStoreKey } from "../../../lib/facets";
import { HTTP_STATUS_CODE, isHttpMethod } from "../../../lib/fetch-request";

/**
 * Number of seconds to keep the facet configuration in the cache.
 */
const FACET_CONFIG_EXPIRATION = 60 * 60 * 24 * 7;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the user uuid from the path `/api/facet-config/[uuid]`.
  const uuid = req.query.uuid as string;
  if (!uuid) {
    res
      .status(HTTP_STATUS_CODE.BAD_REQUEST)
      .json({ error: "User UUID required." });
    return;
  }

  // Get the type from the query string.
  const type = req.query.type as string;
  if (!type) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: "Type required." });
    return;
  }
  const facetStoreKey = generateFacetStoreKey("config", uuid);

  if (isHttpMethod(req.method, "POST")) {
    await setCachedDataWithField(
      facetStoreKey,
      type,
      req.body,
      FACET_CONFIG_EXPIRATION
    );
    res.status(HTTP_STATUS_CODE.CREATED).json(req.body);
  } else if (isHttpMethod(req.method, "GET")) {
    const value = await getCachedDataWithField(facetStoreKey, type);
    if (value) {
      res.status(HTTP_STATUS_CODE.OK).json(value);
    } else {
      res.status(HTTP_STATUS_CODE.NOT_FOUND).end();
    }
  } else {
    res.status(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED).end();
  }
}
