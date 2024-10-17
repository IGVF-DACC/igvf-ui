// node_modules
import * as d3Dag from "d3-dag";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Group } from "@visx/group";
import { LinkHorizontal } from "@visx/shape";
// components
import AliasList from "./alias-list";
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "./animation";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "./data-area";
import Modal from "./modal";
import { type PagePanelStates } from "./page-panels";
// root
import { type DatabaseObject } from "../globals.d";

/**
 * Width of a node in the graph in pixels.
 */
const NODE_WIDTH = 120;

/**
 * Height of a node in the graph in pixels.
 */
const NODE_HEIGHT = 40;

/**
 * Data structure common to all file object types.
 */
interface FileObject extends DatabaseObject {
  accession: string;
  aliases: string[];
  derived_from?: string[];
  file_format: string;
  file_set: string;
}

/**
 * Data structure common to all file set object types.
 */
interface FileSetObject extends DatabaseObject {
  file_set_type: string;
  files: string[];
}

// Represents a mapping of file set types to colors.
type FileSetTypeColorMap = {
  [key: string]: string;
};

// Maps file-set types to colors of nodes on the graph.
const fileSetTypeColorMap: FileSetTypeColorMap = {
  AnalysisSet: "#faafff",
  AuxiliarySet: "#60fa72",
  ConstructLibrarySet: "#fa608f",
  CuratedSet: "#faac60",
  MeasurementSet: "#60a5fa",
  ModelSet: "#f5fa60",
  ReferenceSet: "#60f5fa",
} as const;

/**
 * Data structure for a node in the graph. This matches the built-in d3-dag node data structure.
 * but adds an `accession` property for the file accession. I don't believe the built-in d3-dag
 * `DagNode` allows for additional properties, so I duplicate it here.
 * @property {string} id Unique identifier for the node
 * @property {string[]} parentIds List of unique identifiers for the parent nodes
 * @property {string} accession File accession
 * @property {string} fileSetType File set `@type`
 */
interface NodeData {
  id: string;
  parentIds: string[];
  file: FileObject;
  fileFileSet: FileSetObject;
}

/**
 * Generate d3-dag-compatible data from a list of files using their `derived_from` property.
 * @param files List of files to generate graph data from
 * @param fileFileSets List of file sets that the files belong to
 * @returns List of nodes with their parent nodes
 */
function generateGraphData(
  files: FileObject[],
  fileFileSets: FileSetObject[],
  derivedFromFiles: FileObject[]
) {
  // Combine the list of files from the file set with the upstream files outside the file set.
  const combinedFiles = files.concat(derivedFromFiles);

  // For each file in the graph, make a corresponding NodeData object.
  return combinedFiles.map((file) => {
    // Find the corresponding file set for the file based on `file.file_set`.
    const fileFileSet = fileFileSets.find(
      (fileSet) => fileSet["@id"] === file?.file_set["@id"]
    );

    const derivedFrom = file.derived_from
      ? file.derived_from.filter((derivedFromFilePath) => {
          return combinedFiles.some(
            (file) => file["@id"] === derivedFromFilePath
          );
        })
      : [];
    return {
      id: file["@id"],
      parentIds: derivedFrom,
      file,
      fileFileSet,
    } as NodeData;
  });
}

/**
 * Remove what would have appeared as isolated nodes in the graph, lacking any parent or child
 * nodes.
 * @param graphData List of nodes with their parent nodes
 * @returns List of nodes that either have parents or are parents of other nodes
 */
function trimIsolatedNodes(graphData: NodeData[]) {
  // Make a set of all parent IDs that appear across all nodes.
  const parentIds = new Set(graphData.flatMap((node) => node.parentIds));

  // Return only nodes with parents or that appear as parents of other nodes.
  return graphData.filter(
    (node) => node.parentIds.length > 0 || parentIds.has(node.id)
  );
}

