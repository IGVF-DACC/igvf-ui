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
};

/**
 * Split an array of files into two arrays: one with files with the `illumina_read_type` property
 * and one with files that don't have that property.
 * @param {Array<DatabaseObject>} files Array of files to split
 * @returns {IlluminaSequenceFiles} Arrays of files with and without the `illumina_read_type`
 */
export function SplitIlluminaSequenceFiles(
  files: Array<DatabaseObject>
): IlluminaSequenceFiles {
  return files.reduce(
    (acc: IlluminaSequenceFiles, file) => {
      if (file.illumina_read_type) {
        acc.filesWithReadType.push(file);
      } else {
        acc.filesWithoutReadType.push(file);
      }
      return acc;
    },
    { filesWithReadType: [], filesWithoutReadType: [] }
  );
}
