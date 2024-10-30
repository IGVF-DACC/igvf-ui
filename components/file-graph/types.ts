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
 * @property {FileSetNodeType} type Code indicating this node represents a file set in the graph
 * @property {FileSetObject} fileSet File set object that this node represents
 * @property {FileObject[]} files Files in the file set that a native file derives from
 */
export interface FileSetNodeData extends GenericNodeData {
  type: FileSetNodeType;
  fileSet: FileSetObject;
  files: FileObject[];
}

/**
 * A node in the graph that could represent a file or a file set.
 */
export type NodeData = FileNodeData | FileSetNodeData;

/**
 * Represents a mapping of file set types to colors.
 */
type FileSetTypeColorMap = {
  readonly [key: string]: { readonly fill: string; readonly bg: string };
};

/**
 * Maps file-set types to colors of nodes on the graph.
 */
export const fileSetTypeColorMap: FileSetTypeColorMap = {
  AnalysisSet: {
    fill: "fill-file-graph-analysis",
    bg: "bg-file-graph-analysis",
  },
  AuxiliarySet: {
    fill: "fill-file-graph-auxiliary",
    bg: "bg-file-graph-auxiliary",
  },
  ConstructLibrarySet: {
    fill: "fill-file-graph-construct-library",
    bg: "bg-file-graph-construct-library",
  },
  CuratedSet: { fill: "fill-file-graph-curated", bg: "bg-file-graph-curated" },
  MeasurementSet: {
    fill: "fill-file-graph-measurement",
    bg: "bg-file-graph-measurement",
  },
  ModelSet: { fill: "fill-file-graph-model", bg: "bg-file-graph-model" },
  PredictionSet: {
    fill: "fill-file-graph-prediction",
    bg: "bg-file-graph-prediction",
  },
  unknown: { fill: "fill-file-graph-unknown", bg: "bg-file-graph-unknown" },
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
