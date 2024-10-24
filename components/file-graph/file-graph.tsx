// node_modules
import * as d3Dag from "d3-dag";
import { AnimatePresence, motion } from "framer-motion";
import _ from "lodash";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { Group } from "@visx/group";
import { LinkHorizontal } from "@visx/shape";
import XXH from "xxhashjs";
// components
import AliasList from "../alias-list";
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "../animation";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../data-area";
import { FileAccessionAndDownload } from "../file-download";
import GlobalContext from "../global-context";
import Modal from "../modal";
import { type PagePanelStates } from "../page-panels";
import SessionContext from "../session-context";
import SortableGrid from "../sortable-grid";
import Status from "../status";
// lib
import { truncateText } from "../../lib/general";
// local
import { FileModal } from "./file-modal";
import {
  isFileNodeData,
  isFileSetNodeData,
  type FileNodeData,
  type FileNodeType,
  type FileSetNodeData,
  type FileSetNodeType,
  type NodeData,
} from "./types";
// root
import type {
  DatabaseObject,
  FileObject,
  FileSetObject,
} from "../../globals.d";

/**
 * Width of a node in the graph in pixels.
 */
const NODE_WIDTH = 150;

/**
 * Height of a node in the graph in pixels.
 */
const NODE_HEIGHT = 44;

/**
 * xxhashjs seed for hashing strings; generate randomly.
 */
const HASH_SEED = 0xe8c0f852;

// Represents a mapping of file set types to colors.
type FileSetTypeColorMap = {
  readonly [key: string]: { readonly light: string; readonly dark: string };
};

// Maps file-set types to colors of nodes on the graph.
const fileSetTypeColorMap: FileSetTypeColorMap = {
  AnalysisSet: { light: "#faafff", dark: "#733c77" },
  AuxiliarySet: { light: "#60fa72", dark: "#196021" },
  ConstructLibrarySet: { light: "#ff84aa", dark: "#852f4a" },
  CuratedSet: { light: "#faac60", dark: "#925112" },
  MeasurementSet: { light: "#7cc0ff", dark: "#777b00" },
  ModelSet: { light: "#f5fa60", dark: "#196a6d" },
  PredictionSet: { light: "#60f5fa", dark: "#60f5fa" },
  unknown: { light: "#c0c0c0", dark: "#606060" },
};

const filesColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => <FileAccessionAndDownload file={source} />,
  },
  {
    id: "file_format",
    title: "File Format",
    sorter: (item) => item.file_format.toLowerCase(),
  },
  {
    id: "content_type",
    title: "Content Type",
    sorter: (item) => item.content_type.toLowerCase(),
  },
  {
    id: "upload_status",
    title: "Upload Status",
    display: ({ source }) => <Status status={source.upload_status} />,
  },
];

/**
 * Generate d3-dag-compatible data from a list of files using their `derived_from` property.
 * @param nativeFiles Files belonging to the file set the user currently views
 * @param fileFileSets File sets that the `files` and `derivedFromFiles` belong to
 * @param derivedFromFiles Files that `files` derive from, including from other file sets
 * @returns List of nodes with their parent nodes
 */
