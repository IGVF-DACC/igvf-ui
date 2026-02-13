// root
import { FileObject } from "../../globals";

/**
 * Detect cycles in a graph defined by FileObject.derived_from references. Returns each cycle as an
 * array of `@id` values where the first `@id` === last `@id`.
 *
 * Behavior:
 * - Detects self-loops: A -> A
 * - Detects 2-cycles:   A -> B -> A
 * - Detects longer:     A -> ... -> A
 * - De-duplicates equivalent cycles (different rotations/reversals are considered the same cycle)
 *
 * This uses the depth-first search (DFS) algorithm to visit each node of the tree. At each node
 * check if any of its neighboring nodes have already been visited during the search. This condition
 * indicates a cycle, meaning we cannot render the file association graph. This function returns
 * an empty array if it finds no cycles, meaning we can render the graph.
 *
 * @param fileObjects - Files to analyze for cycles through their `derived_from`
 * @returns Array of cycles, with each cycle an array of `@id` strings involved in the cycle
 */
export function detectCycles(fileObjects: FileObject[]): string[][] {
  const { adjacencyById, allIdsInGraph } = buildAdjacencyMap(fileObjects);

  // Initialize the return value of cycles, and the `@id` of all visited files (black nodes in DFS
  // parlance).
  const allCycles: string[][] = [];
  const visitedFileIds = new Set<string>();

  // For each node in the graph, detect whether it participates in a cycle. Add each cycle found to
  // `allCycles`.
  allIdsInGraph.forEach((fileId) => {
    if (!visitedFileIds.has(fileId)) {
      const { cycles, visited } = findCyclesFromNode(
        fileId,
        adjacencyById,
        visitedFileIds,
        new Set<string>(),
        []
      );
      allCycles.push(...cycles);

      // Update the set of visited file `@id` with the new visited nodes.
      visited.forEach((id) => visitedFileIds.add(id));
    }
  });

  return deduplicateCycles(allCycles);
}

/**
 * Find cycles starting from a specific node using depth-first search (DFS). Returns both the cycles
 * found and all nodes visited during the traversal. Don't stop once we find a cycle -- we can
 * detect multiple cycles. DFS involves traversing the graph by exploring along each branch as far
 * as possible before backtracking.
 *
 * @param currentId - Current node ID being visited
 * @param adjacencyById - Adjacency map of the graph
 * @param alreadyVisited - Set of nodes already visited in previous traversals (black nodes)
 * @param recursionStack - Set of nodes in the current recursion path (gray nodes)
 * @param currentPath - Represents the path taken to reach the current node
 * @returns An object containing cycles found and all nodes visited during this traversal
 */
function findCyclesFromNode(
  currentId: string,
  adjacencyById: Map<string, string[]>,
  alreadyVisited: Set<string>,
  recursionStack: Set<string>,
  currentPath: string[]
): { cycles: string[][]; visited: Set<string> } {
  // Track nodes visited in this subtree.
  const localVisited = new Set([currentId]);

  // Create new immutable state for this recursive call.
  const newRecursionStack = new Set([...recursionStack, currentId]);
  const newPath = [...currentPath, currentId];
  const foundCycles: string[][] = [];

  // Get the current node's neighbors (gray nodes in DFS parlance). These represent the files that
  // a file immediately derives from.
  const neighbors = adjacencyById.get(currentId)!;

  // For each neighboring node, descend into its subtree. Recursion provides a natural solution to
  // explore neighbors that might have their own neighbors.
  for (const neighborId of neighbors) {
    if (newRecursionStack.has(neighborId)) {
      // Back-edge detected: `neighborId` is already in our current path, forming a cycle. Extract
      // the cycle by taking the path from where `neighborId` first appears to the end, then add
      // `neighborId` again to close the loop (A -> B -> C -> A).
      const cycleStartIndex = newPath.indexOf(neighborId);
      const cycle = [...newPath.slice(cycleStartIndex), neighborId];
      foundCycles.push(cycle);
    } else if (!alreadyVisited.has(neighborId)) {
      // No back edge detected; continue DFS. `neighborId` hasn't been visited yet, so recurse with
      // this neighbor as the new root of its own tree.
      const { cycles, visited } = findCyclesFromNode(
        neighborId,
        adjacencyById,
        alreadyVisited,
        newRecursionStack,
        newPath
      );

      // Add any cycles found in this subtree to the overall list.
      foundCycles.push(...cycles);

      // Update the set of visited file `@id` with the new visited nodes (black nodes).
      visited.forEach((id) => localVisited.add(id));
    }
  }

  return { cycles: foundCycles, visited: localVisited };
}

