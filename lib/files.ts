/**
 * General file-related utility functions.
 */
// node_modules
import _ from "lodash";
// lib
import { requestFiles } from "./common-requests";
import type FetchRequest from "./fetch-request";
// root
import type { DatabaseObject, FileObject, UploadStatus } from "../globals.d";

/**
 * Set of file statuses that are not downloadable.
 */
const nonDownloadableStatuses = new Set<UploadStatus>([
  "file not found",
  "pending",
]);

/**
 * Array of files with and without the `illumina_read_type` property.
 */
export type IlluminaSequenceFiles = {
  filesWithReadType: Array<DatabaseObject>;
  filesWithoutReadType: Array<DatabaseObject>;
  imageFileType: Array<DatabaseObject>;
  tabularFileType: Array<DatabaseObject>;
};

/**
 * Split an array of files into two arrays: one with files with the `illumina_read_type` property
 * and one with files that don't have that property.
 * @param files Array of files to split
 * @returns Arrays of files with and without the `illumina_read_type`
 */
export function splitIlluminaSequenceFiles(
  files: Array<DatabaseObject>
): IlluminaSequenceFiles {
  return files.reduce(
    (acc: IlluminaSequenceFiles, file) => {
      if (file["@type"][0] === "ImageFile") {
        acc.imageFileType.push(file);
      } else if (file["@type"][0] === "TabularFile") {
        acc.tabularFileType.push(file);
      } else if (file.illumina_read_type) {
        acc.filesWithReadType.push(file);
      } else {
        acc.filesWithoutReadType.push(file);
      }
      return acc;
    },
    {
      filesWithReadType: [],
      filesWithoutReadType: [],
      imageFileType: [],
      tabularFileType: [],
    }
  );
}

/**
 * Check if a path is a file-download path.
 * @param path Path to check
 * @returns True if the URL is a file-download link, false otherwise
 */
export function checkForFileDownloadPath(path: string): boolean {
  const matches = path.match(/^\/.+?\/.+?\/@@download\/.+$/);
  return matches !== null;
}

/**
 * Convert a file-download path to a path to the corresponding file-object page.
 * @param path Path to convert
 * @returns Path to the file page, or empty string if the path is not a file-download path
 */
export function convertFileDownloadPathToFilePagePath(url: string): string {
  const matches = url.match(/^(\/.+?\/.+?\/)@@download\/.+$/);
  return matches !== null ? matches[1] : "";
}

/**
 * Collect the paths of all `derived_from` files in `files` that are not already in `files`, and
 * that we have already processed in the graph, then request them from the server. Avoiding already
 * processed files prevents infinite loops in the case of loops in the `derived_from` chains.
 * @param files Array of files to get derived_from files for
 * @param request Request object
 * @param processedFileIds Set of file IDs that have already been processed
 * @returns Array of derived_from files
 */
async function getFileDerivedFromFiles(
  files: FileObject[],
  request: FetchRequest,
  processedFileIds: Set<string>
) {
  const filePaths = files.map((file) => file["@id"]);

  // Collect all derived_from file paths from `files`.
  let derivedFromPaths = files.reduce((acc: string[], file) => {
    return file.derived_from?.length > 0 ? acc.concat(file.derived_from) : acc;
  }, []);

  // Deduplicate the paths.
  derivedFromPaths = [...new Set(derivedFromPaths)];

  // Filter out any paths that are already in `files`. Also filter out any paths that we have
  // already processed into the graph so we don't go into an infinite loop when the data includes a
  // loop.
  derivedFromPaths = derivedFromPaths.filter(
    (path) => !filePaths.includes(path) && !processedFileIds.has(path)
  );

  // Request these derived_from files from the server.
  let derivedFromFiles: FileObject[] = [];
  if (derivedFromPaths.length > 0) {
    derivedFromFiles = (await requestFiles(
      derivedFromPaths,
      request
    )) as FileObject[];
  }

  return derivedFromFiles;
}

/**
 * Get all upstream files from the files in the current file set, based on their `derived_from`
 * paths. We have to iteratively request the `derived_from` files for each batch of files until we
 * have reached the top of the chains. `derived_from` doesn't contain embedded file objects, so we
 * have to ascend these change batch by batch, collecting each batch's `derived_from` arrays.
 *
 * Depending on where they occur, either filter out or detect loops in the `derived_from` chains,
 * which should tell the user to fix the data.
 * @param files Array of files in a file set to get all upstream files for
 * @param request Request object
 * @returns Array of all upstream files from the files in the current file set
 */
export async function getAllDerivedFromFiles(
  files: FileObject[],
  request: FetchRequest
) {
  // Initialize `derivedFromFiles` collects all the upstream files from the files in the current
  // file set. `processedFileIds` is a set of file IDs that have already been processed in the graph
  // to prevent infinite loops in the case of loops in the `derived_from` chains.
  let derivedFromFiles: FileObject[] = [];
  const processedFileIds = new Set<string>();

  // Prime the pump by getting the `derived_from` files for the files directly in the current file
  // set.
  let derivedFromFileBatch = await getFileDerivedFromFiles(
    files,
    request,
    processedFileIds
  );

  // As long as we find derived-from files in the batch of files, keep going up the chain of these
  // files until we have run out of `derived_from` files in a batch.
  while (derivedFromFileBatch.length > 0) {
    derivedFromFiles = derivedFromFiles.concat(derivedFromFileBatch);

    // Add the current batch of file IDs to the processed set. This helps us detect loops in the
    // `derived_from` chains. Throw an error if we detect a loop here.
    derivedFromFileBatch.forEach((file) => {
      if (processedFileIds.has(file["@id"])) {
        throw new Error(
          `Detected a derived_from loop with file ID: ${file["@id"]}`
        );
      }
      processedFileIds.add(file["@id"]);
    });

    // We now have a batch of files that might derive from other files. Request any derived from
    // files in this batch, which gets us a new upstream batch of files to process.
    derivedFromFileBatch = await getFileDerivedFromFiles(
      derivedFromFileBatch,
      request,
      processedFileIds
    );
  }

  // Deduplicate the derivedFromFiles array. Filter out any files that are already in `files`,
  // leaving us the final list of all upstream files from the files in the current file set.
  derivedFromFiles = _.uniqBy(derivedFromFiles, "@id");
  return derivedFromFiles.filter(
    (file) => !files.some((f) => f["@id"] === file["@id"])
  );
}

/**
 * Check if a file is downloadable based on its upload status and its anvil status, as well as
 * not being externally hosted.
 * @param file File object to check
 * @returns True if the file is downloadable
 */
export function checkFileDownloadable(file: FileObject): boolean {
  const isDownloadDisabledByStatus = nonDownloadableStatuses.has(
    file.upload_status
  );
  const isDownloadDisabledByAnvil = Boolean(
    file.controlled_access && file.anvil_url
  );
  return (
    !isDownloadDisabledByAnvil &&
    !isDownloadDisabledByStatus &&
    !file.externally_hosted
  );
}
