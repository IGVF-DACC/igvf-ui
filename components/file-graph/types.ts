// node_modules
import type { ElkNode } from "elkjs/lib/elk-api";
// lib
import { QualityMetricObject } from "../../lib/quality-metric";
// root
import type { FileObject, FileSetObject } from "../../globals.d";

/**
 * Constants for node metadata kinds.
 */
export const NODE_KINDS = {
  FILE: "file",
  FILESET: "fileset",
} as const;

/**
 * Type for node kind values.
 */
export type NodeKind = (typeof NODE_KINDS)[keyof typeof NODE_KINDS];

/**
 * Metadata to attach to each ELK and React Flow file node.
 * @property kind - Kind of the node to determine if this is for a file set node or a file node
 * @property file - File object associated with this node
 * @property upstreamNativeFiles - Native files that this file derives from
 * @property upstreamExternalFiles - External files that this file derives from
 * @property upstreamFileSetNodes - File set nodes that `upstreamExternalFiles` belong to
 * @property referenceFiles - Files that are referenced by this file
 * @property qualityMetrics - Quality-metric objects for this file
 */
export type FileMetadata = {
  kind: typeof NODE_KINDS.FILE;
  file: FileObject;
  upstreamNativeFiles: FileObject[];
  upstreamExternalFiles: FileObject[];
  upstreamFileSetNodes: ElkNodeEx[];
  referenceFiles: FileObject[];
  qualityMetrics: QualityMetricObject[];
};

/**
 * Metadata to attach to each ELK and React Flow file set node.
 * @property kind - Kind of the node to determine if this is for a file set node or a file node
 * @property fileSet - File set object associated with this node
 * @property externalFiles - Files associated with this file set that downstream file derives from
 * @property downstreamFile - Downstream file deriving from `externalFiles` in this file set
 */
export type FileSetMetadata = {
  kind: typeof NODE_KINDS.FILESET;
  fileSet: FileSetObject;
  externalFiles: FileObject[];
  downstreamFile: FileObject;
};

/**
 * Metadata to attach to each ELK and React Flow node regardless of its kind.
 */
export type NodeMetadata = FileMetadata | FileSetMetadata;

/**
 * Extended ElkNode interface that includes metadata. You see `metadata` on every node representing
 * a file or file set in the graph, but not for the root node nor group nodes.
 */
export interface ElkNodeEx extends ElkNode {
  metadata?: NodeMetadata;
}

/**
 * Defines the colors of components of the file and file-set nodes in the graph. The `bgColor` and
 * `borderColor` properties duplicate the light-mode colors of the `bg` and `border` properties,
 * but is used for downloaded SVGs where Tailwind CSS classes are not available.
 *
 * @property bg - CSS class for the background color of the nodes and legend elements
 * @property bgCount - CSS class for the background color of the count in the legend elements
 * @property border - CSS class for the border color of the legend elements
 * @property bgColor - Hex color for the background color of the node for downloaded SVGs
 * @property borderColor - Hex color for the border color of the node for downloaded SVGs
 */
export type ColorMapSpec = {
  readonly bg: string;
  readonly bgCount: string;
  readonly border: string;
  readonly bgColor: string;
  readonly borderColor: string;
};

/**
 * Represents a mapping of file-set types to colors.
 */
export type FileSetTypeColorMap = {
  readonly [key: string]: ColorMapSpec;
};

/**
 * Basic statistics for file sets in the graph. Each key is a file-set type, and the value is the
 * number of file sets of that type in the graph. Add to this type if we ever get new file-set
 * types.
 */
export type FileSetStats = {
  AnalysisSet?: number;
  AuxiliarySet?: number;
  ConstructLibrarySet?: number;
  CuratedSet?: number;
  MeasurementSet?: number;
  ModelSet?: number;
  PredictionSet?: number;
  unknown?: number;
};

/**
 * Maps file-set types to colors of nodes on the graph.
 */
export const fileSetTypeColorMap: FileSetTypeColorMap = {
  AnalysisSet: {
    bg: "bg-file-graph-analysis",
    bgCount: "bg-file-graph-analysis-count",
    border: "border-file-graph-analysis",
    bgColor: "#faafff",
    borderColor: "#b770bd",
  },
  AuxiliarySet: {
    bg: "bg-file-graph-auxiliary",
    bgCount: "bg-file-graph-auxiliary-count",
    border: "border-file-graph-auxiliary",
    bgColor: "#60fa72",
    borderColor: "#00b629",
  },
  ConstructLibrarySet: {
    bg: "bg-file-graph-construct-library",
    bgCount: "bg-file-graph-construct-library-count",
    border: "border-file-graph-construct-library",
    bgColor: "#ff84aa",
    borderColor: "#bd4871",
  },
  CuratedSet: {
    bg: "bg-file-graph-curated",
    bgCount: "bg-file-graph-curated-count",
    border: "border-file-graph-curated",
    bgColor: "#faac60",
    borderColor: "#bc721e",
  },
  MeasurementSet: {
    bg: "bg-file-graph-measurement",
    bgCount: "bg-file-graph-measurement-count",
    border: "border-file-graph-measurement",
    bgColor: "#7cc0ff",
    borderColor: "#4588c4",
  },
  ModelSet: {
    bg: "bg-file-graph-model",
    bgCount: "bg-file-graph-model-count",
    border: "border-file-graph-model",
    bgColor: "#f5fa60",
    borderColor: "#aeb000",
  },
  PredictionSet: {
    bg: "bg-file-graph-prediction",
    bgCount: "bg-file-graph-prediction-count",
    border: "border-file-graph-prediction",
    bgColor: "#60f5fa",
    borderColor: "#00afb4",
  },
  unknown: {
    bg: "bg-file-graph-unknown",
    bgCount: "bg-file-graph-unknown-count",
    border: "border-file-graph-unknown",
    bgColor: "#c0c0c0",
    borderColor: "#868686",
  },
};

/**
 * Color map for file nodes in the graph. This is really only used for downloaded SVGs because the
 * Tailwind CSS classes have names we can use directly.
 */
export const fileTypeColorMap: ColorMapSpec = {
  bg: "bg-file-graph-file",
  bgCount: "bg-file-graph-file-count",
  border: "border-file-graph-file",
  bgColor: "#e0e0e0",
  borderColor: "#606060",
};

/**
 * Type guard to determine if a node is a file node or not.
 * @param node Node to test whether it's a file node
 * @returns True if the node is a file node, false otherwise
 */
export function isFileNodeMetadata(
  metadata: NodeMetadata
): metadata is FileMetadata {
  return metadata.kind === NODE_KINDS.FILE;
}

/**
 * Type guard to determine if a node is a file-set node or not.
 * @param node Node to test whether it's a file-set node
 * @returns True if the node is a file-set node, false otherwise
 */
export function isFileSetNodeMetadata(
  node: NodeMetadata
): node is FileSetMetadata {
  return node.kind === NODE_KINDS.FILESET;
}
