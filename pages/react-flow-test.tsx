import { useEffect, useState } from "react";
// Import ELK from the bundle in NextJS to avoid "web-worker" error on page load.
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs/lib/elk-api";
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
import "@xyflow/react/dist/style.css";
import { DataPanel } from "../components/data-area";
// components
import { elkToReactFlow } from "../components/file-graph/lib";

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
 * Node width
 */
const NODE_WIDTH = 156;

/**
 * Node height
 */
const NODE_HEIGHT = 60;

/**
 * ELK Data Structure
 * Defines the nodes as well as the relationships between nodes.
 */
const elkConfig: ElkNode = {
  id: "root",
  layoutOptions: {
    "org.eclipse.elk.algorithm": "layered",
    "org.eclipse.elk.layered.edgeRouting": "POLYLINE",
    "org.eclipse.elk.direction": "RIGHT",
    "org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers": "100",
    "org.eclipse.elk.layered.hierarchyHandling": "INCLUDE_CHILDREN",
    "org.eclipse.elk.layered.nodePlacement.favorStraightEdges": "true",
    "org.eclipse.elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
    "org.eclipse.elk.padding": "[top=4,left=4,bottom=4,right=4]",
  },
  children: [
    {
      id: "g1-2",
      children: [
        { id: "1", width: NODE_WIDTH, height: NODE_HEIGHT },
        { id: "2", width: NODE_WIDTH, height: NODE_HEIGHT },
        { id: "4", width: NODE_WIDTH, height: NODE_HEIGHT },
      ],
    },
    { id: "3", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "6", width: NODE_WIDTH, height: NODE_HEIGHT },
    {
      id: "g5-7",
      children: [
        { id: "5", width: NODE_WIDTH, height: NODE_HEIGHT },
        { id: "7", width: NODE_WIDTH, height: NODE_HEIGHT },
      ],
    },
    { id: "8", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "9", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "10", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "11", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "12", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "13", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "14", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "15", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "16", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "17", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "18", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "19", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "20", width: NODE_WIDTH, height: NODE_HEIGHT },

    { id: "21", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "22", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "23", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "24", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "25", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "26", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "27", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "28", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "29", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "30", width: NODE_WIDTH, height: NODE_HEIGHT },

    { id: "31", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "32", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "33", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "34", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "35", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "36", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "37", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "38", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "39", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "40", width: NODE_WIDTH, height: NODE_HEIGHT },

    { id: "41", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "42", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "43", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "44", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "45", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "46", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "47", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "48", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "49", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "50", width: NODE_WIDTH, height: NODE_HEIGHT },

    { id: "51", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "52", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "53", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "54", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "55", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "56", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "57", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "58", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "59", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "60", width: NODE_WIDTH, height: NODE_HEIGHT },

    { id: "61", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "62", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "63", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "64", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "65", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "66", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "67", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "68", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "69", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "70", width: NODE_WIDTH, height: NODE_HEIGHT },

    { id: "71", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "72", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "73", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "74", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "75", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "76", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "77", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "78", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "79", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "80", width: NODE_WIDTH, height: NODE_HEIGHT },

    { id: "81", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "82", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "83", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "84", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "85", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "86", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "87", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "88", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "89", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "90", width: NODE_WIDTH, height: NODE_HEIGHT },

    { id: "91", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "92", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "93", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "94", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "95", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "96", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "97", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "98", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "99", width: NODE_WIDTH, height: NODE_HEIGHT },
    { id: "100", width: NODE_WIDTH, height: NODE_HEIGHT },
  ],
  edges: [
    { id: "e1-3", sources: ["1"], targets: ["3"] },
    { id: "e2-3", sources: ["2"], targets: ["3"] },
    { id: "e4-3", sources: ["4"], targets: ["3"] },
    { id: "e5-3", sources: ["5"], targets: ["3"] },
    { id: "e5-6", sources: ["5"], targets: ["6"] },
    { id: "e7-6", sources: ["7"], targets: ["6"] },
    { id: "e7-3", sources: ["7"], targets: ["3"] },
    { id: "e8-4", sources: ["8"], targets: ["4"] },
    { id: "e8-5", sources: ["8"], targets: ["5"] },
    { id: "e9-5", sources: ["9"], targets: ["5"] },
    { id: "e10-6", sources: ["10"], targets: ["6"] },
    { id: "e11-10", sources: ["11"], targets: ["10"] },
    { id: "e12-10", sources: ["12"], targets: ["10"] },
    { id: "e13-10", sources: ["13"], targets: ["10"] },
    { id: "e14-10", sources: ["14"], targets: ["10"] },
    { id: "e15-10", sources: ["15"], targets: ["10"] },
    { id: "e16-10", sources: ["16"], targets: ["10"] },
    { id: "e17-10", sources: ["17"], targets: ["10"] },
    { id: "e18-10", sources: ["18"], targets: ["10"] },
    { id: "e19-10", sources: ["19"], targets: ["10"] },
    { id: "e20-10", sources: ["20"], targets: ["10"] },

    { id: "e21-11", sources: ["21"], targets: ["11"] },
    { id: "e22-12", sources: ["22"], targets: ["12"] },
    { id: "e23-13", sources: ["23"], targets: ["13"] },
    { id: "e24-14", sources: ["24"], targets: ["14"] },
    { id: "e25-15", sources: ["25"], targets: ["15"] },
    { id: "e26-16", sources: ["26"], targets: ["16"] },
    { id: "e27-17", sources: ["27"], targets: ["17"] },
    { id: "e28-18", sources: ["28"], targets: ["18"] },
    { id: "e29-19", sources: ["29"], targets: ["19"] },
    { id: "e30-20", sources: ["30"], targets: ["20"] },

    { id: "e31-21", sources: ["31"], targets: ["21"] },
    { id: "e32-22", sources: ["32"], targets: ["22"] },
    { id: "e33-23", sources: ["33"], targets: ["23"] },
    { id: "e34-24", sources: ["34"], targets: ["24"] },
    { id: "e35-25", sources: ["35"], targets: ["25"] },
    { id: "e36-26", sources: ["36"], targets: ["26"] },
    { id: "e37-27", sources: ["37"], targets: ["27"] },
    { id: "e38-28", sources: ["38"], targets: ["28"] },
    { id: "e39-29", sources: ["39"], targets: ["29"] },
    { id: "e40-30", sources: ["40"], targets: ["30"] },

    { id: "e41-31", sources: ["41"], targets: ["31"] },
    { id: "e42-32", sources: ["42"], targets: ["32"] },
    { id: "e43-33", sources: ["43"], targets: ["33"] },
    { id: "e44-34", sources: ["44"], targets: ["34"] },
    { id: "e45-35", sources: ["45"], targets: ["35"] },
    { id: "e46-36", sources: ["46"], targets: ["36"] },
    { id: "e47-37", sources: ["47"], targets: ["37"] },
    { id: "e48-38", sources: ["48"], targets: ["38"] },
    { id: "e49-39", sources: ["49"], targets: ["39"] },
    { id: "e50-40", sources: ["50"], targets: ["40"] },

    { id: "e51-41", sources: ["51"], targets: ["41"] },
    { id: "e52-42", sources: ["52"], targets: ["42"] },
    { id: "e53-43", sources: ["53"], targets: ["43"] },
    { id: "e54-44", sources: ["54"], targets: ["44"] },
    { id: "e55-45", sources: ["55"], targets: ["45"] },
    { id: "e56-46", sources: ["56"], targets: ["46"] },
    { id: "e57-47", sources: ["57"], targets: ["47"] },
    { id: "e58-48", sources: ["58"], targets: ["48"] },
    { id: "e59-49", sources: ["59"], targets: ["49"] },
    { id: "e60-50", sources: ["60"], targets: ["50"] },

    { id: "e61-51", sources: ["61"], targets: ["51"] },
    { id: "e62-52", sources: ["62"], targets: ["52"] },
    { id: "e63-53", sources: ["63"], targets: ["53"] },
    { id: "e64-54", sources: ["64"], targets: ["54"] },
    { id: "e65-55", sources: ["65"], targets: ["55"] },
    { id: "e66-56", sources: ["66"], targets: ["56"] },
    { id: "e67-57", sources: ["67"], targets: ["57"] },
    { id: "e68-58", sources: ["68"], targets: ["58"] },
    { id: "e69-59", sources: ["69"], targets: ["59"] },
    { id: "e70-60", sources: ["70"], targets: ["60"] },

    { id: "e71-61", sources: ["71"], targets: ["61"] },
    { id: "e72-62", sources: ["72"], targets: ["62"] },
    { id: "e73-63", sources: ["73"], targets: ["63"] },
    { id: "e74-64", sources: ["74"], targets: ["64"] },
    { id: "e75-65", sources: ["75"], targets: ["65"] },
    { id: "e76-66", sources: ["76"], targets: ["66"] },
    { id: "e77-67", sources: ["77"], targets: ["67"] },
    { id: "e78-68", sources: ["78"], targets: ["68"] },
    { id: "e79-69", sources: ["79"], targets: ["69"] },
    { id: "e80-70", sources: ["80"], targets: ["70"] },

    { id: "e81-71", sources: ["81"], targets: ["71"] },
    { id: "e82-72", sources: ["82"], targets: ["72"] },
    { id: "e83-73", sources: ["83"], targets: ["73"] },
    { id: "e84-74", sources: ["84"], targets: ["74"] },
    { id: "e85-75", sources: ["85"], targets: ["75"] },
    { id: "e86-76", sources: ["86"], targets: ["76"] },
    { id: "e87-77", sources: ["87"], targets: ["77"] },
    { id: "e88-78", sources: ["88"], targets: ["78"] },
    { id: "e89-79", sources: ["89"], targets: ["79"] },
    { id: "e90-80", sources: ["90"], targets: ["80"] },

    { id: "e91-81", sources: ["91"], targets: ["81"] },
    { id: "e92-82", sources: ["92"], targets: ["82"] },
    { id: "e93-83", sources: ["93"], targets: ["83"] },
    { id: "e94-84", sources: ["94"], targets: ["84"] },
    { id: "e95-85", sources: ["95"], targets: ["85"] },
    { id: "e96-86", sources: ["96"], targets: ["86"] },
    { id: "e97-87", sources: ["97"], targets: ["87"] },
    { id: "e98-88", sources: ["98"], targets: ["88"] },
    { id: "e99-89", sources: ["99"], targets: ["89"] },
    { id: "e100-90", sources: ["100"], targets: ["90"] },

    // 👇 layout-only helper so ELK layers group → 3
    { id: "__layout__g1-2->3", sources: ["g1-2"], targets: ["3"] },
    { id: "__layout__g5-7->3", sources: ["g5-7"], targets: ["3"] },
    { id: "__layout__g5-7->6", sources: ["g5-7"], targets: ["6"] },
    { id: "__layout__8->g1-2", sources: ["8"], targets: ["g1-2"] },
    { id: "__layout__8->g5-7", sources: ["8"], targets: ["g5-7"] },
    { id: "__layout__9->g5-7", sources: ["9"], targets: ["g5-7"] },
  ],
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

function ReactFlowTest() {
  const [elk] = useState(() => new ELK());
  const [positionedNodes, setPositionedNodes] = useState<Node[]>([]);
  const [positionedEdges, setPositionedEdges] = useState<Edge[]>([]);
  const [graphHeight, setGraphHeight] = useState(0);
  const [graphWidth, setGraphWidth] = useState(0);
  const rf = useReactFlow();

  useEffect(() => {
    elk.layout(elkConfig).then((layouted: ElkNode) => {
      const { nodes: newNodes, edges: newEdges } = elkToReactFlow(layouted);
      setPositionedNodes(newNodes);
      setPositionedEdges(newEdges);
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
    <DataPanel className="overflow-x-auto">
      <div
        style={{
          height: graphHeight,
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
    </DataPanel>
  );
}

export default function ReactFlowCore() {
  return (
    <ReactFlowProvider>
      <ReactFlowTest />
    </ReactFlowProvider>
  );
}
