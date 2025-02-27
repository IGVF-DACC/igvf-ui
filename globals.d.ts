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
  "@id": string;
  "@type": string[];
  accession?: string;
  actions?: ObjectActions[];
  alternate_accessions?: string[];
  award?: string | DatabaseObject;
  audit?: Audits;
  collections?: string[];
  creation_timestamp?: string;
  lab?: string | LabObject;
  release_timestamp?: string;
  status?: string;
  submitted_by?: string | UserObject;
  title?: string;
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
  facets: SearchResultsFacet[];
  filters: SearchResultsFilter[];
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

export type SearchResultsFacetTerm = {
  /** Title of the term */
  key: string | number;
  /** Number of items with this term */
  doc_count: number;
  /** Human-readable version of `key` for some cases, like boolean properties */
  key_as_string?: string;
};

export interface SearchResultsFacet {
  /** Object property the facet represents */
  field: string;
  /** Title to display for the facet */
  title: string;
  /** List of terms in the facet */
  terms: SearchResultsFacetTerm[];
  /** Total number of objects selected within this facet */
  total: number;
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
 * Types within the `matrix` property of matrix search results.
 */
type MatrixBucket = {
  key: string;
  doc_count: number;
} & {
  [key: string]: MatrixBucketWrapper | undefined;
};

type MatrixBucketWrapper = {
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
  buckets: MatrixBucket[];
};

type MatrixAxis = {
  group_by: string | string[];
  doc_count: number;
  label?: string;
} & Record<string, MatrixBucketWrapper>;

type MatrixResultsObject = {
  x: MatrixAxis;
  y: MatrixAxis;
};

export interface MatrixResults extends SearchResults {
  matrix: MatrixResultsObject;
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
 * Session properties object from the data provider while the user has logged in.
 */
export interface SessionPropertiesObject {
  admin?: boolean;
  "auth.userid"?: string;
  user?: UserObject;
  user_actions?: UserActionObject[];
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
export type CollectionTitles = CollectionTitleProps | CollectionTitleGenerics;

interface CollectionTitleProps {
  "@type": string[];
}

interface CollectionTitleGenerics {
  [key: string]: string;
}

/**
 * ************************************************************************************************
 * This section defines types for specific objects in the database, and should follow the schema
 * definitions for those types.
 */

/**
 * Possible values for a file's `upload_status` property.
 */
export type UploadStatus =
  | "pending"
  | "file not found"
  | "invalidated"
  | "validated"
  | "validation exempted";

/**
 * Data structure common to all file object types.
 */
export interface FileObject extends DatabaseObject {
  accession?: string;
  aliases?: string[];
  checkfiles_version?: string;
  content_type: string;
  derived_from?: string[];
  file_format: string;
  file_format_specifications?: string[];
  file_set: string | FileSetObject;
  file_size?: number;
  href?: string;
  input_file_for?: string[] | FileObject[];
  reference_files: string[] | FileObject[];
  summary?: string;
  upload_status?: UploadStatus;
}

/**
 * Data structure common to all file set object types.
 */
export interface FileSetObject extends DatabaseObject {
  aliases?: string[];
  file_set_type?: string;
  files: string[];
  samples?: string[] | SampleObject[];
  summary: string;
}

/**
 * Institutional certificate object type.
 */
export interface InstitutionalCertificateObject extends DatabaseObject {
  certificate_identifier: string;
  controlled_access: boolean;
  data_use_limitation?: string;
  data_use_limitation_modifiers?: string[];
  data_use_limitation_summary: string;
  summary: string;
  urls: string[];
}

/**
 * Lab object type.
 */
export interface LabObject extends DatabaseObject {
  institute_label?: string;
  name?: string;
  title: string;
}

/**
 * Data structure common to all sample object types.
 */
export interface SampleObject extends DatabaseObject {
  aliases?: string[];
}

/**
 * Data structure common to all workflow object types.
 */
export interface WorkflowObject extends DatabaseObject {
  name: string;
  source_url: string;
  uniform_pipeline?: boolean;
}

/**
 * Data structure of the `User` object.
 */
export interface UserObject extends DatabaseObject {
  title: string;
}

/**
 * User actions in the session properties.
 */
export type UserActionObject = {
  id: string;
  title: string;
  href: string;
  notSubmittable: boolean;
};
