// node_modules
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs/lib/elk-api";
import _ from "lodash";
import { useEffect, useState } from "react";
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
// components
import { DataAreaTitle, DataPanel } from "../data-area";
// lib
import { type QualityMetricObject } from "../../lib/quality-metric";
// local
import {
  elkToReactFlow,
  generateGraphData,
  NODE_HEIGHT,
  NODE_WIDTH,
} from "./lib";
// root
import type {
  DatabaseObject,
  FileObject,
  FileSetObject,
} from "../../globals.d";
import "@xyflow/react/dist/style.css";

/**
 * React Flow Data Structure
 * Allows nodes to render using a custom React component.
 */
const nodeTypes = {
  file: FileNodeContent,
  group: GroupNodeContent,
};

type FileNodeData = {
  label: string;
};

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
  derivedFromFiles,
  referenceFiles,
  qualityMetrics,
  title = "File Association Graph",
  panelId = "file-graph",
}: {
  fileSet: DatabaseObject;
  files: DatabaseObject[];
  referenceFiles: FileObject[];
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
