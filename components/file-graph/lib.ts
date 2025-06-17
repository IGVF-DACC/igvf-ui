// node_modules
import _ from "lodash";
import XXH from "xxhashjs";
// local
import {
  isFileSetNodeData,
  type FileNodeData,
  type FileNodeType,
  type FileSetNodeData,
  type FileSetNodeType,
  type FileSetStats,
  type NodeData,
} from "./types";
// lib
import { type QualityMetricObject } from "../../lib/quality-metric";
// root
import { FileObject, FileSetObject } from "../../globals.d";

/**
 * Width of a node in the graph in pixels.
 */
export const NODE_WIDTH = 156;

/**
 * Height of a node in the graph in pixels.
 */
export const NODE_HEIGHT = 60;

/**
 * xxhashjs seed for hashing strings; generate randomly.
 */
const HASH_SEED = 0xe8c0f852;

/**
 * Remove what would have appeared as isolated nodes in the graph, lacking any parent or child
 * nodes.
 * @param graphData List of nodes with their parent nodes
 * @returns List of nodes that either have parents or are parents of other nodes
 */
export function trimIsolatedNodes(graphData: NodeData[]) {
  // Make a set of all parent IDs that appear across all nodes.
  const parentIds = new Set(graphData.flatMap((node) => node.parentIds));

  // Return only nodes with parents or that appear as parents of other nodes.
  return graphData.filter(
    (node) => node.parentIds.length > 0 || parentIds.has(node.id)
  );
}

/**
 * Collect all the file-set types that appear in `graphData` and return them along with a count of
 * the number of times each type appears in `graphData`.
 * @param graphData All nodes in the graph, probably after trimming
 * @returns Object with file-set types as keys and the count of each type in `graphData` as values
 */
export function collectRelevantFileSetStats(
  graphData: NodeData[]
): FileSetStats {
  const fileSetTypes = graphData.reduce((acc, node) => {
    if (isFileSetNodeData(node)) {
      return acc.concat(node.fileSet["@type"][0]);
    }
    return acc;
  }, [] as string[]);

  // Make array of FileSetStats objects, with each type found in `fileSetTypes` and with count
  // set to the number of times that type appears in `fileSetTypes`.
  return _.countBy(fileSetTypes) as FileSetStats;
}

/**
 * Generate d3-dag-compatible data from a list of files using their `derived_from` property.
 * @param nativeFiles Files belonging to the file set the user currently views
 * @param fileFileSets File sets that the `files` and `derivedFromFiles` belong to
 * @param derivedFromFiles Files that `files` derive from, including from other file sets
 * @returns List of nodes with their parent nodes
 */
export function generateGraphData(
  nativeFiles: FileObject[],
  fileFileSets: FileSetObject[],
  derivedFromFiles: FileObject[]
): NodeData[] {
  const nativeFilePaths = nativeFiles.map((file) => file["@id"]);

  // Generate the graph node data for the native files.
  const graphData: NodeData[] = nativeFiles.map((nativeFile) => {
    // Initialize the node data for the native file.
    return {
      id: nativeFile["@id"],
      parentIds:
        nativeFile.derived_from?.filter((derivedFromPath) =>
          nativeFilePaths.includes(derivedFromPath)
        ) || [],
      type: "file" as FileNodeType,
      file: nativeFile,
      externalFiles: derivedFromFiles.filter(
        (derivedFile) => nativeFile.derived_from?.includes(derivedFile["@id"])
      ),
    } as FileNodeData;
  });

  // Generate the graph node data for the file sets for the external files that the native files
  // derive from.
  const fileSetNodes = graphData.reduce((acc, fileNode: FileNodeData) => {
    // Group the external files that the node's native file derives from by the file set path they
    // belong to.
    let nodes: FileSetNodeData[] = [];
    if (fileNode.externalFiles.length > 0) {
      // Group the external files of `fileNode` by the paths of the file set they belong to.
      const fileSetGroups = _.groupBy(
        fileNode.externalFiles,
        (file) => file.file_set["@id"]
      );

      // For each file set group, create a file set node and add it to the list of nodes.
      nodes = Object.entries(fileSetGroups).reduce(
        (fileSetNodeAcc, [fileSetPath, files]) => {
          const fileSet = fileFileSets.find(
            (fileSet) => fileSet["@id"] === fileSetPath
          );

          let newFileSetNode: FileSetNodeData = null;
          if (fileSet) {
            // Make a hash from the combined file paths in the file set. This lets us have multiple
            // file-set nodes for the same file set, but with a different set of files.
            const combinedFilePaths = files
              .map((file) => file["@id"])
              .sort()
              .join("");
            const hash = XXH.h32(combinedFilePaths, HASH_SEED).toString(16);
            const fileSetNodeId = `${fileSetPath}-${hash}`;

            // See if a file-set node already exists with the same file set path and hash.
            const fileSetNodeExists = Boolean(
              acc.find((node) => node.id === fileSetNodeId)
            );
            if (fileSetNodeExists) {
              // If a file-set node already exists, add its ID to the native file node's parent IDs.
              fileNode.parentIds.push(fileSetNodeId);
              return fileSetNodeAcc;
            }
            newFileSetNode = {
              id: `${fileSetPath}-${hash}`,
              parentIds: [],
              type: "file-set" as FileSetNodeType,
              fileSet,
              files,
              childFile: fileNode.file,
            } as FileSetNodeData;
            fileNode.parentIds.push(newFileSetNode.id);
          }
          return newFileSetNode
            ? fileSetNodeAcc.concat(newFileSetNode)
            : fileSetNodeAcc;
        },
        [] as FileSetNodeData[]
      );
    }
    return acc.concat(nodes);
  }, [] as FileSetNodeData[]);

  return graphData.concat(fileSetNodes);
}

/**
 * Find the quality metrics for a file from the list of quality metrics for all files in the file
 * graph.
 * @param file The file object to get the quality metrics for
 * @param qualityMetrics Full quality metrics objects for all files in the file set
 * @returns Objects from `qualityMetrics` that are associated with `file`
 */
export function getFileMetrics(
  file: FileObject,
  qualityMetrics: QualityMetricObject[]
): QualityMetricObject[] {
  const fileMetricPaths = file.quality_metrics as string[];
  return qualityMetrics.filter((metric) =>
    fileMetricPaths.includes(metric["@id"])
  );
}
