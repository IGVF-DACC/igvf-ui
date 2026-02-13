// node_modules
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs/lib/elk-api";
import _ from "lodash";
import { CSSProperties, Fragment, useEffect, useState } from "react";
import {
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
// components
import Checkbox from "../checkbox";
import { DataAreaTitle, DataPanel } from "../data-area";
import Link from "../link-no-prefetch";
import { QualityMetricModal } from "../quality-metric";
import SeparatedList from "../separated-list";
import { Tooltip, TooltipRef, useTooltip } from "../tooltip";
// lib
import { truncateText } from "../../lib/general";
import { type QualityMetricObject } from "../../lib/quality-metric";
// local
import { detectCycles } from "./detect-cycles";
import { DownloadTrigger } from "./download";
import { FileModal } from "./file-modal";
import { FileSetModal } from "./file-set-modal";
import { Legend } from "./legend";
import {
  collectRelevantFileSetStats,
  countFileNodes,
  elkToReactFlow,
  generateGraphData,
  generateIncludedFiles,
  MAX_LINE_LENGTH,
  NODE_HEIGHT,
  NODE_WIDTH,
  trimArchivedFiles,
} from "./lib";
import { NodeStatus } from "./status";
import {
  fileSetTypeColorMap,
  isFileNodeMetadata,
  isFileSetNodeMetadata,
  NODE_KINDS,
  type FileMetadata,
  type FileSetMetadata,
  type NodeMetadata,
} from "./types";
// root
import type { FileObject, FileSetObject } from "../../globals.d";
import "@xyflow/react/dist/style.css";

/**
 * Directs node rendering to the appropriate components.
 */
const nodeTypes = {
  [NODE_KINDS.FILE]: FileNodeContent,
  [NODE_KINDS.FILESET]: FileSetNodeContent,
};

/**
 * Directs edge rendering to use custom arrowheads.
 */
const edgeTypes = {
  default: CustomArrowEdge,
};

/**
 * Padding around the graph in pixels.
 */
const GRAPH_PADDING = 5;

/**
 * Position of the first line of text in a file node.
 */
const FILE_NODE_TOP_LINE_POSITION = 20;

/**
 * Position of the first line of text in a file-set node.
 */
const FILESET_NODE_TOP_LINE_POSITION = 20;

/**
 * Height of each line of text in a node.
 */
const NODE_LINE_HEIGHT = 13;

/**
 * Padding of the container around the graph.
 */
const CONTAINER_PADDING = 16;

/**
 * Styles for the node handles. This puts the handles in the correct place for the edges to hook up
 * to, but hidden to avoid visual clutter.
 */
const NodeHandleStyle: CSSProperties = {
  opacity: 0,
  pointerEvents: "none",
  left: 0,
  right: 0,
  top: "50%",
  transform: "translate(0, -50%)",
  width: 1,
  height: 1,
  border: 0,
  background: "transparent",
};

/**
 * Display a button within a file node that the user can click to display the quality metrics for
 * the file.
 *
 * @param file - File object that the given quality metrics belong to
 * @param fileMetrics - Quality metric objects for the currently rendering file
 */
function QCMetricTrigger({
  file,
  fileMetrics,
}: {
  file: FileObject;
  fileMetrics: QualityMetricObject[];
}) {
  if (fileMetrics.length > 0) {
    return (
      <div className="flex justify-center">
        <button
          className="border-file-graph-file bg-file-graph-qc-trigger block cursor-pointer rounded-b-sm border-r border-b border-l px-2 text-[8px] font-semibold"
          aria-label={`quality metrics for file ${file.accession}`}
          data-qc-button
        >
          QC
        </button>
      </div>
    );
  }
}

/**
 * Render the title of a node centered horizontally at the given Y position.
 *
 * @param content - Text content of the title
 * @param y - Y position to center the title at
 */
function NodeTitle({ content, y }: { content: string; y: number }) {
  return (
    <text
      x={NODE_WIDTH / 2}
      y={y}
      textAnchor="middle"
      fontSize="11px"
      fontWeight="bold"
      className="fill-black dark:fill-white"
    >
      {content}
    </text>
  );
}

/**
 * Render the subtitle of a node centered horizontally at the given Y position.
 *
 * @param content - Text content of the subtitle
 * @param y - Y position to center the subtitle at
 */
function NodeSubtitle({ content, y }: { content: string; y: number }) {
  return (
    <text
      x={NODE_WIDTH / 2}
      y={y}
      textAnchor="middle"
      fontSize="11px"
      fill="#111827"
      className="fill-black dark:fill-white"
    >
      {content}
    </text>
  );
}

/**
 * Render the handles for a node. We use two handles, one on the left for incoming edges and one on
 * the right for outgoing edges.
 */
function NodeHandles() {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          ...NodeHandleStyle,
          right: "auto",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          ...NodeHandleStyle,
          left: "auto",
        }}
      />
    </>
  );
}

