// node_modules
import _ from "lodash";
import type { ParsedUrlQuery } from "querystring";
// lib
import FetchRequest, { type ErrorObject } from "./fetch-request";
// root
import type {
  DataProviderObject,
  SearchResults,
  SearchResultsFacet,
  SearchResultsFacetTerm,
  SearchResultsFilter,
} from "../globals";

/**
 * Maximum number of types allowed in the optional facets configuration.
 */
export const MAX_TYPES_IN_CONFIG = 50;

/**
 * Maximum number of facets allowed per type in the optional facets configuration.
 */
const MAX_FACETS_PER_TYPE = 100;

/**
 * Maximum length of a facet field name.
 */
const FACET_FIELD_NAME_MAX_LENGTH = 100;

/**
 * Holds the property names for the optional facets a user has configured to be visible for a given
 * type.
 */
export type OptionalFacetsConfigForType = string[];

/**
 * Holds the optional facets configuration for all types. For each type it holds the property names
 * of the optional facets the user has configured to be visible.
 */
export type OptionalFacetsConfig = Record<string, OptionalFacetsConfigForType>;

/**
 * Facet fields that don't get displayed as a facet.
 */
const HIDDEN_FACET_FIELDS = ["type"];

/**
 * Types that allow optional facets configuration. The button to configure optional facets
 * appears only when searching for a single type included in this list.
 */
const optionalFacetTypes = [
  "AnalysisSet",
  "File",
  "MeasurementSet",
  "PredictionSet",
];

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
 * @param selectedType Type of object being searched
 * @param isAuthenticated True if the user has authenticated
 * @returns Facets that the user can see
 */
