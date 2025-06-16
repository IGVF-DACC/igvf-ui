// node_modules
import * as d3Dag from "d3-dag";
import { ArrowDownTrayIcon, DocumentTextIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
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
import { truncateText } from "../../lib/general";
import { type QualityMetricObject } from "../../lib/quality-metric";
// local
import { FileModal } from "./file-modal";
import { FileSetModal } from "./file-set-modal";
import { Legend } from "./legend";
import {
  collectRelevantFileSetTypes,
  generateGraphData,
  getFileMetrics,
  NODE_HEIGHT,
  NODE_WIDTH,
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

/**
 * Horizontal offset of arrowhead from the target node.
 */
const LINK_ARROWHEAD_X_OFFSET = -88;

/**
 * Dimensions of the quality metric trigger rectangle within a file node.
 */
const QUALITY_METRIC_DIMENSIONS = {
  width: 40,
  height: 16,
} as const;

/**
 * y-offsets for the text labels in file and file-set nodes. Each array element corresponds to a
 * different text line number in the node. `withoutMetrics` is used when the node does not
 * contain quality metrics, and `withMetrics` is used when the node does contain quality metrics.
 */
const lineOffsetsMap = {
  withoutMetrics: ["-8px", "6px", "18px"],
  withMetrics: ["-18px", "-4px", "8px"],
} as const;

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
 * Display an arrowhead at the end of a link between two nodes. The arrowhead is a triangle pointing
 * in the direction of the target node. `x` comes from `link.target.x` which -- in this graph
 * orientation -- specifies the vertical position of the target node. `y` comes from
 * `link.target.y` which specifies the horizontal position of the target node.
 * @param x X-coordinate of the arrowhead from the target node
 * @param y Y-coordinate of the arrowhead from the target node
 * @param angle Angle of the arrowhead in radians
 * @param isGraphDownload True if downloading graph as an SVG file, false if browser displayed
 */
function LinkArrowHead({
  x,
  y,
  angle,
  isGraphDownload,
}: {
  x: number;
  y: number;
  angle: number;
  isGraphDownload: boolean;
}) {
  return (
    <polygon
      points="0,-5 10,0 0,5"
      transform={`translate(${
        y + LINK_ARROWHEAD_X_OFFSET + Math.sin(angle) * 2.8
      },${x - 10 * Math.sin(angle) * 1.3}) rotate(${(angle * 180) / Math.PI})`}
      {...(!isGraphDownload && {
        className: "stroke-black dark:stroke-white fill-black dark:fill-white",
      })}
      {...(isGraphDownload && {
        style: { stroke: "black", fill: "black" },
      })}
    />
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
          className="pointer-events-none fill-file-graph-qc-trigger-text"
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
function Graph({
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
  graphData: NodeData[];
  onReady?: (svg: SVGSVGElement) => void;
  isGraphDownload?: boolean;
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
  // When the user clicks on a nodes quality metrics, hold the selected node's metrics
  const [selectedQualityMetrics, setSelectedQualityMetrics] = useState<
    QualityMetricObject[]
  >([]);
  // File that the user clicked the quality metrics trigger for
  const [qualityMetricFile, setQualityMetricFile] = useState<FileObject | null>(
    null
  );

  // Reference to the SVG element that holds the graph; useful for saving the graph to a file
  const svgRef = useRef<SVGSVGElement>(null);
  // Timer to periodically monitor when svgRef gets filled in with the SVG element
  let svgReadyTimer: NodeJS.Timeout;

  // Poll the SVG element ref to know when the graph is ready to be displayed.
  function waitForSvg() {
    if (svgRef.current) {
      // Notify the caller that the graph is ready to be displayed. Use this to download the chart
      // to an SVG file.
      onReady(svgRef.current);
    } else {
      svgReadyTimer = setTimeout(waitForSvg, 10);
    }
  }

  useEffect(() => {
    // useEffect hides the d3-dag code from the NextJS server because d3-dag requires the browser's
    // DOM to run. Use a timer to give React a cycle to render the "Loading..." message before
    // running the d3-dag code.
    const loadingTimer = setTimeout(() => {
      const dag = d3Dag.dagStratify()(graphData);
      const layout = d3Dag
        .sugiyama()
        .coord(d3Dag.coordGreedy())
        .decross(d3Dag.decrossOpt().large("large"))
        .layering(d3Dag.layeringLongestPath())
        .nodeSize((node) => {
          // Might have to play with the adjustment factors if you change the size of the nodes.
          return node ? [NODE_HEIGHT * 1.4, NODE_WIDTH * 1.8] : [0, 0];
        });
      const { width, height } = layout(dag as any);
      setLoadedDag(dag);

      // d3-dag sugiyama lays out the graph vertically, so swap the width and height to fit a
      // horizontal display.
      setLayoutHeight(width);
      setLayoutWidth(height);
    }, 0);

    // Start waiting for the SVG graph to finish rendering.
    waitForSvg();

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(svgReadyTimer);
    };
  }, []);

  /**
   * Called when the user clicks on a quality metric trigger in a file node. By setting the
   * `selectedQualityMetrics` state, the modal showing the quality metrics gets displayed.
   * @param file File object that the quality-metric button user clicked on belongs to
   * @param qcMetrics Quality metrics for the file that the user clicked on
   */
  function qcMetricClickHandler(
    file: FileObject,
    qcMetrics: QualityMetricObject[]
  ) {
    setQualityMetricFile(file);
    setSelectedQualityMetrics(qcMetrics);
  }

  /**
   * Handle when the user clicks on a node in the graph to display a modal.
   * @param {NodeData} nodeData The node that the user clicked on
   */
  function onNodeClick(nodeData: NodeData) {
    setSelectedNode(nodeData);
  }

  return loadedDag ? (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
      <svg
        className="mx-auto"
        width={layoutWidth}
        height={layoutHeight}
        ref={svgRef}
      >
        <Group top={0} left={0}>
          {loadedDag.links().map((link, i) => {
            const source = { x: link.source.x, y: link.source.y + 70 };
            const target = { x: link.target.x, y: link.target.y - 70 };

            // Calculate the angle of the arrowhead based on the link's source and target positions.
            const dx = target.y - source.y;
            const dy = target.x - source.x;
            const angle = Math.atan2(dy, dx) * 0.4;

            // Render the edges between nodes as lines.
            return (
              <g key={`link-${i}`}>
                <LinkHorizontal
                  data={link}
                  {...(!isGraphDownload && {
                    className: "stroke-black dark:stroke-white",
                  })}
                  {...(isGraphDownload && {
                    style: { stroke: "black" },
                  })}
                  fill="none"
                  source={() => source}
                  target={() => target}
                />
                <LinkArrowHead
                  x={link.target.x}
                  y={link.target.y}
                  angle={angle}
                  isGraphDownload={isGraphDownload}
                />
              </g>
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
              const foreground =
                darkMode.enabled && !isGraphDownload ? "#ffffff" : "#000000";
              const fileMetrics = getFileMetrics(
                graphNode.file,
                qualityMetrics
              );
              const lineOffsets =
                fileMetrics.length > 0
                  ? lineOffsetsMap.withMetrics
                  : lineOffsetsMap.withoutMetrics;
              return (
                <GraphNode
                  key={i}
                  node={node}
                  onNodeClick={onNodeClick}
                  background={background}
                  label={`File ${graphNode.file.accession}, file format ${graphNode.file.file_format}, content type ${graphNode.file.content_type}`}
                  isNodeSelected={isNodeSelected && !isGraphDownload}
                  isGraphDownload={isGraphDownload}
                  className="relative"
                >
                  <DocumentTextIcon
                    className="absolute"
                    x={NODE_WIDTH / 2 - 18}
                    y={-NODE_HEIGHT / 2 + 2}
                    width={16}
                    height={16}
                  />
                  <text
                    y={lineOffsets[0]}
                    fontSize={12}
                    textAnchor="middle"
                    fontWeight="bold"
                    fill={foreground}
                  >
                    {graphNode.file.accession}
                  </text>
                  <text
                    y={lineOffsets[1]}
                    fontSize={12}
                    textAnchor="middle"
                    fill={foreground}
                  >
                    {graphNode.file.file_format}
                  </text>
                  <text
                    y={lineOffsets[2]}
                    fontSize={12}
                    textAnchor="middle"
                    fill={foreground}
                  >
                    {truncateText(graphNode.file.content_type, 24)}
                  </text>
                  <QCMetricTrigger
                    file={graphNode.file}
                    fileMetrics={fileMetrics}
                    onClick={qcMetricClickHandler}
                  />
                </GraphNode>
              );
            }
            if (isFileSetNodeData(graphNode)) {
              const isNodeSelected = selectedNode?.id === graphNode.id;
              const background =
                fileSetTypeColorMap[graphNode.fileSet["@type"][0]] ||
                fileSetTypeColorMap.unknown;
              const foreground = darkMode.enabled ? "#ffffff" : "#000000";
              const lineOffsets = lineOffsetsMap.withoutMetrics;
              return (
                <GraphNode
                  key={i}
                  node={node}
                  onNodeClick={onNodeClick}
                  background={background}
                  label={`File set ${graphNode.fileSet.title}`}
                  isNodeSelected={isNodeSelected && !isGraphDownload}
                  isGraphDownload={isGraphDownload}
                  isRounded
                >
                  <Icon.FileSet
                    className="absolute"
                    x={NODE_WIDTH / 2 - 18}
                    y={-NODE_HEIGHT / 2 + 1}
                    width={16}
                    height={16}
                  />
                  <text
                    y={lineOffsets[0]}
                    fontSize={12}
                    textAnchor="middle"
                    fontWeight="bold"
                    fill={foreground}
                  >
                    {graphNode.fileSet.accession}
                  </text>
                  <text
                    y={lineOffsets[1]}
                    fontSize={12}
                    textAnchor="middle"
                    fill={foreground}
                  >
                    {graphNode.files.length}{" "}
                    {graphNode.files.length === 1 ? "file" : "files"}
                  </text>
                  {graphNode.fileSet.file_set_type && (
                    <text
                      y={lineOffsets[2]}
                      fontSize={12}
                      textAnchor="middle"
                      fill={foreground}
                    >
                      {truncateText(graphNode.fileSet.file_set_type, 24)}
                    </text>
                  )}
                  <text
                    y="6px"
                    fontSize={12}
                    textAnchor="middle"
                    fill={foreground}
                  >
                    {graphNode.files.length}{" "}
                    {graphNode.files.length === 1 ? "file" : "files"}
                  </text>
                </GraphNode>
              );
            }
            return null;
          })}
        </Group>
      </svg>
      {selectedNode && isFileNodeData(selectedNode) && (
        <FileModal
          node={selectedNode}
          referenceFiles={referenceFiles}
          onClose={() => setSelectedNode(null)}
        />
      )}
      {selectedNode && isFileSetNodeData(selectedNode) && (
        <FileSetModal
          node={selectedNode}
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
  ) : (
    <div className="flex h-16 items-center justify-center italic">
      Loading&hellip;
    </div>
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
  const data = generateGraphData(
    files as FileObject[],
    fileFileSets as FileSetObject[],
    derivedFromFiles as FileObject[]
  );
  const trimmedData = trimIsolatedNodes(data);
  const isGraphTooLarge = trimmedData.length > MAX_NODES_TO_DISPLAY;
  const relevantFileSetTypes = !isGraphTooLarge
    ? collectRelevantFileSetTypes(trimmedData, fileSet as FileSetObject)
    : [];

  if (trimmedData.length > 0) {
    return (
      <section role="region" aria-labelledby="file-graph">
        <DataAreaTitle id={panelId}>
          <div id="file-graph">{title}</div>
          <SaveSvgTrigger
            fileSet={fileSet as FileSetObject}
            nativeFiles={files as FileObject[]}
            referenceFiles={referenceFiles}
            trimmedData={trimmedData}
          />
        </DataAreaTitle>
        <div className="[&>div]:p-0">
          <DataPanel>
            {!isGraphTooLarge ? (
              <>
                <Graph
                  fileSet={fileSet as FileSetObject}
                  nativeFiles={files as FileObject[]}
                  referenceFiles={referenceFiles}
                  qualityMetrics={qualityMetrics}
                  graphData={trimmedData}
                />
                <Legend fileSetTypes={relevantFileSetTypes} />
              </>
            ) : (
              <div className="p-4 text-center italic">
                Graph too large to display
              </div>
            )}
          </DataPanel>
        </div>
      </section>
    );
  }
}
