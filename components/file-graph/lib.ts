// node_modules
import type { ElkNode, ElkExtendedEdge } from "elkjs/lib/elk-api";
import _ from "lodash";
import XXH from "xxhashjs";
import { type Edge, type Node } from "@xyflow/react";
// lib
import { pathToId } from "../../lib/general";
import { type QualityMetricObject } from "../../lib/quality-metric";
// local
import {
  fileSetTypeColorMap,
  fileTypeColorMap,
  isFileSetNodeMetadata,
  NODE_KINDS,
  type ElkNodeEx,
  type FileMetadata,
  type FileSetMetadata,
  type FileSetStats,
  type NodeMetadata,
} from "./types";
// root
import { FileObject, FileSetObject } from "../../globals.d";

/**
 * Width of a node in the graph in pixels.
 */
export const NODE_WIDTH = 156;

/**
 * Height of a node in the graph in pixels.
 */
export const NODE_HEIGHT = 60;

/**
 * Maximum number of characters to display in one line of a node label.
 */
export const MAX_LINE_LENGTH = 24;

/**
 * xxhashjs seed for hashing strings; generated randomly.
 */
const HASH_SEED = 0xe8c0f852;

/**
 * Padding (in pixels) added around SVG export content for visual spacing.
 */
const SVG_CONTENT_PADDING = 5;

/**
 * Static root node of ELK graph.
 */
const rootElkNode: ElkNodeEx = {
  id: "root",
  layoutOptions: {
    "org.eclipse.elk.algorithm": "layered",
    "org.eclipse.elk.layered.edgeRouting": "POLYLINE",
    "org.eclipse.elk.direction": "RIGHT",
    "org.eclipse.elk.layered.hierarchyHandling": "INCLUDE_CHILDREN",
    "org.eclipse.elk.layered.nodePlacement.favorStraightEdges": "true",
    "org.eclipse.elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
    "org.eclipse.elk.padding": "[top=4,left=4,bottom=4,right=4]",
    "org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers": "100", // Horizontal gaps
    "org.eclipse.elk.spacing.componentComponent": "30", // Vertical gaps between disconnected groups of nodes
    "org.eclipse.elk.spacing.nodeNode": "30", // Vertical gaps between nodes in a group
    "org.eclipse.elk.layered.spacing.edgeNode": "50", // Space between edges and nodes
  },
  children: [],
  edges: [],
};

/**
 * Remove files that would appear as isolated nodes in the graph (no connections to other files).
 *
 * A file is kept if it either:
 * - derives from other files (has incoming edges - is a target)
 * - other files derive from it (has outgoing edges - is a source)
 *
 * @param nativeFiles - Native file objects to filter
 * @param externalFiles - External derived-from file objects used in the graph
 * @returns Native file objects that have connections to other files in the graph
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
 * Collect all the file-set types that appear in `nodes` and return them along with a count of the
 * number of times each type appears in `nodes`.
 *
 * @param nodes - All nodes in the graph after trimming isolated nodes
 * @returns Object with file-set types as keys and the count of each type in `nodes` as values
 */
export function collectRelevantFileSetStats(
  nodes: Node<NodeMetadata>[]
): FileSetStats {
  // Make an array of file set types. Include duplicates because we need those to count.
  const fileSetTypes = nodes.reduce((acc, node) => {
    if (isFileSetNodeMetadata(node.data)) {
      return acc.concat(node.data.fileSet["@type"][0]);
    }
    return acc;
  }, [] as string[]);

  // Count the occurrences of each file-set type.
  return _.countBy(fileSetTypes) as FileSetStats;
}

/**
 * Find all external files that the given native files derive from.
 *
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
 *
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
 * hash, appended to the file-set accession, ensuring each file-set node ID is unique even if
 * multiple represent the same file set but with different external files.
 *
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
 * Generate ELK file nodes for the graph.
 *
 * @param nativeFiles - List of native files
 * @param externalFiles - List of external files
 * @param referenceFiles - List of reference files
 * @param qualityMetrics - Quality metric objects for all files
 * @returns List of native file nodes
 */
function generateFileNodes(
  nativeFiles: FileObject[],
  externalFiles: FileObject[],
  referenceFiles: FileObject[],
  qualityMetrics: QualityMetricObject[]
): ElkNodeEx[] {
  return nativeFiles.map((nativeFile) => {
    // Get the native and external files that the current file derives from.
    const { upstreamNativeFiles, upstreamExternalFiles } = getUpstreamFiles(
      nativeFile,
      nativeFiles,
      externalFiles
    );

    // Get all quality metric objects associated with the current file.
    const fileQualityMetrics = qualityMetrics.filter((metric) =>
      (metric.quality_metric_of as string[]).includes(nativeFile["@id"])
    );

    // Get all reference-file objects associated with the current file.
    const fileReferenceFiles = referenceFiles.filter((referenceFile) =>
      (nativeFile.reference_files as string[])?.includes(referenceFile["@id"])
    );

    // Initialize the node data for the native file.
    return {
      id: nativeFile["@id"],
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      metadata: {
        kind: NODE_KINDS.FILE,
        file: nativeFile,
        upstreamNativeFiles,
        upstreamExternalFiles,
        upstreamFileSetNodes: [],
        referenceFiles: fileReferenceFiles,
        qualityMetrics: fileQualityMetrics,
      } satisfies FileMetadata,
    } satisfies ElkNodeEx;
  });
}

