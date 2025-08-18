import { useEffect, useState } from "react";
// Import ELK from the bundle in NextJS to avoid "web-worker" error on page load.
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode, ElkExtendedEdge } from "elkjs/lib/elk-api";
import {
  Handle,
  Position,
  ReactFlow,
  Node,
  Edge,
  MarkerType,
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
    // You can keep this — sometimes helps but not sufficient alone:
    "org.eclipse.elk.layered.hierarchyHandling": "INCLUDE_CHILDREN",
    "org.eclipse.elk.padding": "[top=12,left=12,bottom=12,right=12]",
  },
  children: [
    {
      id: "g1-2",
      children: [
        { id: "1", width: 100, height: 50 },
        { id: "2", width: 100, height: 50 },
      ],
    },
    { id: "3", width: 100, height: 50 },
  ],
  edges: [
    { id: "e1-3", sources: ["1"], targets: ["3"] },
    { id: "e2-3", sources: ["2"], targets: ["3"] },

    // 👇 layout-only helper so ELK layers group → 3
    { id: "__layout__g1-2->3", sources: ["g1-2"], targets: ["3"] },
  ],
};

/**
 * Convert a laid-out ELK graph to React Flow nodes/edges.
 * - Children inside a parent get parent-relative positions.
 * - Top-left normalization so the whole graph starts at (0,0).
 * - Group nodes are detected by presence of `children`.
 */
export function elkToReactFlow(
  elk: ElkNode,
  opts?: {
    rootId?: string; // id of the virtual root to skip (default: elk.id)
    groupType?: string; // RF node type for groups
    leafType?: string; // RF node type for leaves
    normalize?: boolean; // shift so min x/y = 0 (default: true)
  }
): { nodes: Node[]; edges: Edge[] } {
  const rootId = opts?.rootId ?? elk.id!;
  const groupType = opts?.groupType ?? "group";
  const leafType = opts?.leafType ?? "default";
  const normalize = opts?.normalize ?? true;

  type AbsNode = ElkNode & { ax: number; ay: number; parentId?: string };
  const byId = new Map<string, AbsNode>();

  // Walk graph to compute ABS positions and index by id
  function walk(n: ElkNode, parent?: AbsNode) {
    const ax = (n.x ?? 0) + (parent?.ax ?? 0);
    const ay = (n.y ?? 0) + (parent?.ay ?? 0);
    const an: AbsNode = { ...n, ax, ay, parentId: parent?.id };
    byId.set(n.id!, an);
    (n.children ?? []).forEach((c) => walk(c, an));
  }
  walk(elk);

  // Compute normalization shift from all **non-root** nodes
  let minX = 0,
    minY = 0;
  if (normalize) {
    const all = Array.from(byId.values()).filter((n) => n.id !== rootId);
    if (all.length) {
      minX = Math.min(...all.map((n) => n.ax));
      minY = Math.min(...all.map((n) => n.ay));
      if (!isFinite(minX)) {
        minX = 0;
      }
      if (!isFinite(minY)) {
        minY = 0;
      }
    }
  }

  // Build React Flow nodes; SKIP the root
  const nodes: Node[] = [];
  for (const n of byId.values()) {
    if (n.id === rootId) {
      continue;
    }

    const isGroup = !!(n.children && n.children.length);
    const width = n.width ?? (isGroup ? 200 : 120);
    const height = n.height ?? (isGroup ? 120 : 40);

    if (isGroup) {
      // group nodes are placed absolutely (relative to canvas)
      nodes.push({
        id: n.id!,
        type: groupType,
        data: { label: n.id },
        position: { x: n.ax - minX, y: n.ay - minY },
        style: { width, height },
        draggable: false,
        selectable: true,
      });
    } else {
      // leaf nodes: relative to parent if present
      const parent = n.parentId ? byId.get(n.parentId) : undefined;
      if (parent && parent.id !== rootId) {
        const px = parent.ax - minX;
        const py = parent.ay - minY;
        nodes.push({
          id: n.id!,
          type: leafType,
          data: { label: n.id },
          position: { x: n.ax - minX - px, y: n.ay - minY - py },
          style: {
            width,
            height,
            padding: 0,
            margin: 0,
            boxSizing: "border-box",
            borderWidth: 0,
          },
          parentId: parent.id!,
          extent: "parent",
        });
      } else {
        // no parent or parent is root → absolute
        nodes.push({
          id: n.id!,
          type: leafType,
          data: { label: n.id },
          position: { x: n.ax - minX, y: n.ay - minY },
          style: {
            width,
            height,
            padding: 0,
            margin: 0,
            boxSizing: "border-box",
            borderWidth: 0,
          },
        });
      }
    }
  }

  // Collect edges from **all levels** (root and subgraphs), safely
  const elkEdges: ElkExtendedEdge[] = [];
  (function collectEdges(n: ElkNode) {
    if (n.edges) {
      elkEdges.push(...(n.edges as ElkExtendedEdge[]));
    }
    (n.children ?? []).forEach(collectEdges);
  })(elk);

  const edges: Edge[] = (elkEdges ?? [])
    // make the union explicit so TS knows it's (Edge | null)[]
    .map<Edge | null>((e) => {
      const [source] = e.sources ?? [];
      const [target] = e.targets ?? [];
      if (!source || !target) {
        return null;
      }

      return {
        id: e.id ?? `${source}->${target}`,
        source,
        target,
        // pick whatever edge type you use:
        // type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
      };
    })
    // now the predicate is valid because param is Edge | null
    .filter((x): x is Edge => x !== null);

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
      const { nodes, edges } = elkToReactFlow(layouted, {
        rootId: "root",
        groupType: "group",
        leafType: "file",
        normalize: true,
      });

      console.log("UPDATED NODES", nodes);
      console.log("UPDATED EDGES", edges);
      setPositionedNodes(nodes);
      setPositionedEdges(edges);
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