/**
 * File node component. Renders the node as well as its contents.
 *
 * @param props - React Flow node props
 */
function FileNodeContent(props: NodeProps) {
  const data = props.data as FileMetadata;
  const file = data.file;
  let linePosition = FILE_NODE_TOP_LINE_POSITION;

  // Render the containing box with a div instead of an SVG rect to use the same mechanism that
  // `<FileSetNodeContent>` needs.
  return (
    <>
      <div
        className="bg-file-graph-file border-file-graph-file cursor-pointer border"
        style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
      >
        <svg width={NODE_WIDTH - 2} height={NODE_HEIGHT - 2}>
          <g>
            <NodeTitle content={file.accession} y={linePosition} />
            <NodeSubtitle
              content={truncateText(file.file_format, MAX_LINE_LENGTH)}
              y={(linePosition += NODE_LINE_HEIGHT)}
            />
            <NodeSubtitle
              content={truncateText(
                file.content_summary || file.content_type,
                MAX_LINE_LENGTH
              )}
              y={(linePosition += NODE_LINE_HEIGHT)}
            />
            <NodeStatus file={file} />
          </g>
        </svg>
      </div>
      <div className="absolute top-full right-0 left-0 z-10">
        <QCMetricTrigger file={file} fileMetrics={data.qualityMetrics} />
      </div>
      <NodeHandles />
    </>
  );
}

/**
 * File-set node component. Renders the node as well as its contents.
 *
 * @param props - React Flow node props
 */
function FileSetNodeContent(props: NodeProps) {
  const metadata = props.data as FileSetMetadata;
  const fileSet = metadata.fileSet;
  const fileSetAtType = fileSet["@type"][0];
  const fileSetTypeColors =
    fileSetTypeColorMap[fileSetAtType] || fileSetTypeColorMap.unknown;
  const externalFileCount = metadata.externalFiles.length;
  let linePosition = FILESET_NODE_TOP_LINE_POSITION;
  const fileCountDisplay =
    externalFileCount === 1 ? "1 file" : `${externalFileCount} files`;

  // Render the containing box with rounded corners as a div instead of an SVG rect because any
  // curved lines in SVG appear thicker than straight ones. A div with rounded corners keeps the
  // border width consistent.
  return (
    <>
      <div
        className={`relative cursor-pointer rounded-full border ${fileSetTypeColors.bg} ${fileSetTypeColors.border}`}
        style={{
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        }}
      >
        <svg
          width={NODE_WIDTH - 2}
          height={NODE_HEIGHT - 2}
          data-fileset-type={fileSetAtType}
        >
          <g>
            <NodeTitle content={fileSet.accession} y={linePosition} />
            <NodeSubtitle
              content={fileCountDisplay}
              y={(linePosition += NODE_LINE_HEIGHT)}
            />
            <NodeSubtitle
              content={truncateText(fileSet.file_set_type, MAX_LINE_LENGTH)}
              y={(linePosition += NODE_LINE_HEIGHT)}
            />
          </g>
        </svg>
      </div>
      <NodeHandles />
    </>
  );
}

/**
 * Custom edge component that renders a curved path with a polygon arrowhead.
 *
 * @param id - ID of the edge
 * @param sourceX - X coordinate of the edge source
 * @param sourceY - Y coordinate of the edge source
 * @param targetX - X coordinate of the edge target
 * @param targetY - Y coordinate of the edge target
 * @param sourcePosition - Position of the edge source handle
 * @param targetPosition - Position of the edge target handle
 * @param style - Styles to apply to the edge
 */
function CustomArrowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
}: EdgeProps) {
  // Use ReactFlow's bezier path to create smooth curved edges
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g>
      <path
        id={id}
        d={edgePath}
        style={style}
        fill="none"
        className="react-flow__edge-path"
      />
      <polygon
        points={`${targetX},${targetY} ${targetX - 5},${targetY - 5} ${targetX - 5},${targetY + 5}`}
        fill={style?.stroke || "#6b7280"}
        className="react-flow__edge-arrowhead"
      />
    </g>
  );
}

