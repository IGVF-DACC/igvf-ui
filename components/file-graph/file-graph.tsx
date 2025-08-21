// node_modules
import * as d3Dag from "d3-dag";
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs/lib/elk-api";
import { ArrowDownTrayIcon, DocumentTextIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Edge,
  Handle,
  Node,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import { Group } from "@visx/group";
import { LinkHorizontal } from "@visx/shape";
// components
import { DataAreaTitle, DataPanel } from "../data-area";
import { Button } from "../form-elements";
import GlobalContext from "../global-context";
import Icon from "../icon";
import { QualityMetricModal } from "../quality-metric";
import { Tooltip, TooltipRef, useTooltip } from "../tooltip";
// lib
import { UC } from "../../lib/constants";
import { truncateText } from "../../lib/general";
import { type QualityMetricObject } from "../../lib/quality-metric";
// local
import { FileModal } from "./file-modal";
import { FileSetModal } from "./file-set-modal";
import { Legend } from "./legend";
import {
  collectRelevantFileSetStats,
  elkToReactFlow,
  generateGraphData,
  NODE_HEIGHT,
  NODE_WIDTH,
  pathToElkId,
  trimIsolatedNodes,
} from "./lib";
import {
  fileSetTypeColorMap,
  isFileNodeData,
  isFileSetNodeData,
  MAX_NODES_TO_DISPLAY,
  type FileSetTypeColorMapSpec,
  type NodeData,
} from "./types";
// root
import type {
  DatabaseObject,
  FileObject,
  FileSetObject,
} from "../../globals.d";
import "@xyflow/react/dist/style.css";

/**
 * Horizontal offset of arrowhead from the target node.
 */
const LINK_ARROWHEAD_X_OFFSET = -88;

/**
 * React Flow Data Structure
 * Allows nodes to render using a custom React component.
 */
const nodeTypes = {
  file: FileNodeContent,
  group: GroupNodeContent,
};

/**
 * Dimensions of the quality metric trigger rectangle within a file node.
 */
const QUALITY_METRIC_DIMENSIONS = {
  width: 40,
  height: 16,
} as const;

type FileNodeData = {
  label: string;
};

/**
 * y-offsets for the text labels in file and file-set nodes. Each array element corresponds to a
 * different text line number in the node. `withoutMetrics` is used when the node does not
 * contain quality metrics, and `withMetrics` is used when the node does contain quality metrics.
 */
const lineOffsetsMap = {
  withoutMetrics: ["-8px", "6px", "18px"],
  withMetrics: ["-18px", "-4px", "8px"],
} as const;

function FileNodeContent(props: NodeProps) {
  const data = props.data as unknown as FileNodeData;

  return (
    <div className="h-full rounded-md border border-gray-800 bg-white p-2 text-xs dark:border-gray-200 dark:bg-black">
      Node <strong>{data.label}</strong>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          opacity: 0,
          pointerEvents: "none",
          left: 0, // use left, cancel right
          right: "auto",
          top: "50%",
          transform: "translate(0, -50%)", // no horizontal offset
          width: 1,
          height: 1,
          border: 0,
          background: "transparent",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          opacity: 0,
          pointerEvents: "none",
          right: 0, // use right, cancel left
          left: "auto",
          top: "50%",
          transform: "translate(0, -50%)", // no horizontal offset
          width: 1,
          height: 1,
          border: 0,
          background: "transparent",
        }}
      />
    </div>
  );
}

function GroupNodeContent(props: NodeProps) {
  const data = props.data as unknown as FileNodeData;
  return (
    <div className="rounded-md border border-gray-400 bg-gray-50 text-xs">
      <strong>{data.label}</strong>
    </div>
  );
}

/**
 * Display a selectable node in the graph, for either a file or a file set node. Put the contents
 * of the node as the children of this component.
 * @param node The node to display from d3-dag
 * @param onNodeClick Function to call when the user clicks on the node
 * @param background Background color of the node
 * @param label Aria label for the node
 * @param isNodeSelected Whether the node is selected
 */