function generateGraphData(
  nativeFiles: FileObject[],
  fileFileSets: FileSetObject[],
  derivedFromFiles: FileObject[]
) {
  const nativeFilePaths = nativeFiles.map((file) => file["@id"]);

  // Generate the graph node data for the native files.
  const graphData: NodeData[] = nativeFiles.map((nativeFile) => {
    // Initialize the node data for the native file.
    return {
      id: nativeFile["@id"],
      parentIds:
        nativeFile.derived_from?.filter((derivedFromPath) =>
          nativeFilePaths.includes(derivedFromPath)
        ) || [],
      type: "file" as FileNodeType,
      file: nativeFile,
      externalFiles: derivedFromFiles.filter(
        (derivedFile) => nativeFile.derived_from?.includes(derivedFile["@id"])
      ),
    } as FileNodeData;
  });

  // Generate the graph node data for the file sets for the external files that the native files
  // derive from.
  const fileSetNodes = graphData.reduce((acc, fileNode: FileNodeData) => {
    // Group the external files that the node's native file derives from by the file set path they
    // belong to.
    let nodes: FileSetNodeData[] = [];
    if (fileNode.externalFiles.length > 0) {
      // Group the external files of `fileNode` by the paths of the file set they belong to.
      const fileSetGroups = _.groupBy(
        fileNode.externalFiles,
        (file) => file.file_set["@id"]
      );

      // For each file set group, create a file set node and add it to the list of nodes.
      nodes = Object.entries(fileSetGroups).reduce(
        (fileSetNodeAcc, [fileSetPath, files]) => {
          const fileSet = fileFileSets.find(
            (fileSet) => fileSet["@id"] === fileSetPath
          );

          // Make a hash from the combined file paths in the file set. This lets us have multiple
          // file-set nodes for the same file set, but with a different set of files.
          const combinedFilePaths = files
            .map((file) => file["@id"])
            .sort()
            .join("");
          const hash = XXH.h32(combinedFilePaths, HASH_SEED).toString(16);
          const fileSetNodeId = `${fileSetPath}-${hash}`;

          // See if a file-set node already exists with the same file set path and hash.
          const fileSetNodeExists = Boolean(
            acc.find((node) => node.id === fileSetNodeId)
          );
          if (fileSetNodeExists) {
            // If a file-set node already exists, add its ID to the native file node's parent IDs.
            fileNode.parentIds.push(fileSetNodeId);
            return fileSetNodeAcc;
          }
          const newFileSetNode = {
            id: `${fileSetPath}-${hash}`,
            parentIds: [],
            type: "file-set" as FileSetNodeType,
            fileSet,
            files,
          } as FileSetNodeData;
          fileNode.parentIds.push(newFileSetNode.id);
          return fileSetNodeAcc.concat(newFileSetNode);
        },
        [] as FileSetNodeData[]
      );
    }
    return acc.concat(nodes);
  }, [] as FileSetNodeData[]);

  return graphData.concat(fileSetNodes);
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
 * File table for a file set modal.
 * @param files List of files to display in the table
 */
function FileSetFileTable({ files }: { files: FileObject[] }) {
  return (
    <SortableGrid
      data={files}
      columns={filesColumns}
      keyProp="@id"
      pager={{} as any}
    />
  );
}

/**
 * Collect a deduplicated list of all file set types that appear in the graph, given the node data
 * for the graph.
 * @param graphData All nodes in the graph, probably after trimming
 * @param fileSet File set object for the page the user is viewing
 * @returns List of file set types that appear in the graph
 */
function collectRelevantFileSetTypes(
  graphData: NodeData[],
  fileSet: FileSetObject
): string[] {
  const fileSetTypes = new Set<string>([fileSet["@type"][0]]);
  graphData.forEach((node) => {
    if (isFileSetNodeData(node)) {
      fileSetTypes.add(node.fileSet["@type"][0]);
    }
  });
  return [...fileSetTypes];
}

/**
 * Display a modal with detailed information about a file set when the user clicks on a node in the
 * graph.
 * @param node File-set node that the user clicked on
 * @param onClose Callback to close the modal
 */
function FileSetModal({
  node,
  onClose,
}: {
  node: FileSetNodeData;
  onClose: () => void;
}) {
  const { fileSet } = node;

  return (
    <Modal isOpen={true} onClose={onClose}>
      <Modal.Header onClose={onClose}>
        <div className="flex gap-1">
          <Link href={fileSet["@id"]} target="_blank" rel="noopener noreferrer">
            {fileSet.accession}
          </Link>
        </div>
      </Modal.Header>
      <DataPanel className="border-none">
        <DataArea>
          {fileSet.aliases?.length > 0 && (
            <>
              <DataItemLabel>Aliases</DataItemLabel>
              <DataItemValue>
                <AliasList aliases={fileSet.aliases} />
              </DataItemValue>
            </>
          )}
          {fileSet.summary && (
            <>
              <DataItemLabel>Summary</DataItemLabel>
              <DataItemValue>{fileSet.summary}</DataItemValue>
            </>
          )}
        </DataArea>
        <div className="mt-4">
          <FileSetFileTable files={node.files} />
        </div>
      </DataPanel>
    </Modal>
  );
}

/**
 * Draw the legend to show what colors correspond to each file set type.
 */
function Legend({ fileSetTypes }: { fileSetTypes: string[] }) {
  const { collectionTitles } = useContext<any>(SessionContext);
  const { darkMode } = useContext(GlobalContext);

  return (
    <div className="flex flex-wrap justify-center gap-1 border-t border-data-border py-2">
      {Object.entries(fileSetTypeColorMap).map(([fileSetType, color]) => {
        if (fileSetTypes.includes(fileSetType)) {
          return (
            <div
              key={fileSetType}
              className="flex items-center gap-0.5 border border-gray-800 px-1 text-sm text-black dark:border-gray-400 dark:text-white"
              style={{
                backgroundColor: darkMode.enabled ? color.dark : color.light,
              }}
            >
              {collectionTitles?.[fileSetType] || fileSetType}
            </div>
          );
        }
      })}
    </div>
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
  const { darkMode } = useContext(GlobalContext);
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
      .coord(d3Dag.coordGreedy())
      .decross(d3Dag.decrossOpt().large("medium"))
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
              className="fill-black dark:fill-white"
            >
              <path d="M0,-5L10,0L0,5" />
            </marker>
          </defs>
          <Group top={0} left={0}>
            {loadedDag.links().map((link, i) => {
              // Render the edges between nodes as lines.
              return (
                <LinkHorizontal
                  key={`link-${i}`}
                  data={link}
                  // stroke="#000000"
                  className="stroke-black dark:stroke-white"
                  strokeWidth="1"
                  fill="none"
                  x={(node: any) => node.y - NODE_WIDTH / 2 + 10}
                  markerEnd="url(#arrow)"
                />
              );
            })}
            {loadedDag.descendants().map((node, i) => {
              // Render the nodes as rectangles.
              const graphNode = node.data as NodeData;
              if (isFileNodeData(graphNode)) {
                const isNodeSelected = selectedNode?.id === graphNode.id;
                const background =
                  fileSetTypeColorMap[fileSet["@type"][0]] ||
                  fileSetTypeColorMap.unknown;
                const foreground = darkMode.enabled ? "#ffffff" : "#000000";
                return (
                  <Group
                    key={i}
                    top={node.x}
                    left={node.y}
                    style={{ cursor: "pointer" }}
                    onClick={() => onNodeClick(node.data as NodeData)}
                    tabIndex={0}
                    aria-label={`File ${graphNode.file.accession}, file format ${graphNode.file.file_format}, content type ${graphNode.file.content_type}`}
                  >
                    <rect
                      height={NODE_HEIGHT}
                      width={NODE_WIDTH}
                      x={-NODE_WIDTH / 2}
                      y={-NODE_HEIGHT / 2}
                      fill={
                        darkMode.enabled ? background.dark : background.light
                      }
                      opacity={1}
                      className="stroke-gray-800 dark:stroke-gray-400"
                      strokeWidth={1}
                    />
                    {isNodeSelected && (
                      <rect
                        height={NODE_HEIGHT + 8}
                        width={NODE_WIDTH + 8}
                        x={-NODE_WIDTH / 2 - 4}
                        y={-NODE_HEIGHT / 2 - 4}
                        fill="transparent"
                        opacity={1}
                        className="stroke-gray-800 dark:stroke-white"
                        strokeWidth={3}
                      />
                    )}
                    <text
                      y="-8px"
                      fontSize={12}
                      textAnchor="middle"
                      fontWeight="bold"
                      fill={foreground}
                    >
                      {graphNode.file.accession}
                    </text>
                    <text
                      y="6px"
                      fontSize={12}
                      textAnchor="middle"
                      fill={foreground}
                    >
                      {graphNode.file.file_format}
                    </text>
                    <text
                      y="18px"
                      fontSize={12}
                      textAnchor="middle"
                      fill={foreground}
                    >
                      {truncateText(graphNode.file.content_type, 24)}
                    </text>
                  </Group>
                );
              }
              if (isFileSetNodeData(graphNode)) {
                const isNodeSelected = selectedNode?.id === graphNode.id;
                const background =
                  fileSetTypeColorMap[graphNode.fileSet["@type"][0]] ||
                  fileSetTypeColorMap.unknown;
                const foreground = darkMode.enabled ? "#ffffff" : "#000000";
                return (
                  <Group
                    key={i}
                    top={node.x}
                    left={node.y}
                    style={{ cursor: "pointer" }}
                    onClick={() => onNodeClick(node.data as NodeData)}
                    tabIndex={0}
                    aria-label={`File set ${graphNode.fileSet.title}`}
                  >
                    <rect
                      height={NODE_HEIGHT}
                      width={NODE_WIDTH}
                      x={-NODE_WIDTH / 2}
                      y={-NODE_HEIGHT / 2}
                      rx={10}
                      ry={10}
                      fill={
                        darkMode.enabled ? background.dark : background.light
                      }
                      opacity={1}
                      className="stroke-gray-800 dark:stroke-gray-400"
                      strokeWidth={1}
                    />
                    {isNodeSelected && (
                      <rect
                        height={NODE_HEIGHT + 8}
                        width={NODE_WIDTH + 8}
                        x={-NODE_WIDTH / 2 - 4}
                        y={-NODE_HEIGHT / 2 - 4}
                        rx={10}
                        ry={10}
                        fill="transparent"
                        opacity={1}
                        className="stroke-gray-800 dark:stroke-white"
                        strokeWidth={3}
                      />
                    )}
                    <text
                      y="-4px"
                      fontSize={12}
                      textAnchor="middle"
                      fontWeight="bold"
                      fill={foreground}
                    >
                      {graphNode.fileSet.accession}
                    </text>
                    <text
                      y="12px"
                      fontSize={12}
                      textAnchor="middle"
                      fill={foreground}
                    >
                      {graphNode.files.length} files
                    </text>
                  </Group>
                );
              }
              return null;
            })}
          </Group>
        </svg>
        {selectedNode && isFileNodeData(selectedNode) && (
          <FileModal
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
        {selectedNode && isFileSetNodeData(selectedNode) && (
          <FileSetModal
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
  const relevantFileSetTypes = collectRelevantFileSetTypes(
    trimmedData,
    fileSet as FileSetObject
  );

  if (trimmedData.length > 0) {
    return (
      <section role="region" aria-labelledby="file-graph">
        <DataAreaTitle>
          <DataAreaTitle.Expander
            pagePanels={pagePanels}
            pagePanelId={pagePanelId}
            label={`${title} table`}
          >
            <div id="file-graph">{title}</div>
          </DataAreaTitle.Expander>
        </DataAreaTitle>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="overflow-hidden [&>div]:p-0"
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
                <Legend fileSetTypes={relevantFileSetTypes} />
              </DataPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    );
  }
}
