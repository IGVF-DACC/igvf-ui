// node_modules
import * as d3Dag from "d3-dag";
import { AnimatePresence, motion } from "framer-motion";
import { DocumentTextIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import { ReactNode, useContext, useEffect, useState } from "react";
import { Group } from "@visx/group";
import { LinkHorizontal } from "@visx/shape";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "../animation";
import { DataAreaTitle, DataPanel } from "../data-area";
import GlobalContext from "../global-context";
import Icon from "../icon";
import { type PagePanelStates } from "../page-panels";
// lib
import { truncateText } from "../../lib/general";
// local
import { FileModal } from "./file-modal";
import { FileSetModal } from "./file-set-modal";
import { Legend } from "./legend";
import {
  collectRelevantFileSetTypes,
  generateGraphData,
  NODE_HEIGHT,
  NODE_WIDTH,
  trimIsolatedNodes,
} from "./lib";
import {
  fileSetTypeColorMap,
  isFileNodeData,
  isFileSetNodeData,
  type NodeData,
} from "./types";
// root
import type {
  DatabaseObject,
  FileObject,
  FileSetObject,
} from "../../globals.d";

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
  background: { fill: string; bg: string };
  label: string;
  isNodeSelected: boolean;
  isRounded?: boolean;
  className?: string;
  children: ReactNode;
}) {
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
      <rect
        height={NODE_HEIGHT}
        width={NODE_WIDTH}
        x={-NODE_WIDTH / 2}
        y={-NODE_HEIGHT / 2}
        opacity={1}
        className={`stroke-gray-800 dark:stroke-gray-400 ${background.fill}`}
        strokeWidth={1}
        {...(isRounded ? { rx: 10, ry: 10 } : {})}
      />
      {isNodeSelected && (
        <rect
          height={NODE_HEIGHT + 8}
          width={NODE_WIDTH + 8}
          x={-NODE_WIDTH / 2 - 4}
          y={-NODE_HEIGHT / 2 - 4}
          fill="transparent"
          opacity={1}
          className="stroke-gray-800 dark:stroke-white"
          strokeWidth={3}
          {...(isRounded ? { rx: 14, ry: 14 } : {})}
        />
      )}
      {children}
    </Group>
  );
}

/**
 * Display a graph of file associations for a file set. The graph is a directed acyclic graph (DAG)
 * where each node represents a file and each edge represents a `derived_from` relationship between
 * files.
 * @param fileSet The file set object for the page the user views
 * @param nativeFiles Files belonging to the file set the user views
 * @param graphData List of nodes to include in the graph
 */
