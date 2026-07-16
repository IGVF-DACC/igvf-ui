// file-graph
import { type FileSetNode } from "../types";
// file-graph/grouping-pipeline
import {
  buildStandardAdjacency,
  standardGroupingStage,
} from "./standard-grouping";
import { type GroupStageResult } from "./types";

/**
 * Runs the input-file-set stage of the grouping pipeline. In this stage, file sets are grouped by
 * their `input_file_sets` property for file sets already included in the graph. Any file sets that
 * this function groups together are added to the `groups` mapping in the result that maps a group
 * ID to the array of nodes in that group. Any nodes not part of any group are returned in the
 * `remainingNodes` array in the result.
 *
 * @param fileSetNodes - File set nodes to group in this stage
 * @param nodeById - Mapping of node IDs to the corresponding file-set nodes for all nodes in the
 *                   graph
 * @param nodesByFileSetPath - Mapping of file-set paths to the corresponding file-set nodes for all
 *                             nodes in the graph
 * @returns Result of this grouping stage, including the groups that were formed and any remaining
 *          ungrouped nodes
 */
export function inputFileSetStage(
  fileSetNodes: FileSetNode[],
  nodeById: Map<string, FileSetNode>,
  nodesByFileSetPath: Map<string, FileSetNode[]>
): GroupStageResult {
  const adjacency = buildStandardAdjacency(
    fileSetNodes,
    fileSetNodes,
    nodesByFileSetPath,
    "input_file_sets"
  );
  const results = standardGroupingStage(fileSetNodes, nodeById, adjacency);
  /* istanbul ignore next */
  if (process.env.NODE_ENV === "development") {
    console.log(
      `GROUPING: Input file set stage grouped ${[...results.groups.values()]
        .map((group) => group.length)
        .reduce((sum, length) => sum + length, 0)} nodes into ${
        results.groups.size
      } groups and left ${results.remainingNodes.length} nodes ungrouped.`
    );
  }
  return results;
}
