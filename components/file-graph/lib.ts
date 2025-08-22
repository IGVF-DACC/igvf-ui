// node_modules
import type { ElkNode, ElkExtendedEdge } from "elkjs/lib/elk-api";
import { MarkerType, type Edge, type Node } from "@xyflow/react";
import _ from "lodash";
// local
import {
  isFileSetNodeData,
  type D3DagErrorObject,
  type FileSetStats,
  type NodeData,
} from "./types";
// lib
import { pathToId } from "../../lib/general";
import { type QualityMetricObject } from "../../lib/quality-metric";
// root
import { FileObject } from "../../globals.d";

/**
 * Metadata to attach to each ELK and React Flow file node. ELK carries it through the layout
 * process.
 */
type FileMetadata = {
  kind: "file";
  file: FileObject;
};

/**
 * Metadata to attach to each ELK and React Flow node regardless of its kind.
 */
export type NodeMetadata = FileMetadata;

/**
 * Extended ElkNode interface that includes metadata.
 */
interface ElkNodeEx extends ElkNode {
  metadata?: NodeMetadata;
}

/**
 * Width of a node in the graph in pixels.
 */
export const NODE_WIDTH = 156;

/**
 * Height of a node in the graph in pixels.
 */
export const NODE_HEIGHT = 60;

/**
 * Static root node of ELK graph.
 */
const rootElkNode = {
  id: "root",
  layoutOptions: {
    "org.eclipse.elk.algorithm": "layered",
    "org.eclipse.elk.layered.edgeRouting": "POLYLINE",
    "org.eclipse.elk.direction": "RIGHT",
    "org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers": "100",
    "org.eclipse.elk.layered.hierarchyHandling": "INCLUDE_CHILDREN",
    "org.eclipse.elk.layered.nodePlacement.favorStraightEdges": "true",
    "org.eclipse.elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
    "org.eclipse.elk.padding": "[top=4,left=4,bottom=4,right=4]",
  },
  children: [],
  edges: [],
} as ElkNode;

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
 * Remove files that would appear as isolated nodes in the graph (no connections to other files).
 * A file is kept if it either:
 * - derives from other files (has incoming edges - is a target)
 * - other files derive from it (has outgoing edges - is a source)
 * @param files - File objects to filter
 * @returns File objects that have connections to other files in the graph
 */
export function trimIsolatedFiles(files: FileObject[]): FileObject[] {
  // Collect all file IDs that are referenced in derived_from arrays.
  const derivedFromFilePaths = new Set(
    files.flatMap((file) => file.derived_from || [])
  );

  // Keep files that either have incoming or outgoing edges.
  return files.filter(
    (file) =>
      derivedFromFilePaths.has(file["@id"]) || // File has outgoing edges
      file.derived_from?.length > 0 // File has incoming edges
  );
}

/**
 * Find all external files that the given native files derive from.
 * @param externalFiles - List of all external files
 * @param nativeFiles - List of all native files
 * @returns External files that are referenced in native files' derived_from arrays
 */
function findUsedExternalFiles(
  externalFiles: FileObject[],
  nativeFiles: FileObject[]
): FileObject[] {
  const derivedFromFilePaths = new Set(
    nativeFiles.flatMap((file) => file.derived_from || [])
  );
  return externalFiles.filter((file) => derivedFromFilePaths.has(file["@id"]));
}

/**
 * Generate d3-dag-compatible data from a list of files using their `derived_from` property.
 * @param nativeFiles Files belonging to the file set the user currently views
 * @param fileFileSets File sets that the `files` and `derivedFromFiles` belong to
 * @param externalFiles Files in other file sets that `nativeFiles` derive from
 * @returns List of nodes with their parent nodes
 */
export function generateGraphData(
  nativeFiles: FileObject[],
  externalFiles: FileObject[]
): ElkNodeEx {
  // Only consider native files that derive from other files or that other files derive from.
  const includedNativeFiles = trimIsolatedFiles(nativeFiles);

  // Generate a list of external file objects that nativeFiles derives from. These don't appear in
  // the graph -- the file sets they belong to do.
  const usedExternalFiles = findUsedExternalFiles(
    externalFiles,
    includedNativeFiles
  );

  // Generate the graph node data for the native and external files.
  const allFiles = [...includedNativeFiles, ...usedExternalFiles];
  const nodes = allFiles.map((nativeFile) => {
    // Initialize the node data for the native file.
    return {
      id: nativeFile["@id"],
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      metadata: {
        kind: "file",
        file: nativeFile,
      } as NodeMetadata,
    } as ElkNode;
  });

  // Generate the graph edge data, each edge of type `ElkExtendedEdge`
  const edges = allFiles.flatMap((file) => {
    return (file.derived_from || []).map((derivedFromPath) => {
      const fileId = file["@id"];
      const derivedFromId = derivedFromPath;
      return {
        id: `${fileId}-${derivedFromId}`,
        sources: [fileId],
        targets: [derivedFromId],
      } as ElkExtendedEdge;
    });
  });

  // Add nodes and edges to a copy of the static root node.
  return {
    ...rootElkNode,
    children: nodes,
    edges,
  } as ElkNode;
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
  const fileMetricPaths = (
    file.quality_metrics?.length > 0 ? file.quality_metrics : []
  ) as string[];
  return qualityMetrics.filter((metric) =>
    fileMetricPaths.includes(metric["@id"])
  );
}