function Graph({
  fileSet,
  nativeFiles,
  graphData,
}: {
  fileSet: FileSetObject;
  nativeFiles: FileObject[];
  graphData: NodeData[];
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

  useEffect(() => {
    // useEffect hides the d3-dag code from the NextJS server because d3-dag requires the browser's
    // DOM to run.
    const dag = d3Dag.dagStratify()(graphData);
    const layout = d3Dag
      .sugiyama()
      .coord(d3Dag.coordGreedy())
      .decross(d3Dag.decrossOpt().large("large"))
      .layering(d3Dag.layeringLongestPath())
      .nodeSize((node) => {
        // Might have to play with the adjustment factors if you change the size of the nodes.
        return node ? [NODE_HEIGHT * 2, NODE_WIDTH * 1.8] : [0, 0];
      });
    const { width, height } = layout(dag as any);
    setLoadedDag(dag);

    // d3-dag sugiyama lays out the graph vertically, so swap the width and height to fit a
    // horizontal display.
    setLayoutHeight(width);
    setLayoutWidth(height);
  }, []);

  /**
   * Handle when the user clicks on a node in the graph to display a modal.
   * @param {NodeData} nodeData The node that the user clicked on
   */
  function onNodeClick(nodeData: NodeData) {
    setSelectedNode(nodeData);
  }

  return (
    loadedDag && (
      <div className="overflow-x-auto">
        <svg className="mx-auto" width={layoutWidth} height={layoutHeight}>
          <defs>
            <marker
              id="arrow"
              viewBox="0 -5 10 10"
              refX="20"
              refY="0"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
              className="fill-black dark:fill-white"
            >
              <path d="M0,-5L10,0L0,5" />
            </marker>
          </defs>
          <Group top={0} left={0}>
            {loadedDag.links().map((link, i) => {
              // Render the edges between nodes as lines.
              return (
                <LinkHorizontal
                  key={`link-${i}`}
                  data={link}
                  className="stroke-black dark:stroke-white"
                  strokeWidth="1"
                  fill="none"
                  x={(node: any) => node.y - NODE_WIDTH / 2 + 10}
                  markerEnd="url(#arrow)"
                />
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
                const foreground = darkMode.enabled ? "#ffffff" : "#000000";
                return (
                  <GraphNode
                    key={i}
                    node={node}
                    onNodeClick={onNodeClick}
                    background={background}
                    label={`File ${graphNode.file.accession}, file format ${graphNode.file.file_format}, content type ${graphNode.file.content_type}`}
                    isNodeSelected={isNodeSelected}
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
                      y="-8px"
                      fontSize={12}
                      textAnchor="middle"
                      fontWeight="bold"
                      fill={foreground}
                    >
                      {graphNode.file.accession}
                    </text>
                    <text
                      y="6px"
                      fontSize={12}
                      textAnchor="middle"
                      fill={foreground}
                    >
                      {graphNode.file.file_format}
                    </text>
                    <text
                      y="18px"
                      fontSize={12}
                      textAnchor="middle"
                      fill={foreground}
                    >
                      {truncateText(graphNode.file.content_type, 24)}
                    </text>
                  </GraphNode>
                );
              }
              if (isFileSetNodeData(graphNode)) {
                const isNodeSelected = selectedNode?.id === graphNode.id;
                const background =
                  fileSetTypeColorMap[graphNode.fileSet["@type"][0]] ||
                  fileSetTypeColorMap.unknown;
                const foreground = darkMode.enabled ? "#ffffff" : "#000000";
                return (
                  <GraphNode
                    key={i}
                    node={node}
                    onNodeClick={onNodeClick}
                    background={background}
                    label={`File set ${graphNode.fileSet.title}`}
                    isNodeSelected={isNodeSelected}
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
                      y="-8px"
                      fontSize={12}
                      textAnchor="middle"
                      fontWeight="bold"
                      fill={foreground}
                    >
                      {graphNode.fileSet.accession}
                    </text>
                    <text
                      y="6px"
                      fontSize={12}
                      textAnchor="middle"
                      fill={foreground}
                    >
                      {graphNode.files.length}{" "}
                      {graphNode.files.length === 1 ? "file" : "files"}
                    </text>
                    {graphNode.fileSet.file_set_type && (
                      <text
                        y="18px"
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
      </div>
    )
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
 * @param title Title that appears above the graph panel
 * @param pagePanels The page panels controller
 * @param pagePanelId The ID of the file-graph panel unique on the page
 */
export function FileGraph({
  fileSet,
  files,
  derivedFromFiles,
  fileFileSets,
  title = "File Association Graph",
  pagePanels,
  pagePanelId,
}: {
  fileSet: DatabaseObject;
  files: DatabaseObject[];
  fileFileSets: DatabaseObject[];
  derivedFromFiles: DatabaseObject[];
  title?: string;
  pagePanels: PagePanelStates;
  pagePanelId: string;
}) {
  const isExpanded = pagePanels.isExpanded(pagePanelId);

  const data = generateGraphData(
    files as FileObject[],
    fileFileSets as FileSetObject[],
    derivedFromFiles as FileObject[]
  );
  const trimmedData = trimIsolatedNodes(data);
  const relevantFileSetTypes = collectRelevantFileSetTypes(
    trimmedData,
    fileSet as FileSetObject
  );

  if (trimmedData.length > 0) {
    return (
      <section role="region" aria-labelledby="file-graph">
        <DataAreaTitle>
          <DataAreaTitle.Expander
            pagePanels={pagePanels}
            pagePanelId={pagePanelId}
            label={`${title} table`}
          >
            <div id="file-graph">{title}</div>
          </DataAreaTitle.Expander>
        </DataAreaTitle>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="overflow-hidden [&>div]:p-0"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              transition={standardAnimationTransition}
              variants={standardAnimationVariants}
            >
              <DataPanel>
                <Graph
                  fileSet={fileSet as FileSetObject}
                  nativeFiles={files as FileObject[]}
                  graphData={trimmedData}
                />
                <Legend fileSetTypes={relevantFileSetTypes} />
              </DataPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    );
  }
}
