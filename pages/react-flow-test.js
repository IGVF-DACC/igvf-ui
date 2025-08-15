import React from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Position,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { DataPanel } from "../components/data-area";

// Define the nodes - two source nodes and one target node
const initialNodes = [
  {
    id: "1",
    type: "default",
    data: { label: "Node 1" },
    position: { x: 100, y: 100 },
    sourcePosition: Position.Right,
  },
  {
    id: "2",
    type: "default",
    data: { label: "Node 2" },
    position: { x: 100, y: 300 },
    sourcePosition: Position.Right,
  },
  {
    id: "3",
    type: "default",
    data: { label: "Target Node" },
    position: { x: 400, y: 200 },
    targetPosition: Position.Left,
  },
];

// Define the edges - arrows from Node 1 and Node 2 to Target Node
const initialEdges = [
  {
    id: "e1-3",
    source: "1",
    target: "3",
    type: "default",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: "default",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];

export default function ReactFlowTest() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <h1
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          margin: 0,
          padding: "10px",
          backgroundColor: "white",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        React Flow Test Page
      </h1>
      <DataPanel className="h-[500px]">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
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
          }}
        >
          <Background />
          <Controls
            showZoom={false}
            showFitView={false}
            showInteractive={false}
          />
          <MiniMap nodeColor={() => "#3b82f6"} maskColor="rgba(0, 0, 0, 0.2)" />
        </ReactFlow>
      </DataPanel>
    </div>
  );
}
