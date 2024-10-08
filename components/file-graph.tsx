// node_modules
import * as d3Dag from "d3-dag";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Group } from "@visx/group";
import { LinkHorizontal } from "@visx/shape";
// components
import AliasList from "./alias-list";
import { DataArea, DataItemLabel, DataItemValue, DataPanel } from "./data-area";
import Modal from "./modal";
// root
import { type DatabaseObject } from "../globals.d";

/**
 * Data structure common to all file object types.
 */
interface FileObject extends DatabaseObject {
  accession: string;
  aliases: string[];
  derived_from?: string[];
  file_format: string;
  file_set: string;
}

/**
 * Data structure common to all file set object types.
 */
interface FileSetObject extends DatabaseObject {
  file_set_type: string;
  files: string[];
}

// Represents a mapping of file set types to colors.
type FileSetTypeColorMap = {
  [key: string]: string;
};

// Maps file-set types to colors of nodes on the graph.
const fileSetTypeColorMap: FileSetTypeColorMap = {
  AnalysisSet: "#faafff",
  AuxiliarySet: "#60fa72",
  ConstructLibrarySet: "#fa608f",
  CuratedSet: "#faac60",
  MeasurementSet: "#60a5fa",
  ModelSet: "#f5fa60",
  ReferenceSet: "#60f5fa",
} as const;

/**
 * Data structure for a node in the graph. This matches the built-in d3-dag node data structure.
 * but adds an `accession` property for the file accession. I don't believe the built-in d3-dag
 * `DagNode` allows for additional properties, so I duplicate it here.
 * @property {string} id Unique identifier for the node
 * @property {string[]} parentIds List of unique identifiers for the parent nodes
 * @property {string} accession File accession
 * @property {string} fileSetType File set `@type`
 */
interface NodeData {
  id: string;
  parentIds: string[];
  file: FileObject;
  fileFileSet: FileSetObject;
}

/**
 * Generate d3-dag-compatible data from a list of files using their `derived_from` property.
 * @param files List of files to generate graph data from.
 * @returns List of nodes with their parent nodes.
 */
function generateGraphData(
  files: FileObject[],
  fileFileSets: FileSetObject[],
  derivedFromFiles: FileObject[]
) {
  // Combine the list of files from the file set with the upstream files outside the file set.
  const combinedFiles = files.concat(derivedFromFiles);

  // For each file in the graph, make a corresponding NodeData object.
  return combinedFiles.map((file) => {
    // Find the corresponding file set for the file based on `file.file_set`.
    const fileFileSet = fileFileSets.find(
      (fileSet) => fileSet["@id"] === file?.file_set["@id"]
    );

    const derivedFrom = file.derived_from
      ? file.derived_from.filter((derivedFromFilePath) => {
          return combinedFiles.some(
            (file) => file["@id"] === derivedFromFilePath
          );
        })
      : [];
    return {
      id: file["@id"],
      parentIds: derivedFrom,
      file,
      fileFileSet,
    } as NodeData;
  });
}

/**
 * Remove what would have appeared as isolated nodes in the graph, lacking any parent or child
 * nodes.
 * @param graphData List of nodes with their parent nodes
 * @returns List of nodes that either have parents or are parents of other nodes
 */
function trimIsolatedNodes(graphData: NodeData[]) {
  // Make a set of all parent IDs that appear across all nodes.
  const parentIds = new Set(graphData.flatMap((node) => node.parentIds));

  // Return only nodes with parents or that appear as parents of other nodes.
  return graphData.filter(
    (node) => node.parentIds.length > 0 || parentIds.has(node.id)
  );
}