/**
 * Display a graph of file associations for a file set using React Flow and ELK layout.
 *
 * @param graphData - ELK node data structure containing files and file sets to render
 * @param nativeFiles - Files included directly in the file set the user views
 * @param graphId - ID to assign to the graph container element
 * @param onNodeLayout - Callback invoked after node layout is complete with the laid out nodes
 */
function GraphCore({
  graphData,
  nativeFiles,
  graphId = "file-graph-container",
  onNodeLayout,
}: {
  graphData: ElkNode;
  nativeFiles: FileObject[];
  graphId?: string;
  onNodeLayout?: (nodes: Node<NodeMetadata>[]) => void;
}) {
  const [elk] = useState(() => new ELK());
  const [laidOutNodes, setLaidOutNodes] = useState<Node<NodeMetadata>[]>([]);
  const [laidOutEdges, setLaidOutEdges] = useState<Edge[]>([]);
  const [graphHeight, setGraphHeight] = useState(0);
  const [graphWidth, setGraphWidth] = useState(0);
  const [selectedNode, setSelectedNode] = useState<Node<NodeMetadata> | null>(
    null
  );
  const [selectedQualityMetrics, setSelectedQualityMetrics] = useState<
    QualityMetricObject[]
  >([]);
  const [qualityMetricFile, setQualityMetricFile] = useState<FileObject | null>(
    null
  );

  const rf = useReactFlow();
  const fileSetStats = collectRelevantFileSetStats(laidOutNodes);

  // Called when the user clicks on a file or file-set node in the graph. It sets the currently
  // selected node so that its modal appears.
  function onNodeClick(e: React.MouseEvent, node: Node<NodeMetadata>) {
    // Detect if the click was in the QC button enclave within the clicked node.
    if ((e.target as HTMLElement).closest("[data-qc-button]")) {
      const metadata = node.data as FileMetadata;
      setSelectedQualityMetrics(metadata.qualityMetrics);
      setQualityMetricFile(metadata.file);
      return;
    }

    // Click was within the node but outside the QC button. Set a state to open the file or file-
    // set modal.
    setSelectedNode(node as Node<NodeMetadata>);
  }

  useEffect(() => {
    // After ELK loads we can start layout with ELK. Do this inside useEffect so we can set the
    // node and edge states and render the graph once layout finishes.
    elk
      .layout(graphData)
      .then((graphDataWithLayout: ElkNode) => {
        const { nodes, edges } = elkToReactFlow(graphDataWithLayout);
        setLaidOutNodes(nodes as Node<NodeMetadata>[]);
        setLaidOutEdges(edges);
        onNodeLayout?.(nodes);
      })
      .catch((error) => {
        console.error("ELK layout failed:", error);
      });
  }, [elk, graphData]);

  useEffect(() => {
    // Runs after layout to determine the height of the graph so we can set the height of the
    // container appropriately.
    requestAnimationFrame(() => {
      const graphBounds = rf.getNodesBounds(rf.getNodes());
      setGraphHeight(
        Math.ceil(
          graphBounds.y + graphBounds.height + GRAPH_PADDING + CONTAINER_PADDING
        )
      );
      setGraphWidth(
        Math.ceil(
          graphBounds.x + graphBounds.width + GRAPH_PADDING + CONTAINER_PADDING
        )
      );
    });
  }, [rf, laidOutNodes, laidOutEdges]);

  return (
    <div className="relative">
      <div className="max-h-[calc(100vh-8rem)] overflow-x-auto overflow-y-auto">
        <div
          className="mx-auto"
          style={{
            height: graphHeight + 8,
            width: graphWidth,
          }}
        >
          <div className="h-full w-full p-2" id={graphId}>
            <ReactFlow
              nodes={laidOutNodes}
              edges={laidOutEdges}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              minZoom={1}
              maxZoom={1}
              nodeOrigin={[0, 0]}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              onNodeClick={onNodeClick}
              panOnDrag={false}
              panOnScroll={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              preventScrolling={false}
              defaultEdgeOptions={{
                style: {
                  stroke: "var(--color-file-graph-edge)",
                  strokeWidth: 1,
                },
              }}
            />
          </div>
        </div>
        {selectedNode && isFileNodeMetadata(selectedNode.data) && (
          <FileModal
            node={selectedNode as Node<FileMetadata>}
            onClose={() => setSelectedNode(null)}
          />
        )}
        {selectedNode && isFileSetNodeMetadata(selectedNode.data) && (
          <FileSetModal
            node={selectedNode as Node<FileSetMetadata>}
            nativeFiles={nativeFiles}
            onClose={() => setSelectedNode(null)}
          />
        )}
        {selectedQualityMetrics.length > 0 && (
          <QualityMetricModal
            file={qualityMetricFile}
            qualityMetrics={selectedQualityMetrics}
            onClose={() => {
              setSelectedQualityMetrics([]);
              setQualityMetricFile(null);
            }}
          />
        )}
      </div>
      <Legend
        fileSetStats={fileSetStats}
        fileCount={countFileNodes(laidOutNodes)}
      />
    </div>
  );
}

/**
 * Wrapper for the file-graph component to provide its hooks with the React Flow context provider.
 *
 * @param graphData - Graph data after ELK layout
 * @param nativeFiles - Files included directly in the file set the user is viewing
 * @param graphId - ID to assign to the graph container element
 * @param onNodeLayout - Callback invoked after node layout is complete with the laid out nodes
 */
function Graph({
  graphData,
  nativeFiles,
  graphId = "file-graph-container",
  onNodeLayout,
}: {
  graphData: ElkNode;
  nativeFiles: FileObject[];
  graphId?: string;
  onNodeLayout?: (nodes: Node<NodeMetadata>[]) => void;
}) {
  return (
    <ReactFlowProvider>
      <GraphCore
        graphData={graphData}
        nativeFiles={nativeFiles}
        graphId={graphId}
        onNodeLayout={onNodeLayout}
      />
    </ReactFlowProvider>
  );
}

/**
 * Wrapper to display cycle error messages of a single type.
 *
 * @param title - Title of the error message section
 */
function CycleErrorMessage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-4">
      <h4 className="font-bold">{title}</h4>
      <ul className="list-none space-y-1 [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:top-0 [&>li]:before:left-2 [&>li]:before:content-['–']">
        {children}
      </ul>
    </div>
  );
}

