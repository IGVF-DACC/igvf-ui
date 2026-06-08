// lib
import {
  requestDonors,
  requestFileSets,
  requestPublications,
  requestSamples,
} from "./common-requests";
import {
  isDatabaseObjectArray,
  pathsFromDatabaseObjects,
} from "./database-object";
import FetchRequest from "./fetch-request";
import { type AssayTermObject } from "./ontology-terms";
import { type SampleObject } from "./samples";
import { type LinkTo, type LinkToArray } from "./types";
import { type WorkflowObject } from "./workflow";
// root
import type {
  DatabaseObject,
  DocumentObject,
  DonorObject,
  FileObject,
  GeneObject,
  LabObject,
  OntologyTermObject,
  OpenReadingFrameObject,
  PublicationObject,
  SourceObject,
} from "../globals";

/**
 * Represents the different types of file sets available in the system as strings.
 */
export type FileSetObjectType =
  | "AnalysisSet"
  | "AuxiliarySet"
  | "ConstructLibrarySet"
  | "CuratedSet"
  | "MeasurementSet"
  | "ModelSet"
  | "PredictionSet"
  | "PseudobulkSet";

/**
 * Maps file-set types to their corresponding object interfaces. Each file-set type corresponds to
 * a specific interface that extends `FileSetObject`, containing additional properties specific to
 * that type. Add to this map for any new file-set types and their corresponding interfaces.
 */
export type FileSetTypeMap = {
  AnalysisSet: AnalysisSetObject;
  AuxiliarySet: AuxiliarySetObject;
  ConstructLibrarySet: ConstructLibrarySetObject;
  CuratedSet: CuratedSetObject;
  MeasurementSet: MeasurementSetObject;
  ModelSet: ModelSetObject;
  PredictionSet: PredictionSetObject;
  PseudobulkSet: PseudobulkSetObject;
};

/**
 * Represents the structure of the `related_measurement_sets` property on `MeasurementSetObject`.
 *
 * @param measurement_sets - Measurement sets related to this measurement set
 * @param series_type - Type of series for the related measurement sets
 */
type RelatedMeasurementSet = {
  measurement_sets: MeasurementSetObject[];
  series_type: SeriesType;
};

/**
 * Represents the possible values of `related_measurement_sets.series_type`. Expand this as the
 * enum defined in the schema expands.
 */
type SeriesType = "multiome";

/**
 * Represents any concrete file-set object in the system. This is a union of all specific file-set
 * object interfaces defined in `FileSetTypeMap`. Use `FileSetObject` when you don't use a specific
 * property of a file set, or when you use properties common to all file-set objects. Use
 * `ConcreteFileSetObject` when you need to work with any specific file-set type that you need to
 * narrow to a specific file-set type.
 */
export type ConcreteFileSetObject = FileSetTypeMap[keyof FileSetTypeMap];

/**
 * Abstract interface representing the common properties of all file-set objects in the system. Use
 * this when you don't need a specific property of a file set, or when you only need these
 * properties common to all file-set objects. Use `ConcreteFileSetObject` when you need to work
 * with any specific file-set type that you need to narrow to a specific file-set type.
 */

export interface FileSetObject extends DatabaseObject {
  aliases?: string[];
  construct_library_sets?: LinkToArray<ConstructLibrarySetObject>;
  control_for?: LinkToArray<FileSetObject>;
  controlled_access?: boolean;
  data_use_limitation_summaries?: string[];
  donors?: LinkToArray<DonorObject>;
  file_set_type: string;
  files?: LinkToArray<FileObject>;
  input_for?: LinkToArray<FileSetObject>;
  integrated_content_files?: LinkToArray<FileObject>;
  is_on_anvil?: boolean;
  publications?: LinkToArray<PublicationObject>;
  revoke_detail?: string;
  samples?: LinkToArray<SampleObject>;
  sources?: LinkToArray<LabObject | SourceObject>;
  submitted_files_timestamp?: string;
  summary: string;
}