export function getVisibleFacets(
  facets: SearchResultsFacet[],
  optionalFacetsConfigForType: OptionalFacetsConfigForType,
  selectedType: string,
  isAuthenticated: boolean
): SearchResultsFacet[] {
  // Only want to consider parent facets, not terms of child facets.
  const normalAndParentFacets = filterOutChildFacets(facets);

  // Filter out facets that never appear, at least at the current access level.
  const extraHiddenFIelds = isAuthenticated
    ? []
    : ["audit.INTERNAL_ACTION.category"];
  const nonHiddenFacets = normalAndParentFacets.filter(
    (facet) =>
      !HIDDEN_FACET_FIELDS.concat(extraHiddenFIelds).includes(facet.field)
  );

  // Finally, filter out any optional facets that are not in the user's visible optional facet
  // configuration.
  return nonHiddenFacets.filter((facet) => {
    if (optionalFacetTypes.includes(selectedType)) {
      return (
        optionalFacetsConfigForType.includes(facet.field) || !facet.optional
      );
    }
    return !facet.optional;
  });
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
 *
 * @param type Type of object for which to generate the facet store key
 * @param uuid UUID of the user for whom to generate the facet store key
 * @returns Facet store key for the user
 */
export function generateFacetStoreKey(type: string, uuid: string): string {
  return `facet-${type}-${uuid}`;
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
 * @returns Result of the set operation
 */
export async function setFacetConfig(
  userUuid: string,
  selectedType: string,
  facetConfig: FacetOpenState,
  request: FetchRequest
): Promise<DataProviderObject | ErrorObject> {
  const apiPath = generateFacetConfigApiPath(userUuid, selectedType);
  return await request.postObject(apiPath, facetConfig);
}

/**
 * Get the facet order for a user and object type from the Next.js server redis cache.
 *
 * @param userUuid - UUID of the current user to get the facet order for
 * @param selectedType - Type of object for which to get the facet order
 * @param request - FetchRequest object to use for the request
 * @returns Promise that resolves to the ordered array of facet fields, or null if not found
 */
export async function getFacetOrder(
  userUuid: string,
  selectedType: string,
  request: FetchRequest
): Promise<string[] | null> {
  const apiPath = `/api/facet-order/${userUuid}/?type=${selectedType}`;
  const response = (await request.getObject(apiPath)).optional();
  return response as unknown as string[] | null;
}

/**
 * Save the facet order for a user and object type in the Next.js server redis cache via the API.
 *
 * @param userUuid - UUID of the current user to save the facet order
 * @param selectedType - Type of object for which to save the facet order
 * @param orderedFacetFields - Ordered array of facet fields to save
 * @param request - FetchRequest object to use for the request
 * @returns Result of the set operation
 */
export async function setFacetOrder(
  userUuid: string,
  selectedType: string,
  orderedFacetFields: string[],
  request: FetchRequest
): Promise<DataProviderObject | ErrorObject> {
  const apiPath = `/api/facet-order/${userUuid}/?type=${selectedType}`;
  return await request.postObject(apiPath, orderedFacetFields);
}

/**
 * Check if a facet appears to be a boolean facet. A boolean facet has one or two terms, either
 * with `key_as_string` of "false" and `key` of 0, or with `key_as_string` of "true" and `key` of
 * 1, or both. The schema `type` property does not get carried over to the facet terms, so we can't
 * just check for the type.
 * @param facet Facet to check if it is a boolean facet
 * @returns True if the facet is a boolean facet, false otherwise
 */
export function checkForBooleanFacet(facet: SearchResultsFacet): boolean {
  const facetTerms = facet.terms as SearchResultsFacetTerm[];
  if (facetTerms.length <= 2) {
    const falseTerms = facetTerms.filter(
      (term) => term.key_as_string === "false" && term.key === 0
    );
    const trueTerms = facetTerms.filter(
      (term) => term.key_as_string === "true" && term.key === 1
    );
    return falseTerms.length === 1 || trueTerms.length === 1;
  }
  return false;
}

/**
 * Fetch all facets for the given query's type with zero results, to get the full list of facets
 * without any filtering.
 *
 * @param query - Query parameters from Next.js request
 * @param request - FetchRequest instance to make the fetch request
 * @returns Promise that resolves to an array of all facets for the given type
 */
export async function getAllFacetsFromQuery(
  query: ParsedUrlQuery,
  request: FetchRequest
): Promise<SearchResultsFacet[]> {
  const type = query.type;
  let typeQuery = "";
  if (Array.isArray(type)) {
    if (type.length === 1) {
      typeQuery = `type=${type[0]}`;
    }
  } else if (type) {
    typeQuery = `type=${type}`;
  }

  const response = (
    await request.getObject(`/search/?${typeQuery}&limit=0`)
  ).optional() as SearchResults;
  return response?.facets || [];
}

/**
 * Check whether the optional facets configuration button should be shown on the search page.
 *
 * @param selectedType - Single `@type` for the search results
 * @returns True if the search page should show the button to configure optional facets
 */
export function checkOptionalFacetsConfigurable(selectedType: string): boolean {
  // Return true if search result filters have exactly one `type=` filter, and that type allows
  // optional facets configuration.
  return optionalFacetTypes.includes(selectedType);
}

/**
 * Get the optional facets configuration for the given type from the Redis cache on the Next.js
 * server.
 *
 * @param selectedType - `@type` for the displayed search result; single-type search only
 * @param request - FetchRequest instance to make the request with
 * @param isAuthenticated - True if the user has authenticated
 * @returns Properties for the optional facets the user configured to be visible for the `@type`
 */
export async function getOptionalFacetsConfigForType(
  selectedType: string,
  request: FetchRequest,
  isAuthenticated: boolean
): Promise<OptionalFacetsConfigForType> {
  let configForType: OptionalFacetsConfigForType = [];

  if (isAuthenticated) {
    // Authenticated users get their config from the Next.js server's Redis cache.
    const response = (
      await request.getObject(`/api/facet-optional/${selectedType}/`)
    ).optional();
    if (isValidOptionalFacetConfigForType(response)) {
      configForType = response;
    }
  } else {
    // Non-authenticated users get their config from localStorage.
    const configString = localStorage.getItem("facet-optional");
    if (configString) {
      try {
        const config = JSON.parse(configString);
        if (isValidOptionalFacetConfig(config)) {
          configForType = config[selectedType] || [];
        }
      } catch {
        configForType = [];
      }
    }
  }

  return configForType;
}

/**
 * Set the optional facets configuration for the given type.
 *
 * @param selectedType - Search `@type` to set the visible optional facets for
 * @param newConfigForType - New optional facets configuration to set for a type
 * @param request - FetchRequest instance to make the request with
 * @param isAuthenticated - True if the user has authenticated
 */
export async function saveOptionalFacetsConfigForType(
  selectedType: string,
  newConfigForType: OptionalFacetsConfigForType,
  request: FetchRequest,
  isAuthenticated: boolean
): Promise<void> {
  if (isAuthenticated) {
    // For authenticated users, save the config in the Next.js server Redis cache.
    await request.postObject(
      `/api/facet-optional/${selectedType}/`,
      newConfigForType
    );
  } else {
    // For non-authenticated users, save the config in localStorage.
    const configString = localStorage.getItem("facet-optional");
    let config: OptionalFacetsConfig = {};
    if (configString) {
      try {
        const parsedConfig = JSON.parse(configString);
        if (isValidOptionalFacetConfig(parsedConfig)) {
          config = parsedConfig;
        }
      } catch {
        config = {};
      }
    }

    // Update the config for the given type.
    config[selectedType] = newConfigForType;

    // Save the updated config back to localStorage.
    try {
      localStorage.setItem("facet-optional", JSON.stringify(config));
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  }
}

/**
 * Type guard to validate that a value matches the OptionalFacetsConfigForType structure.
 *
 * @param config - Value to validate
 * @returns True if the value satisfies the OptionalFacetsConfigForType structure
 */
export function isValidOptionalFacetConfigForType(
  configForType: unknown
): configForType is OptionalFacetsConfigForType {
  if (
    !Array.isArray(configForType) ||
    configForType.length > MAX_FACETS_PER_TYPE
  ) {
    return false;
  }

  // Array elements must all be non-empty strings with reasonable length.
  const allPropsValid = configForType.every(
    (item) =>
      typeof item === "string" &&
      item.length > 0 &&
      item.length < FACET_FIELD_NAME_MAX_LENGTH
  );
  return allPropsValid;
}

/**
 * Type guard to validate that a value matches the OptionalFacetsConfig structure.
 * OptionalFacetsConfig is a Record<string, string[]> where:
 * - Keys are type names (strings)
 * - Values are arrays of facet field names (strings)
 *
 * @param config - Value to validate
 * @returns True if the value satisfies the OptionalFacetsConfig structure
 */
export function isValidOptionalFacetConfig(
  config: unknown
): config is OptionalFacetsConfig {
  // Must be an object and not null nor an array.
  if (typeof config !== "object" || config === null || Array.isArray(config)) {
    return false;
  }

  // Must have a reasonable number of keys (types).
  const keys = Object.keys(config);
  if (keys.length > MAX_TYPES_IN_CONFIG) {
    return false;
  }

  // Check each key-value pair.
  for (const [key, value] of Object.entries(config)) {
    // Keys must be non-empty strings.
    if (typeof key !== "string" || key.length === 0) {
      return false;
    }

    if (!isValidOptionalFacetConfigForType(value)) {
      return false;
    }
  }

  return true;
}
