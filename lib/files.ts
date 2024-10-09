/**
 * General file-related utility functions.
 */
// node_modules
import _ from "lodash";
// lib
import { requestFiles } from "./common-requests";
import type FetchRequest from "./fetch-request";
// root
import type { DatabaseObject } from "../globals.d";

export interface FileObject extends DatabaseObject {
  accession: string;
  aliases?: string[];
  derived_from?: string[];
  file_format: string;
  file_set: string;
}

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
 * @param {Array<DatabaseObject>} files Array of files to split
 * @returns {IlluminaSequenceFiles} Arrays of files with and without the `illumina_read_type`
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
 * @param {string} path Path to check
 * @returns {boolean} True if the URL is a file-download link, false otherwise
 */
export function checkForFileDownloadPath(path: string): boolean {
  const matches = path.match(/^\/.+?\/.+?\/@@download\/.+$/);
  return matches !== null;
}

/**
 * Convert a file-download path to a path to the corresponding file-object page.
 * @param {string} path Path to convert
 * @returns {string} Path to the file page, or empty string if the path is not a file-download path
 */
export function convertFileDownloadPathToFilePagePath(url: string): string {
  const matches = url.match(/^(\/.+?\/.+?\/)@@download\/.+$/);
  return matches !== null ? matches[1] : "";
}

/**
 * Collect the paths of all `derived_from` files in `files` that are not already in `files`, and
 * request them from the server.
 * @param {FileObject[]} files Array of files to get derived_from files for
 * @param {FetchRequest} request Request object
 * @returns {Promise<FileObject[]>} Array of derived_from files
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

  // Filter out any paths that are already in `files`.
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
 * have reached the top of the chains.
 */
export async function getAllDerivedFromFiles(
  files: FileObject[],
  request: FetchRequest
) {
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
  // files until we have run out of `derived_from` files.
  while (derivedFromFileBatch.length > 0) {
    derivedFromFiles = derivedFromFiles.concat(derivedFromFileBatch);

    // Add the current batch of file IDs to the processed set
    derivedFromFileBatch.forEach((file) => {
      if (processedFileIds.has(file["@id"])) {
        throw new Error(
          `Detected a derived_from loop with file ID: ${file["@id"]}`
        );
      }
      processedFileIds.add(file["@id"]);
    });

    derivedFromFileBatch = await getFileDerivedFromFiles(
      derivedFromFileBatch,
      request,
      processedFileIds
    );
  }

  // Deduplicate the derivedFromFiles array.
  derivedFromFiles = _.uniqBy(derivedFromFiles, "@id");

  // Filter out any files that are already in `files`, leaving us the final list of all upstream
  // files from the files in the current file set.
  return derivedFromFiles.filter(
    (file) => !files.some((f) => f["@id"] === file["@id"])
  );
}
