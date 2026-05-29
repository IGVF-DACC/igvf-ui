// lib
import { isFileSetObjectType } from "../../../lib/file-sets";
// file-graph
import { type FileSetNode } from "../types";
// local
import { standardGroupingStage } from "./standard-grouping";
import { type GroupStageResult } from "./types";

/**
 * Runs the related measurement set stage of the grouping pipeline. In this stage, measurement sets
 * are grouped with related measurement sets already included in the graph. Any file sets that this
 * function groups together are added to the `groups` mapping in the result that maps a group ID to
 * the array of nodes in that group. Any nodes not part of any group are added to the
 * `remainingNodes` mapping in the result that maps node IDs to the corresponding nodes.
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
export function relatedMeasurementSetStage(
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
        "Related measurement set stage found no eligible nodes to group, so skipping this stage."
      );
    }
    return {
      groups: new Map(),
      remainingNodes: fileSetNodes,
    };
  }

  // Build the adjacency map of file-set nodes based on related measurement set relationships. This
  // allows us to efficiently find all nodes connected by related measurement set relationships
  // when building the groups. Also build a mapping of file-set `@id` to the corresponding node for
  // quick lookup when building the groups.
  const adjacency = buildRelatedMeasurementSetAdjacency(
    fileSetNodes,
    nodesByFileSetPath
  );
  const results = standardGroupingStage(fileSetNodes, nodeById, adjacency);
  /* istanbul ignore next */
  if (process.env.NODE_ENV === "development") {
    console.log(
      `GROUPING: Related measurement set stage grouped ${[
        ...results.groups.values(),
      ]
        .map((group) => group.length)
        .reduce((sum, length) => sum + length, 0)} nodes into ${
        results.groups.size
      } groups and left ${results.remainingNodes.length} nodes ungrouped.`
    );
  }
  return results;
}

/**
 * Builds the adjacency map of file-set nodes based on related measurement set relationships. This
 * allows us to efficiently find all nodes connected by related measurement set relationships when
 * building the groups. This is a specific instance of the common pattern of adjacency defined by a
 * property on the file-set.
 *
 * @param fileSetNodes - All file-set nodes in the graph
 * @param nodesByFileSetPath - Map of file-set `@id` to the corresponding ELK node
 * @returns Map of node IDs to sets of neighboring node IDs connected by related measurement set
 *   relationships
 */
function buildRelatedMeasurementSetAdjacency(
  fileSetNodes: FileSetNode[],
  nodesByFileSetPath: Map<string, FileSetNode[]>
): Map<string, Set<string>> {
  // Initialize the adjacency map to assign an empty bucket to every file-set node ID.
  const adjacency = new Map(
    fileSetNodes.map((node) => [node.id, new Set<string>()])
  );

  for (const node of fileSetNodes) {
    const fileSet = node.metadata.fileSet;
    if (
      isFileSetObjectType(fileSet, "MeasurementSet") &&
      Array.isArray(fileSet.related_measurement_sets) &&
      fileSet.related_measurement_sets.length > 0
    ) {
      // Collect up all the measurement sets in all `related_measurement_sets.measurement_sets`
      // arrays, deduplicating by `@id` in case the same measurement set appears in multiple arrays.
      const relatedMeasurementSets = [
        ...new Map(
          fileSet.related_measurement_sets
            .flatMap(
              (relatedMeasurementSet) => relatedMeasurementSet.measurement_sets
            )
            .map((measurementSet) => [measurementSet["@id"], measurementSet])
        ).values(),
      ];

      for (const measurementSet of relatedMeasurementSets) {
        const msNodes = nodesByFileSetPath.get(measurementSet["@id"]);
        if (msNodes) {
          for (const msNode of msNodes) {
            adjacency.get(node.id)?.add(msNode.id);
            adjacency.get(msNode.id)?.add(node.id);
          }
        }
      }
    }
  }

  return adjacency;
}