/**
 * Display information about cycles detected in the file graph preventing its display.
 *
 * @param cycles - Array of cycle arrays, where each cycle is an array of file `@id`s
 */
function GraphCycleError({ cycles }: { cycles: string[][] }) {
  // Categorize cycles by type.
  const selfLoops = cycles.filter((cycle) => cycle.length === 2); // ["A", "A"]
  const mutualLoops = cycles.filter((cycle) => cycle.length === 3); // ["A", "B", "A"]
  const complexCycles = cycles.filter((cycle) => cycle.length > 3); // ["A", "B", "C", "A"]

  return (
    <>
      <p>
        The file association graph does not appear because the{" "}
        <code>derived_from</code> relationships contain circular dependencies.
        Please review and correct these dependencies to display the graph.
      </p>

      {selfLoops.length > 0 && (
        <CycleErrorMessage title="Self References">
          {selfLoops.map((cycle, index) => (
            <li key={index}>
              <a href={cycle[0]} target="_blank" rel="noopener noreferrer">
                <code>{cycle[0]}</code>
              </a>{" "}
              derives from itself
            </li>
          ))}
        </CycleErrorMessage>
      )}

      {mutualLoops.length > 0 && (
        <CycleErrorMessage title="Mutual Dependencies">
          {mutualLoops.map((cycle, index) => (
            <li key={index}>
              <a href={cycle[0]} target="_blank" rel="noopener noreferrer">
                <code>{cycle[0]}</code>
              </a>{" "}
              ↔{" "}
              <a href={cycle[1]} target="_blank" rel="noopener noreferrer">
                <code>{cycle[1]}</code>
              </a>{" "}
              derive from each other
            </li>
          ))}
        </CycleErrorMessage>
      )}

      {complexCycles.length > 0 && (
        <CycleErrorMessage title="Complex Circular Dependencies">
          {complexCycles.map((cycle, index) => (
            <li key={index}>
              <SeparatedList separator=" ↔ ">
                {cycle.map((fileId, i) => (
                  <Fragment key={i}>
                    <a href={fileId} target="_blank" rel="noopener noreferrer">
                      <code>{fileId}</code>
                    </a>
                  </Fragment>
                ))}
              </SeparatedList>
            </li>
          ))}
        </CycleErrorMessage>
      )}
    </>
  );
}

/**
 * Display a graph of the file associations for a file set in a collapsible panel. We use files in
 * `files` instead of those embedded in `fileSet` because the embedded file objects do not include
 * enough properties of the files to generate the graph.
 *
 * @param files - Files included directly in `fileSet`
 * @param fileFileSets - File sets aside from `fileSet` that `files` belong to
 * @param derivedFromFiles - Files in other file sets that `files` derive from
 * @param referenceFiles - Reference files associated with `files`
 * @param qualityMetrics - Quality metrics for `files`
 * @param title - Title that appears above the graph panel
 * @param panelId - ID of the file-graph panel unique on the page for the section directory
 * @param graphId - ID of the graph container element unique on the page
 * @param fileId - ID of the file the graph is for; used to customize download filename
 */
