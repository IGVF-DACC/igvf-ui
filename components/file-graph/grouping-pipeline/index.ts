// file-graph
import { type FileSetNode } from "../types";
// local
import { auxiliarySetStage } from "./auxiliary-set-grouping";
import { constructLibrarySetStage } from "./construct-library-set-grouping";
import { controlFileSetStage } from "./control-file-set-groupings";
import { inputFileSetStage } from "./input-file-set-grouping";
import { buildNodesByFileSetPath } from "./lib";
import { relatedMeasurementSetStage } from "./related-measurement-set-grouping";
import {
  type GroupNodeMap,
  type GroupStageResult,
  type GroupPipelineResult,
} from "./types";

export { type GroupNodeMap };

/**
 * Type for grouping pipeline stage functions. Each function accepts the file-set nodes not grouped
 * by previous stages, and returns the groups it found as well as any remaining nodes not part of
 * those groups. The grouping pipeline runner function calls each of these stages in turn, passing
 * the remaining nodes from the previous stage to the next stage, and collecting all groups found
 * across stages.
 */
export type GroupPipelineStageFunction = (
  fileSetNodes: FileSetNode[],
  nodesById: Map<string, FileSetNode>,
  nodesByFileSetPath: Map<string, FileSetNode[]>
) => GroupStageResult;

// Array of stage functions to run in the grouping pipeline, in order. Each function accepts the
// file-set nodes not grouped by previous stages, and returns the groups it found as well as any
// remaining nodes not part of those groups. The grouping pipeline runner function calls each of
// these stages in turn, passing the remaining nodes from the previous stage to the next stage, and
// collecting all groups found across stages.
const groupingPipelineStages: GroupPipelineStageFunction[] = [
  auxiliarySetStage,
  relatedMeasurementSetStage,
  constructLibrarySetStage,
  controlFileSetStage,
  inputFileSetStage,
];

/**
 * Runs the grouping pipeline on a set of Elk nodes. It accepts the map of file-set IDs to the
 * corresponding nodes, calls each grouping pipeline stage in turn, collecting groups as well as
 * remaining nodes not part of that stage's groups. After all stages, it returns the final groups
 * and any nodes not part of any group.
 *
 * @param fileSetNodes - All file-set nodes in the graph
 * @returns All groups from the grouping pipeline, and nodes not part of any group
 */
export function groupingPipelineRunner(
  fileSetNodes: FileSetNode[]
): GroupPipelineResult {
  const nodesById = new Map(fileSetNodes.map((node) => [node.id, node]));

  // Run each stage in the grouping pipeline, passing remaining nodes from one stage to the next,
  // and collecting groups across stages. Each stage returns the groups it found, which are added
  // to the overall groups map, and the nodes not part of those groups, which are passed to the
  // next stage.
  const { groups, remainingNodes } = groupingPipelineStages.reduce(
    ({ groups, remainingNodes }, stage) => {
      // Build the file-set-path map from only the nodes in the current stage so later stages don't
      // try to connect to nodes that were already grouped in earlier stages.
      const nodesByFileSetPath = buildNodesByFileSetPath(remainingNodes);
      const result = stage(remainingNodes, nodesById, nodesByFileSetPath);
      result.groups.forEach((nodes, id) => groups.set(id, nodes));
      return { groups, remainingNodes: result.remainingNodes };
    },
    { groups: new Map() as GroupNodeMap, remainingNodes: fileSetNodes }
  );

  return {
    groups,
    remainingNodes,
  };
}
