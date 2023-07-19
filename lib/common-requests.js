/**
 * Retrieve the award objects for the given award paths from the data provider.
 * @param {Array<string>} paths Paths to the award objects to request
 * @param {object} request The request object to use to make the request
 * @returns {Array<object>} The award objects requested
 */
export async function requestAwards(paths, request) {
  return paths.length > 0
    ? request.getMultipleObjectsBulk(paths, [], ["name", "url"])
    : [];
}

/**
 * Retrieve the biomarker objects for the given biosample paths from the data provider.
 * @param {Array<string>} paths Paths to the biomarker objects to request
 * @param {object} request The request object to use to make the request
 * @returns {Array<object>} The biomarker objects requested
 */
export async function requestBiomarkers(paths, request) {
  return paths.length > 0
    ? request.getMultipleObjectsBulk(
        paths,
        ["aliases", "classification", "name", "qualification", "synonyms"],
        []
      )
    : [];
}

/**
 * Retrieve the biosample objects for the given biosample paths from the data provider.
 * @param {Array<string>} paths Paths to the biosample objects to request
 * @param {object} request The request object to use to make the request
 * @returns {Array<object>} The biosample objects requested
 */
export async function requestBiosamples(paths, request) {
  return paths.length > 0
    ? request.getMultipleObjectsBulk(paths, ["accession"], [])
    : [];
}

/**
 * Retrieve the file objects for the given file paths from the data provider.
 * @param {Array<string>} paths Paths to the file objects to request
 * @param {object} request The request object to use to make the request
 * @returns {Array<object>} The file objects requested
 */
export async function requestFiles(paths, request) {
  return paths.length > 0
    ? request.getMultipleObjectsBulk(
        paths,
        [
          "accession",
          "content_type",
          "file_format",
          "file_size",
          "flowcell_id",
          "href",
          "illumina_read_type",
          "lab.title",
          "lane",
          "sequencing_platform",
          "sequencing_run",
          "status",
          "upload_status",
        ],
        []
      )
    : [];
}

/**
 * Retrieve the FileSet objects for the given FileSet paths from the data provider.
 * @param {Array<string>} paths Paths to the FileSet objects to request
 * @param {object} request The request object to use to make the request
 * @returns {Array<object>} The file-set objects requested
 */
export async function requestFileSets(paths, request) {
  return paths.length > 0
    ? request.getMultipleObjectsBulk(paths, ["accession"], [])
    : [];
}

/**
 * Retrieve the document objects for the given document paths from the data provider.
 * @param {Array<string>} paths Paths to the document objects to request
 * @param {object} request The request object to use to make the request
 * @returns {Array<object>} The document objects requested
 */
export async function requestDocuments(paths, request) {
  return paths.length > 0
    ? request.getMultipleObjectsBulk(
        paths,
        ["attachment", "description", "document_type", "uuid"],
        []
      )
    : [];
}

/**
 * Retrieve the donor objects for the given donor paths from the data provider.
 * @param {Array<string>} paths Paths to the donor objects to request
 * @param {object} request The request object to use to make the request
 * @returns {Array<object>} The donor objects requested
 */
export async function requestDonors(paths, request) {
  return paths.length > 0
    ? request.getMultipleObjectsBulk(paths, ["accession", "uuid"], [])
    : [];
}

/**
 * Retrieve the ontology-term objects for the given donor paths from the data provider.
 * @param {Array<string>} paths Paths to the ontology-term objects to request
 * @param {object} request The request object to use to make the request
 * @returns {Array<object>} The ontology term objects requested
 */
export async function requestOntologyTerms(paths, request) {
  return paths.length > 0
    ? request.getMultipleObjectsBulk(paths, ["term_id", "term_name"], [])
    : [];
}

/**
 * Retrieve the phenotypic-feature objects for the given phenotypic-feature paths from the data
 * provider.
 * @param {Array<string>} paths Paths to the phenotypic-feature objects to request
 * @param {object} request The request object to use to make the request
 * @returns {Array<object>} The phenotypic features objects requested
 */
export async function requestPhenotypicFeatures(paths, request) {
  return paths.length > 0
    ? request.getMultipleObjectsBulk(
        paths,
        ["feature", "observation_date", "quantity", "quantity_units"],
        []
      )
    : [];
}

/**
 * Retrieve the software-version objects for the given software-version paths from the data
 * provider.
 * @param {Array<string>} paths Paths to the software-version objects to request
 * @param {object} request The request object to use to make the request
 * @returns {Array<object>} The software version objects requested
 */
export async function requestSoftwareVersions(paths, request) {
  return paths.length > 0
    ? request.getMultipleObjectsBulk(paths, ["version", "downloaded_url"], [])
    : [];
}

/**
 * Retrieve the treatment objects for the given treatment paths from the data provider.
 * @param {Array<string>} paths Paths to the treatment objects to request
 * @param {object} request The request object to use to make the request
 * @returns {Array<object>} The treatment objects requested
 */
export async function requestTreatments(paths, request) {
  return paths.length > 0
    ? request.getMultipleObjectsBulk(
        paths,
        [
          "amount",
          "duration",
          "purpose",
          "treatment_term_id",
          "treatment_term_name",
          "treatment_type",
        ],
        []
      )
    : [];
}

/**
 * Retrieve the user objects for the given user paths from the data provider.
 * @param {Array<string>} paths Paths to the user objects to request
 * @param {object} request The request object to use to make the request
 * @returns {Array<object>} The user objects requested
 */
export async function requestUsers(paths, request) {
  return paths.length > 0
    ? request.getMultipleObjectsBulk(paths, ["title"], [])
    : [];
}
