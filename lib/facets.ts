// lib
import FetchRequest from "./fetch-request";

/**
 * Facet fields that don't get displayed as a facet.
 */
const HIDDEN_FACET_FIELDS = ["type"];

/**
 * Defines whether a facet is open (true) or closed (false). The string is the property the facet
 * represents, e.g. `auxiliary_sets.file_set_type`.
 */
export type FacetOpenState = Record<string, boolean>;

/**
 * From a single filter from search results, extract the term for that filter. For example, with
 * the filter for `type=InVitroSystem`, the term is `InVitroSystem`. This function also takes
 * wildcard terms into account. For example, with the filter `type=*`, this function returns is
 * `ANY`. If instead the filter is `type!=*`, this function returns `NOT`.
 * @param filter Search result filter object for a single term
 * @returns Term for the filter, including wildcard terms
 */
export function getFilterTerm(filter: { field: string; term: string }): string {
  const isAnyOrNot = filter.term === "*";

  let term;
  if (isAnyOrNot) {
    const isNot = filter.field.at(-1) === "!";
    term = isNot ? "NOT" : "ANY";
  } else {
    term = filter.term;
  }

  return term;
}

/**
 * Filter out the hidden facet fields from the given array of facets.
 * @param facets Property of search results
 * @param isAuthenticated True if the user has authenticated
 * @returns Facets that the user can see
 */
export function getVisibleFacets(
  facets: { field: string; count: number }[],
  isAuthenticated: boolean
): { field: string; count: number }[] {
  const extraHiddenFIelds = isAuthenticated
    ? []
    : ["audit.INTERNAL_ACTION.category"];
  return facets.filter(
    (facet) =>
      !HIDDEN_FACET_FIELDS.concat(extraHiddenFIelds).includes(facet.field)
  );
}

/**
 * Generate the key to store the facet configuration for a user. This key, along with the object
 * type, is used to identify the facet configuration in the redis cache.
 * @param uuid UUID of the user for whom to generate the facet store key
 * @returns Facet store key for the user
 */
export function generateFacetStoreKey(uuid: string): string {
  return `facet-config-${uuid}`;
}

/**
 * Generate the path to get or set the facet configuration for a user and object type.
 * @param uuid UUID of the user whose facet configuration to get or set
 * @param selectedType Type of object for which to get or set the facet configuration
 * @returns API path to get or set the facet configuration
 */
function generateFacetConfigApiPath(
  uuid: string,
  selectedType: string
): string {
  return `/api/facet-config/${uuid}/?type=${selectedType}`;
}

/**
 * Get the facet configuration for a user and object type. This indicates which facets are open
 * and which are closed for the specified user and object type.
 * @param userUuid UUID of the user for whom to get the facet configuration
 * @param selectedType Type of object for which to get the facet configuration
 * @param request FetchRequest object to use for the request
 * @returns Facet configuration for the user and object type; empty object if not found
 */
export async function getFacetConfig(
  userUuid: string,
  selectedType: string,
  request: FetchRequest
): Promise<FacetOpenState> {
  const apiPath = generateFacetConfigApiPath(userUuid, selectedType);
  return (await request.getObject(apiPath)).unwrap_or({}) as FacetOpenState;
}

/**
 * Set the facet configuration for a user and object type.
 * @param userUuid UUID of the user for whom to set the facet configuration
 * @param selectedType Type of object for which to set the facet configuration
 * @param facetConfig Facet configuration to set
 * @param request FetchRequest object to use for the request
 */
export async function setFacetConfig(
  userUuid: string,
  selectedType: string,
  facetConfig: FacetOpenState,
  request: FetchRequest
): Promise<void> {
  const apiPath = generateFacetConfigApiPath(userUuid, selectedType);
  await request.postObject(apiPath, facetConfig);
}