export interface AnalysisSetObject extends FileSetObject {
  assay_titles?: string[];
  dbxrefs?: string[];
  doi?: string;
  external_image_data_url?: string;
  file_sets?: LinkToArray<FileSetObject>;
  input_file_sets?: LinkToArray<FileSetObject>;
  pipeline_parameters?: LinkToArray<FileObject | DocumentObject>;
  preferred_assay_titles?: string[];
  sample_summary?: string;
  uniform_pipeline_status?: string;
  workflows?: LinkToArray<WorkflowObject>;
}

export interface AuxiliarySetObject extends FileSetObject {
  assay_titles?: string[];
  dbxrefs?: string[];
  doi?: string;
  measurement_sets?: LinkToArray<MeasurementSetObject>;
  preferred_assay_titles?: string[];
}

export interface ConstructLibrarySetObject extends FileSetObject {
  assay_titles?: string[];
  associated_phenotypes?: LinkToArray<OntologyTermObject>;
  average_guide_coverage?: number;
  average_insert_size?: number;
  control_file_sets?: LinkToArray<FileSetObject>;
  control_types?: string[];
  doi?: string;
  exon?: string;
  file_sets?: LinkToArray<FileSetObject>;
  integrated_content_files?: LinkToArray<FileObject>;
  large_scale_gene_list?: LinkTo<FileObject>;
  large_scale_loci_list?: LinkTo<FileObject>;
  lower_bound_guide_coverage?: number;
  lower_bound_insert_size?: number;
  orf_list?: LinkToArray<OpenReadingFrameObject>;
  preferred_assay_titles?: string[];
  scope: string;
  selection_criteria: string[];
  small_scale_gene_list?: LinkToArray<GeneObject>;
  small_scale_loci_list?: {
    assembly: string;
    chromosome: string;
    end: number;
    name?: string;
    start: number;
  };
  targeton?: string;
  tile?: {
    tile_end: number;
    tile_id: string;
    tile_start: number;
  };
  tiling_modality?: string;
  upper_bound_guide_coverage?: number;
  upper_bound_insert_size?: number;
}

export interface CuratedSetObject extends FileSetObject {
  assay_term?: LinkTo<AssayTermObject>;
  assay_titles?: string[];
  assemblies?: string[];
  dbxrefs?: string[];
  preferred_assay_titles?: string[];
}

export interface MeasurementSetObject extends FileSetObject {
  assay_term: LinkTo<AssayTermObject>;
  assay_titles?: string[];
  auxiliary_sets?: LinkToArray<AuxiliarySetObject>;
  control_file_sets?: LinkToArray<FileSetObject>;
  control_types?: string[];
  dbxrefs?: string[];
  doi?: string;
  external_image_urls?: string[];
  file_sets?: LinkToArray<FileSetObject>;
  multiome_size?: number;
  preferred_assay_titles?: string[];
  related_measurement_sets?: RelatedMeasurementSet[];
}

export interface ModelSetObject extends FileSetObject {
  assay_titles?: string[];
  dbxrefs?: string[];
  doi?: string;
  file_sets?: LinkToArray<FileSetObject>;
  input_file_sets?: LinkToArray<FileSetObject>;
  preferred_assay_titles?: string[];
}

export interface PredictionSetObject extends FileSetObject {
  associated_phenotypes?: LinkToArray<OntologyTermObject>;
  dbxrefs?: string[];
  doi?: string;
  file_sets?: LinkToArray<FileSetObject>;
  input_file_sets?: LinkToArray<FileSetObject>;
  large_scale_gene_list?: LinkTo<FileObject>;
  large_scale_loci_list?: LinkTo<FileObject>;
  scope?: string;
}

export interface PseudobulkSetObject extends FileSetObject {
  assay_titles?: string[];
  cell_qualifier?: string;
  cell_type?: LinkTo<OntologyTermObject>;
  dbxrefs?: string[];
  doi?: string;
  input_file_sets?: LinkToArray<FileSetObject>;
  preferred_assay_titles?: string[];
  file_sets?: LinkToArray<FileSetObject>;
  workflows?: LinkToArray<WorkflowObject>;
}

