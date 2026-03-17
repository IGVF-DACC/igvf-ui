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
 * The `type` is the object type for which the facet states are being stored. Example path:
 *
 * /api/facet-order/MeasurementSet/
 *
 * The data is stored in the cache with the user's UUID as part of the storage key. This way, each
 * logged-in user can have their own set of facet states. The user's UUID is determined from the
 * request cookie.
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
import { HTTP_STATUS_CODE, isHttpMethod } from "../../../lib/fetch-request";
import { getCachedUserUuid } from "../../../lib/user-uuid-cache";

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
 * Handler for the /facet-order/[type] endpoint.
 *
 * @param req - Next.js parameter with details about the request
 * @param res - Next.js parameter with details about the response
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Require POST and GET methods only.
  if (!isHttpMethod(req.method, "POST") && !isHttpMethod(req.method, "GET")) {
    res.status(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED).end();
    return;
  }

  // Require a `type` query parameter to specify the object type for which the facet order is being
  // stored or retrieved.
  const type = req.query.type;
  if (typeof type !== "string" || type.length === 0) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      error: "Missing or invalid 'type' parameter (/api/facet-order/[type]).",
    });
    return;
  }

  // Get the user UUID from the cookie and cache it using the in-memory user UUID cache.
  const userUuid = await getCachedUserUuid(req.headers.cookie || "");
  if (!userUuid) {
    res
      .status(HTTP_STATUS_CODE.UNAUTHORIZED)
      .json({ error: "User not authenticated." });
    return;
  }

  // Generate the facet store key. This is incompatible with the previous implementation that used
  // a single key for all types, but this new approach allows us to store facet orders for multiple
  // types without them overwriting each other. We'll just let users lose their previously stored
  // facet orders, and let Redis expire the old keys over time.
  const facetStoreKey = `facet-${type}-${userUuid}`;

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

    // Store the facet order in the Redis cache with the user UUID as part of the key.
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
