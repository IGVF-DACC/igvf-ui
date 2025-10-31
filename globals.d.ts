import { type InstitutionalCertificateObject } from "./lib/data-use-limitation";

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
  supersedes?: string[];
  superseded_by?: string[];
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
 * Object with a required property containing an array of strings, used for schemas with more than
 * one possible set of required properties.
 */
export interface RequiredFieldObject {
  required: string[];
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
  enum_descriptions?: Record<string, string>;
  anyOf?: object[];
  oneOf?: object[];
  notSubmittable?: boolean;
  readonly?: boolean;
  permission?: string;
  default?: unknown;
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
  required?: string[];
  oneOf?: RequiredFieldObject[];
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

export type Profiles = ProfilesProps & ProfilesGeneric;

/**
 * Describes the search-results object returned by the data provider.
 */
export interface SearchResults extends DatabaseObject {
  "@graph": SearchResultsObject[];
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
  doc_count?: number;
  /** Possibly when using non-configured facet term */
  isEqual?: boolean;
  /** Human-readable version of `key` for some cases, like boolean properties */
  key_as_string?: string;
  /** Child facets in a facet hierarchy */
  subfacet?: SearchResultsFacet;
};

export interface SearchResultsFacet {
  /** Object property the facet represents */
  field: string;
  /** Title to display for the facet */
  title: string;
  /** List of terms in the facet */
  terms: SearchResultsFacetTerm[] | unknown;
  /** Facet type as configured in search config */
  type: string;
  /** Total number of objects selected within this facet; only in parent facets */
  total?: number;
  /** True if facet term selected but not in search config */
  appended?: boolean;
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
 * Response from /collection-titles. Contains an @type property and dynamic collection keys
 * that map to their human-readable titles.
 */
export type CollectionTitles = {
  "@type": string[];
} & Record<string, string>;

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
  external_host_url?: string;
  file_format: string;
  file_format_specifications?: string[];
  file_set: string | FileSetObject;
  file_size?: number;
  flowcell_id?: string;
  href?: string;
  illumina_read_type?: string;
  input_file_for?: string[] | FileObject[];
  lane?: number;
  quality_metrics?: string[] | QualityMetricObject[];
  reference_files?: string[] | FileObject[];
  seqspecs?: string[] | FileObject[];
  sequencing_run?: number;
  summary?: string;
  upload_status?: UploadStatus;
  workflows?: string[] | WorkflowObject[];
}

/**
 * Data structure common to all file set object types.
 */
export interface FileSetObject extends DatabaseObject {
  aliases?: string[];
  construct_library_sets?: string[] | FileSetObject[];
  assay_term?: string | OntologyTermObject;
  assay_titles?: string[];
  external_image_urls?: string[];
  file_set_type?: string;
  files: string[] | FileObject[];
  integrated_content_files?: string[] | FileObject[];
  samples?: string[] | SampleObject[];
  summary: string;
}

export type GeneLocation = {
  assembly: string;
  chromosome: string;
  start: number;
  end: number;
};

export interface GeneObject extends DatabaseObject {
  aliases?: string[];
  collections?: string[];
  description?: string;
  dbxrefs?: string[];
  geneid: string;
  geneid_with_version?: string;
  locations?: GeneLocation[];
  name?: string;
  notes?: string;
  study_sets?: string[];
  symbol: string;
  taxa: string;
  title?: string;
  transcriptome_annotation: string;
  version_number: string;
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
 * Award object type.
 */
export interface AwardObject extends DatabaseObject {
  aliases?: string[];
  contact_pi?: string | UserObject;
  description?: string;
  end_date?: string;
  name: string;
  pis?: string[] | UserObject[];
  project: string;
  start_date?: string;
  submitter_comment?: string;
  title: string;
  url?: string;
  viewing_group?: string;
}

export type RelatedDonorObject = {
  donor: HumanDonorObject;
  relationship_type: string;
};

export interface HumanDonorObject extends DatabaseObject {
  aliases?: string[];
  dbxrefs?: string[];
  description?: string;
  documents: string[] | DocumentObject[];
  ethnicities?: string[];
  human_donor_identifiers?: string[];
  notes?: string;
  phenotypic_features?: string[];
  publications?: string[] | PublicationObject[];
  related_donors?: RelatedDonorObject[];
  sex?: string;
  taxa: string;
  url?: string;
  virtual?: boolean;
}

/**
 * Data structure common to all sample object types.
 */
export interface SampleObject extends DatabaseObject {
  aliases?: string[];
  collections?: string[];
  dbxrefs?: string[];
  institutional_certificates?: string[] | InstitutionalCertificateObject[];
  name?: string;
  notes?: string;
  study_sets?: string[];
  submitter_comment?: string;
  summary?: string;
  taxa?: string;
  title?: string;
  transcriptome_annotation?: string;
}

export interface OntologyTermObject extends DatabaseObject {
  aliases?: string[];
  ancestors?: string[];
  assay_slims?: string[];
  category_slims?: string[];
  cell_slims?: string[];
  comments?: string[];
  company?: string;
  definition?: string;
  deprecated_ntr_terms?: string[];
  description?: string;
  is_a?: string[] | OntologyTermObject[];
  name?: string;
  notes?: string;
  objective_slims?: string[];
  ontology?: string;
  organ_slims?: string[];
  preferred_assay_titles?: string[];
  sequencing_kits?: string[];
  summary?: string;
  synonyms?: string[];
  system_slims?: string[];
  term_id: string;
  term_name: string;
}

export interface PageObject extends DatabaseObject {
  aliases?: string[];
  canonical_uri?: string;
  description?: string;
  layout?: {
    block: [
      {
        "@id": string;
        "@type": string;
        body: string;
        direction?: "ltr" | "rtl";
      },
    ];
  };
  name: string;
  notes?: string;
  parent?: string;
  summary?: string;
  title: string;
}

/**
 * Data structure common to all publication object types.
 */
export interface PublicationObject extends DatabaseObject {
  publication_identifiers: string[];
}

/**
 * Data structure common to all software object types.
 */
export interface SoftwareObject extends DatabaseObject {
  categories?: string[];
  description: string;
  name: string;
  publications?: PublicationObject[];
  source_url: string;
  title: string;
}

/**
 * Data structure of the `User` object.
 */
export interface UserObject extends DatabaseObject {
  title: string;
  submits_for: string[];
  viewing_groups: string[];
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

export type MimeType =
  | "application/json"
  | "application/pdf"
  | "image/gif"
  | "image/jpeg"
  | "image/png"
  | "image/svs"
  | "image/tiff"
  | "text/autosql"
  | "text/html"
  | "text/plain"
  | "text/tab-separated-values";

export type Attachment = {
  download: string;
  href: string;
  type: MimeType;
  md5sum?: string;
  size?: number;
  width?: number;
  height?: number;
};

/**
 * Data structure common to all document object types.
 */
export interface DocumentObject extends DatabaseObject {
  attachment: Attachment;
  characterization_method?: string;
  description: string;
  document_type?: string;
  notes?: string;
  standardized_file_format?: boolean;
  urls?: string[];
}

export interface SoftwareObject extends DatabaseObject {
  description: string;
  name: string;
  source_url: string;
  title: string;
}

export interface SoftwareVersionObject extends DatabaseObject {
  aliases: string[];
  software: string | SoftwareObject;
}

export interface AnalysisStepObject extends DatabaseObject {
  aliases?: string[];
  analysis_step_types: string[];
  analysis_step_versions?: string[] | AnalysisStepVersionObject[];
  description?: string;
  input_content_types: string[];
  output_content_types: string[];
  parents?: string[] | AnalysisStepObject[];
  step_label: string;
  submitter_comment?: string;
  title: string;
}

export interface AnalysisStepVersionObject extends DatabaseObject {
  analysis_step: string | AnalysisStepObject;
  software_versions: string[] | SoftwareVersionObject[];
  workflows?: string[] | WorkflowObject[];
}