/**
 * Build an adjacency list and validate derived-from IDs. This function returns two things:
 *
 * 1. An adjacency map for each file's `@id` to all its derived-from `@id`.
 *    With DFS we check the currently visited node for neighbors (derived_from files). The
 *    `adjacencyById` map helps us quickly find these neighbors. We therefore only call this
 * .  function once before DFS begins.
 *
 * 2. A list of all `@id` present in the graph.
 *    To perform DFS we simply iterate through this list of `@id`s. Academically DFS starts at the
 *    root node of the tree. But we don't know which file represents the root, and we can have
 *    multiple root nodes. Instead we treat every node we visit as a potential root, traveling down
 *    its neighbors until we have exhausted that subtree's nodes.
 *
 * Provide both native and external files in `files`. If a derived-from file does not appear in
 * `files`, it get skipped.
 *
 * @param files - Native and external files to process
 * @returns result.adjacencyById - Adjacency map for each file's `@id` to all its derived_from `@id`
 * @returns result.allIdsInGraph - List of all `@id` present in the graph.
 */
function buildAdjacencyMap(files: FileObject[]): {
  adjacencyById: Map<string, string[]>;
  allIdsInGraph: string[];
} {
  // Build map for each file's @id to all its derived_from @ids -- the adjacency map.
  const adjacencyById = new Map<string, string[]>();
  files.forEach((file) => {
    // Filter `file.derived_from` to only include `@id` that are present in the graph. This handles the case where a
    // file derives from an external file that isn't included in the graph. We still want to render the graph and not consider this a cycle, so we ignore derived_from references to files that aren't included in the graph.
    const validDerivedFrom = (file.derived_from || []).filter((id) =>
      files.some((f) => f["@id"] === id)
    );
    adjacencyById.set(file["@id"], validDerivedFrom);
  });

  // Build the array of all @ids present in the graph.
  const allIdsInGraph = [...adjacencyById.keys()];

  return { adjacencyById, allIdsInGraph };
}

/**
 * Canonicalize and deduplicate cycles:
 * - Remove the trailing duplicate to work on the core
 * - Rotate so the lexicographically smallest id is first
 * - Consider forward and reverse equivalent; pick lexicographically smaller
 *
 * @param cycles - Array of cycles, each cycle is an array of `@id` strings with first === last
 * @returns Array of deduplicated cycles
 */
function deduplicateCycles(cycles: string[][]): string[][] {
  const canonicalSignatureSet = new Set<string>();
  const uniqueCycles: string[][] = [];

  for (const cycleWithClosing of cycles) {
    // Step 1: Remove the closing duplicate temporarily for processing
    // e.g., ["A", "B", "C", "A"] → ["A", "B", "C"] (for rotation and comparison)
    const coreWithoutClosing = cycleWithClosing.slice(0, -1);

    // Step 2: Normalize rotation - start from lexicographically smallest node
    // e.g., ["B", "C", "A"] → ["A", "B", "C"]
    const rotationStartIndex =
      indexOfLexicographicallySmallest(coreWithoutClosing);
    const rotatedCore = rotateArray(coreWithoutClosing, rotationStartIndex);

    // Step 3: Generate canonical signatures to handle equivalent cycles
    // Forward: ["A", "B", "C"] → "A->B->C"
    // Reverse: ["A", "B", "C"] → "C->B->A" (same cycle, opposite direction)
    const forwardSignature = rotatedCore.join("->");
    const reverseSignature = rotateArray([...rotatedCore].reverse(), 0).join(
      "->"
    );

    // Choose lexicographically smaller signature.
    let canonicalSignature: string;
    if (forwardSignature < reverseSignature) {
      canonicalSignature = forwardSignature;
    } else {
      canonicalSignature = reverseSignature;
    }

    // Step 4: Add to results if this canonical form hasn't been seen before.
    if (!canonicalSignatureSet.has(canonicalSignature)) {
      canonicalSignatureSet.add(canonicalSignature);

      // Add back closing duplicate to meet the spec.
      uniqueCycles.push([...rotatedCore, rotatedCore[0]]);
    }
  }

  return uniqueCycles;
}

/**
 * Rotate an array to start from a specific index.
 *
 * @param array - Array to rotate
 * @param startIndex - Index to rotate from
 * @returns Rotated array
 */
function rotateArray(array: string[], startIndex: number): string[] {
  return [...array.slice(startIndex), ...array.slice(0, startIndex)];
}

/**
 * Find the index of the lexicographically smallest string in an array.
 *
 * @param values - Array of strings to search
 * @returns Index of the lexicographically smallest string
 */
function indexOfLexicographicallySmallest(values: string[]): number {
  let bestIndex = 0;
  let bestValue = values[0];
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] < bestValue) {
      bestValue = values[i];
      bestIndex = i;
    }
  }
  return bestIndex;
}