/**
 * The d3-dag module returns errors as strings that could include one or more JSON strings. This
 * function extracts those JSON strings and returns them as objects. This returns an empty array if
 * `error` contains no valid JSON strings.
 * @param error Error string from d3-dag
 * @returns Parsed d3-dag error objects if the string contains valid JSON strings; [] if not
 */
export function extractD3DagErrorObject(error: string): D3DagErrorObject[] {
  // Match all occurrences of JSON strings with '{...}' in the error string, which can contain
  // newlines.
  const matches = [...error.matchAll(/'(\{[^]*?\})'/g)];
  const results = matches.reduce((acc, match) => {
    try {
      const jsonString = match[1];
      const parsedObject = JSON.parse(jsonString) as D3DagErrorObject;
      return acc.concat(parsedObject);
    } catch (_) {
      // If parsing fails, ignore this match.
      return acc;
    }
  }, [] as D3DagErrorObject[]);

  // Deduplicate objects that have the same `id` property.
  const seenIds = new Set<string>();
  const filteredResults = results.filter((result) => {
    if (!seenIds.has(result.id)) {
      seenIds.add(result.id);
      return true;
    }
    return false;
  });
  return filteredResults;
}

/**
 * Extracts the ids (usually object accessions) contained within the error objects from a d3-dag
 * error string. This is useful for identifying the nodes that caused the error in the graph.
 * Returns an empty array if no valid JSON strings are found in the error string.
 * @param error Error string from d3-dag that might contain one or more JSON strings
 * @returns Array of ids within the error objects extracted from the error string
 */
export function extractD3DagErrorObjectIds(error: string): string[] {
  const errorObjects = extractD3DagErrorObject(error);
  return errorObjects.map((errorObject) => pathToId(errorObject.id));
}

/**
 * Converts ELK nodes to React Flow nodes. As this can involve multiple levels of hierarchy, the
 * `parentId` parameter is used to maintain the correct parent-child relationships. This uses
 * recursion to process all child nodes, returning them as a flat array with group nodes positioned
 * before their children.
 * @param elkNodes - Nodes from the `children` property of an ELK object
 * @param parentId - ID of the parent node if `elkNodes` are children of a node
 * @returns Array of React Flow nodes ready to pass to <ReactFlow />
 */
function elkToReactFlowNodes(elkNodes: ElkNodeEx[], parentId = ""): Node[] {
  const rfNodes: Node[] = [];
  elkNodes.forEach((elkNode) => {
    // Generate a React Flow node and add it to the cumulative array.
    const rfNode: Node<NodeMetadata> = {
      id: elkNode.id,
      type: elkNode.children ? "group" : "file",
      data: elkNode.metadata,
      position: { x: elkNode.x, y: elkNode.y },
      style: { width: elkNode.width, height: elkNode.height },
      draggable: false,
      selectable: false,
      ...(parentId ? { parentId } : {}),
    };
    rfNodes.push(rfNode);

    // If the node has children, recursively process them and add them to the cumulative array.
    if (elkNode.children) {
      const childNodes = elkToReactFlowNodes(elkNode.children, elkNode.id);
      rfNodes.push(...childNodes);
    }
  });
  return rfNodes;
}

/**
 * Converts ELK edges to React Flow edges. This is mostly a simple mapping.
 * @param elkNodes - Nodes from the `children` property of an ELK object
 * @returns Array of React Flow edges ready to pass to <ReactFlow />
 */
function elkToReactFlowEdges(elkNodes: ElkNode) {
  const rfEdges: Edge[] = [];
  elkNodes.edges.forEach((edge) => {
    if (!edge.id.startsWith("__layout__")) {
      const rfEdge: Edge = {
        id: edge.id,
        source: edge.sources[0],
        target: edge.targets[0],
        markerEnd: {
          // Use an arrowhead at the end of each edge with a larger-than-default size.
          type: MarkerType.ArrowClosed,
          width: 24,
          height: 24,
        },
      };
      rfEdges.push(rfEdge);
    }
  });
  return rfEdges;
}

/**
 * Converts an ELK graph to React Flow format. You can pass the `nodes` and `edges` directly to
 * <ReactFlow /> to render the graph.
 * @param elkGraph - The ELK graph to convert
 * @returns An object containing the converted nodes and edges
 */
export function elkToReactFlow(elkGraph: ElkNode): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes = elkToReactFlowNodes(elkGraph.children || []);
  const edges = elkToReactFlowEdges(elkGraph);
  return { nodes, edges };
}