function GraphNode({
  node,
  onNodeClick,
  background,
  label,
  isNodeSelected,
  isRounded = false,
  className = "",
  isGraphDownload = false,
  children,
}: {
  node: d3Dag.DagNode<
    {
      id: string;
      parentIds: string[];
    },
    undefined
  >;
  onNodeClick: (nodeData: NodeData) => void;
  background: FileSetTypeColorMapSpec;
  label: string;
  isNodeSelected: boolean;
  isRounded?: boolean;
  isGraphDownload?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const rectProps = {
    height: NODE_HEIGHT,
    width: NODE_WIDTH,
    x: -NODE_WIDTH / 2,
    y: -NODE_HEIGHT / 2,
    opacity: 1,
    strokeWidth: 1,
    ...(isRounded ? { rx: 10, ry: 10 } : {}),
    ...(!isGraphDownload && {
      className: `stroke-file-graph-node ${background.fill}`,
    }),
    ...(isGraphDownload && {
      style: { stroke: "#1f2937", fill: background.color },
    }),
  };

  return (
    <Group
      top={node.x}
      left={node.y}
      style={{ cursor: "pointer" }}
      onClick={() => onNodeClick(node.data as NodeData)}
      tabIndex={0}
      aria-label={label}
      className={className}
    >
      <rect {...rectProps} />
      {isNodeSelected && (
        <rect
          height={NODE_HEIGHT + 8}
          width={NODE_WIDTH + 8}
          x={-NODE_WIDTH / 2 - 4}
          y={-NODE_HEIGHT / 2 - 4}
          fill="transparent"
          opacity={1}
          className="stroke-file-graph-node"
          strokeWidth={3}
          {...(isRounded ? { rx: 14, ry: 14 } : {})}
        />
      )}
      {children}
    </Group>
  );
}

/**
 * Display a button within a file node that the user can click to display the quality metrics for
 * the file.
 * @param file File object that the given quality metrics belong to
 * @param fileMetrics Quality metric objects for the currently rendering file
 * @param onClick Function to call when the user clicks on the quality metric trigger
 */
function QCMetricTrigger({
  file,
  fileMetrics,
  onClick,
}: {
  file: FileObject;
  fileMetrics: QualityMetricObject[];
  onClick: (file: FileObject, qcMetrics: QualityMetricObject[]) => void;
}) {
  // Called when the user clicks on the quality metric trigger button. This button is an enclave
  // within the file node, so stop the event from propagating to the node click handler.
  function clickHandler(e: React.MouseEvent<SVGRectElement>) {
    e.stopPropagation();
    onClick(file, fileMetrics);
  }

  if (fileMetrics.length > 0) {
    return (
      <g aria-label={`Quality metrics for file ${file.accession}`}>
        <rect
          x={-QUALITY_METRIC_DIMENSIONS.width / 2}
          y={NODE_HEIGHT / 2 - QUALITY_METRIC_DIMENSIONS.height - 2}
          width={QUALITY_METRIC_DIMENSIONS.width}
          height={QUALITY_METRIC_DIMENSIONS.height}
          rx={2}
          ry={2}
          fill="lightgray"
          role="button"
          className="fill-file-graph-qc-trigger stroke-file-graph-node"
          onClick={clickHandler}
          tabIndex={0}
        />
        <text
          x={0}
          y={NODE_HEIGHT / 2 - QUALITY_METRIC_DIMENSIONS.height + 10}
          fontSize={10}
          textAnchor="middle"
          className="fill-file-graph-qc-trigger-text pointer-events-none"
          fill="black"
          fontWeight="bold"
        >
          QC
        </text>
      </g>
    );
  }
}

/**
 * Display a graph of file associations for a file set. The graph is a directed acyclic graph (DAG)
 * where each node represents a file and each edge represents a `derived_from` relationship between
 * files.
 * @param fileSet The file set object for the page the user views
 * @param nativeFiles Files belonging to the file set the user views
 * @param qualityMetrics Quality metrics for `nativeFiles`
 * @param graphData List of nodes to include in the graph
 * @param onReady Called when the graph is ready to be displayed
 * @param isGraphDownload True to download graph in SVG file, false to display in browser
 */
function GraphCore({
  fileSet,
  nativeFiles,
  referenceFiles,
  qualityMetrics = [],
  graphData,
  onReady = () => {},
  isGraphDownload = false,
}: {
  fileSet: FileSetObject;
  nativeFiles: FileObject[];
  referenceFiles: FileObject[];
  qualityMetrics?: QualityMetricObject[];
  graphData: ElkNode;
  onReady?: (svg: SVGSVGElement) => void;
  isGraphDownload?: boolean;
}) {
  const [elk] = useState(() => new ELK());
  const [positionedNodes, setPositionedNodes] = useState<Node[]>([]);
  const [positionedEdges, setPositionedEdges] = useState<Edge[]>([]);
  const [graphHeight, setGraphHeight] = useState(0);
  const [graphWidth, setGraphWidth] = useState(0);
  const rf = useReactFlow();

  useEffect(() => {
    elk.layout(graphData).then((graphDataWithLayout: ElkNode) => {
      const { nodes, edges } = elkToReactFlow(graphDataWithLayout);
      setPositionedNodes(nodes);
      setPositionedEdges(edges);
    });
  }, [elk]);

  useEffect(() => {
    // run after mount/paint so sizes are measured
    requestAnimationFrame(() => {
      const r = rf.getNodesBounds(rf.getNodes());
      setGraphHeight(Math.ceil(r.y + r.height + NODE_HEIGHT + 12));
      setGraphWidth(Math.ceil(r.x + r.width + NODE_WIDTH));
    });
  }, [rf, positionedNodes, positionedEdges]);

  return (
    <div
      style={{
        height: graphHeight + 500,
        width: graphWidth,
      }}
    >
      <ReactFlow
        nodes={positionedNodes}
        edges={positionedEdges}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={1}
        maxZoom={1}
        nodeOrigin={[0, 0]}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
      />
    </div>
  );
}

function Graph(props) {
  return (
    <ReactFlowProvider>
      <GraphCore {...props} />
    </ReactFlowProvider>
  );
}

/**
 * Save an SVG element as an SVG file.
 * @param svgElement SVG element to save as an SVG file
 * @param fileSet File set object the user views
 */
async function saveSvg(
  svgElement: SVGSVGElement,
  fileSet: FileSetObject
): Promise<void> {
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgString], { type: "image/svg+xml" });

  // Generate a suggested file name.
  const filename = `${fileSet.accession}_graph.svg`;

  if ("showSaveFilePicker" in window) {
    // Use the File System Access API to save the SVG file using a Save As modal.
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: `File graph for file set ${fileSet.accession}`,
            accept: { "image/svg+xml": [".svg"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      console.error("Save aborted:", error);
    }
  } else {
    // The File System Access API is not available in this browser, so directly download the SVG
    // file to the user's download directory as configured in their browser.
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/**
 * Handles the button to download the graph as an SVG file. It also directs the actual process of
 * saving the SVG file.
 * @param fileSet The file set object the user views
 * @param nativeFiles Files included directly in `fileSet`
 * @param trimmedData List of nodes to include in the graph
 */
function SaveSvgTrigger({
  fileSet,
  nativeFiles,
  referenceFiles,
  trimmedData,
}: {
  fileSet: FileSetObject;
  nativeFiles: FileObject[];
  referenceFiles: FileObject[];
  trimmedData: NodeData[];
}) {
  const tooltipAttr = useTooltip("graph-download");

  // Set up the process to save the graph as an SVG file, and render the graph for a file instead
  // of for the browser. The downloaded file doesn't use Tailwind CSS classes nor does it pay
  // attention to dark mode.
  function saveAsSvgSetup() {
    // Create an off-screen container and create the React 18 root inside it.
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    // Render <Graph /> inside the off-screen container, indicating we're rendering the graph for
    // download.
    root.render(
      <Graph
        fileSet={fileSet}
        nativeFiles={nativeFiles}
        referenceFiles={referenceFiles}
        graphData={trimmedData}
        onReady={(svgElement) => {
          if (svgElement) {
            saveSvg(svgElement, fileSet);
          }

          // Cleanup: Unmount the component and remove the container.
          root.unmount();
          document.body.removeChild(container);
        }}
        isGraphDownload
      />
    );
  }

  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <div>
          <Button size="sm" onClick={saveAsSvgSetup}>
            <ArrowDownTrayIcon className="h-4 w-4" />
          </Button>
        </div>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>
        Download graph as SVG file. See{" "}
        <a
          href="https://youtu.be/700ZwlFX41g"
          target="_blank"
          rel="noopener noreferrer"
        >
          tutorial
        </a>
        .
      </Tooltip>
    </>
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
 * @param qualityMetrics Quality metrics for `files`
 * @param title Title that appears above the graph panel
 * @param pagePanels The page panels controller
 * @param pagePanelId The ID of the file-graph panel unique on the page
 */
export function FileGraph({
  fileSet,
  files,
  derivedFromFiles,
  referenceFiles,
  fileFileSets,
  qualityMetrics,
  title = "File Association Graph",
  panelId = "file-graph",
}: {
  fileSet: DatabaseObject;
  files: DatabaseObject[];
  referenceFiles: FileObject[];
  fileFileSets: DatabaseObject[];
  derivedFromFiles: DatabaseObject[];
  qualityMetrics: QualityMetricObject[];
  title?: string;
  panelId?: string;
}) {
  const graphData = generateGraphData(
    files as FileObject[],
    derivedFromFiles as FileObject[]
  );

  return (
    <section role="region" aria-labelledby="file-graph">
      <DataAreaTitle id={panelId}>
        <div id="file-graph">{title}</div>
      </DataAreaTitle>
      <div className="[&>div]:p-0">
        <DataPanel>
          <Graph
            fileSet={fileSet as FileSetObject}
            nativeFiles={files as FileObject[]}
            referenceFiles={referenceFiles}
            qualityMetrics={qualityMetrics}
            graphData={graphData}
          />
        </DataPanel>
      </div>
    </section>
  );
}
