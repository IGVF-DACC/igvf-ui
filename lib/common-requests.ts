import { DataProviderObject } from "../globals";
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
  return (await request.getMultipleObjectsBulk(paths, ["name"])).unwrap_or([]);
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
      "qualification",
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
  return (await request.getMultipleObjectsBulk(paths, ["accession"])).unwrap_or(
    []
  );
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
      "accession",
      "content_type",
      "file_format",
      "file_size",
      "file_set",
      "flowcell_id",
      "href",
      "illumina_read_type",
      "index",
      "lab.title",
      "lane",
      "seqspec",
      "sequencing_platform",
      "sequencing_run",
      "status",
      "upload_status",
    ])
  ).unwrap_or([]);
}

/**
 * Retrieve the FileSet objects for the given FileSet paths from the data provider.
 * @param {Array<string>} paths Paths to the FileSet objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The file-set objects requested
 */
export async function requestFileSets(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(paths, [
      "accession",
      "aliases",
      "lab.title",
      "summary",
      "status",
    ])
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
    await request.getMultipleObjectsBulk(paths, ["accession", "uuid"])
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
  return (await request.getMultipleObjectsBulk(paths, ["geneid"])).unwrap_or(
    []
  );
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
 * Retrieve the phenotypic-feature objects for the given phenotypic-feature paths from the data
 * provider.
 * @param {Array<string>} paths Paths to the phenotypic-feature objects to request
 * @param {FetchRequest} request The request object to use to make the request
 * @returns {Array<object>} The phenotypic features objects requested
 */
export async function requestPhenotypicFeatures(
  paths: Array<string>,
  request: FetchRequest
): Promise<Array<DataProviderObject>> {
  return (
    await request.getMultipleObjectsBulk(paths, [
      "feature",
      "observation_date",
      "quantity",
      "quantity_units",
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
    await request.getMultipleObjectsBulk(paths, ["construct_library_sets"])
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
    await request.getMultipleObjectsBulk(paths, ["version", "downloaded_url"])
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