/**
 * Generate ELK file-set nodes for the graph.
 *
 * @param fileNodes - Previously generated file nodes
 * @param fileFileSets - File-set objects to add to file-set node metadata
 * @returns File-set nodes to add to the ELK graph
 */
function generateFileSetNodes(
  fileNodes: ElkNodeEx[],
  fileFileSets: FileSetObject[]
): ElkNodeEx[] {
  // Map a file-set path to its file-set object for easy lookup.
  const fileSetMap = new Map(
    fileFileSets.map((fileFileSet) => [fileFileSet["@id"], fileFileSet])
  );

  // This map accumulates file-set nodes to return as a function result. It uses the calculated
  // file-set node ID to map to the corresponding ElkNodeEx value.
  const fileSetNodes = new Map<string, ElkNodeEx>();

  // Each file node serves as a basis for generating its upstream file-set nodes.
  fileNodes.forEach((fileNode) => {
    const fileNodeMetadata = fileNode.metadata as FileMetadata;
    const upstreamExternalFiles = fileNodeMetadata.upstreamExternalFiles;

    // Easy look-up table for each added file-set node ID.
    const addedFileSetNodeIds = new Set<string>();

    // Group external files the current file node derives from by their file set's path. We'll
    // generate one file-set node for each group.
    const externalFilesByFileSet = _.groupBy(
      upstreamExternalFiles,
      (externalFile) => externalFile.file_set["@id"]
    );

    // Process file-set nodes for each file set group, with each group representing a unique
    // combination of a file set and its external files (external to the viewed file set).
    Object.entries(externalFilesByFileSet).forEach(
      ([fileSetPath, externalFiles]) => {
        // Find an already-added file-set node with a matching path and combination of external
        // files. Do this through the file-set node ID which combines the file-set path and all the
        // external files' IDs combined into a single hash.
        const fileSetNodeId = generateFileSetNodeId(fileSetPath, externalFiles);
        let fileSetNode = fileSetNodes.get(fileSetNodeId);

        if (!fileSetNode) {
          // A file-set node with the same combination of external files doesn't already exist.
          // Create a new file-set node and add it to the accumulating list of file-set nodes.
          fileSetNode = {
            id: fileSetNodeId,
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            metadata: {
              kind: NODE_KINDS.FILESET,
              fileSet: fileSetMap.get(fileSetPath),
              externalFiles,
              downstreamFile: (fileNode.metadata as FileMetadata).file,
            } satisfies FileSetMetadata,
          };
          fileSetNodes.set(fileSetNodeId, fileSetNode);
        }

        // Update the current file node's upstream file-set nodes with this new or updated file-set
        // node.
        if (!addedFileSetNodeIds.has(fileSetNode.id)) {
          fileNodeMetadata.upstreamFileSetNodes.push(fileSetNode);
          addedFileSetNodeIds.add(fileSetNode.id);
        }
      }
    );
  });
  return [...fileSetNodes.values()];
}

/**
 * Generate edges between file and file-set nodes based on their relationships described by every
 * node's metadata.
 *
 * @param nodes - The file and file-set nodes to generate edges for
 * @returns Edges connecting the file nodes
 */
function generateEdges(fileNodes: ElkNodeEx[]): ElkExtendedEdge[] {
  const edges: ElkExtendedEdge[] = [];
  fileNodes.forEach((fileNode) => {
    const fileNodeMetadata = fileNode.metadata as FileMetadata;

    // Create edges from upstream native files to this file.
    fileNodeMetadata.upstreamNativeFiles.forEach((nativeFile) => {
      edges.push({
        id: `${pathToId(nativeFile["@id"])}-${fileNode.id}`,
        sources: [nativeFile["@id"]],
        targets: [fileNode.id],
      });
    });

    // Create edges from upstream file set nodes to this file.
    fileNodeMetadata.upstreamFileSetNodes.forEach((fileSetNode) => {
      edges.push({
        id: `${fileSetNode.id}-${fileNode.id}`,
        sources: [fileSetNode.id],
        targets: [fileNode.id],
      });
    });
  });
  return edges;
}

