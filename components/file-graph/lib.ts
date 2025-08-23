// node_modules
import type { ElkNode, ElkExtendedEdge } from "elkjs/lib/elk-api";
import _ from "lodash";
import XXH from "xxhashjs";
import { MarkerType, type Edge, type Node } from "@xyflow/react";
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
import { FileObject, FileSetObject } from "../../globals.d";

/**
 * Metadata to attach to each ELK and React Flow file node. ELK carries it through the layout
 * process.
 */
export type FileMetadata = {
  kind: "file";
  file: FileObject;
  upstreamNativeFiles: FileObject[];
  upstreamExternalFiles: FileObject[];
  upstreamFileSetNodes: ElkNodeEx[];
};

export type FileSetMetadata = {
  kind: "fileset";
  fileSet: FileSetObject;
  externalFiles: FileObject[];
  downstreamFileNodes: ElkNodeEx[];
};

/**
 * Metadata to attach to each ELK and React Flow node regardless of its kind.
 */
export type NodeMetadata = FileMetadata | FileSetMetadata;

/**
 * Extended ElkNode interface that includes metadata. You see `metadata` on every node representing
 * a file or file set in the graph, but not for the root node nor group nodes.
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
 * xxhashjs seed for hashing strings; generated randomly.
 */
const HASH_SEED = 0xe8c0f852;

/**
 * Static root node of ELK graph.
 */
const rootElkNode: ElkNodeEx = {
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
};

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
 * @param nativeFiles - Native file objects to filter
 * @param externalFiles - External derived-from file objects used in the graph
 * @returns - Native file objects that have connections to other files in the graph
 */
export function trimIsolatedFiles(
  nativeFiles: FileObject[],
  externalFiles: FileObject[]
): FileObject[] {
  // Create a set of all available file paths to help make sure derived-from files have actually
  // loaded.
  const allFilePaths = new Set([
    ...nativeFiles.map((file) => file["@id"]),
    ...externalFiles.map((file) => file["@id"]),
  ]);

  // Collect incoming and outgoing edges for every native file.
  const filesWithOutgoingEdges = new Set<string>();
  const filesWithIncomingEdges = new Set<string>();
  nativeFiles.forEach((file) => {
    // Get all derived_from paths for files that have loaded.
    const loadedDerivedFromPaths = (file.derived_from || []).filter((path) =>
      allFilePaths.has(path)
    );

    // This file has incoming edges if it derives from loaded files.
    if (loadedDerivedFromPaths.length > 0) {
      filesWithIncomingEdges.add(file["@id"]);
    }

    // The files this file derives from have outgoing edges.
    loadedDerivedFromPaths.forEach((path) => {
      filesWithOutgoingEdges.add(path);
    });
  });

  // Filter out files that have no incoming nor outgoing edges.
  return nativeFiles.filter(
    (file) =>
      filesWithOutgoingEdges.has(file["@id"]) ||
      filesWithIncomingEdges.has(file["@id"])
  );
}

/**
 * Find all external files that the given native files derive from.
 * @param externalFiles - List of all external files
 * @param nativeFiles - List of all native files
 * @returns External files that native files derive from (appear in derived_from arrays)
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
 * Get the upstream files for a given file, split into native upstream files and external upstream
 * files. "Native" here means files that are included in the current file set. "External" means
 * files that are included in some other file set.
 * @param file - File to get upstream files for
 * @param nativeFiles - All native upstream files
 * @param externalFiles - All external upstream files
 * @returns result - Upstream files categorized by type
 * @returns result.upstreamNativeFiles - Files from the current file set that this file derives from
 * @returns result.upstreamExternalFiles - Files from other file sets that this file derives from
 */
function getUpstreamFiles(
  file: FileObject,
  nativeFiles: FileObject[],
  externalFiles: FileObject[]
): { upstreamNativeFiles: FileObject[]; upstreamExternalFiles: FileObject[] } {
  const allDerivedFromPaths = file.derived_from || [];
  const nativeFilePaths = new Set(
    nativeFiles.map((nativeFile) => nativeFile["@id"])
  );

  // Split the derived-from file paths into native and external file paths.
  const { nativePaths = [], externalPaths = [] } = _.groupBy(
    allDerivedFromPaths,
    (filePath) =>
      nativeFilePaths.has(filePath) ? "nativePaths" : "externalPaths"
  );

  // Map the native and external file paths into the corresponding file objects.
  const upstreamNativeFiles = nativePaths
    .map((path) => nativeFiles.find((file) => file["@id"] === path))
    .filter(Boolean);
  const upstreamExternalFiles = externalPaths
    .map((path) => externalFiles.find((file) => file["@id"] === path))
    .filter(Boolean);

  return {
    upstreamNativeFiles,
    upstreamExternalFiles,
  };
}

