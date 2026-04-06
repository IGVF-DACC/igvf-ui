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
 * Runs the auxiliary-set stage of the grouping pipeline. In this stage, measurement sets are
 * grouped with their auxiliary sets for auxiliary sets already included in the graph. Any file
 * sets that this function groups together are added to the `groups` mapping in the result that
 * maps a group ID to the array of nodes in that group. Any nodes not part of any group are added
 * to the `remainingNodes` mapping in the result that maps node IDs to the corresponding nodes.
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
export function auxiliarySetStage(
  fileSetNodes: FileSetNode[],
  nodeById: Map<string, FileSetNode>,
  nodesByFileSetPath: Map<string, FileSetNode[]>
): GroupStageResult {
  const eligibleNodes = fileSetNodes.filter((node) =>
    isFileSetObjectType(node.metadata.fileSet, "MeasurementSet")
  );
  if (eligibleNodes.length === 0) {
    /* istanbul ignore next */
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Auxiliary set stage found no eligible nodes to group, so skipping this stage."
      );
    }
    return {
      groups: new Map(),
      remainingNodes: fileSetNodes,
    };
  }

  // Build the adjacency map of file-set nodes based on auxiliary set relationships. This allows us
  // to efficiently find all nodes connected by auxiliary set relationships when building the
  // groups. Also build a mapping of file-set `@id` to the corresponding node for quick lookup when
  // building the groups.
  const adjacency = buildStandardAdjacency(
    eligibleNodes,
    fileSetNodes,
    nodesByFileSetPath,
    "auxiliary_sets"
  );
  // Run grouping over all current nodes so non-measurement nodes that are not grouped in this
  // stage still flow to later stages in the pipeline.
  const results = standardGroupingStage(fileSetNodes, nodeById, adjacency);
  /* istanbul ignore next */
  if (process.env.NODE_ENV === "development") {
    console.log(
      `GROUPING: Auxiliary set stage grouped ${[...results.groups.values()]
        .map((group) => group.length)
        .reduce((sum, length) => sum + length, 0)} nodes into ${
        results.groups.size
      } groups and left ${results.remainingNodes.length} nodes ungrouped.`
    );
  }
  return results;
}