/**
 * Generate ELK-compatible data from a list of files using their `derived_from` property.
 * `nativeFiles` has already had its isolated files trimmed.
 *
 * @param nativeFiles - Files belonging to the file set the user currently views
 * @param externalFiles - Files in other file sets that `nativeFiles` derive from
 * @param fileFileSets - File sets that the `files` and `derivedFromFiles` belong to
 * @param referenceFiles - Files that are referenced by `nativeFiles`
 * @param qualityMetrics - Quality metric objects for all files in the file graph
 * @returns ELK graph data with nodes and edges, or null if no graph can be generated
 */
export function generateGraphData(
  nativeFiles: FileObject[],
  externalFiles: FileObject[],
  fileFileSets: FileSetObject[],
  referenceFiles: FileObject[],
  qualityMetrics: QualityMetricObject[]
): ElkNodeEx | null {
  if (nativeFiles.length > 0) {
    // Generate a list of external file objects that nativeFiles derives from. These don't appear in
    // the graph -- the file sets they belong to do.
    const usedExternalFiles = findUsedExternalFiles(externalFiles, nativeFiles);

    // Generate the graph node data for the native files and file sets.
    const fileNodes = generateFileNodes(
      nativeFiles,
      usedExternalFiles,
      referenceFiles,
      qualityMetrics
    );
    const fileSetNodes = generateFileSetNodes(fileNodes, fileFileSets);

    // Generate the graph edges between the file nodes and file-set nodes.
    const edges = generateEdges(fileNodes);

    // Add nodes and edges to a copy of the static root node.
    return {
      ...rootElkNode,
      children: [...fileNodes, ...fileSetNodes],
      edges,
    } as ElkNode;
  }

  // No nodes available for graphing.
  return null;
}

/**
 * Find the quality metrics for a file from the list of quality metrics for all files in the file
 * graph.

 * @param file - The file object to get the quality metrics for
 * @param qualityMetrics - Full quality metrics objects for all files in the file set
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
 * Converts ELK nodes to React Flow nodes. As this can involve multiple levels of hierarchy, the
 * `parentId` parameter is used to maintain the correct parent-child relationships. This uses
 * recursion to process all child nodes, returning them as a flat array with group nodes positioned
 * before their children.
 *
 * @param elkNodes - Nodes from the `children` property of an ELK object
 * @param parentId - ID of the parent node if `elkNodes` are children of a node
 * @returns Array of React Flow nodes ready to pass to <ReactFlow />
 */
