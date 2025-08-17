import { useEffect, useState } from "react";
// Import ELK from the bundle in NextJS to avoid "web-worker" error on page load.
import ELK from "elkjs/lib/elk.bundled.js";
import {
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DataPanel } from "../components/data-area";

type FileNodeData = {
  label: string;
};

/**
 * React Flow Data Structure
 * Define the nodes - two source nodes and one target node
 */
const initialNodes = [
  {
    id: "1",
    type: "file",
    data: { label: "Node 1" },
    position: { x: 0, y: 0 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: "2",
    type: "file",
    data: { label: "Node 2" },
    position: { x: 0, y: 0 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: "3",
    type: "file",
    data: { label: "Node 3" },
    position: { x: 0, y: 0 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
];

/**
 * React Flow Data Structure
 * Allows nodes to render using a custom React component.
 */
const nodeTypes = {
  file: FileNodeContent,
};

/**
 * React Flow Data Structure
 * Define the edges - arrows from Node 1 and Node 2 to Target Node
 */

const initialEdges = [
  {
    id: "e1-3",
    source: "1",
    target: "3",
    type: "default",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "black",
    },
    style: { stroke: "black", strokeWidth: 1 }, // 👈 custom color/width
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: "default",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "black",
    },
    style: { stroke: "black", strokeWidth: 1 }, // 👈 custom color/width
  },
];

/**
 * ELK Data Structure
 * Defines the nodes as well as the relationships between nodes.
 */
const elkConfig = {
  id: "root",
  layoutOptions: {
    "elk.algorithm": "layered",
    "elk.direction": "RIGHT",
  },
  children: [
    {
      id: "1",
      width: 100,
      height: 50,
    },
    {
      id: "2",
      width: 100,
      height: 50,
    },
    {
      id: "3",
      width: 100,
      height: 50,
    },
  ],
  edges: initialEdges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  })),
};

function FileNodeContent(props: NodeProps) {
  const data = props.data as unknown as FileNodeData;

  return (
    <div className="rounded-md border border-gray-300 bg-white p-2 text-xs shadow-sm">
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

export default function ReactFlowTest() {
  const [elk] = useState(() => new ELK());
  const [positionedNodes, setPositionedNodes] = useState(initialNodes);

  useEffect(() => {
    elk.layout(elkConfig).then((layouted) => {
      // Copy the layouted positions back to the nodes
      const updatedNodes = initialNodes.map((node) => {
        const layoutNode = layouted.children.find((n) => n.id === node.id);
        if (layoutNode) {
          return {
            ...node,
            position: {
              x: layoutNode.x || 0,
              y: layoutNode.y || 0,
            },
          };
        }
        return node;
      });
      console.log("UPDATED NODES", updatedNodes);
      setPositionedNodes(updatedNodes);
    });
  }, [elk]);

  return (
    <DataPanel className="h-[500px]">
      <ReactFlow
        nodes={positionedNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={true}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 2,
        }}
      />
    </DataPanel>
  );
}
