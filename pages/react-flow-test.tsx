import { useEffect, useState } from "react";
// Import ELK from the bundle in NextJS to avoid "web-worker" error on page load.
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs/lib/elk-api";
import {
  Edge,
  Handle,
  MarkerType,
  Node,
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
 * Allows nodes to render using a custom React component.
 */
const nodeTypes = {
  file: FileNodeContent,
  group: GroupNodeContent,
};

/**
 * ELK Data Structure
 * Defines the nodes as well as the relationships between nodes.
 */
const elkConfig: ElkNode = {
  id: "root",
  layoutOptions: {
    "org.eclipse.elk.algorithm": "layered",
    "org.eclipse.elk.direction": "RIGHT",
    // === horizontal spacing between columns (most important) ===
    // horizontal gap between columns (layers)
    "org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers": "100",

    // extra clearance for edges between layers (adds to the above)
    // "org.eclipse.elk.layered.spacing.edgeNodeBetweenLayers": "60",

    "org.eclipse.elk.layered.hierarchyHandling": "INCLUDE_CHILDREN",
    "org.eclipse.elk.padding": "[top=12,left=12,bottom=12,right=12]",
  },
  children: [
    {
      id: "g1-2",
      children: [
        { id: "1", width: 100, height: 50 },
        { id: "2", width: 100, height: 50 },
        { id: "4", width: 100, height: 50 },
      ],
    },
    { id: "3", width: 100, height: 50 },
  ],
  edges: [
    { id: "e1-3", sources: ["1"], targets: ["3"] },
    { id: "e2-3", sources: ["2"], targets: ["3"] },
    { id: "e4-3", sources: ["4"], targets: ["3"] },

    // 👇 layout-only helper so ELK layers group → 3
    { id: "__layout__g1-2->3", sources: ["g1-2"], targets: ["3"] },
  ],
};

function convertNodes(elkNodes: ElkNode[], parentId = ""): Node[] {
  const rfNodes = [];
  elkNodes.forEach((elkNode) => {
    // Generate a React Flow node and add it to the cumulative array.
    const rfNode = {
      id: elkNode.id,
      type: elkNode.children ? "group" : "file",
      data: { label: elkNode.id },
      position: { x: elkNode.x, y: elkNode.y },
      style: { width: elkNode.width, height: elkNode.height },
      draggable: false,
      selectable: false,
      ...(parentId ? { parentId } : {}),
    };
    rfNodes.push(rfNode);

    // If the node has children, recursively process them and add them to the cumulative array.
    if (elkNode.children) {
      const childNodes = convertNodes(elkNode.children, elkNode.id);
      rfNodes.push(...childNodes);
    }
  });
  return rfNodes;
}

function convertEdges(elkNodes: ElkNode) {
  const rfEdges: Edge[] = [];
  elkNodes.edges.forEach((edge) => {
    if (!edge.id.startsWith("__layout__")) {
      const rfEdge: Edge = {
        id: edge.id,
        source: edge.sources[0],
        target: edge.targets[0],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 24, // make arrowhead larger
          height: 24,
        },
      };
      rfEdges.push(rfEdge);
    }
  });
  return rfEdges;
}

function elkToReactFlow(elkGraph: ElkNode): { nodes: Node[]; edges: Edge[] } {
  const nodes = convertNodes(elkGraph.children || []);
  const edges = convertEdges(elkGraph);
  return { nodes, edges };
}

function FileNodeContent(props: NodeProps) {
  const data = props.data as unknown as FileNodeData;

  return (
    <div className="h-full rounded-md border border-gray-300 bg-white p-2 text-xs shadow-sm dark:bg-black">
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

export default function ReactFlowTest() {
  const [elk] = useState(() => new ELK());
  const [positionedNodes, setPositionedNodes] = useState<Node[]>([]);
  const [positionedEdges, setPositionedEdges] = useState<Edge[]>([]);

  useEffect(() => {
    elk.layout(elkConfig).then((layouted: ElkNode) => {
      const { nodes: newNodes, edges: newEdges } = elkToReactFlow(layouted);
      console.log("NODES", JSON.stringify(newNodes, null, 2));
      console.log("EDGES", JSON.stringify(newEdges, null, 2));

      setPositionedNodes(newNodes);
      setPositionedEdges(newEdges);
    });
  }, [elk]);

  return (
    <DataPanel className="h-[1000px]">
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
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={true}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 1,
          maxZoom: 1,
        }}
      />
    </DataPanel>
  );
}