/**
 * Given an array of file sets, retrieve all associated file sets from a specified property of those
 * file sets.
 *
 * @param fileSets - Array of file set objects from which to retrieve associated file sets
 * @param fileSetProperty - File-set property name that contains the associated file sets
 * @param request - FetchRequest instance to use for retrieving database objects
 * @param addedProperties - Additional properties to include in the request
 * @returns Array of associated file set objects
 */
export async function requestAssociatedFileSets<T extends FileSetObject>(
  fileSets: T[],
  fileSetProperty: keyof T,
  request: FetchRequest,
  addedProperties: string[] = []
): Promise<FileSetObject[]> {
  if (!isDatabaseObjectArray(fileSets)) {
    return [];
  }

  const uniquePaths = [
    ...new Set(
      fileSets.flatMap((fileSet) =>
        pathsFromDatabaseObjects(fileSet[fileSetProperty])
      )
    ),
  ];

  return uniquePaths.length > 0
    ? await requestFileSets(uniquePaths, request, addedProperties)
    : [];
}

/**
 * Given a file set, request donor objects from the file set's `donors` property, which can contain
 * either paths to donor objects or partial embedded donor objects. If they're embedded, use this
 * function if you need to retrieve the full donor objects.
 *
 * @param fileSet - File set from which to retrieve linked donor objects
 * @param request - FetchRequest instance to use for retrieving donor objects
 * @returns Array of donor objects referenced by the file set's `donors` property
 */
export async function requestFileSetDonors(
  fileSet: FileSetObject,
  request: FetchRequest
): Promise<DonorObject[]> {
  const donorPaths = pathsFromDatabaseObjects(fileSet.donors);
  return donorPaths.length > 0 ? await requestDonors(donorPaths, request) : [];
}

/**
 * Given a file set, request publication objects from the file set's `publications` property. The
 * `publications` property can contain either paths to publication objects or partial embedded
 * publication objects. If they're embedded, use this function if you need to retrieve the full
 * publication objects.
 *
 * @param fileSet - File set from which to retrieve publications
 * @param request - FetchRequest instance to use for retrieving publication objects
 * @returns Array of publication objects from the file set's `publications` property
 */
export async function requestFileSetPublications(
  fileSet: FileSetObject,
  request: FetchRequest
): Promise<PublicationObject[]> {
  const publicationPaths = pathsFromDatabaseObjects(fileSet.publications);
  return publicationPaths.length > 0
    ? await requestPublications(publicationPaths, request)
    : [];
}

/**
 * Retrieve all sample objects from every file set's `samples` properties. The `fileSets` array
 * must contain fully or partially embedded file-set objects. The `samples` property of each file
 * set should contain partially embedded sample objects or paths to sample objects. For that case,
 * use this function to retrieve the full sample objects.
 *
 * @param fileSets - File sets from which to retrieve sample objects
 * @param request - FetchRequest instance to use for retrieving sample objects
 * @returns Sample objects referenced by all given file sets
 */
export async function requestFileSetSamples(
  fileSets: FileSetObject[],
  request: FetchRequest
): Promise<SampleObject[]> {
  if (!isDatabaseObjectArray(fileSets)) {
    return [];
  }

  const uniquePaths = [
    ...new Set(
      fileSets.flatMap((fileSet) => pathsFromDatabaseObjects(fileSet.samples))
    ),
  ];

  return uniquePaths.length > 0
    ? await requestSamples(uniquePaths, request)
    : [];
}

/**
 * Type guard to check if a file-set object is of a specific file-set type, extended from
 * `FileSetObject`.
 *
 * @param fileSet - Object to check if it's of the given file-set type
 * @param type - Specific file-set type to check for
 * @returns `true` if the object is of the specified file-set type
 */
export function isFileSetObjectType<T extends FileSetObjectType>(
  fileSet: FileSetObject | null | undefined,
  type: T
): fileSet is FileSetTypeMap[T] {
  return fileSet ? fileSet["@type"].includes(type) : false;
}
