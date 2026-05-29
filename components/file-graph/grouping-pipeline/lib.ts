// node_modules
import XXH from "xxhashjs";
// file-graph
import { type FileSetNode, type ElkNodeEx } from "../types";
// local
import { type GroupNodeId } from "./types";

/**
 * xxhashjs seed for hashing strings; generated randomly.
 */
const HASH_SEED = 0x135d3f7f;

/**
 * Generates a unique group ID for a group of nodes based on a hash of their IDs.
 *
 * @param group - Array of Elk nodes we've determined to be sharing a group
 * @returns ID unique to this group
 */
export function generateGroupId(group: ElkNodeEx[]): GroupNodeId {
  const combinedFileSetPaths = group
    .map((node) => node.id)
    .sort()
    .join("|");
  const groupHash = XXH.h64(combinedFileSetPaths, HASH_SEED).toString(16);
  return `group-${groupHash}`;
}

/**
 * Builds a mapping of file-set object `@id` to all corresponding Elk nodes for each file set.
 * Multiple nodes can share the same file-set path, so values are arrays.
 *
 * @param nodes - File-set nodes to index by file-set object path
 * @returns Map of file-set object `@id` to all matching Elk file-set nodes
 */
export function buildNodesByFileSetPath(
  nodes: FileSetNode[]
): Map<string, FileSetNode[]> {
  const nodesByPath = new Map<string, FileSetNode[]>();
  for (const node of nodes) {
    const nodeFileSetPath = node.metadata.fileSet["@id"];
    const existingNodes = nodesByPath.get(nodeFileSetPath) ?? [];
    existingNodes.push(node);
    nodesByPath.set(nodeFileSetPath, existingNodes);
  }
  return nodesByPath;
}
