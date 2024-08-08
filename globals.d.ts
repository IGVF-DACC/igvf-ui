/**
 * Single audit within an audit category.
 */
export interface Audit {
  category: string;
  detail: string;
  level: number;
  level_name: string;
  name: string;
  path: string;
}

/**
 * Template for the `audit` object within a database object.
 */
export interface Audits {
  ERROR?: Array<Audit>;
  INTERNAL_ACTION?: Array<Audit>;
  NOT_COMPLIANT?: Array<Audit>;
  WARNING?: Array<Audit>;
}

/**
 * Type used for any item retrieved from the data provider.
 */
export interface DataProviderObject {
  [key: string]: unknown;
}

/**
 * Actions that we can perform on a database object for logged-in users. The `actions` property of
 * data objects holds an array of these.
 */
export interface ObjectActions {
  name: string;
  title: string;
  profile: string;
  href: string;
}

/**
 * Standard properties for all objects in the database.
 */
export interface DatabaseObject {
  "@context"?: string;
  "@id"?: string;
  "@type": Array<string>;
  actions?: Array<ObjectActions>;
  audit?: Audits;
  creation_timestamp?: string;
  release_timestamp?: string;
  status?: string;
  uuid?: string;
  [key: string]: unknown;
}

/**
 * Return value for `getServerSideProps` functions in NextJS.
 */
export interface ServerSideProps {
  // Normal NextJS props to pass to the UI
  props?: object;
  // To trigger a 404 page
  notFound?: boolean;
}

/**
 * Search result object; similar to `DatabaseObject` but without some properties.
 */
export type SearchResultsObject = SearchResultsObjectProps &
  SearchResultsObjectGenerics;

interface SearchResultsObjectProps {
  "@id": string;
  "@type": string[];
}

interface SearchResultsObjectGenerics {
  [key: string]: unknown;
}

/**
 * The `properties` object of a schema.
 */
export interface SchemaProperty {
  title: string;
  type: string;
  items?: SchemaProperty;
  properties?: SchemaProperties;
  enum?: string[];
  anyOf?: object[];
  oneOf?: object[];
  notSubmittable?: boolean;
  readonly?: boolean;
  permission?: string;
}

export interface SchemaProperties {
  [key: string]: SchemaProperty;
}

/**
 * Describes schema objects.
 */
export interface Schema {
  $id: string;
  $schema: string;
  "@type": string[];
  additionalProperties: boolean;
  changelog?: string;
  dependentSchemas?: {
    [key: string]: {
      [key: string]: unknown;
    };
  };
  description?: string;
  exact_searchable_fields?: string[];
  fuzzy_searchable_fields?: string[];
  identifyingProperties?: string[];
  mixinProperties: object[];
  properties: SchemaProperties;
  required: string[];
  title: string;
  type: string;
}

/**
 * Describes the /profiles endpoint object, which is an object with `@type`s as its keys and
 * the corresponding schemas for each type as the values.
 */

export interface ProfilesProps {
  "@type": string[];
  _hierarchy: {
    Item: {
      [key: string]: object;
    };
  };
  _subtypes: {
    [key: string]: string[];
  };
}

export interface ProfilesGeneric {
  [key: string]: Schema;
}

export type Profiles = ProfilesProps | ProfilesGeneric;

/**
 * Describes the search-results object returned by the data provider.
 */
export interface SearchResults {
  "@context": string;
  "@graph": SearchResultsObject[];
  "@id": string;
  "@type": string[];
  clear_filters: string;
  columns: SearchResultsColumns;
  facet_groups?: SearchResultsFacetGroup[];
  facets?: SearchResultsFacet[];
  filters?: SearchResultsFilter[];
  non_sortable?: string[];
  notification: string;
  sort?: SearchResultsSort;
  title: string;
  total: number;
}

export interface SearchResultsColumns {
  [key: string]: {
    title: string;
  };
}

export interface SearchResultsFacetGroup {
  facet_fields: string[];
  name: string;
  title: string;
}

export interface SearchResultsFacet {
  field: string;
  terms: {
    doc_count: number;
    key: string;
  }[];
  [key: string]: unknown;
}

export interface SearchResultsFilter {
  field: string;
  remove: string;
  term: string;
}

export interface SearchResultsSort {
  [key: string]: {
    order: "asc" | "desc";
    unmapped_type: string;
  };
}

/**
 * Result from PUT or POST requests to the data provider.
 */
export interface DatabaseWriteResponse {
  "@graph": DatabaseObject[];
  "@type": ["result"];
  status: string;
}

/**
 * Session object from the data provider. `auth.userid` exists if the user has logged in.
 */
export interface SessionObject {
  _csrft_: string;
  "auth.userid"?: string;
  edits?: unknown[][];
}

/**
 * NextJS query object that gets passed to `getServerSideProps`.
 */
export interface NextJsServerQuery {
  [key: string]: string | string[] | undefined;
}

/**
 * Response from /collection-titles.
 */
export type CollectionTitles = {
  "@type": string[];
  [key: string]: string;
};
