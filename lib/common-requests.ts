import { DatabaseObject, DataProviderObject, SearchResults } from "../globals";
import FetchRequest from "./fetch-request";

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
    await request.getMultipleObjectsBulk(paths, [
      "aliases",
      "input_content_types",
      "name",
      "output_content_types",
      "status",
      "step_label",
      "title",
    ])
  ).unwrap_or([]);
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
    await request.getMultipleObjectsBulk(paths, ["name", "url"])
  ).unwrap_or([]);
}

/**
 * Retrieve the biomarker objects for the given biosample paths from the data provider.
 * @param {Array<string>} paths Paths to the biomarker objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The biomarker objects requested
 */
export async function requestBiomarkers(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(paths, [
      "aliases",
      "classification",
      "name",
      "quantification",
      "status",
      "synonyms",
    ])
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
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(paths, [
      "accession",
      "disease_terms",
      "sample_terms",
      "status",
      "summary",
    ])
  ).unwrap_or([]);
}

/**
 * Retrieve the file objects for the given file paths from the data provider.
 * @param {Array<string>} paths Paths to the file objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The file objects requested
 */
export async function requestFiles(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(paths, [
      "@type",
      "accession",
      "aliases",
      "content_type",
      "creation_timestamp",
      "derived_from",
      "file_format",
      "file_size",
      "file_set",
      "flowcell_id",
      "href",
      "illumina_read_type",
      "index",
      "input_file_for",
      "lab.@id",
      "lab.title",
      "lane",
      "seqspecs",
      "sequencing_platform",
      "sequencing_run",
      "status",
      "summary",
      "upload_status",
    ])
  ).unwrap_or([]);
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
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(
      paths,
      [
        "@type",
        "accession",
        "aliases",
        "file_set_type",
        "lab.title",
        "samples",
        "status",
        "summary",
      ].concat(addedProperties)
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
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(paths, [
      "attachment",
      "description",
      "document_type",
      "uuid",
    ])
  ).unwrap_or([]);
}

/**
 * Retrieve the donor objects for the given donor paths from the data provider.
 * @param {Array<string>} paths Paths to the donor objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The donor objects requested
 */
export async function requestDonors(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(paths, [
      "accession",
      "aliases",
      "sex",
      "status",
      "taxa",
    ])
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
    await request.getMultipleObjectsBulk(paths, ["geneid", "symbol"])
  ).unwrap_or([]);
}

/**
 * Retrieves the institutional-certificate objects for the given paths from the data provider.
 * @param {string[]} paths Paths to the institutional-certificate objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {DataProviderObject[]} The institutional-certificate objects requested
 */
export async function requestInstitutionalCertificates(
  paths: string[],
  request: FetchRequest
): Promise<DataProviderObject[]> {
  return (
    await request.getMultipleObjectsBulk(paths, [
      "certificate_identifier",
      "status",
    ])
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
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(paths, ["term_id", "term_name"])
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
    await request.getMultipleObjectsBulk(paths, [
      "feature.@id",
      "feature.term_id",
      "feature.term_name",
      "observation_date",
      "quantity",
      "quantity_units",
      "status",
    ])
  ).unwrap_or([]);
}

/**
 * Retrieve the samples objects for the given sample paths from the data provider.
 * @param {Array<string>} paths Paths to the samples objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The samples objects requested
 */
export async function requestSamples(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(paths, [
      "accession",
      "construct_library_sets",
      "protocols",
      "sample_terms",
      "status",
      "summary",
    ])
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
    await request.getMultipleObjectsBulk(paths, [
      "aliases",
      "description",
      "lab",
      "name",
      "source_url",
      "status",
      "title",
    ])
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
    await request.getMultipleObjectsBulk(paths, [
      "downloaded_url",
      "name",
      "status",
      "version",
    ])
  ).unwrap_or([]);
}

/**
 * Retrieve the treatments objects for the given paths from the data provider.
 * @param {Array<string>} paths Paths to the treatment objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The treatment objects requested
 */
export async function requestTreatments(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(paths, [
      "purpose",
      "status",
      "summary",
      "treatment_term_name",
      "treatment_type",
    ])
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
  return (await request.getMultipleObjectsBulk(paths, ["title"])).unwrap_or([]);
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
    await request.getMultipleObjectsBulk(paths, ["name", "url", "lab.title"])
  ).unwrap_or([]);
}

/**
 * Retrieve the search results from the `/dataset-summary` endpoint.
 * @param request The request object to use to make the request
 * @returns The dataset summary object requested
 */
export async function requestDatasetSummary(
  request: FetchRequest
): Promise<SearchResults> {
  return (await request.getObject("/dataset-summary")).unwrap_or(
    {}
  ) as unknown as SearchResults;
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
    await request.getMultipleObjectsBulk(paths, [
      "accession",
      "aliases",
      "lab",
      "name",
      "source_url",
      "status",
    ])
  ).unwrap_or([]);
}

/**
 * Retrieve the publication objects for the given paths from the data provider.
 * @param paths Paths to the publication objects to request
 * @param request The request object to use to make the request
 * @returns The publication objects requested, or an empty array if none found
 */
export async function requestPublications(
  paths: string[],
  request: FetchRequest
): Promise<DataProviderObject[]> {
  return (
    await request.getMultipleObjectsBulk(paths, [
      "aliases",
      "authors",
      "date_published",
      "issue",
      "journal",
      "page",
      "publication_identifiers",
      "title",
      "volume",
    ])
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
    await request.getMultipleObjectsBulk(paths, ["name", "title", "status"])
  ).unwrap_or([]);
}
