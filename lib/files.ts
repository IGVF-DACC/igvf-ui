/**
 * General file-related utility functions.
 */
// node_modules
import _ from "lodash";
import XXH from "xxhashjs";
// lib
import { requestFiles } from "./common-requests";
import {
  type Cell,
  type DataGridFormat,
  type Row,
  type RowComponentProps,
} from "./data-grid";
import type FetchRequest from "./fetch-request";
// root
import type {
  DatabaseObject,
  FileObject,
  FileSetObject,
  SampleObject,
  UploadStatus,
} from "../globals.d";

/**
 * Flag indicating a missing flowcell ID in a sequencing file group. Uses "z" to ensure
 * missing values sort to the end alphabetically.
 */
const MISSING_FLOWCELL_ID_PLACEHOLDER = "z";

/**
 * Flag indicating a missing lane in a sequencing file group. Uses "z" to ensure
 * missing values sort to the end alphabetically.
 */
const MISSING_LANE_PLACEHOLDER = "z";

/**
 * Key used for files that cannot be grouped due to missing required metadata.
 */
const INVALID_GROUP_KEY = "invalid";

/**
 * Cache seed for generating consistent hashes.
 */
const CACHE_SEED = 0x3a9ffcd0;

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
export function checkFileDownloadable(
  file: FileObject,
  viewingGroups: string[] = []
): boolean {
  const isDownloadDisabledByStatus = nonDownloadableStatuses.has(
    file.upload_status
  );
  const isDownloadDisabledByControlledAccess =
    file.controlled_access && !viewingGroups.includes("IGVF");
  return (
    !isDownloadDisabledByStatus &&
    !isDownloadDisabledByControlledAccess &&
    !file.externally_hosted
  );
}

/**
 * Type guard to see if a file set is an embedded file-set object in a file object.
 * @param fileSet File set in a file object; could be a string `@id` or an embedded file set object
 * @returns True if the file set is an embedded file set object
 */
function checkFileSetIsObject(
  fileSet: string | FileSetObject
): fileSet is FileSetObject {
  return (fileSet as FileSetObject).samples !== undefined;
}

/**
 * Type guard to see if a file set's `samples` property is an array of sample objects or an array of
 * sample `@id` strings.
 * @param samples Samples array in a file set; could be an array of sample objects or an array of
 *     sample `@id` strings
 * @returns True if the samples array is an array of sample objects
 */
function checkSampleIsObjectArray(
  samples: string[] | SampleObject[]
): samples is SampleObject[] {
  return samples?.length > 0 && typeof samples[0] !== "string";
}

/**
 * Collect all sample objects from a file object's `file_set` object. Both `file_set` and
 * `file_set.samples` have to be embedded objects in the file object. The returned samples are
 * deduplicated.
 * @param files File objects to collect samples from
 * @returns Array of sample objects from the files deduplicated
 */
export function collectFileFileSetSamples(files: FileObject): SampleObject[] {
  // Collect all samples from the file set of the file.
  const samples: SampleObject[] = [];
  if (checkFileSetIsObject(files.file_set)) {
    if (checkSampleIsObjectArray(files.file_set.samples)) {
      samples.push(...files.file_set.samples);
    }
  }

  return _.uniqBy(samples, "@id");
}

/**
 * Generate groups of sequencing files based on their sequencing run, flowcell ID, and lane. The
 * keys of the returned map are formatted as `S{sequencing_run}-{flowcell_id}-L{lane}`. Each key
 * holds an array of files that share the same sequencing run, flowcell ID, and lane. The files
 * within each group are sorted by their `illumina_read_type`. Files without sequencing_run
 * (undefined or null) are excluded. Files without flowcell_id or lane are included but grouped
 * with "z" placeholder values to ensure they sort to the end alphabetically. Note that
 * sequencing_run: 0 is treated as a valid value and will be included.
 * @param files File objects to group
 * @returns Map of sequencing file groups with keys sorted alphabetically
 */
export function generateSequenceFileGroups(
  files: FileObject[]
): Map<string, FileObject[]> {
  // Group the array of files by a combination of their sequencing run, flowcell ID, and lane.
  // Files missing the sequencing run get placed into the `invalid` group and do not get included
  // in the groups.
  const groups = _.groupBy(files, (file) => {
    const sequencingRun =
      file.sequencing_run !== undefined && file.sequencing_run !== null
        ? `${file.sequencing_run}`
        : "";
    const flowcellId = file.flowcell_id || MISSING_FLOWCELL_ID_PLACEHOLDER;
    const lane = `${file.lane || MISSING_LANE_PLACEHOLDER}`;

    // Generate a group key. `sequencing_run` is required for inclusion in any group.
    return sequencingRun !== ""
      ? `S${sequencingRun}-${flowcellId}-L${lane}`
      : INVALID_GROUP_KEY;
  });

  // Create Map with sorted keys, excluding files in the `invalid` group.
  const sortedMap = new Map<string, FileObject[]>();
  _.sortBy(Object.keys(groups))
    .filter((key) => key !== INVALID_GROUP_KEY)
    .forEach((key) => {
      // Sort files within each group by illumina_read_type
      const sortedFiles = _.sortBy(groups[key], "illumina_read_type");
      sortedMap.set(key, sortedFiles);
    });

  return sortedMap;
}

/**
 * Apply a file object to the `source` property of each cell in `cells`. Use this to generate the
 * rows of the sequence file table data grid. The returned cells comprise copies of the given cells
 * but with the `source` property set to the given file object.
 * @param file File object to apply to the cells
 * @param cells Cell definitions to apply the file object to
 * @returns Copy of `cells` with the file object applied to their `source` property
 */
function applyFileToCells(file: FileObject, cells: Cell[]): Cell[] {
  return cells.map((cell) => {
    return {
      ...cell,
      source: file,
    };
  });
}