/**
 * Generate a unique ID for a file-set node based on its path and associated files. Multiple nodes
 * can represent the same file set but different subsets of files, depending on which native files
 * derive from them. To distinguish these cases, this function encodes the set of file IDs into a
 * hash, appended to the file-set path, ensuring each node ID is unique.
 * @param fileSet - File-set object we need an ID for
 * @param files - List of external files for this file-set node
 * @returns A unique ID for the file-set node
 */
function generateFileSetNodeId(
  fileSetPath: string,
  files: FileObject[]
): string {
  const combinedFilePaths = files
    .map((file) => file["@id"])
    .sort()
    .join("");
  const hash = XXH.h32(combinedFilePaths, HASH_SEED).toString(16);
  return `${pathToId(fileSetPath)}-${hash}`;
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
  externalFiles: FileObject[],
  fileFileSets: FileSetObject[]
): ElkNodeEx {
  // Only consider native files that derive from other files or that other files derive from.
  const includedNativeFiles = trimIsolatedFiles(nativeFiles, externalFiles);

  // Generate a list of external file objects that nativeFiles derives from. These don't appear in
  // the graph -- the file sets they belong to do.
  const usedExternalFiles = findUsedExternalFiles(
    externalFiles,
    includedNativeFiles
  );

  // Generate the graph node data for the native and external files.
  const allFiles = [...includedNativeFiles, ...usedExternalFiles];
  const fileNodes = allFiles.map((nativeFile) => {
    const { upstreamNativeFiles, upstreamExternalFiles } = getUpstreamFiles(
      nativeFile,
      includedNativeFiles,
      usedExternalFiles
    );

    // Initialize the node data for the native file.
    const metadata: FileMetadata = {
      kind: "file",
      file: nativeFile,
      upstreamNativeFiles,
      upstreamExternalFiles,
      upstreamFileSetNodes: [],
    };
    return {
      id: nativeFile["@id"],
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      metadata,
    } as ElkNodeEx;
  });

  // Generate the graph node data for the external file sets.
  const fileSetNodes: ElkNodeEx[] = [];
  const fileSetMap = new Map(
    fileFileSets.map((fileFileSet) => [fileFileSet["@id"], fileFileSet])
  );
  fileNodes.forEach((fileNode) => {
    const fileNodeMetadata = fileNode.metadata as FileMetadata;
    const upstreamExternalFiles = fileNodeMetadata.upstreamExternalFiles;
    const externalFilesByFileSet = _.groupBy(
      upstreamExternalFiles,
      (externalFile) => externalFile.file_set["@id"]
    );

    // Process file-set nodes for each file set group, with each group representing a unique
    // combination of a file set and its external files (external to the viewed file set).
    Object.entries(externalFilesByFileSet).forEach(
      ([fileSetPath, externalFiles]) => {
        const fileSetNodeId = generateFileSetNodeId(fileSetPath, externalFiles);
        let fileSetNode = fileSetNodes.find(
          (node) => node.id === fileSetNodeId
        );
        if (fileSetNode) {
          // Add `fileNode` to the list of `downstreamFiles`.
          const fileSetMetadata = fileSetNode.metadata as FileSetMetadata;
          fileSetMetadata.downstreamFileNodes.push(fileNode);
        } else {
          // Create a new file-set node if one doesn't already exist.
          const metadata: FileSetMetadata = {
            kind: "fileset",
            fileSet: fileSetMap.get(fileSetPath),
            externalFiles: upstreamExternalFiles,
            downstreamFileNodes: [fileNode],
          };
          fileSetNode = {
            id: fileSetNodeId,
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            metadata,
          };
          fileSetNodes.push(fileSetNode);
        }

        // Update the file node's upstream file set nodes with this new or updated file set node.
        if (
          !fileNodeMetadata.upstreamFileSetNodes.some(
            (node) => node.id === fileSetNode.id
          )
        ) {
          fileNodeMetadata.upstreamFileSetNodes.push(fileSetNode);
        }
      }
    );
  });

  console.log("FILE NODES", fileNodes);
  console.log("FILE SET NODES", fileSetNodes);

  // Generate the graph edge data, each edge of type `ElkExtendedEdge`
  const edges = allFiles.flatMap((file) => {
    return (file.derived_from || []).map((derivedFromPath) => {
      const fileId = file["@id"];
      const derivedFromId = derivedFromPath;
      return {
        id: `${pathToId(fileId)}-${pathToId(derivedFromId)}`,
        sources: [derivedFromId],
        targets: [fileId],
      } as ElkExtendedEdge;
    });
  });

  // Add nodes and edges to a copy of the static root node.
  return {
    ...rootElkNode,
    children: fileNodes,
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
