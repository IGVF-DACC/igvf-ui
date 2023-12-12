/**
 * General file-related utility functions.
 */

// TYPES
// root
import { DatabaseObject } from "../globals.d";

/**
 * Array of files with and without the `illumina_read_type` property.
 */
export type IlluminaSequenceFiles = {
  filesWithReadType: Array<DatabaseObject>;
  filesWithoutReadType: Array<DatabaseObject>;
  imageFileType: Array<DatabaseObject>;
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
      } else if (file.illumina_read_type) {
        acc.filesWithReadType.push(file);
      } else {
        acc.filesWithoutReadType.push(file);
      }
      return acc;
    },
    { filesWithReadType: [], filesWithoutReadType: [], imageFileType: [] }
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
