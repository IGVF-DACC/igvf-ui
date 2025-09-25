// node_modules
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs/lib/elk-api";
import _ from "lodash";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
// components
import { DataAreaTitle, DataPanel } from "../data-area";
import { QualityMetricModal } from "../quality-metric";
import SeparatedList from "../separated-list";
// lib
import { truncateText } from "../../lib/general";
import { type QualityMetricObject } from "../../lib/quality-metric";
// local
import { detectCycles } from "./detect-cycles";
import { FileModal } from "./file-modal";
import { FileSetModal } from "./file-set-modal";
import { Legend } from "./legend";
import {
  collectRelevantFileSetStats,
  countFileNodes,
  elkToReactFlow,
  generateGraphData,
  NODE_HEIGHT,
  NODE_WIDTH,
  trimIsolatedFiles,
} from "./lib";
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
 * Maximum number of characters to display in one line of a node label.
 */
const MAX_LINE_LENGTH = 24;

/**
 * Padding around the graph in pixels.
 */
const GRAPH_PADDING = 20;

/**
 * Styles for the node handles. This puts the handles in the correct place for the edges to hook up
 * to, but hidden to avoid visual clutter.
 */
const NodeHandleStyle: React.CSSProperties = {
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
      <button
        className="border-file-graph-file bg-file-graph-qc-trigger h-4 w-10 cursor-pointer rounded-sm border font-bold"
        aria-label={`Quality metrics for file ${file.accession}`}
        data-qc-button
      >
        QC
      </button>
    );
  }
}

/**
 * File node component. Renders the node as well as its contents.
 *
 * @param props - React Flow node props
 */
function FileNodeContent(props: NodeProps) {
  const data = props.data as FileMetadata;
  const file = data.file;

  return (
    <div className="border-file-graph-file bg-file-graph-file h-full cursor-pointer border px-1 py-0.5">
      <div className="flex h-full flex-col items-center justify-center text-[0.67rem] leading-[1.2]">
        <div className="font-bold">{file.accession}</div>
        <div>{truncateText(file.file_format, MAX_LINE_LENGTH)}</div>
        <div>{truncateText(file.content_type, MAX_LINE_LENGTH)}</div>
        <QCMetricTrigger file={file} fileMetrics={data.qualityMetrics} />
      </div>
      <div>
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
      </div>
    </div>
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
  const fileSetTypeColors = fileSetTypeColorMap[fileSetAtType];
  const externalFileCount = metadata.externalFiles.length;

  return (
    <div
      className={`h-full cursor-pointer rounded-full border px-1 py-0.5 ${fileSetTypeColors.bg} ${fileSetTypeColors.border}`}
    >
      <div className="flex h-full flex-col items-center justify-center text-[0.67rem] leading-[1.2]">
        <div className="font-bold">{fileSet.accession}</div>
        {externalFileCount === 1 ? (
          <div>1 file</div>
        ) : (
          <div>{externalFileCount} files</div>
        )}
        {fileSet.file_set_type && (
          <div>{truncateText(fileSet.file_set_type, MAX_LINE_LENGTH)}</div>
        )}
      </div>
      <div>
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
      </div>
    </div>
  );
}

/**
 * Display a graph of file associations for a file set using React Flow and ELK layout.
 *
 * @param graphData - ELK node data structure containing files and file sets to render
 * @param nativeFiles - Files included directly in the file set the user views
 */
function GraphCore({
  graphData,
  nativeFiles,
}: {
  graphData: ElkNode;
  nativeFiles: FileObject[];
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
  const onNodeClick = useCallback(
    (e: React.MouseEvent, node: Node<NodeMetadata>) => {
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
    },
    []
  );

  useEffect(() => {
    // After ELK loads we can start layout with ELK. Do this inside useEffect so we can set the
    // node and edge states and render the graph once layout finishes.
    elk
      .layout(graphData)
      .then((graphDataWithLayout: ElkNode) => {
        const { nodes, edges } = elkToReactFlow(graphDataWithLayout);
        setLaidOutNodes(nodes as Node<NodeMetadata>[]);
        setLaidOutEdges(edges);
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
          graphBounds.y + graphBounds.height + NODE_HEIGHT + GRAPH_PADDING
        )
      );
      setGraphWidth(
        Math.ceil(
          graphBounds.x + graphBounds.width + NODE_WIDTH + GRAPH_PADDING
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
            height: graphHeight,
            width: graphWidth,
          }}
        >
          <div className="h-full w-full p-2">
            <ReactFlow
              nodes={laidOutNodes}
              edges={laidOutEdges}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              minZoom={1}
              maxZoom={1}
              nodeOrigin={[0, 0]}
              nodeTypes={nodeTypes}
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
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: "var(--color-file-graph-edge)",
                  width: 24,
                  height: 24,
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
 */
function Graph({
  graphData,
  nativeFiles,
}: {
  graphData: ElkNode;
  nativeFiles: FileObject[];
}) {
  return (
    <ReactFlowProvider>
      <GraphCore graphData={graphData} nativeFiles={nativeFiles} />
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
 */
export function FileGraph({
  files,
  fileFileSets,
  derivedFromFiles,
  referenceFiles,
  qualityMetrics,
  title = "File Association Graph",
  panelId = "file-graph",
}: {
  files: FileObject[];
  fileFileSets: FileSetObject[];
  referenceFiles: FileObject[];
  derivedFromFiles: FileObject[];
  qualityMetrics: QualityMetricObject[];
  title?: string;
  panelId?: string;
}) {
  // Create a set of paths of files that are available to be included in the graph. Any files
  // unavailable because of incomplete indexing or access privileges do not get included.
  const availableFilePaths = new Set([
    ...files.map((file) => file["@id"]),
    ...derivedFromFiles.map((file) => file["@id"]),
  ]);

  // Copy the files but with unavailable files filtered out of their `derived_from` arrays.
  const filesWithFilteredDerived = files.map((file) => ({
    ...file,
    derived_from:
      file.derived_from?.filter((path) => availableFilePaths.has(path)) || [],
  }));

  // Only consider native files that derive from other files or that other files derive from. From
  // these files look for cycles caused by circular `derived_from` relationships.
  const includedFiles = trimIsolatedFiles(
    filesWithFilteredDerived,
    derivedFromFiles
  );
  const cycles = detectCycles(includedFiles.concat(derivedFromFiles));

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

  if (graphData || cycles.length > 0) {
    return (
      <section role="region" aria-labelledby="file-graph">
        <DataAreaTitle id={panelId}>
          <div id="file-graph">{title}</div>
        </DataAreaTitle>
        {graphData ? (
          <DataPanel isPaddingSuppressed>
            <Graph
              graphData={graphData}
              nativeFiles={filesWithFilteredDerived}
            />
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
