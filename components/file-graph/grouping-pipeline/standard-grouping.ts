// lib
import { isEmbeddedArray } from "../../../lib/types";
// file-graph
import { type FileSetNode } from "../types";
// local
import { generateGroupId } from "./lib";
import { type GroupNodeMap, type GroupStageResult } from "./types";

/**
 * Standard grouping stage for file sets. This stage groups together file-set nodes that are
 * connected by any relationships defined by a property on the file-set object that lists related
 * file sets. For example, this stage can be used to group measurement sets with their related
 * auxiliary sets by building groups from the `auxiliary_sets` property on measurement-set objects.
 *
 * In some cases the grouping might be too different from this standard pattern to be implemented
 * with this function, and in that case a custom grouping stage function can be implemented with
 * custom logic for that relationship. But for relationships that do follow this standard pattern,
 * this function can be used to avoid duplicating the same grouping logic across different stages.
 *
 * `adjacency` defines the undirected graph of file-set relationships to group by, so this mapping
 * must be built with the relevant relationships for the file-set type and relationship being
 * grouped by.
 *
 * @param fileSetNodes - All file sets in a file graph
 * @param nodeById - Mapping of file-set node IDs to their corresponding nodes, for quick lookup
 *                   when traversing the graph
 * @param adjacency - Map of node IDs to sets of adjacent node IDs, defining the undirected graph
 *                    of file-set relationships to group by
 * @returns Groups of file-set nodes connected by the specified relationships, and any remaining
 *          ungrouped nodes
 */
export function standardGroupingStage(
  fileSetNodes: FileSetNode[],
  nodeById: Map<string, FileSetNode>,
  adjacency: Map<string, Set<string>>
): GroupStageResult {
  // Initialize the group nodes and remaining nodes as mappings from group IDs to arrays of nodes
  // in that group.
  const groups: GroupNodeMap = new Map();
  const remainingNodes: FileSetNode[] = [];

  // Build the groups of nodes connected by file-set relationships. Iterate through all file-set
  // nodes and perform a depth-first search to find all nodes connected to that node by their
  // relationships. Each set of connected nodes is grouped together.
  const visited = new Set<string>();
  for (const node of fileSetNodes) {
    // Skip if already visited in a previous grouping. This means it's already part of a group, so
    // we don't want to process it again.
    if (visited.has(node.id)) {
      continue;
    }

    // Initialize an empty group and the DFS stack with the current node ID. Mark the current node
    // as visited to avoid processing it again with another node in the same group.
    const group: FileSetNode[] = [];
    const stack = [node.id];

    // Note that the current node has been visited and added to the stack.
    visited.add(node.id);

    // Perform a depth-first search to find all nodes connected to the current node by a
    // relationship defined in the adjacency mapping. For each neighboring node, if it hasn't been
    // visited, mark it as visited and add it to the stack to be processed. Each node popped from
    // the stack is added to the current group.
    while (stack.length > 0) {
      // Pop a node ID from the stack to process. End the search for file-set neighbors when we
      // have no more nodes in the stack, meaning we've found all nodes in this group.
      const id = stack.pop()!;

      // Get the corresponding node for this ID and add it to the current group.
      const current = nodeById.get(id)!;

      // Add the current node to the group and continue the search for its neighbors.
      group.push(current);

      // For each neighboring node ID connected by a file-set relationship, if it hasn't been
      // visited, mark it as visited and add it to the stack to be processed.
      for (const neighbor of adjacency.get(id)!) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      }
    }

    // Add the group of connected nodes to the mapping of groups if it contains more than one node, or to
    // the remaining nodes if it only contains one node (i.e. it's not really a group).
    if (group.length > 1) {
      const groupId = generateGroupId(group);
      groups.set(groupId, group);
    } else if (group.length === 1) {
      remainingNodes.push(group[0]);
    }
  }

  return { groups, remainingNodes };
}

/**
 * Most file-set adjacency relationships follow a common pattern of adjacency defined by a property
 * on the file-set object that lists related file sets. This function builds an adjacency map for
 * any relationship that follows this pattern, given the specific file-set type and property that
 * defines the adjacency. This allows for consistent handling of adjacency relationships across
 * different file-set types.
 *
 * Adjacency maps not built in this way must be implemented with custom logic in the relevant stage
 * function.
 *
 * @param targetFileSetNodes - File-set nodes to build adjacency for
 * @param allFileSetNodes - All file-set nodes in the graph
 * @param nodesByFileSetPath - Mapping of file-set object `@id` to all corresponding Elk nodes
 * @param adjacencyProperty - Property name on the file-set object that defines adjacency
 * @returns Map of node IDs to sets of adjacent node IDs
 */
export function buildStandardAdjacency(
  targetFileSetNodes: FileSetNode[],
  allFileSetNodes: FileSetNode[],
  nodesByFileSetPath: Map<string, FileSetNode[]>,
  adjacencyProperty: string
): Map<string, Set<string>> {
  // Initialize the adjacency map to assign an empty bucket to every file-set node ID.
  const adjacency = new Map<string, Set<string>>(
    allFileSetNodes.map((node) => [node.id, new Set<string>()])
  );

  // Build an undirected graph from measurement sets to all matching auxiliary-set nodes.
  for (const node of targetFileSetNodes) {
    const fileSet = node.metadata.fileSet;
    if (isEmbeddedArray(fileSet[adjacencyProperty])) {
      for (const adjacentSet of fileSet[adjacencyProperty]) {
        const adjacentNodes = nodesByFileSetPath.get(adjacentSet["@id"]);
        if (!adjacentNodes || adjacentNodes.length === 0) {
          continue;
        }
        for (const adjacentNode of adjacentNodes) {
          adjacency.get(node.id)!.add(adjacentNode.id);
          adjacency.get(adjacentNode.id)!.add(node.id);
        }
      }
    }
  }

  return adjacency;
}
