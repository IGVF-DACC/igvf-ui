/**
 * /facet-order endpoint for storing and retrieving the order of facets for a user for each object
 * type. Each type has its own set of facets that might overlap other types' facets. But with this
 * model, overlapping facets are treated as separate entities for different selected types. This
 * mechanism only works when the user selects a single type at a time.
 *
 * The endpoint supports GET and POST methods. The GET method retrieves the facet order for the
 * user, and the POST method stores the facet order for the user. The facet order is stored in the
 * redis cache.
 *
 * The endpoint expects a user UUID as part of the path. The UUID is used to identify the user whose
 * facet states are being retrieved or stored. The UUID is required for both GET and POST requests.
 * For POST requests, the facet states are expected in the request body, and a required `type` must
 * exist in the query string. The `type` is the object type for which the facet states are being
 * stored. Example path:
 *
 * /api/facet-order/12345678-1234-1234-1234-123456789012/?type=MeasurementSet
 *
 * The data is stored in the cache with the user's UUID as part of the storage key. This way, each
 * logged-in user can have their own set of facet states.
 *
 * The facet states are stored as an array of facet property names in the order they should appear.
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
 * Number of seconds to keep the facet order in the cache.
 */
const FACET_ORDER_EXPIRATION = 60 * 60 * 24 * 90;

/**
 * Maximum number of facets allowed in the facet order array to prevent DoS attacks.
 */
const FACET_ORDER_MAX_FACETS = 200;

/**
 * Maximum length of a facet field name.
 */
const FACET_FIELD_NAME_MAX_LENGTH = 100;

/**
 * Handler for the /facet-order/[uuid] endpoint.
 *
 * @param req - Next.js parameter with details about the request
 * @param res - Next.js parameter with details about the response
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const uuid = req.query.uuid as string;
  if (!uuid) {
    res
      .status(HTTP_STATUS_CODE.BAD_REQUEST)
      .json({ error: "User UUID required." });
    return;
  }

  // Get the type from the query string; must be exactly one value.
  const rawType = req.query.type;
  if (Array.isArray(rawType) ? rawType.length !== 1 : !rawType) {
    res
      .status(HTTP_STATUS_CODE.BAD_REQUEST)
      .json({ error: "Single type required." });
    return;
  }
  const type = Array.isArray(rawType) ? rawType[0] : (rawType as string);

  // Generate the facet store key for the current user.
  const facetStoreKey = generateFacetStoreKey("order", uuid);

  // Handle a POST request to store the facet order.
  if (isHttpMethod(req.method, "POST")) {
    // Facet order must be an array.
    if (!Array.isArray(req.body)) {
      res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ error: "Facet order must be an array." });
      return;
    }

    // Limit array size to prevent DoS attacks.
    if (req.body.length > FACET_ORDER_MAX_FACETS) {
      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        error: `Too many facets. Maximum allowed is ${FACET_ORDER_MAX_FACETS}.`,
      });
      return;
    }

    // Validate that each element is a non-empty string with reasonable length. Also make sure each
    // one is a string with letters, numbers, underscores, periods, or hyphens.
    const isValid = req.body.every(
      (field) =>
        typeof field === "string" &&
        field.length > 0 &&
        field.length < FACET_FIELD_NAME_MAX_LENGTH &&
        /^[a-zA-Z0-9_.-]+$/.test(field)
    );

    if (!isValid) {
      res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ error: "Invalid facet field names." });
      return;
    }

    await setCachedDataWithField(
      facetStoreKey,
      type,
      req.body,
      FACET_ORDER_EXPIRATION
    );
    res.status(HTTP_STATUS_CODE.CREATED).json(req.body);
  } else if (isHttpMethod(req.method, "GET")) {
    // Handle a GET request to retrieve the facet order.
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
