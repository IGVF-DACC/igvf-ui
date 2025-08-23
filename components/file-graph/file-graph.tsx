// node_modules
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs/lib/elk-api";
import _ from "lodash";
import { useEffect, useState } from "react";
import {
  Handle,
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
// lib
import { truncateText } from "../../lib/general";
import { type QualityMetricObject } from "../../lib/quality-metric";
// local
import {
  elkToReactFlow,
  generateGraphData,
  NODE_HEIGHT,
  NODE_WIDTH,
  type FileMetadata,
  type FileSetMetadata,
} from "./lib";
// root
import type { FileObject, FileSetObject } from "../../globals.d";
import "@xyflow/react/dist/style.css";

/**
 * React Flow Data Structure
 * Allows nodes to render using a custom React component.
 */
const nodeTypes = {
  file: FileNodeContent,
  fileset: FileSetNodeContent,
  group: GroupNodeContent,
};

type FileNodeData = {
  label: string;
};

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

function FileNodeContent(props: NodeProps) {
  const data = props.data as FileMetadata;
  const file = data.file;

  return (
    <div className="h-full border border-gray-800 bg-white px-1 py-0.5 dark:border-gray-200 dark:bg-black">
      <div className="flex h-full flex-col items-center justify-center text-[0.67rem]">
        <div className="font-bold">{file.accession}</div>
        <div>{truncateText(file.file_format, 24)}</div>
        <div>{truncateText(file.content_type, 24)}</div>
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

function FileSetNodeContent(props: NodeProps) {
  const data = props.data as FileSetMetadata;
  const fileSet = data.fileSet;

  return (
    <div className="h-full border border-gray-800 bg-white px-1 py-0.5 dark:border-gray-200 dark:bg-black">
      <div className="flex h-full flex-col items-center justify-center text-[0.67rem]">
        <div className="font-bold">{fileSet.accession}</div>
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

function GroupNodeContent(props: NodeProps) {
  const data = props.data as unknown as FileNodeData;
  return (
    <div className="rounded-md border border-gray-400 bg-gray-50 text-xs">
      <strong>{data.label}</strong>
    </div>
  );
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
function GraphCore({ graphData }: { graphData: ElkNode }) {
  const [elk] = useState(() => new ELK());
  const [laidOutNodes, setLaidOutNodes] = useState<Node[]>([]);
  const [laidOutEdges, setLaidOutEdges] = useState<Edge[]>([]);
  const [graphHeight, setGraphHeight] = useState(0);
  const [graphWidth, setGraphWidth] = useState(0);
  const rf = useReactFlow();

  useEffect(() => {
    // After Elk loads we can start layout with Elk. Do this inside useEffect so we can set the
    // node and edge states and render the graph once layout finishes.
    elk.layout(graphData).then((graphDataWithLayout: ElkNode) => {
      const { nodes, edges } = elkToReactFlow(graphDataWithLayout);
      setLaidOutNodes(nodes);
      setLaidOutEdges(edges);
    });
  }, [elk]);

  useEffect(() => {
    // Runs after layout to determine the height of the graph so we can set the height of the
    // container appropriately.
    requestAnimationFrame(() => {
      const graphBounds = rf.getNodesBounds(rf.getNodes());
      setGraphHeight(
        Math.ceil(graphBounds.y + graphBounds.height + NODE_HEIGHT + 12)
      );
      setGraphWidth(Math.ceil(graphBounds.x + graphBounds.width + NODE_WIDTH));
    });
  }, [rf, laidOutNodes, laidOutEdges]);

  return (
    <div
      style={{
        height: graphHeight,
        width: graphWidth,
      }}
    >
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
  fileFileSets,
  derivedFromFiles,
  referenceFiles,
  qualityMetrics,
  title = "File Association Graph",
  panelId = "file-graph",
}: {
  fileSet: FileSetObject;
  files: FileObject[];
  fileFileSets: FileSetObject[];
  referenceFiles: FileObject[];
  derivedFromFiles: FileObject[];
  qualityMetrics: QualityMetricObject[];
  title?: string;
  panelId?: string;
}) {
  const graphData = generateGraphData(
    files as FileObject[],
    derivedFromFiles as FileObject[],
    fileFileSets
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
