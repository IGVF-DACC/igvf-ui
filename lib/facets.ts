// node_modules
import _ from "lodash";
// lib
import FetchRequest from "./fetch-request";
// root
import type {
  SearchResultsFacet,
  SearchResultsFacetTerm,
  SearchResultsFilter,
} from "../globals";

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
 * Type for stats facet terms. Most facet terms are arrays of objects with their key and doc_count,
 * but stats facet terms are a single object with the count of items, minimum and maximum values
 * of all items, the average value of all items, and sum of the values in all items.
 */
export type SearchResultsFacetStats = {
  count: number;
  min: number;
  max: number;
  avg: number;
  sum: number;
};

/**
 * Type guard to see if the facet terms is an array or an object.
 * @param facet Facet to check
 * @returns True if the facet contains a terms array
 */
function isTermsArray(
  terms: SearchResultsFacetTerm[] | unknown
): terms is SearchResultsFacetTerm[] {
  return Array.isArray(terms);
}

/**
 * From a single filter from search results, extract the term for that filter. For example, with
 * the filter for `type=InVitroSystem`, the term is `InVitroSystem`. This function also takes
 * wildcard terms into account. For example, with the filter `type=*`, this function returns is
 * `ANY`. If instead the filter is `type!=*`, this function returns `NOT`.
 * @param filter Search result filter object for a single term
 * @returns Term for the filter, including wildcard terms
 */
export function getFilterTerm(filter: SearchResultsFilter): string {
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
  facets: SearchResultsFacet[],
  isAuthenticated: boolean
): SearchResultsFacet[] {
  const extraHiddenFIelds = isAuthenticated
    ? []
    : ["audit.INTERNAL_ACTION.category"];
  const normalAndParentFacets = filterOutChildFacets(facets);

  return normalAndParentFacets.filter(
    (facet) =>
      !HIDDEN_FACET_FIELDS.concat(extraHiddenFIelds).includes(facet.field)
  );
}

/**
 * Filter out the hidden facet fields from the given array of filters. This is useful for only
 * showing facet tags that the user is allowed to see.
 * @param filters Search result filters
 * @param isAuthenticated True if the user has authenticated
 * @returns Filters that the user can see
 */
export function getVisibleFilters(
  filters: SearchResultsFilter[],
  isAuthenticated: boolean
): SearchResultsFilter[] {
  const extraHiddenFIelds = isAuthenticated
    ? []
    : ["audit.INTERNAL_ACTION.category"];

  return filters.filter(
    (filter) =>
      !HIDDEN_FACET_FIELDS.concat(extraHiddenFIelds).includes(filter.field)
  );
}

/**
 * Check if a facet is the parent of a hierarchical facet.
 * @param facet Facet to check if it's the parent of a hierarchical facet
 * @returns True if the facet is the parent of a hierarchical facet
 */
export function checkHierarchicalFacet(facet: SearchResultsFacet): boolean {
  return isTermsArray(facet.terms) && Boolean(facet.terms[0].subfacet);
}

/**
 * Collect all child facets from all parent facets.
 * @param facets From search results
 * @returns All child facets from all parent facets
 */
export function collectAllChildFacets(
  facets: SearchResultsFacet[]
): SearchResultsFacet[] {
  return facets.reduce((acc, facet) => {
    const isHierarchicalFacet = checkHierarchicalFacet(facet);
    return isHierarchicalFacet ? acc.concat(facet.terms[0].subfacet) : acc;
  }, []);
}

/**
 * When a child facet term is selected, it appears as a top-level facet without a title in the
 * search result facets. This function filters out these child facet terms from the facets so they
 * don't appear at the bottom of the facet list as an independent facet.
 * @param facets Facets from search results, possibly including selected child facet terms
 * @returns Facets without the child facet terms
 */
export function filterOutChildFacets(
  facets: SearchResultsFacet[]
): SearchResultsFacet[] {
  const childFacets = collectAllChildFacets(facets);

  // Find facets that exist despite not being in the type's search config. These are automatically
  // generated from selected properties not included in facet configurations, but also from selected child
  // facets, which we don't want included in facets.
  const nonConfiguredFacets = facets.filter((facet) => facet.appended);

  // Generate a list of all non-configured facets that are also selected child facets.
  const nonConfiguredChildFacets = _.intersectionBy(
    nonConfiguredFacets,
    childFacets,
    "field"
  );

  // Filter out the non-configured child facets from the facets.
  return facets.filter((facet) => {
    return !nonConfiguredChildFacets.some((childFacet) => {
      return childFacet.field === facet.field;
    });
  });
}

/**
 * Get the selected terms, negative-selected terms, and non-selected terms for a facet. For normal
 * facets, the terms are directly in the facet. For hierarchical facets, the terms are in the
 * subfacets, and the parent terms are ignored.
 * @param facet Containing the terms to determine their selection state
 * @param filters Search-result filters to use to determine the current selections
 * @returns Object containing the selected terms, negative-selected terms, and non-selected terms
 */
export function getTermSelections(
  facet: SearchResultsFacet,
  filters: SearchResultsFilter[]
): {
  selectedTerms: string[];
  negativeTerms: string[];
  nonSelectedTerms: string[];
} {
  const isHierarchicalFacet = checkHierarchicalFacet(facet);

  // Get the field and terms for the facet. For hierarchical facets, collect all the terms from the
  // subfacets.
  let field = "";
  let terms: SearchResultsFacetTerm[] = [];
  if (isTermsArray(facet.terms) && isHierarchicalFacet) {
    const facetTerms = facet.terms as SearchResultsFacetTerm[];
    field = facetTerms[0].subfacet?.field;
    terms = facetTerms.reduce((acc, parentTerm) => {
      return acc.concat(parentTerm.subfacet.terms as SearchResultsFacetTerm[]);
    }, [] as SearchResultsFacetTerm[]);
  } else {
    field = facet.field;
    terms = facet.terms as SearchResultsFacetTerm[];
  }

  // Divide the filters into selected and negative-selected terms.
  const groupedFilters = _.groupBy(filters, (filter) => {
    if (filter.field === field) {
      return "selected";
    }
    if (filter.field === `${field}!`) {
      return "negative";
    }
    return "neither";
  });

  // Get the term names for the selected, negative-selected, and non-selected terms; the latter
  // does not appear in the filters, so we have to use the facet terms to determine them.
  const selectedTerms =
    groupedFilters.selected?.map((filter) => filter.term) || [];
  const negativeTerms =
    groupedFilters.negative?.map((filter) => filter.term) || [];
  const nonSelectedTerms = Array.isArray(terms)
    ? terms
        .map((term) => term.key.toString())
        .filter((term) => {
          return !selectedTerms.includes(term) && !negativeTerms.includes(term);
        })
    : [];

  return { selectedTerms, negativeTerms, nonSelectedTerms };
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
  return (await request.getObject(apiPath)).optional() as FacetOpenState;
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
