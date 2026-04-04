// lib
import { type InstitutionalCertificateObject } from "./data-use-limitation";
import { trimDeprecatedFiles } from "./deprecated-files";
import FetchRequest from "./fetch-request";
import { type DatasetSummary } from "./home";
import { type BiosampleObject, type SampleObject } from "./samples";
// root
import type {
  AnalysisStepVersionObject,
  BiomarkerObject,
  DatabaseObject,
  DataProviderObject,
  DocumentObject,
  DonorObject,
  FileObject,
  FileSetObject,
  LabObject,
  OntologyTermObject,
  PublicationObject,
  SessionPropertiesObject,
  TreatmentObject,
  UserObject,
} from "../globals";

/**
 * Retrieve the analysis step objects for the given analysis step paths from the data provider.
 * @param {Array<string>} paths Paths to the analysis step objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The analysis step objects requested
 */
export async function requestAnalysisSteps(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(
      paths,
      [
        "aliases",
        "input_content_types",
        "name",
        "output_content_types",
        "status",
        "step_label",
        "title",
      ],
      ["AnalysisStep"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the analysis step version objects for the given analysis step version paths from the
 * data provider.
 *
 * @param paths - Paths to the analysis step version objects to request
 * @param request - Request object to use to make the request
 * @returns - Analysis step version objects requested
 */
export async function requestAnalysisStepVersions(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<AnalysisStepVersionObject>> {
  return (
    await request.getMultipleObjectsBulk(
      paths,
      [
        "analysis_step.analysis_step_types",
        "analysis_step.input_content_types",
        "analysis_step.output_content_types",
        "analysis_step.title",
        "software_versions",
      ],
      ["AnalysisStepVersion"]
    )
  ).unwrap_or([]) as AnalysisStepVersionObject[];
}

/**
 * Retrieve the award objects for the given award paths from the data provider.
 * @param {Array<string>} paths Paths to the award objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The award objects requested
 */
export async function requestAwards(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(paths, ["name", "url"], ["Award"])
  ).unwrap_or([]);
}

/**
 * Retrieve the biomarker objects for the given biosample paths from the data provider.
 *
 * @param paths - Paths to the biomarker objects to request
 * @param request - The request object to use to make the request
 * @returns The biomarker objects requested
 */
export async function requestBiomarkers(
  paths: Array<string>,
  request: FetchRequest
): Promise<BiomarkerObject[]> {
  return (
    await request.getMultipleObjectsBulk<BiomarkerObject>(
      paths,
      [
        "aliases",
        "classification",
        "name",
        "quantification",
        "status",
        "synonyms",
      ],
      ["Biomarker"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the biosample objects for the given biosample paths from the data provider.
 * @param {Array<string>} paths Paths to the biosample objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The biosample objects requested
 */
export async function requestBiosamples(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<BiosampleObject>> {
  return (
    await request.getMultipleObjectsBulk<BiosampleObject>(
      paths,
      ["accession", "disease_terms", "sample_terms", "status", "summary"],
      ["Biosample"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the file objects for the given file paths from the data provider.
 * @param paths - Paths to the file objects to request
 * @param request - Request object to use to make the request
 * @param type - Type of file to request, defaults to "File"
 * @returns File objects requested
 */
export async function requestFiles(
  paths: string[],
  request: FetchRequest,
  types = ["File"]
): Promise<DataProviderObject[]> {
  return (
    await request.getMultipleObjectsBulk(
      paths,
      [
        "@type",
        "accession",
        "aliases",
        "content_summary",
        "content_type",
        "controlled_access",
        "creation_timestamp",
        "derived_from",
        "derived_manually",
        "external_host_url",
        "externally_hosted",
        "file_format",
        "file_size",
        "file_set",
        "filtered",
        "flowcell_id",
        "href",
        "illumina_read_type",
        "imaging_platform",
        "index",
        "input_file_for",
        "lab.@id",
        "lab.title",
        "lane",
        "quality_metrics",
        "read_names",
        "reference_files",
        "seqspecs",
        "seqspec_document",
        "sequencing_platform",
        "sequencing_run",
        "submitted_file_name",
        "status",
        "summary",
        "tile",
        "workflows",
        "upload_status",
      ],
      types
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the lab objects for the given lab paths from the data provider.
 * @param paths - Paths to the lab objects to request
 * @param request - The request object to use to make the request
 * @returns The lab objects requested
 */
export async function requestLabs(
  paths: string[],
  request: FetchRequest
): Promise<LabObject[]> {
  return (
    await request.getMultipleObjectsBulk(paths, ["title"], ["Lab"])
  ).unwrap_or([]) as LabObject[];
}

/**
 * Files can contain seqspec paths or partial embedded objects. This function retrieves the seqspec
 * files referenced by the given files for both cases.
 * @param files Files potentially containing seqspec paths or objects to request
 * @param request The request object to use to make the request
 * @returns The seqspec files requested; [] if no seqspec files found
 */
export async function requestSeqspecFiles(
  files: DatabaseObject[],
  request: FetchRequest
): Promise<DataProviderObject[]> {
  let seqspecFiles: DataProviderObject[] = [];
  if (files.length > 0) {
    const seqspecPaths: string[] = files.reduce((acc: string[], file) => {
      const fileSeqspecs = file.seqspecs as string[] | undefined;
      if (fileSeqspecs && fileSeqspecs.length > 0) {
        // File schemas define seqspecs as either an array of @ids or partial embedded
        // configuration-file objects. If the latter, extract the @id paths from each object.
        const paths: string[] =
          typeof fileSeqspecs[0] === "string"
            ? fileSeqspecs
            : (fileSeqspecs as unknown as DatabaseObject[]).map(
                (seqspec) => seqspec["@id"]
              );
        return [...acc, ...paths];
      }
      return acc;
    }, []);
    const uniqueSeqspecPaths = [...new Set(seqspecPaths)];
    seqspecFiles =
      uniqueSeqspecPaths.length > 0
        ? await requestFiles(uniqueSeqspecPaths, request)
        : [];
  }
  return seqspecFiles;
}

/**
 * Retrieve the FileSet objects for the given FileSet paths from the data provider.
 * @param paths Paths to the FileSet objects to request
 * @param request The request object to use to make the request
 * @param addedProperties Additional properties to request
 * @returns The file-set objects requested
 */
export async function requestFileSets(
  paths: string[],
  request: FetchRequest,
  addedProperties: string[] = []
): Promise<FileSetObject[]> {
  return (
    await request.getMultipleObjectsBulk<FileSetObject>(
      paths,
      [
        "@type",
        "accession",
        "aliases",
        "file_set_type",
        "lab.title",
        "preferred_assay_titles",
        "samples",
        "status",
        "summary",
      ].concat(addedProperties),
      ["FileSet"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the document objects for the given document paths from the data provider.
 * @param {Array<string>} paths Paths to the document objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The document objects requested
 */
export async function requestDocuments(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DocumentObject>> {
  return (
    await request.getMultipleObjectsBulk<DocumentObject>(
      paths,
      [
        "attachment",
        "description",
        "document_type",
        "standardized_file_format",
        "uuid",
      ],
      ["Document"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the donor objects for the given donor paths from the data provider.
 * @param {Array<string>} paths Paths to the donor objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<DonorObject>} The donor objects requested
 */
export async function requestDonors(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DonorObject>> {
  return (
    await request.getMultipleObjectsBulk<DonorObject>(
      paths,
      [
        "accession",
        "aliases",
        "ethnicities",
        "sex",
        "status",
        "strain",
        "taxa",
      ],
      ["Donor"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the gene objects for the given gene paths from the data provider.
 * @param {Array<string>} paths Paths to the gene objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The gene objects requested
 */
export async function requestGenes(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(paths, ["geneid", "symbol"], ["Gene"])
  ).unwrap_or([]);
}

/**
 * Retrieves the institutional-certificate objects for the given paths from the data provider.
 *
 * @param paths - Paths to the institutional-certificate objects to request
 * @param request - The request object to use to make the request
 * @returns The institutional-certificate objects requested
 */
export async function requestInstitutionalCertificates(
  paths: string[],
  request: FetchRequest
): Promise<InstitutionalCertificateObject[]> {
  return (
    await request.getMultipleObjectsBulk<InstitutionalCertificateObject>(
      paths,
      [
        "certificate_identifier",
        "controlled_access",
        "data_use_limitation_summary",
        "lab",
        "status",
      ],
      ["InstitutionalCertificate"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the ontology-term objects for the given donor paths from the data provider.
 * @param {Array<string>} paths Paths to the ontology-term objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The ontology term objects requested
 */
export async function requestOntologyTerms(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<OntologyTermObject>> {
  return (
    await request.getMultipleObjectsBulk<OntologyTermObject>(
      paths,
      ["term_id", "term_name"],
      ["OntologyTerm"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the phenotype objects for the given phenotype paths from the data provider. This
 * includes a partial embed of the associated ontology-term object.
 * @param paths Paths to the phenotypic feature objects to request
 * @param request The request object to use to make the request
 * @returns The phenotypic feature objects requested
 */
export async function requestPhenotypicFeatures(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(
      paths,
      [
        "feature.@id",
        "feature.term_id",
        "feature.term_name",
        "observation_date",
        "quantity",
        "quantity_units",
        "status",
      ],
      ["PhenotypicFeature"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the samples objects for the given sample paths from the data provider.
 *
 * @param paths - Paths to the samples objects to request
 * @param request - The request object to use to make the request
 * @returns The samples objects requested
 */
export async function requestSamples(
  paths: Array<string>,
  request: FetchRequest
): Promise<SampleObject[]> {
  return (
    await request.getMultipleObjectsBulk<SampleObject>(
      paths,
      [
        "accession",
        "barcode_map",
        "construct_library_sets",
        "disease_terms",
        "protocols",
        "sample_terms",
        "status",
        "summary",
      ],
      ["Sample"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the software objects for the given paths from the data provider.
 * @param paths Paths to the software objects to request
 * @param request The request object to use to make the request
 * @returns The software version objects requested
 */
export async function requestSoftware(
  paths: string[],
  request: FetchRequest
): Promise<DataProviderObject[]> {
  return (
    await request.getMultipleObjectsBulk(
      paths,
      [
        "aliases",
        "description",
        "lab",
        "name",
        "source_url",
        "status",
        "title",
      ],
      ["Software"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the software-version objects for the given software-version paths from the data
 * provider.
 * @param {Array<string>} paths Paths to the software-version objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The software version objects requested
 */
export async function requestSoftwareVersions(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(
      paths,
      ["downloaded_url", "name", "status", "version"],
      ["SoftwareVersion"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the treatments objects for the given paths from the data provider.
 *
 * @param paths - Paths to the treatment objects to request
 * @param request - The request object to use to make the request
 * @returns The treatment objects requested
 */
export async function requestTreatments(
  paths: string[],
  request: FetchRequest
): Promise<TreatmentObject[]> {
  return (
    await request.getMultipleObjectsBulk<TreatmentObject>(
      paths,
      ["purpose", "status", "summary", "treatment_term_name", "treatment_type"],
      ["Treatment"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the user objects for the given user paths from the data provider.
 * @param {Array<string>} paths Paths to the user objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The user objects requested
 */
export async function requestUsers(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(paths, ["title"], ["User"])
  ).unwrap_or([]);
}

/**
 * Retrieve the sources objects for the given award paths from the data provider.
 * @param {Array<string>} paths Paths to the award objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The award objects requested
 */
export async function requestSources(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(
      paths,
      ["name", "url", "lab.title"],
      ["Source"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the search results from the `/dataset-summary` endpoint.
 * @param request The request object to use to make the request
 * @returns The dataset summary object requested
 */
export async function requestDatasetSummary(
  request: FetchRequest,
  queryString: string = ""
): Promise<DatasetSummary> {
  return (
    await request.getObject(`/dataset-summary-agg/?${queryString}`)
  ).unwrap_or({}) as unknown as DatasetSummary;
}

/**
 * Retrieve the workflow objects for the given paths from the data provider.
 * @param paths Paths to the workflow objects to request
 * @param request The request object to use to make the request
 * @returns The workflow objects requested, or an empty array if none found
 */
export async function requestWorkflows(
  paths: string[],
  request: FetchRequest
): Promise<DataProviderObject[]> {
  return (
    await request.getMultipleObjectsBulk(
      paths,
      [
        "accession",
        "aliases",
        "lab",
        "name",
        "source_url",
        "status",
        "uniform_pipeline",
        "workflow_version",
      ],
      ["Workflow"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the publication objects for the given paths from the data provider.
 *
 * @param paths - Paths to the publication objects to request
 * @param request - The request object to use to make the request
 * @returns The publication objects requested, or an empty array if none found
 */
export async function requestPublications(
  paths: string[],
  request: FetchRequest
): Promise<PublicationObject[]> {
  return (
    await request.getMultipleObjectsBulk<PublicationObject>(
      paths,
      [
        "aliases",
        "authors",
        "date_published",
        "issue",
        "journal",
        "page",
        "publication_identifiers",
        "title",
        "volume",
      ],
      ["Publication"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the page objects for the given page paths from the data provider. Typically used to
 * retrieve the parent page objects for a given page.
 * @param paths Path to each Page object to request
 * @param request The request object to use to make the request
 * @returns Requested Page objects
 */
export async function requestPages(
  paths: string[],
  request: FetchRequest
): Promise<DataProviderObject[]> {
  return (
    await request.getMultipleObjectsBulk(
      paths,
      ["name", "title", "status"],
      ["Page"]
    )
  ).unwrap_or([]);
}

/**
 * Retrieve the quality-metrics objects for the given paths from the data provider. Every sub-type
 * of quality-metrics object has very different properties, so this function gets all properties
 * for each object. We have to use getMultipleObjects instead of getMultipleObjectsBulk because the
 * former returns full objects regardless of the properties within, while the latter only returns
 * the properties specifically requested.
 * @param paths Paths to the quality-metrics objects to request
 * @param request Request object to use to make the request
 * @returns Requested quality-metrics objects
 */
export async function requestQualityMetrics(
  paths: string[],
  request: FetchRequest
): Promise<DataProviderObject[]> {
  return (await request.getMultipleObjects(paths, { filterErrors: true })).map(
    // getMultipleObjects already filtered out errors, so we can safely unwrap all elements.
    (result) => result.unwrap()
  );
}

/**
 * Type guard to check if the construct library sets are embedded objects or paths.
 * @param constructLibrarySets - Construct library sets to check embedded objects or paths
 * @returns True if all construct library sets are embedded objects, false if they are paths
 */
function constructLibrarySetsAreEmbedded(
  constructLibrarySets: string[] | FileSetObject[]
): constructLibrarySets is FileSetObject[] {
  return constructLibrarySets.every((set) => typeof set === "object");
}

/**
 * Type guard to check if the integrated content files are embedded objects or paths.
 * @param integratedContentFiles - Integrated content files to check if they are embedded or paths
 * @returns True if all integrated content files are embedded objects, false if they are paths
 */
function integratedContentFilesAreEmbedded(
  integratedContentFiles: string[] | FileObject[]
): integratedContentFiles is FileObject[] {
  return integratedContentFiles.every((file) => typeof file === "object");
}

/**
 * Request the library design files for a given FileSet object. Get these from the file set's
 * construct library sets' `integrated_content_files`, which are both expected to be embedded within
 * the file-set object. If the file set has no construct library sets, or if they do not have
 * `integrated_content_files`, then this returns an empty array. If the database server hasn't
 * completed indexing, `construct_library_sets` might not be present or might exist as an array of
 * paths instead of embedded objects, so treat this condition as if no construct library sets
 * exist within the file set.
 * @param fileSet - FileSet object to request the library design files from
 * @param request - Request object to use to make the request
 * @returns Requested library design files, or an empty array if none found
 */
export async function requestLibraryDesignFiles(
  fileSet: FileSetObject,
  request: FetchRequest
): Promise<FileObject[]> {
  const constructLibrarySets = fileSet.construct_library_sets || [];
  if (
    constructLibrarySets.length > 0 &&
    constructLibrarySetsAreEmbedded(constructLibrarySets)
  ) {
    const integratedContentFilePaths = constructLibrarySets.flatMap((cls) => {
      const integratedContentFiles = cls.integrated_content_files || [];
      if (
        integratedContentFiles.length > 0 &&
        integratedContentFilesAreEmbedded(integratedContentFiles)
      ) {
        return integratedContentFiles.map((file) => file["@id"]);
      }
      return [];
    });
    const uniqueIntegratedContentFilePaths = [
      ...new Set(integratedContentFilePaths),
    ];
    if (uniqueIntegratedContentFilePaths.length > 0) {
      return (await requestFiles(uniqueIntegratedContentFilePaths, request, [
        "TabularFile",
        "ReferenceFile",
      ])) as FileObject[];
    }
  }
  return [];
}

/**
 * Request the supersedes and superseded_by objects for a given item. The requests go out in
 * parallel. This function expects that the item has `supersedes` and `superseded_by` properties
 * that comprise arrays of unique paths.
 *
 * @param item - Item to request supersedes and superseded_by from
 * @param type - Type of the items that could supersede or be superseded by the item
 * @param request - Request object to use to make the request
 * @returns Objects that the item supersedes and is superseded by
 */
export async function requestSupersedes(
  item: DatabaseObject,
  type: string,
  request: FetchRequest
): Promise<{ supersedes: DatabaseObject[]; supersededBy: DatabaseObject[] }> {
  const itemSupersedes = item.supersedes || [];
  const itemSupersededBy = item.superseded_by || [];

  const [supersedes, supersededBy] = await Promise.all([
    itemSupersedes.length > 0
      ? ((
          await request.getMultipleObjectsBulk(
            itemSupersedes,
            ["accession"],
            [type]
          )
        ).unwrap_or([]) as DatabaseObject[])
      : [],
    itemSupersededBy.length > 0
      ? ((
          await request.getMultipleObjectsBulk(
            itemSupersededBy,
            ["accession"],
            [type]
          )
        ).unwrap_or([]) as DatabaseObject[])
      : [],
  ]);

  return { supersedes, supersededBy };
}

/**
 * Request the barcode_map tabular files for a given set of samples. You can optionally exclude
 * files with deleted or deprecated status by setting the `exclude` parameter to "deleted" or
 * "deprecated", respectively. By default, no files get excluded based on status.
 *
 * @param samples - Samples from which to request barcode_map tabular files
 * @param request - Request object to use to make the request
 * @param exclude - Exclude files with deleted or deprecated status, or don't exclude any files
 * @returns Requested barcode_map tabular files, or an empty array if none found
 */
export async function requestSampleBarcodeMaps(
  samples: SampleObject[],
  request: FetchRequest,
  exclude: "deleted" | "deprecated" | "none" = "none"
): Promise<FileObject[]> {
  // Gather any barcode map tabular-file paths from the samples.
  const barcodeMapPaths = samples.flatMap((sample) => {
    if (sample.barcode_map) {
      return [
        typeof sample.barcode_map === "string"
          ? sample.barcode_map
          : sample.barcode_map["@id"],
      ];
    }
    return [];
  });

  // Request the unique barcode map files if any barcode maps were found in the samples.
  let barcodeMapFiles: FileObject[] = [];
  const uniqueBarcodeMapPaths = [...new Set(barcodeMapPaths)];
  if (uniqueBarcodeMapPaths.length > 0) {
    barcodeMapFiles = (await requestFiles(uniqueBarcodeMapPaths, request, [
      "TabularFile",
    ])) as FileObject[];

    // Exclude files with deleted or deprecated status if specified.
    if (exclude === "deleted") {
      barcodeMapFiles = barcodeMapFiles.filter(
        (file) => file.status !== "deleted"
      );
    } else if (exclude === "deprecated") {
      barcodeMapFiles = trimDeprecatedFiles(barcodeMapFiles, false);
    }
  }
  return barcodeMapFiles;
}

/**
 * Request the current user object from the data provider.
 *
 * @param cookie - Current user browser cookie
 * @returns Current user object from session-properties; null if not authenticated
 */
export async function requestAuthenticatedUser(
  cookie: string
): Promise<UserObject | null> {
  const request = new FetchRequest({ cookie });
  const response = (await request.getObject("/session-properties")).optional();
  if (!response) {
    return null;
  }

  // Extract the user object from the session properties.
  const sessionProperties = response as SessionPropertiesObject;
  return sessionProperties.user || null;
}