function FileModal({
  pageFileSet,
  node,
  onClose,
}: {
  pageFileSet: FileSetObject;
  node: NodeData;
  onClose: () => void;
}) {
  const { file, fileFileSet } = node;
  return (
    <Modal isOpen={true} onClose={onClose}>
      <Modal.Header onClose={onClose}>
        <Link href={file["@id"]} target="_blank" rel="noopener noreferrer">
          {file.accession}
        </Link>
      </Modal.Header>
      <DataPanel className="border-none">
        <DataArea>
          {file.aliases?.length > 0 && (
            <>
              <DataItemLabel>Aliases</DataItemLabel>
              <DataItemValue>
                <AliasList aliases={file.aliases} />
              </DataItemValue>
              <DataItemLabel>Content Type</DataItemLabel>
              <DataItemValue>{file.content_type}</DataItemValue>
              <DataItemLabel>File Format</DataItemLabel>
              <DataItemValue>{file.file_format}</DataItemValue>
              <DataItemLabel>Summary</DataItemLabel>
              <DataItemValue>{file.summary}</DataItemValue>
              <DataItemLabel>File Set</DataItemLabel>
              <DataItemValue>
                {fileFileSet["@id"] !== pageFileSet["@id"] ? (
                  <Link
                    href={fileFileSet["@id"]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {fileFileSet.accession}
                  </Link>
                ) : (
                  <>{fileFileSet.accession} (this file set)</>
                )}
              </DataItemValue>
            </>
          )}
        </DataArea>
      </DataPanel>
    </Modal>
  );
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 40;

function Graph({
  fileSet,
  graphData,
}: {
  fileSet: FileSetObject;
  graphData: NodeData[];
}) {
  // Holds the DAG to render after it has been loaded in the browser
  const [loadedDag, setLoadedDag] = useState<d3Dag.Dag<
    { id: string; parentIds: string[] },
    undefined
  > | null>(null);
  // Holds the height of the layout after it has been calculated
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  useEffect(() => {
    const dag = d3Dag.dagStratify()(graphData);
    const layout = d3Dag
      .sugiyama() // base layout
      .decross(d3Dag.decrossOpt()) // minimize number of crossings
      .layering(d3Dag.layeringLongestPath()) // longest path or optimal link
      .nodeSize((node) => {
        return node ? [NODE_HEIGHT * 2, NODE_WIDTH * 1.2] : [0, 0];
      }); // set node size instead of constraining to fit
    const { width, height } = layout(dag as any);
    setLoadedDag(dag);
    setLayoutHeight(width);
    setLayoutWidth(height);
  }, []);

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
              refX="12"
              refY="0"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
              fill="#000000"
            >
              <path d="M0,-5L10,0L0,5" />
            </marker>
          </defs>
          <Group top={0} left={0}>
            {loadedDag.links().map((link, i) => {
              return (
                <LinkHorizontal
                  key={`link-${i}`}
                  data={link}
                  stroke="#000000"
                  strokeWidth="1"
                  fill="none"
                  x={(node: any) => node.y - NODE_WIDTH / 2 + 1}
                  markerEnd="url(#arrow)"
                />
              );
            })}
            {loadedDag.descendants().map((node, i) => {
              const graphNode = node as d3Dag.DagNode<NodeData>;
              const background =
                fileSetTypeColorMap[graphNode.data.fileFileSet["@type"][0]] ||
                "#c0c0c0";
              return (
                <Group
                  key={i}
                  top={node.x}
                  left={node.y}
                  style={{ cursor: "pointer" }}
                  onClick={() => onNodeClick(node.data as NodeData)}
                >
                  <rect
                    height={NODE_HEIGHT}
                    width={NODE_WIDTH}
                    x={-NODE_WIDTH / 2}
                    y={-NODE_HEIGHT / 2}
                    fill={background}
                    opacity={1}
                    stroke="#505050"
                    strokeWidth={1}
                  />
                  <text
                    y="-3px"
                    fontSize={12}
                    textAnchor="middle"
                    fontWeight="bold"
                    fill="#000000"
                  >
                    {graphNode.data.file.accession}
                  </text>
                  <text
                    y="12px"
                    fontSize={12}
                    textAnchor="middle"
                    fill="#000000"
                  >
                    {graphNode.data.file.file_format}
                  </text>
                </Group>
              );
            })}
          </Group>
        </svg>
        {selectedNode && (
          <FileModal
            pageFileSet={fileSet}
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    )
  );
}

export function FileGraph({
  fileSet,
  files,
  fileFileSets,
  derivedFromFiles,
}: {
  fileSet: DatabaseObject;
  files: DatabaseObject[];
  fileFileSets: DatabaseObject[];
  derivedFromFiles: DatabaseObject[];
}) {
  const data = generateGraphData(
    files as FileObject[],
    fileFileSets as FileSetObject[],
    derivedFromFiles as FileObject[]
  );
  const trimmedData = trimIsolatedNodes(data);
  return <Graph fileSet={fileSet as FileSetObject} graphData={trimmedData} />;
}
