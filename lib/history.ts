// node_modules
import * as Diff from "diff";
import _ from "lodash";

/**
 * Types and functions for the @@history objects.
 */

/**
 * A single history entry for a database object. Local instances never include
 * `user_from_access_key`, and neither do changes made by upgrade scripts.
 * @property timestamp - Timestamp of the history entry
 * @property userid - User ID of the user who made the change
 * @property props - Properties of the database object at the time of the change
 * @property user_from_access_key - User name from the access key, if available
 */
export type HistoryEntry = {
  timestamp: string;
  userid: string;
  props: object;
  user_from_access_key?: string;
};

/**
 * A history object for a database object.
 * @property rid - Path of the database object
 * @property latest - Current properties of the database object
 * @property history - Array of history entries for the database object
 */
export type HistoryObject = {
  rid: string;
  latest: HistoryEntry;
  history: HistoryEntry[];
};

/**
 * Compare two JSON strings and generate an array of 1-based line numbers where they differ. The
 * JSON string must contain newlines for this line numbering to work.
 * @param originalText - Original JSON string
 * @param modifiedText - Modified JSON string
 * @returns Array of 1-based line numbers where the JSON strings differ
 */
export function jsonLineDiff(
  originalText: string,
  modifiedText: string
): number[] {
  const differences = Diff.diffJson(originalText, modifiedText);

  let lineCountModified = 0;
  const changedLines = new Set<number>();

  // Go through the differences and condense them into line numbers for added lines and deleted
  // lines. Diff treats changed lines as a deletion followed by an addition, and results in a
  // single line number in the output array.
  differences.forEach((part) => {
    // Exclude trailing newline
    const lineCount = part.value.split("\n").length - 1;

    if (part.removed) {
      for (let i = 0; i < lineCount; i++) {
        changedLines.add(lineCountModified + 1);
      }
    } else if (part.added) {
      for (let i = 0; i < lineCount; i++) {
        changedLines.add(lineCountModified + 1);
        lineCountModified += 1;
      }
    } else {
      // No change; move on.
      lineCountModified += lineCount;
    }
  });

  return _.sortBy([...changedLines]);
}
