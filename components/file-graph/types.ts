// root
import type { FileObject, FileSetObject } from "../../globals.d";

/**
 * Largest number of nodes to display in the graph. Beyond this, display an error message.
 */
export const MAX_NODES_TO_DISPLAY = 70;

/**
 * Code that indicates an element of `NodeData` is a file node.
 */
const FILE_NODE_TYPE = "file";

/**
 * Code that indicates an element of `NodeData` is a file-set node.
 */
const FILE_SET_NODE_TYPE = "file-set";

/**
 * Indicates that a node in the graph represents a file.
 */
export type FileNodeType = typeof FILE_NODE_TYPE;

/**
 * Indicates that a node in the graph represents a file set.
 */
export type FileSetNodeType = typeof FILE_SET_NODE_TYPE;

/**
 * Represents a node in the graph. This matches the built-in d3-dag node data structure.
 * @property {string} id Unique identifier for the node
 * @property {string[]} parentIds List of unique identifiers for the parent nodes
 */
export interface GenericNodeData {
  id: string;
  parentIds: string[];
}

/**
 * Represents a node in the graph for a native file -- a file belonging to the file set the user is
 * viewing.
 * @property {FileNodeType} type Code indicating this node represents a file in the graph
 * @property {FileObject} file File object that this node represents
 * @property {FileObject[]} externalFiles Files in other file sets that this file derives from
 */
export interface FileNodeData extends GenericNodeData {
  type: FileNodeType;
  file: FileObject;
  externalFiles: FileObject[];
}

/**
 * Represents a node in the graph for an external file set -- a file set outside the one the user
 * is viewing that contains files that native files derive from.
 * @property type - Code indicating this node represents a file set in the graph
 * @property fileSet - File set object that this node represents
 * @property files - Files in the file set that a native file derives from
 * @property childFile - File that these files are input file sets for in the graph
 */
export interface FileSetNodeData extends GenericNodeData {
  type: FileSetNodeType;
  fileSet: FileSetObject;
  files: FileObject[];
  childFile: FileObject;
}

/**
 * A node in the graph that could represent a file or a file set.
 */
export type NodeData = FileNodeData | FileSetNodeData;

/**
 * Defines the colors of components of the file-set nodes in the graph. The `color` property
 * duplicates the light-mode color of the `fill` property, but is used for downloaded SVGs where
 * Tailwind CSS classes are not available.
 * @property fill - CSS class for the fill color of the node, like background color
 * @property bg - CSS class for the background color of the legend elements
 * @property bgCount - CSS class for the background color of the count in the legend elements
 * @property color - Hex color for the fill color of the node for downloaded SVGs
 */
export type FileSetTypeColorMapSpec = {
  readonly fill: string;
  readonly bg: string;
  readonly bgCount: string;
  readonly color: string;
};

/**
 * Represents a mapping of file set types to colors.
 */
export type FileSetTypeColorMap = {
  readonly [key: string]: FileSetTypeColorMapSpec;
};

/**
 * Basic statistics for file sets in the graph. Each key is a file set type, and the value is the
 * number of file sets of that type in the graph.
 */
export type FileSetStats = {
  [key: string]: number;
};

/**
 * d3-dag error messages sometimes contain a JSON string that can be parsed to an object. This type
 * describes a portion of that object.
 */
export type D3DagErrorObject = {
  id: string;
};

/**
 * Maps file-set types to colors of nodes on the graph.
 */
export const fileSetTypeColorMap: FileSetTypeColorMap = {
  AnalysisSet: {
    fill: "fill-file-graph-analysis",
    bg: "bg-file-graph-analysis",
    bgCount: "bg-file-graph-analysis-count",
    color: "#faafff",
  },
  AuxiliarySet: {
    fill: "fill-file-graph-auxiliary",
    bg: "bg-file-graph-auxiliary",
    bgCount: "bg-file-graph-auxiliary-count",
    color: "#60fa72",
  },
  ConstructLibrarySet: {
    fill: "fill-file-graph-construct-library",
    bg: "bg-file-graph-construct-library",
    bgCount: "bg-file-graph-construct-library-count",
    color: "#ff84aa",
  },
  CuratedSet: {
    fill: "fill-file-graph-curated",
    bg: "bg-file-graph-curated",
    bgCount: "bg-file-graph-curated-count",
    color: "#faac60",
  },
  MeasurementSet: {
    fill: "fill-file-graph-measurement",
    bg: "bg-file-graph-measurement",
    bgCount: "bg-file-graph-measurement-count",
    color: "#7cc0ff",
  },
  ModelSet: {
    fill: "fill-file-graph-model",
    bg: "bg-file-graph-model",
    bgCount: "bg-file-graph-model-count",
    color: "#f5fa60",
  },
  PredictionSet: {
    fill: "fill-file-graph-prediction",
    bg: "bg-file-graph-prediction",
    bgCount: "bg-file-graph-prediction-count",
    color: "#60f5fa",
  },
  unknown: {
    fill: "fill-file-graph-unknown",
    bg: "bg-file-graph-unknown",
    bgCount: "bg-file-graph-unknown-count",
    color: "#c0c0c0",
  },
};

/**
 * Determine if a node is a file node or not.
 * @param node Node to test whether it's a file node
 * @returns True if the node is a file node, false otherwise
 */
export function isFileNodeData(node: NodeData): node is FileNodeData {
  return node.type === FILE_NODE_TYPE;
}

/**
 * Determine if a node is a file-set node or not.
 * @param node Node to test whether it's a file-set node
 * @returns True if the node is a file-set node, false otherwise
 */
export function isFileSetNodeData(node: NodeData): node is FileSetNodeData {
  return node.type === FILE_SET_NODE_TYPE;
}