function elkToReactFlowNodes(
  elkNodes: ElkNodeEx[],
  parentId = ""
): Node<NodeMetadata>[] {
  const rfNodes: Node<NodeMetadata>[] = [];
  elkNodes.forEach((elkNode) => {
    const elkNodeMetadata = elkNode.metadata;

    // Generate a React Flow node and add it to the cumulative array.
    const rfNode: Node<NodeMetadata> = {
      id: elkNode.id,
      type: elkNodeMetadata.kind,
      data: elkNode.metadata,
      position: { x: elkNode.x, y: elkNode.y },
      width: elkNode.width,
      height: elkNode.height,
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
 *
 * @param elkNodes - Nodes from the `children` property of an ELK object
 * @returns Array of React Flow edges ready to pass to <ReactFlow />
 */
function elkToReactFlowEdges(elkNodes: ElkNode) {
  const rfEdges: Edge[] = [];
  elkNodes.edges.forEach((edge) => {
    // Skip edges belonging to groups. We don't yet support this, but we will.
    if (!edge.id.startsWith("__layout__")) {
      const rfEdge: Edge = {
        id: edge.id,
        source: edge.sources[0],
        target: edge.targets[0],
      };
      rfEdges.push(rfEdge);
    }
  });
  return rfEdges;
}

/**
 * Converts an ELK graph to React Flow format. You can pass the `nodes` and `edges` directly to
 * <ReactFlow /> to render the graph.
 *
 * @param elkGraph - The ELK graph to convert
 * @returns An object containing the converted nodes and edges
 */
export function elkToReactFlow(elkGraph: ElkNodeEx): {
  nodes: Node<NodeMetadata>[];
  edges: Edge[];
} {
  const nodes = elkToReactFlowNodes(elkGraph.children || []);
  const edges = elkToReactFlowEdges(elkGraph);
  return { nodes, edges };
}

/**
 * Counts the number of file nodes in the graph.
 *
 * @param nodes - Array of React Flow nodes
 * @returns Number of file nodes
 */
export function countFileNodes(nodes: Node<NodeMetadata>[]): number {
  return nodes.filter((node) => node.data.kind === NODE_KINDS.FILE).length;
}

/**
 * Generate SVG content for the current file graph that can then be downloaded. This function must
 * run in the browser after ReactFlow has rendered the graph DOM. It queries the rendered elements
 * to extract SVG content.
 *
 * @param graphId - ID of the graph container element in case we have multiple graphs on the page
 * @returns SVG content as a string that can be downloaded
 */
export function generateSVGContent(graphId: string): string | undefined {
  // Get ReactFlow's rendered SVG elements within the specified container.
  const graphContainer = document.getElementById(graphId);
  const reactFlowRenderer = graphContainer?.querySelector(
    ".react-flow__renderer"
  );

  if (!reactFlowRenderer) {
    console.error("ReactFlow renderer not found for graphId:", graphId);
    return;
  }

  // Get all node elements and calculate viewport bounds from ReactFlow.
  const viewportElement = reactFlowRenderer.querySelector(
    ".react-flow__viewport"
  );

  // Use the viewport's bounding box for dimensions (it contains all positioned content).
  const viewportBounds = viewportElement?.getBoundingClientRect();
  const contentWidth = viewportBounds?.width || 800;
  const contentHeight = viewportBounds?.height || 600;

  // Add padding to all sides: left/right and top/bottom
  const width = contentWidth + SVG_CONTENT_PADDING * 2;
  const height = contentHeight + SVG_CONTENT_PADDING * 2;

  // Generate SVG header with calculated dimensions and viewBox starting at negative padding.
  let svgContent = `<?xml version="1.0" encoding="UTF-8"?><svg width="${width}px" height="${height}px" viewBox="${-SVG_CONTENT_PADDING} ${-SVG_CONTENT_PADDING} ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Add edge paths to the accumulating SVG text.
  const edgePathElements = reactFlowRenderer.querySelectorAll(
    ".react-flow__edge path"
  );
  const edgePathElementArray = Array.from(edgePathElements);
  svgContent += edgePathElementArray.reduce((acc, pathElement) => {
    const d = pathElement.getAttribute("d");
    const stroke = pathElement.getAttribute("stroke") || "#6b7280";
    const strokeWidth = pathElement.getAttribute("stroke-width") || "1";
    return d
      ? `${acc} <path d="${d}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none"/>\n`
      : acc;
  }, "");

  // Add arrowheads to the accumulating SVG text.
  const edgeArrowheadElements = reactFlowRenderer.querySelectorAll(
    ".react-flow__edge polygon"
  );
  const edgeArrowheadElementArray = Array.from(edgeArrowheadElements);
  svgContent += edgeArrowheadElementArray.reduce((acc, polygonElement) => {
    const points = polygonElement.getAttribute("points");
    const fill = polygonElement.getAttribute("fill") || "#6b7280";
    return points
      ? `${acc}  <polygon points="${points}" fill="${fill}"/>\n`
      : acc;
  }, "");

  // Add nodes by copying the rendered SVG node elements from the DOM.
  const nodeElements = reactFlowRenderer.querySelectorAll("[data-id]");
  Array.from(nodeElements).forEach((nodeElement) => {
    const svgElement = nodeElement.querySelector("svg");
    if (!svgElement) {
      return;
    }

    // Get position from the node element's style.transform
    const transform = (nodeElement as HTMLElement).style.transform;
    const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
    const x = match ? parseFloat(match[1]) : 0;
    const y = match ? parseFloat(match[2]) : 0;

    // Check if this is a file set node by looking for the data attribute
    const isFileSetNode = svgElement.hasAttribute("data-fileset-type");

    // Determine colors based on node type.
    let nodeColors;
    if (isFileSetNode) {
      const fileSetType = svgElement.getAttribute("data-fileset-type") || "";
      nodeColors =
        fileSetTypeColorMap[fileSetType] || fileSetTypeColorMap.unknown;
    } else {
      nodeColors = fileTypeColorMap;
    }

    // Replace font specifications from the DOM with ones that should work in most SVG viewers.
    const svgContentInner = svgElement.innerHTML
      .replace(
        /<text([^>]*)>/g,
        '<text$1 font-family="Helvetica, Arial, sans-serif">'
      )
      .replace(/(<text[^>]*)\s+class="[^"]*"([^>]*>)/g, "$1$2");

    // Add background rect and content.
    const cleanSvg = isFileSetNode
      ? `<rect x="0" y="0" width="${NODE_WIDTH}" height="${NODE_HEIGHT}" rx="${NODE_HEIGHT / 2}" fill="${nodeColors.bgColor}" stroke="${nodeColors.borderColor}" stroke-width="1"/>${svgContentInner}`
      : `<rect x="0" y="0" width="${NODE_WIDTH}" height="${NODE_HEIGHT}" fill="${nodeColors.bgColor}" stroke="${nodeColors.borderColor}" stroke-width="1"/>${svgContentInner}`;

    svgContent += `  <g transform="translate(${x}, ${y})">${cleanSvg}</g>\n`;
  });

  // Close the SVG element. We now have the entire SVG to download as a string.
  svgContent += "</svg>";
  return svgContent;
}