/**
 * Convert a map of file groups to a data grid format. Each key in the map is a composition of the
 * sequencing run, flowcell ID, and lane of the sequencing files within a group in the sequencing
 * file table. The values are arrays of file objects within that group. This function returns a
 * structure you can pass to `<DataGrid>` to render the sequencing file table with groups.
 * @param fileGroups Map of file groups to convert to a data grid format
 * @param columnDisplayConfig Column display configuration for the data grid
 * @param alternateRowComponent Optional alternate row component for styling
 * @returns Data grid format representation of the file groups
 */
export function fileGroupsToDataGridFormat(
  fileGroups: Map<string, FileObject[]>,
  columnDisplayConfig: Cell[],
  alternateRowComponent?: React.ComponentType<RowComponentProps>
): DataGridFormat {
  const rows: Row[] = [];
  const sortedKeys = Array.from(fileGroups.keys());

  // Create a map for efficient key index lookups to avoid O(n^2) indexOf operations.
  const keyIndexMap = new Map<string, number>();
  sortedKeys.forEach((key, index) => {
    keyIndexMap.set(key, index);
  });

  // This outer loop iterates once for each group of files in the file groups map.
  fileGroups.forEach((files, key) => {
    const keyIndex = keyIndexMap.get(key)!;
    const shouldAddRowComponent = keyIndex % 2 !== 0;

    // Generate the rows within a group.
    const subRows = files.map((file) => {
      const cells = applyFileToCells(file, columnDisplayConfig);
      return {
        id: file["@id"],
        cells,
        ...(shouldAddRowComponent &&
          alternateRowComponent && {
            RowComponent: alternateRowComponent,
          }),
      };
    });
    rows.push(...subRows);
  });
  return rows;
}

/**
 * Split file groups into pages for pagination. Each page contains complete file groups -- no
 * groups get split across pages. It returns an array of file group maps, each one representing
 * a page of file groups. Pagination works similarly to other tables, but if a page hits the maximum
 * page size (`pageSize`) in the middle of a group, it continues adding rows to the page until the
 * entire group gets included. Each page, therefore, could have a different number of rows. This
 * pagination can get expensive, so this function gets called through a memoization mechanism.
 * @param fileGroups - Map of file groups to paginate
 * @param pageSize - Number of file objects per page
 * @return Array of file group maps, each element representing a page of file groups
 */
function paginateSequenceFileGroupsCore(
  fileGroups: Map<string, FileObject[]>,
  pageSize: number
): Map<string, FileObject[]>[] {
  // Each page of maps accumulates until the number of `FileObjects` exceeds `pageSize`. Then it
  // starts a new page.
  const pages: Map<string, FileObject[]>[] = [];
  let currentPage: Map<string, FileObject[]> = new Map();
  let currentCount = 0;

  fileGroups.forEach((files, key) => {
    // Add the current group to the page
    currentPage.set(key, files);
    currentCount += files.length;

    // If adding this group has exceeded the page size, finish the current page and start a new one
    if (currentCount >= pageSize) {
      pages.push(currentPage);
      currentPage = new Map();
      currentCount = 0;
    }
  });

  // Push the last page if it has any groups.
  if (currentCount > 0) {
    pages.push(currentPage);
  }

  return pages;
}

/**
 * Create a hash from the file groups map for caching. Only the keys are used in the hash, not the
 * arrays of files. The hash avoids storing long combinations of keys as the memoization key --
 * just a short hex string representing a 32-bit value.
 * @param fileGroups Map of file groups
 * @returns Hash string
 */
function createMapKeyHash(fileGroups: Map<string, FileObject[]>) {
  const keys = [...fileGroups.keys()];
  const keyString = keys.join("|");
  return XXH.h32(keyString, CACHE_SEED).toString(16);
}

/**
 * Memoized version of the paginateSequenceFileGroupsCore function. External modules call this
 * function instead of paginateSequenceFileGroupsCore. `_.memoize` is called once on page load. It
 * calls the original function with the provided arguments on a cache miss. A cache miss would
 * happen if any of the keys in the fileGroups map change, or the number of file groups change.
 * @param fileGroups - Map of file groups to paginate
 * @param pageSize - Number of file objects per page
 * @return Array of file group maps, each element representing a page of file groups
 */
export const paginateSequenceFileGroups = _.memoize(
  paginateSequenceFileGroupsCore,
  (fileGroups, pageSize) => {
    const hash = createMapKeyHash(fileGroups);
    return `${hash}:${pageSize}`;
  }
);

/**
 * Extracts the sequence specifications associated with a given file from an array of seqspec file
 * objects. The assumption here is that `file` either has non-embedded seqspecs or partially
 * embedded seqspecs. `seqspecs` has complete seqspec file objects including those within `file` as
 * well as those for other files. This function extracts the complete seqspecs from `seqspecs` that
 * match the file's seqspecs.
 * @param file - File object to extract seqspecs file objects from
 * @param seqspecs - All available seqspec file objects
 * @returns Array of matching seqspec file objects for the file
 */
export function extractSeqspecsForFile(
  file: FileObject,
  seqspecs: FileObject[]
): FileObject[] {
  let matchingSeqspecs: FileObject[] = [];
  if (file.seqspecs?.length > 0) {
    const fileSeqspecPaths =
      typeof file.seqspecs[0] === "string"
        ? (file.seqspecs as string[])
        : file.seqspecs.map((seqspec) => (seqspec as { "@id": string })["@id"]);
    matchingSeqspecs = seqspecs.filter((seqspec) =>
      fileSeqspecPaths.includes(seqspec["@id"])
    );
  }
  return _.sortBy(matchingSeqspecs, "accession");
}