/**
 * Display a modal with detailed information about a file when the user clicks on a node in the
 * graph.
 * @param pageFileSet File-set object for the page the user views
 * @param node Node that the user clicked on
 * @param onClose Callback to close the modal
 */
function FileModal({
  pageFileSet,
  node,
  onClose,
}: {
  pageFileSet: FileSetObject;
  node: NodeData;
  onClose: () => void;
}) {
  const { file, fileFileSet } = node;
  return (
    <Modal isOpen={true} onClose={onClose}>
      <Modal.Header onClose={onClose}>
        <Link href={file["@id"]} target="_blank" rel="noopener noreferrer">
          {file.accession}
        </Link>
      </Modal.Header>
      <DataPanel className="border-none">
        <DataArea>
          <>
            {file.aliases?.length > 0 && (
              <>
                <DataItemLabel>Aliases</DataItemLabel>
                <DataItemValue>
                  <AliasList aliases={file.aliases} />
                </DataItemValue>
              </>
            )}
            <DataItemLabel>Content Type</DataItemLabel>
            <DataItemValue>{file.content_type}</DataItemValue>
            <DataItemLabel>File Format</DataItemLabel>
            <DataItemValue>{file.file_format}</DataItemValue>
            <DataItemLabel>Summary</DataItemLabel>
            <DataItemValue>{file.summary}</DataItemValue>
            <DataItemLabel>File Set</DataItemLabel>
            <DataItemValue>
              {fileFileSet["@id"] !== pageFileSet["@id"] ? (
                <Link
                  href={fileFileSet["@id"]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {fileFileSet.accession}
                </Link>
              ) : (
                <>{fileFileSet.accession} (this file set)</>
              )}
            </DataItemValue>
          </>
        </DataArea>
      </DataPanel>
    </Modal>
  );
}

/**
 * Display a graph of file associations for a file set. The graph is a directed acyclic graph (DAG)
 * where each node represents a file and each edge represents a `derived_from` relationship between
 * files.
 * @param fileSet The file set object for the page the user views
 * @param graphData List of nodes to include in the graph
 */
function Graph({
  fileSet,
  graphData,
}: {
  fileSet: FileSetObject;
  graphData: NodeData[];
}) {
  // Holds the DAG to render after it has been loaded in the browser
  const [loadedDag, setLoadedDag] = useState<d3Dag.Dag<
    { id: string; parentIds: string[] },
    undefined
  > | null>(null);
  // Holds the height of the layout after it has been calculated
  const [layoutHeight, setLayoutHeight] = useState(0);
  // Holds the width of the layout after it has been calculated
  const [layoutWidth, setLayoutWidth] = useState(0);
  // Holds the node that the user has clicked on to display a modal
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  useEffect(() => {
    // useEffect hides the d3-dag code from the NextJS server because d3-dag requires the browser's
    // DOM to run.
    const dag = d3Dag.dagStratify()(graphData);
    const layout = d3Dag
      .sugiyama()
      .decross(d3Dag.decrossOpt())
      .layering(d3Dag.layeringLongestPath())
      .nodeSize((node) => {
        // Might have to play with the adjustment factors if you change the size of the nodes.
        return node ? [NODE_HEIGHT * 2, NODE_WIDTH * 1.8] : [0, 0];
      });
    const { width, height } = layout(dag as any);
    setLoadedDag(dag);

    // d3-dag sugiyama lays out the graph vertically, so swap the width and height to fit a
    // horizontal display.
    setLayoutHeight(width);
    setLayoutWidth(height);
  }, []);

  /**
   * Handle when the user clicks on a node in the graph to display a modal.
   * @param {NodeData} nodeData The node that the user clicked on
   */
  function onNodeClick(nodeData: NodeData) {
    setSelectedNode(nodeData);
  }

  return (
    loadedDag && (
      <div className="overflow-x-auto">
        <svg className="mx-auto" width={layoutWidth} height={layoutHeight}>
          <defs>
            <marker
              id="arrow"
              viewBox="0 -5 10 10"
              refX="20"
              refY="0"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
              fill="#000000"
            >
              <path d="M0,-5L10,0L0,5" />
            </marker>
          </defs>
          <Group top={0} left={0}>
            {loadedDag.links().map((link, i) => {
              return (
                <LinkHorizontal
                  key={`link-${i}`}
                  data={link}
                  stroke="#000000"
                  strokeWidth="1"
                  fill="none"
                  x={(node: any) => node.y - NODE_WIDTH / 2 + 10}
                  markerEnd="url(#arrow)"
                />
              );
            })}
            {loadedDag.descendants().map((node, i) => {
              const graphNode = node as d3Dag.DagNode<NodeData>;
              const background =
                fileSetTypeColorMap[graphNode.data.fileFileSet["@type"][0]] ||
                "#c0c0c0";
              return (
                <Group
                  key={i}
                  top={node.x}
                  left={node.y}
                  style={{ cursor: "pointer" }}
                  onClick={() => onNodeClick(node.data as NodeData)}
                >
                  <rect
                    height={NODE_HEIGHT}
                    width={NODE_WIDTH}
                    x={-NODE_WIDTH / 2}
                    y={-NODE_HEIGHT / 2}
                    fill={background}
                    opacity={1}
                    stroke="#505050"
                    strokeWidth={1}
                  />
                  <text
                    y="-3px"
                    fontSize={12}
                    textAnchor="middle"
                    fontWeight="bold"
                    fill="#000000"
                  >
                    {graphNode.data.file.accession}
                  </text>
                  <text
                    y="12px"
                    fontSize={12}
                    textAnchor="middle"
                    fill="#000000"
                  >
                    {graphNode.data.file.file_format}
                  </text>
                </Group>
              );
            })}
          </Group>
        </svg>
        {selectedNode && (
          <FileModal
            pageFileSet={fileSet}
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    )
  );
}

/**
 * Display a graph of the file associations for a file set in a collapsible panel. We use files in
 * `files` instead of those embedded in `fileSet` because the embedded file objects do not include
 * enough properties of the files to generate the graph.
 * @param fileSet The file set object the user views
 * @param files Files included directly in `fileSet`
 * @param derivedFromFiles Files in other file sets that `files` derive from
 * @param fileFileSets File sets aside from `fileSet` that `files` belong to
 * @param title Title that appears above the graph panel
 * @param pagePanels The page panels controller
 * @param pagePanelId The ID of the file-graph panel unique on the page
 */
export function FileGraph({
  fileSet,
  files,
  derivedFromFiles,
  fileFileSets,
  title = "File Association Graph",
  pagePanels,
  pagePanelId,
}: {
  fileSet: DatabaseObject;
  files: DatabaseObject[];
  fileFileSets: DatabaseObject[];
  derivedFromFiles: DatabaseObject[];
  title?: string;
  pagePanels: PagePanelStates;
  pagePanelId: string;
}) {
  const isExpanded = pagePanels.isExpanded(pagePanelId);

  const data = generateGraphData(
    files as FileObject[],
    fileFileSets as FileSetObject[],
    derivedFromFiles as FileObject[]
  );
  const trimmedData = trimIsolatedNodes(data);

  if (trimmedData.length > 0) {
    return (
      <>
        <DataAreaTitle>
          <DataAreaTitle.Expander
            pagePanels={pagePanels}
            pagePanelId={pagePanelId}
            label={`${title} table`}
          >
            {title}
          </DataAreaTitle.Expander>
        </DataAreaTitle>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="overflow-hidden"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              transition={standardAnimationTransition}
              variants={standardAnimationVariants}
            >
              <DataPanel>
                <Graph
                  fileSet={fileSet as FileSetObject}
                  graphData={trimmedData}
                />
              </DataPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }
}
