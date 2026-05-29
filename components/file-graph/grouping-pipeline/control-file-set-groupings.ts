// file-graph
import { type FileSetNode } from "../types";
// lib
import { isFileSetObjectType } from "../../../lib/file-sets";
// local
import {
  buildStandardAdjacency,
  standardGroupingStage,
} from "./standard-grouping";
import { type GroupStageResult } from "./types";

/**
 * Runs the control-file-set stage of the grouping pipeline. In this stage, measurement sets and
 * construct library sets are grouped by their `control_file_sets` property for file sets already
 * included in the graph. Any file sets that this function groups together are added to the `groups`
 * mapping in the result that maps a group ID to the array of nodes in that group. Any nodes not
 * part of any group are added to the `remainingNodes` mapping in the result that maps node IDs to
 * the corresponding nodes.
 *
 * This function generates a map of file-set `@id` to the corresponding ELK nodes, but the calling
 * function already has a mapping. But that mapping uses node IDs as keys, but we need the `@id` as
 * keys for grouping.
 *
 * @param fileSetNodes - File-set nodes to group in this stage.
 * @param nodeById - Mapping of node IDs to the corresponding file-set nodes for all nodes in the
 *   graph.
 * @param nodesByFileSetPath - Mapping of file-set paths to the corresponding file-set nodes for
 *   all nodes in the graph.
 * @returns The result of this grouping stage, including the groups that were formed and any
 *   remaining ungrouped nodes.
 */
export function controlFileSetStage(
  fileSetNodes: FileSetNode[],
  nodeById: Map<string, FileSetNode>,
  nodesByFileSetPath: Map<string, FileSetNode[]>
): GroupStageResult {
  const eligibleNodes = fileSetNodes.filter(
    (node) =>
      isFileSetObjectType(node.metadata.fileSet, "MeasurementSet") ||
      isFileSetObjectType(node.metadata.fileSet, "ConstructLibrarySet")
  );
  if (eligibleNodes.length === 0) {
    /* istanbul ignore next */
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Control file set stage found no eligible nodes to group, so skipping this stage."
      );
    }
    return {
      groups: new Map(),
      remainingNodes: fileSetNodes,
    };
  }

  // Build the adjacency map of file-set nodes based on control file set relationships. This allows
  // us to efficiently find all nodes connected by control file set relationships when building the
  // groups. Also build a mapping of file-set `@id` to the corresponding node for quick lookup when
  // building the groups.
  const adjacency = buildStandardAdjacency(
    eligibleNodes,
    fileSetNodes,
    nodesByFileSetPath,
    "control_file_sets"
  );
  const results = standardGroupingStage(fileSetNodes, nodeById, adjacency);
  /* istanbul ignore next */
  if (process.env.NODE_ENV === "development") {
    console.log(
      `GROUPING: Control file set stage grouped ${[...results.groups.values()]
        .map((group) => group.length)
        .reduce((sum, length) => sum + length, 0)} nodes into ${
        results.groups.size
      } groups and left ${results.remainingNodes.length} nodes ungrouped.`
    );
  }
  return results;
}
