import { inputFileSetStage } from "../input-file-set-grouping";
import {
  type AnalysisSetObject,
  type MeasurementSetObject,
} from "../../../../lib/file-sets";
import { type FileSetNode } from "../../types";

describe("inputFileSetStage", () => {
  it("groups together file-set nodes that are connected by input file set relationships", () => {
    const experimentalData: MeasurementSetObject = {
      "@id": "/measurement-sets/IGVFDS0000EXPD",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      assay_term: {
        "@id": "/assay-terms/OBI_0000185/",
        "@type": ["AssayTerm", "OntologyTerm", "Item"],
        term_id: "OBI:0000185",
        term_name: "imaging assay",
        status: "in progress",
      },
      file_set_type: "experimental data",
      status: "in progress",
      summary: "Experimental data for imaging assay",
    };
    const intermediateAnalysis: AnalysisSetObject = {
      "@id": "/analysis-sets/IGVFDS0000INTA",
      "@type": ["AnalysisSet", "FileSet", "Item"],
      file_set_type: "intermediate analysis",
      input_file_sets: [experimentalData],
      status: "in progress",
      summary: "Intermediate analysis for imaging assay",
    };

    const targetFileSetNodes: FileSetNode[] = [
      {
        id: "file-set-1",
        metadata: {
          fileSet: experimentalData,
          kind: "fileset",
          externalFiles: [],
          downstreamFiles: [],
        },
      },
      {
        id: "file-set-2",
        metadata: {
          fileSet: intermediateAnalysis,
          kind: "fileset",
          externalFiles: [],
          downstreamFiles: [],
        },
      },
    ];

    const nodesByFileSetPath = new Map([
      ["/measurement-sets/IGVFDS0000EXPD", [targetFileSetNodes[0]]],
      ["/analysis-sets/IGVFDS0000INTA", [targetFileSetNodes[1]]],
    ]);

    const nodeById = new Map(targetFileSetNodes.map((node) => [node.id, node]));

    const result = inputFileSetStage(
      targetFileSetNodes,
      nodeById,
      nodesByFileSetPath
    );

    expect(result.groups.size).toBe(1);
    const [group] = [...result.groups.values()];
    expect(group).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "file-set-1",
        }),
        expect.objectContaining({
          id: "file-set-2",
        }),
      ])
    );
    expect(result.remainingNodes).toEqual([]);
  });

  it("returns all nodes as remaining nodes if there are no nodes to group", () => {
    const node1 = {
      id: "file-set-1",
      metadata: {
        fileSet: {
          "@id": "/file-set-1",
          "@type": ["AuxiliarySet", "FileSet", "Item"],
        },
      },
    };

    const node2 = {
      id: "file-set-2",
      metadata: {
        fileSet: {
          "@id": "/file-set-2",
          "@type": ["AuxiliarySet", "FileSet", "Item"],
        },
      },
    };

    const allFileSetNodes = [node1, node2];

    const nodesByFileSetPath = new Map([
      ["/file-set-1", [node1]],
      ["/file-set-2", [node2]],
    ]);

    const result = inputFileSetStage(
      allFileSetNodes as any,
      new Map(allFileSetNodes.map((node) => [node.id, node as any])),
      nodesByFileSetPath as any
    );

    expect(result.groups.size).toBe(0);
    expect(result.remainingNodes).toHaveLength(2);
    expect(result.remainingNodes[0]).toEqual(
      expect.objectContaining({
        id: "file-set-1",
      })
    );
    expect(result.remainingNodes[1]).toEqual(
      expect.objectContaining({
        id: "file-set-2",
      })
    );
  });
});
