import { useEffect, useState } from "react";
// Import ELK from the bundle in NextJS to avoid "web-worker" error on page load.
import ELK from "elkjs/lib/elk.bundled.js";
import ReactFlow, { MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { DataPanel } from "../components/data-area";

// Define the nodes - two source nodes and one target node
const initialNodes = [
  {
    id: "1",
    type: "default",
    data: { label: "Node 1" },
    position: { x: 100, y: 100 },
    sourcePosition: "right",
    targetPosition: "left",
  },
  {
    id: "2",
    type: "default",
    data: { label: "Node 2" },
    position: { x: 100, y: 300 },
    sourcePosition: "right",
    targetPosition: "left",
  },
  {
    id: "3",
    type: "default",
    data: { label: "Node 3" },
    position: { x: 300, y: 200 },
    sourcePosition: "right",
    targetPosition: "left",
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

const elkConfig = {
  id: "root",
  layout: {
    algorithm: "layered",
  },
  children: initialNodes.map((node) => ({
    id: node.id,
    width: 100,
    height: 50,
  })),
  edges: initialEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  })),
};

export default function ReactFlowTest() {
  const [elk] = useState(() => new ELK());

  useEffect(() => {
    elk.layout(elkConfig).then((layouted) => {
      console.log(layouted);
    });
  }, [elk]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
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
        />
      </DataPanel>
    </div>
  );
}