export function FileGraph({
  files,
  fileFileSets,
  derivedFromFiles,
  referenceFiles,
  qualityMetrics,
  title = "File Association Graph",
  panelId = "file-graph",
  graphId = "file-graph-container",
  fileId = "",
}: {
  files: FileObject[];
  fileFileSets: FileSetObject[];
  referenceFiles: FileObject[];
  derivedFromFiles: FileObject[];
  qualityMetrics: QualityMetricObject[];
  title?: string;
  panelId?: string;
  graphId?: string;
  fileId?: string;
}) {
  console.log("FILE GRAPH 0", derivedFromFiles);

  const tooltipAttr = useTooltip(`tooltip-${graphId}`);
  const [isArchivedVisible, setIsArchivedVisible] = useState(false);

  // Filter out archived files if the user has not opted to include them.
  const currentFiles = trimArchivedFiles(files, isArchivedVisible);
  const includedDerivedFromFiles = trimArchivedFiles(
    derivedFromFiles,
    isArchivedVisible
  );
  console.log(
    "******* FILE GRAPH 1: %o\n%o",
    currentFiles,
    includedDerivedFromFiles
  );

  // Generate the lists of files to include in the graph, both for all files and for non-archived
  // files.
  const includedFiles = generateIncludedFiles(
    currentFiles,
    includedDerivedFromFiles
  );
  const includedFilesWithArchived = isArchivedVisible
    ? includedFiles
    : generateIncludedFiles(files, includedDerivedFromFiles);
  console.log(
    "******* FILE GRAPH 2: %o\n%o",
    includedFiles,
    includedFilesWithArchived
  );

  // Determine if the graph is empty only after filtering out archived files. We still want to show
  // a message about archived files being hidden in this case instead of the graph or cycle errors.
  const isEmptyGraphAfterFiltering =
    includedFiles.length === 0 && includedFilesWithArchived.length > 0;
  console.log("******* FILE GRAPH 3:", isEmptyGraphAfterFiltering);

  // Look for cycles caused by circular `derived_from` relationships.
  const cycles = detectCycles(includedFiles.concat(includedDerivedFromFiles));
  console.log("******* FILE GRAPH 4:", cycles);

  // Final list of files now determined. Use them to generate the graph data if there are no cycles.
  const graphData =
    cycles.length === 0
      ? generateGraphData(
          includedFiles,
          derivedFromFiles,
          fileFileSets,
          referenceFiles,
          qualityMetrics
        )
      : null;
  console.log("******* FILE GRAPH 5:", graphData);

  if (graphData || cycles.length > 0 || isEmptyGraphAfterFiltering) {
    return (
      <section role="region" aria-labelledby="file-graph">
        <DataAreaTitle id={panelId}>
          <div id="file-graph">{title}</div>
          <div className="flex gap-1">
            <Checkbox
              id={`include-archived-${panelId}`}
              checked={isArchivedVisible}
              name="Include archived files"
              onClick={() => setIsArchivedVisible((visible) => !visible)}
              className="items-center [&>input]:mr-0"
            >
              <div className="order-first mr-1 text-sm">
                Include archived files
              </div>
            </Checkbox>
            <TooltipRef tooltipAttr={tooltipAttr}>
              <DownloadTrigger
                graphId={graphId}
                fileId={fileId}
                isDisabled={cycles.length > 0 || isEmptyGraphAfterFiltering}
              />
            </TooltipRef>
          </div>
          <Tooltip tooltipAttr={tooltipAttr}>
            Download the graph as an SVG file. See{" "}
            <Link
              href="/help/graph-download"
              target="_blank"
              rel="noopener noreferrer"
            >
              tutorial
            </Link>{" "}
            for details.
          </Tooltip>
        </DataAreaTitle>
        {graphData ? (
          <DataPanel isPaddingSuppressed>
            <Graph
              graphData={graphData}
              nativeFiles={includedFiles}
              graphId={graphId}
            />
          </DataPanel>
        ) : isEmptyGraphAfterFiltering ? (
          <DataPanel>
            <p>
              All files in this graph are archived and currently hidden. Select{" "}
              <b>Include archived files</b> to view them.
            </p>
          </DataPanel>
        ) : (
          <DataPanel>
            <GraphCycleError cycles={cycles} />
          </DataPanel>
        )}
      </section>
    );
  }
}
