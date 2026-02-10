import {
  countFileNodes,
  NODE_WIDTH,
  NODE_HEIGHT,
  trimIsolatedFiles,
  collectRelevantFileSetStats,
  generateGraphData,
  getFileMetrics,
  elkToReactFlow,
  generateSVGContent,
} from "../lib";
import { NODE_KINDS } from "../types";
import type { FileObject, FileSetObject } from "../../../globals";
import type { QualityMetricObject } from "../../../lib/quality-metric";
import type { Node } from "@xyflow/react";
import type { NodeMetadata } from "../types";

jest.mock("../../../lib/color", () => ({
  colorVariableToColorHex: jest.fn((colorVar: string) => {
    const map: Record<string, string> = {
      "var(--color-status-released-bg)": "#00a651",
      "var(--color-status-archived-bg)": "#b0b0b0",
    };
    return map[colorVar] || "";
  }),
}));

// Test constants
describe("Constants", () => {
  it("should export correct node dimensions", () => {
    expect(NODE_WIDTH).toBe(156);
    expect(NODE_HEIGHT).toBe(60);
  });
});

describe("trimIsolatedFiles", () => {
  it("should keep files that derive from other files", () => {
    const nativeFiles: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/file2"],
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
      },
    ];
    const externalFiles: FileObject[] = [];

    const result = trimIsolatedFiles(nativeFiles, externalFiles);
    expect(result).toHaveLength(2);
    expect(result.map((f) => f["@id"])).toEqual([
      "/files/file1",
      "/files/file2",
    ]);
  });

  it("should keep files that other files derive from", () => {
    const nativeFiles: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/file1"],
      },
    ];
    const externalFiles: FileObject[] = [];

    const result = trimIsolatedFiles(nativeFiles, externalFiles);
    expect(result).toHaveLength(2);
  });

  it("should remove isolated files", () => {
    const nativeFiles: FileObject[] = [
      {
        "@id": "/files/isolated",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
      },
      {
        "@id": "/files/connected1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/connected2"],
      },
      {
        "@id": "/files/connected2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
      },
    ];
    const externalFiles: FileObject[] = [];

    const result = trimIsolatedFiles(nativeFiles, externalFiles);
    expect(result).toHaveLength(2);
    expect(result.map((f) => f["@id"])).toEqual([
      "/files/connected1",
      "/files/connected2",
    ]);
  });

  it("should handle files with external dependencies", () => {
    const nativeFiles: FileObject[] = [
      {
        "@id": "/files/native",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/external"],
      },
    ];
    const externalFiles: FileObject[] = [
      {
        "@id": "/files/external",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/other",
        derived_from: [],
      },
    ];

    const result = trimIsolatedFiles(nativeFiles, externalFiles);
    expect(result).toHaveLength(1);
    expect(result[0]["@id"]).toBe("/files/native");
  });

  it("should handle files with undefined derived_from", () => {
    const nativeFiles: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        // derived_from is undefined
      },
    ] as FileObject[];
    const externalFiles: FileObject[] = [];

    const result = trimIsolatedFiles(nativeFiles, externalFiles);
    expect(result).toHaveLength(0);
  });

  it("should handle empty arrays", () => {
    const result = trimIsolatedFiles([], []);
    expect(result).toEqual([]);
  });

  it("should ignore derived_from files that haven't loaded", () => {
    const nativeFiles: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/missing"], // This file doesn't exist in either array
      },
    ];
    const externalFiles: FileObject[] = [];

    const result = trimIsolatedFiles(nativeFiles, externalFiles);
    expect(result).toHaveLength(0); // File should be isolated since derived_from file isn't loaded
  });

  it("should handle files with null derived_from", () => {
    const nativeFiles: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: null, // Explicitly null instead of undefined
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/file1"], // This file derives from file1
      },
    ] as FileObject[];
    const externalFiles: FileObject[] = [];

    const result = trimIsolatedFiles(nativeFiles, externalFiles);
    expect(result).toHaveLength(2); // Both files should be kept (file1 is referenced by file2)
  });
});

describe("collectRelevantFileSetStats", () => {
  it("should count file set types correctly", () => {
    const _nodes: Node<NodeMetadata>[] = [
      {
        id: "fileset1",
        type: "fileset",
        position: { x: 0, y: 0 },
        data: {
          kind: NODE_KINDS.FILESET,
          fileSet: {
            "@id": "/file-sets/set1",
            "@type": ["AnalysisSet", "FileSet", "Item"],
            accession: "SET001",
            files: [],
            summary: "Test set 1",
          } as FileSetObject,
          externalFiles: [],
          downstreamFile: {
            "@id": "/files/file1",
            "@type": ["File", "Item"],
            content_type: "reads",
            file_format: "fastq",
            file_set: "/file-sets/test",
          } as FileObject,
        },
      },
      {
        id: "fileset2",
        type: "fileset",
        position: { x: 0, y: 0 },
        data: {
          kind: NODE_KINDS.FILESET,
          fileSet: {
            "@id": "/file-sets/set2",
            "@type": ["AnalysisSet", "FileSet", "Item"],
            accession: "SET002",
            files: [],
            summary: "Test set 2",
          } as FileSetObject,
          externalFiles: [],
          downstreamFile: {
            "@id": "/files/file2",
            "@type": ["File", "Item"],
            content_type: "reads",
            file_format: "fastq",
            file_set: "/file-sets/test",
          } as FileObject,
        },
      },
      {
        id: "fileset3",
        type: "fileset",
        position: { x: 0, y: 0 },
        data: {
          kind: NODE_KINDS.FILESET,
          fileSet: {
            "@id": "/file-sets/set3",
            "@type": ["MeasurementSet", "FileSet", "Item"],
            accession: "SET003",
            files: [],
            summary: "Test set 3",
          } as FileSetObject,
          externalFiles: [],
          downstreamFile: {
            "@id": "/files/file3",
            "@type": ["File", "Item"],
            content_type: "reads",
            file_format: "fastq",
            file_set: "/file-sets/test",
          } as FileObject,
        },
      },
      {
        id: "file1",
        type: "file",
        position: { x: 0, y: 0 },
        data: {
          kind: NODE_KINDS.FILE,
          file: {
            "@id": "/files/file1",
            "@type": ["File", "Item"],
            content_type: "reads",
            file_format: "fastq",
            file_set: "/file-sets/test",
          } as FileObject,
          upstreamNativeFiles: [],
          upstreamExternalFiles: [],
          upstreamFileSetNodes: [],
          referenceFiles: [],
          qualityMetrics: [],
        },
      },
    ];

    const result = collectRelevantFileSetStats(_nodes);
    expect(result).toEqual({
      AnalysisSet: 2,
      MeasurementSet: 1,
    });
  });

  it("should handle empty nodes array", () => {
    const result = collectRelevantFileSetStats([]);
    expect(result).toEqual({});
  });

  it("should handle nodes with only file nodes (no file-set nodes)", () => {
    const _nodes: Node<NodeMetadata>[] = [
      {
        id: "file1",
        type: "file",
        position: { x: 0, y: 0 },
        data: {
          kind: NODE_KINDS.FILE,
          file: {
            "@id": "/files/file1",
            "@type": ["File", "Item"],
            content_type: "reads",
            file_format: "fastq",
            file_set: "/file-sets/test",
          } as FileObject,
          upstreamNativeFiles: [],
          upstreamExternalFiles: [],
          upstreamFileSetNodes: [],
          referenceFiles: [],
          qualityMetrics: [],
        },
      },
    ];

    const result = collectRelevantFileSetStats(_nodes);
    expect(result).toEqual({});
  });
});

describe("getFileMetrics", () => {
  it("should return metrics associated with a file", () => {
    const file: FileObject = {
      "@id": "/files/file1",
      "@type": ["File", "Item"],
      content_type: "reads",
      file_format: "fastq",
      file_set: "/file-sets/test",
      quality_metrics: ["/quality-metrics/metric1", "/quality-metrics/metric2"],
    };

    const qualityMetrics: QualityMetricObject[] = [
      {
        "@id": "/quality-metrics/metric1",
        "@type": ["QualityMetric", "Item"],
        quality_metric_of: ["/files/file1"],
        analysis_step_version: "/analysis-step-versions/test",
      },
      {
        "@id": "/quality-metrics/metric2",
        "@type": ["QualityMetric", "Item"],
        quality_metric_of: ["/files/file1"],
        analysis_step_version: "/analysis-step-versions/test",
      },
      {
        "@id": "/quality-metrics/metric3",
        "@type": ["QualityMetric", "Item"],
        quality_metric_of: ["/files/other"],
        analysis_step_version: "/analysis-step-versions/test",
      },
    ];

    const result = getFileMetrics(file, qualityMetrics);
    expect(result).toHaveLength(2);
    expect(result.map((m) => m["@id"])).toEqual([
      "/quality-metrics/metric1",
      "/quality-metrics/metric2",
    ]);
  });

  it("should return empty array when file has no quality metrics", () => {
    const file: FileObject = {
      "@id": "/files/file1",
      "@type": ["File", "Item"],
      content_type: "reads",
      file_format: "fastq",
      file_set: "/file-sets/test",
      quality_metrics: [],
    };

    const qualityMetrics: QualityMetricObject[] = [
      {
        "@id": "/quality-metrics/metric1",
        "@type": ["QualityMetric", "Item"],
        quality_metric_of: ["/files/other"],
        analysis_step_version: "/analysis-step-versions/test",
      },
    ];

    const result = getFileMetrics(file, qualityMetrics);
    expect(result).toEqual([]);
  });

  it("should handle file with undefined quality_metrics", () => {
    const file: FileObject = {
      "@id": "/files/file1",
      "@type": ["File", "Item"],
      content_type: "reads",
      file_format: "fastq",
      file_set: "/file-sets/test",
      // quality_metrics is undefined
    };

    const qualityMetrics: QualityMetricObject[] = [
      {
        "@id": "/quality-metrics/metric1",
        "@type": ["QualityMetric", "Item"],
        quality_metric_of: ["/files/file1"],
        analysis_step_version: "/analysis-step-versions/test",
      },
    ];

    const result = getFileMetrics(file, qualityMetrics);
    expect(result).toEqual([]);
  });

  it("should handle empty quality metrics array", () => {
    const file: FileObject = {
      "@id": "/files/file1",
      "@type": ["File", "Item"],
      content_type: "reads",
      file_format: "fastq",
      file_set: "/file-sets/test",
      quality_metrics: ["/quality-metrics/metric1"],
    };

    const result = getFileMetrics(file, []);
    expect(result).toEqual([]);
  });
});

describe("generateGraphData", () => {
  it("should generate graph data for connected files", () => {
    const nativeFiles: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/file2"],
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
      },
    ];
    const externalFiles: FileObject[] = [];
    const fileFileSets: FileSetObject[] = [];
    const referenceFiles: FileObject[] = [];
    const qualityMetrics: QualityMetricObject[] = [];

    const result = generateGraphData(
      nativeFiles,
      externalFiles,
      fileFileSets,
      referenceFiles,
      qualityMetrics
    );

    expect(result).not.toBeNull();
    expect(result?.id).toBe("root");
    expect(result?.children).toBeDefined();
    expect(result?.edges).toBeDefined();
  });

  it("should generate graph data with external file sets", () => {
    const nativeFiles: FileObject[] = [
      {
        "@id": "/files/native1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/native",
        derived_from: ["/files/external1"],
      },
    ];
    const externalFiles: FileObject[] = [
      {
        "@id": "/files/external1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/external",
        derived_from: [],
      },
    ];
    const fileFileSets: FileSetObject[] = [
      {
        "@id": "/file-sets/external",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        accession: "EXT001",
        files: [],
        summary: "External file set",
      },
    ];
    const referenceFiles: FileObject[] = [];
    const qualityMetrics: QualityMetricObject[] = [];

    const result = generateGraphData(
      nativeFiles,
      externalFiles,
      fileFileSets,
      referenceFiles,
      qualityMetrics
    );

    expect(result).not.toBeNull();
    expect(result?.children?.length).toBeGreaterThan(0);
  });

  it("should generate graph data with reference files", () => {
    const nativeFiles: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/file2"],
        reference_files: ["/files/reference1"],
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
      },
    ];
    const externalFiles: FileObject[] = [];
    const fileFileSets: FileSetObject[] = [];
    const referenceFiles: FileObject[] = [
      {
        "@id": "/files/reference1",
        "@type": ["ReferenceFile", "File", "Item"],
        content_type: "genome reference",
        file_format: "fasta",
        file_set: "/file-sets/reference",
      },
    ];
    const qualityMetrics: QualityMetricObject[] = [];

    const result = generateGraphData(
      nativeFiles,
      externalFiles,
      fileFileSets,
      referenceFiles,
      qualityMetrics
    );

    expect(result).not.toBeNull();
    expect(result?.children?.length).toBeGreaterThan(0);
  });

  it("should generate graph data with quality metrics filtering", () => {
    const nativeFiles: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/file2"],
        quality_metrics: ["/quality-metrics/metric1"],
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
      },
    ];
    const externalFiles: FileObject[] = [];
    const fileFileSets: FileSetObject[] = [];
    const referenceFiles: FileObject[] = [];
    const qualityMetrics: QualityMetricObject[] = [
      {
        "@id": "/quality-metrics/metric1",
        "@type": ["QualityMetric", "Item"],
        quality_metric_of: ["/files/file1"],
        analysis_step_version: "/analysis-step-versions/test",
      },
    ];

    const result = generateGraphData(
      nativeFiles,
      externalFiles,
      fileFileSets,
      referenceFiles,
      qualityMetrics
    );

    expect(result).not.toBeNull();
    expect(result?.children?.length).toBeGreaterThan(0);
  });

  it("should generate graph data with files having null derived_from", () => {
    const nativeFiles: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: null, // null instead of undefined or array
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/file1"], // This file derives from file1
      },
    ] as FileObject[];
    const externalFiles: FileObject[] = [];
    const fileFileSets: FileSetObject[] = [];
    const referenceFiles: FileObject[] = [];
    const qualityMetrics: QualityMetricObject[] = [];

    const result = generateGraphData(
      nativeFiles,
      externalFiles,
      fileFileSets,
      referenceFiles,
      qualityMetrics
    );

    expect(result).not.toBeNull();
    expect(result?.children?.length).toBeGreaterThan(0);
  });

  it("should handle empty inputs", () => {
    const result = generateGraphData([], [], [], [], []);
    expect(result).toBeNull();
  });
});

describe("elkToReactFlow", () => {
  it("should handle ELK graph with undefined children", () => {
    const elkGraph = {
      id: "root",
      // children is undefined
      edges: [],
    };

    const result = elkToReactFlow(elkGraph);
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });

  it("should convert empty ELK graph to React Flow format", () => {
    const elkGraph = {
      id: "root",
      children: [],
      edges: [],
    };

    const result = elkToReactFlow(elkGraph);
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });

  it("should convert ELK graph with nodes to React Flow format", () => {
    const elkGraph = {
      id: "root",
      children: [
        {
          id: "node1",
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          metadata: {
            kind: NODE_KINDS.FILE,
            file: {
              "@id": "/files/file1",
              "@type": ["File", "Item"],
              content_type: "reads",
              file_format: "fastq",
              file_set: "/file-sets/test",
            } as FileObject,
            upstreamNativeFiles: [],
            upstreamExternalFiles: [],
            upstreamFileSetNodes: [],
            referenceFiles: [],
            qualityMetrics: [],
          },
        },
      ],
      edges: [],
    };

    const result = elkToReactFlow(elkGraph);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].id).toBe("node1");
    expect(result.nodes[0].type).toBe("file");
    expect(result.nodes[0].position).toEqual({ x: 0, y: 0 });
    expect(result.edges).toEqual([]);
  });

  it("should convert ELK graph with nested children to React Flow format", () => {
    const elkGraph = {
      id: "root",
      children: [
        {
          id: "parent1",
          x: 0,
          y: 0,
          width: 200,
          height: 100,
          metadata: {
            kind: NODE_KINDS.FILESET,
            fileSet: {
              "@id": "/file-sets/parent",
              "@type": ["AnalysisSet", "FileSet", "Item"],
              accession: "PARENT001",
              files: [],
              summary: "Parent file set",
            } as FileSetObject,
            externalFiles: [],
            downstreamFile: {
              "@id": "/files/downstream",
              "@type": ["File", "Item"],
              content_type: "reads",
              file_format: "fastq",
              file_set: "/file-sets/test",
            } as FileObject,
          },
          children: [
            {
              id: "child1",
              x: 10,
              y: 10,
              width: 100,
              height: 50,
              metadata: {
                kind: NODE_KINDS.FILE,
                file: {
                  "@id": "/files/child1",
                  "@type": ["File", "Item"],
                  content_type: "reads",
                  file_format: "fastq",
                  file_set: "/file-sets/test",
                } as FileObject,
                upstreamNativeFiles: [],
                upstreamExternalFiles: [],
                upstreamFileSetNodes: [],
                referenceFiles: [],
                qualityMetrics: [],
              },
            },
          ],
        },
      ],
      edges: [],
    };

    const result = elkToReactFlow(elkGraph);
    expect(result.nodes).toHaveLength(2); // Parent and child nodes both have metadata
    expect(result.nodes.map((n) => n.id)).toContain("parent1");
    expect(result.nodes.map((n) => n.id)).toContain("child1");
    expect(result.edges).toEqual([]);
  });

  it("should convert ELK graph with edges to React Flow format", () => {
    const elkGraph = {
      id: "root",
      children: [
        {
          id: "node1",
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          metadata: {
            kind: NODE_KINDS.FILE,
            file: {
              "@id": "/files/file1",
              "@type": ["File", "Item"],
              content_type: "reads",
              file_format: "fastq",
              file_set: "/file-sets/test",
            } as FileObject,
            upstreamNativeFiles: [],
            upstreamExternalFiles: [],
            upstreamFileSetNodes: [],
            referenceFiles: [],
            qualityMetrics: [],
          },
        },
        {
          id: "node2",
          x: 200,
          y: 0,
          width: 100,
          height: 50,
          metadata: {
            kind: NODE_KINDS.FILE,
            file: {
              "@id": "/files/file2",
              "@type": ["File", "Item"],
              content_type: "reads",
              file_format: "fastq",
              file_set: "/file-sets/test",
            } as FileObject,
            upstreamNativeFiles: [],
            upstreamExternalFiles: [],
            upstreamFileSetNodes: [],
            referenceFiles: [],
            qualityMetrics: [],
          },
        },
      ],
      edges: [
        {
          id: "edge1",
          sources: ["node1"],
          targets: ["node2"],
        },
      ],
    };

    const result = elkToReactFlow(elkGraph);
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].id).toBe("edge1");
    expect(result.edges[0].source).toBe("node1");
    expect(result.edges[0].target).toBe("node2");
  });
});

describe("countFileNodes", () => {
  it("should return 0 for empty node array", () => {
    const result = countFileNodes([]);
    expect(result).toBe(0);
  });

  it("should return the correct count for non-empty node array", () => {
    const _nodes: Node<NodeMetadata>[] = [
      {
        id: "file1",
        type: "file",
        position: { x: 0, y: 0 },
        data: {
          kind: NODE_KINDS.FILE,
          file: {
            "@id": "/files/file1",
            "@type": ["File", "Item"],
            content_type: "reads",
            file_format: "fastq",
            file_set: "/file-sets/test",
          } as FileObject,
          upstreamNativeFiles: [],
          upstreamExternalFiles: [],
          upstreamFileSetNodes: [],
          referenceFiles: [],
          qualityMetrics: [],
        },
      },
      {
        id: "file2",
        type: "file",
        position: { x: 0, y: 0 },
        data: {
          kind: NODE_KINDS.FILE,
          file: {
            "@id": "/files/file2",
            "@type": ["File", "Item"],
            content_type: "reads",
            file_format: "fastq",
            file_set: "/file-sets/test",
          } as FileObject,
          upstreamNativeFiles: [],
          upstreamExternalFiles: [],
          upstreamFileSetNodes: [],
          referenceFiles: [],
          qualityMetrics: [],
        },
      },
      {
        id: "fileset1",
        type: "fileset",
        position: { x: 0, y: 0 },
        data: {
          kind: NODE_KINDS.FILESET,
          fileSet: {
            "@id": "/file-sets/test",
            "@type": ["FileSet", "Item"],
          } as FileSetObject,
          externalFiles: [],
          downstreamFile: {
            "@id": "/files/downstream",
            "@type": ["File", "Item"],
            content_type: "reads",
            file_format: "fastq",
            file_set: "/file-sets/test",
          } as FileObject,
        },
      },
    ];

    const result = countFileNodes(_nodes);
    expect(result).toBe(2);
  });
});

describe("generateSVGContent", () => {
  // Mock DOM-elements factory that creates a fake DOM element for use in Jest tests. It returns a
  // plain object that mimics the interface of a real HTMLElement
  function createMockElement(tagName: string): any {
    return {
      tagName: tagName.toUpperCase(),
      getAttribute: jest.fn().mockReturnValue(null),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      querySelector: jest.fn().mockReturnValue(null),
      querySelectorAll: jest.fn().mockReturnValue([]),
      classList: { remove: jest.fn() } as unknown as DOMTokenList,
      style: {} as unknown as CSSStyleDeclaration,
      getBoundingClientRect: jest.fn().mockReturnValue({
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        top: 0,
        right: 800,
        bottom: 600,
        left: 0,
      }),
      hasAttribute: jest.fn().mockReturnValue(false),
      innerHTML: "",
    };
  }

  it("should return undefined when ReactFlow renderer is not found", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    jest.spyOn(document, "getElementById").mockReturnValue(null);

    const result = generateSVGContent("test-graph-id");

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "ReactFlow renderer not found for graphId:",
      "test-graph-id"
    );

    consoleSpy.mockRestore();
  });

  it("should return undefined when container exists but renderer is not found", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn().mockReturnValue(null);

    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    const result = generateSVGContent("test-graph-id");

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "ReactFlow renderer not found for graphId:",
      "test-graph-id"
    );

    consoleSpy.mockRestore();
  });

  it("should generate SVG content with basic structure", () => {
    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockReturnValue([]);
    mockRenderer.querySelector = jest
      .fn()
      .mockReturnValue(createMockElement("svg"));

    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn().mockReturnValue(mockRenderer);

    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    const result = generateSVGContent("test-graph-id");

    expect(result).toContain("<svg");
    expect(result).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("should include edge paths in SVG content", () => {
    const mockPath = createMockElement("path");
    mockPath.getAttribute = jest.fn().mockImplementation((attr) => {
      if (attr === "d") {
        return "M10,10 L20,20";
      }
      if (attr === "stroke") {
        return "#000000";
      }
      return null;
    });

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === ".react-flow__edge path") {
        return [mockPath];
      }
      return [];
    });
    mockRenderer.querySelector = jest
      .fn()
      .mockReturnValue(createMockElement("svg"));

    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn().mockReturnValue(mockRenderer);

    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    const result = generateSVGContent("test-graph-id");

    expect(result).toContain('<path d="M10,10 L20,20"');
    expect(result).toContain('stroke="#000000"');
  });

  it("should include edge arrowheads in SVG content", () => {
    const mockPolygon = createMockElement("polygon");
    mockPolygon.getAttribute = jest.fn().mockImplementation((attr) => {
      if (attr === "points") {
        return "0,0 10,5 0,10";
      }
      if (attr === "fill") {
        return "#ff0000";
      }
      return null;
    });

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === ".react-flow__edge polygon") {
        return [mockPolygon];
      }
      return [];
    });
    mockRenderer.querySelector = jest
      .fn()
      .mockReturnValue(createMockElement("svg"));

    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn().mockReturnValue(mockRenderer);

    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    const result = generateSVGContent("test-graph-id");

    expect(result).toContain('<polygon points="0,0 10,5 0,10"');
    expect(result).toContain('fill="#6b7280"');
  });

  it("should handle edges with default colors when attributes are missing", () => {
    const mockPath = createMockElement("path");
    mockPath.getAttribute = jest.fn().mockImplementation((attr) => {
      if (attr === "d") {
        return "M10,10 L20,20";
      }
      return null; // No stroke attribute
    });

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === ".react-flow__edge path") {
        return [mockPath];
      }
      return [];
    });
    mockRenderer.querySelector = jest
      .fn()
      .mockReturnValue(createMockElement("svg"));

    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn().mockReturnValue(mockRenderer);

    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    const result = generateSVGContent("test-graph-id");

    expect(result).toContain('<path d="M10,10 L20,20"');
    expect(result).toContain('stroke="#6b7280"'); // Default color
  });

  it("should include file nodes in SVG content", () => {
    const mockFileNode = createMockElement("div");
    mockFileNode.style = { transform: "translate(10px, 20px)" };
    mockFileNode.querySelector = jest.fn().mockReturnValue(null);

    const mockFileSvg = createMockElement("svg");
    mockFileSvg.innerHTML = "<text>File Node</text>";
    mockFileNode.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === "svg") {
        return mockFileSvg;
      }
      return null;
    });

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === "[data-id]") {
        return [mockFileNode];
      }
      if (selector === ".react-flow__edge path") {
        return [];
      }
      if (selector === ".react-flow__edge polygon") {
        return [];
      }
      return [];
    });
    mockRenderer.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === ".react-flow__viewport") {
        return createMockElement("div");
      }
      return null;
    });

    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn().mockReturnValue(mockRenderer);

    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    const result = generateSVGContent("test-graph-id");
    expect(result).toContain('font-family="Helvetica, Arial, sans-serif"');
  });

  it("should include file set nodes with rounded corners", () => {
    const mockFileSetNode = createMockElement("div");
    mockFileSetNode.style = { transform: "translate(50px, 100px)" };

    const mockFileSetSvg = createMockElement("svg");
    mockFileSetSvg.getAttribute = jest.fn().mockImplementation((attr) => {
      if (attr === "data-fileset-type") {
        return "measurement";
      }
      return null;
    });
    mockFileSetSvg.hasAttribute = jest.fn().mockImplementation((attr) => {
      return attr === "data-fileset-type";
    });
    mockFileSetSvg.innerHTML = "<text>Measurement FileSet</text>";

    mockFileSetNode.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === "svg") {
        return mockFileSetSvg;
      }
      return null;
    });

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === "[data-id]") {
        return [mockFileSetNode];
      }
      if (selector === ".react-flow__edge path") {
        return [];
      }
      if (selector === ".react-flow__edge polygon") {
        return [];
      }
      return [];
    });
    mockRenderer.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === ".react-flow__viewport") {
        return createMockElement("div");
      }
      return null;
    });

    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn().mockReturnValue(mockRenderer);

    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    const result = generateSVGContent("test-graph-id");

    expect(result).toContain("Measurement FileSet");
    expect(result).toContain(`rx="${NODE_HEIGHT / 2}"`);
  });

  it("should handle file set nodes with unknown type", () => {
    const mockFileSetNode = createMockElement("div");
    mockFileSetNode.style = { transform: "translate(0px, 0px)" };

    const mockFileSetSvg = createMockElement("svg");
    mockFileSetSvg.getAttribute = jest.fn().mockImplementation((attr) => {
      if (attr === "data-fileset-type") {
        return "unknown"; // Unknown file set type
      }
      return null;
    });
    mockFileSetSvg.hasAttribute = jest.fn().mockImplementation((attr) => {
      return attr === "data-fileset-type";
    });
    mockFileSetSvg.innerHTML = "<text>Unknown FileSet</text>";

    mockFileSetNode.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === "svg") {
        return mockFileSetSvg;
      }
      return null;
    });

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === "[data-id]") {
        return [mockFileSetNode];
      }
      if (selector === ".react-flow__edge path") {
        return [];
      }
      if (selector === ".react-flow__edge polygon") {
        return [];
      }
      return [];
    });
    mockRenderer.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === ".react-flow__viewport") {
        return createMockElement("div");
      }
      return null;
    });

    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn().mockReturnValue(mockRenderer);

    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    const result = generateSVGContent("test-graph-id");

    expect(result).toContain("Unknown FileSet");
    expect(result).toContain(`rx="${NODE_HEIGHT / 2}"`); // Should still have rounded corners
  });

  it("should handle file set nodes without data-fileset-type attribute", () => {
    const mockFileSetNode = createMockElement("div");
    mockFileSetNode.style = { transform: "translate(0px, 0px)" };

    const mockFileSetSvg = createMockElement("svg");
    mockFileSetSvg.getAttribute = jest.fn().mockReturnValue(""); // Empty data-fileset-type
    mockFileSetSvg.hasAttribute = jest.fn().mockReturnValue(true); // Has attribute but empty value
    mockFileSetSvg.innerHTML = "<text>No Type FileSet</text>";

    mockFileSetNode.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === "svg") {
        return mockFileSetSvg;
      }
      return null;
    });

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === "[data-id]") {
        return [mockFileSetNode];
      }
      if (selector === ".react-flow__edge path") {
        return [];
      }
      if (selector === ".react-flow__edge polygon") {
        return [];
      }
      return [];
    });
    mockRenderer.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === ".react-flow__viewport") {
        return createMockElement("div");
      }
      return null;
    });

    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn().mockReturnValue(mockRenderer);

    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    const result = generateSVGContent("test-graph-id");

    expect(result).toContain("No Type FileSet");
  });

  it("should skip nodes when SVG element is not found", () => {
    // Create a mock node element that doesn't have an SVG child
    const mockNodeWithoutSvg = createMockElement("div");
    mockNodeWithoutSvg.querySelector = jest.fn().mockReturnValue(null); // No SVG found

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === "[data-id]") {
        return [mockNodeWithoutSvg]; // Return node but it has no SVG
      }
      if (selector === ".react-flow__edge path") {
        return [];
      }
      if (selector === ".react-flow__edge polygon") {
        return [];
      }
      return [];
    });
    mockRenderer.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === ".react-flow__viewport") {
        return createMockElement("div");
      }
      return null;
    });

    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn().mockReturnValue(mockRenderer);

    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    const result = generateSVGContent("test-graph-id");

    expect(result).toBeDefined();
    expect(result).toContain("<svg");

    // Should not contain any node content since the node SVG was not found
    expect(result).not.toContain('transform="translate(10, 20)"');
  });

  it("should handle paths and polygons without required attributes", () => {
    const mockPathWithoutD = createMockElement("path");
    mockPathWithoutD.getAttribute = jest.fn().mockReturnValue(null); // No 'd' attribute

    const mockPolygonWithoutPoints = createMockElement("polygon");
    mockPolygonWithoutPoints.getAttribute = jest.fn().mockReturnValue(null); // No 'points' attribute

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === ".react-flow__edge path") {
        return [mockPathWithoutD];
      }
      if (selector === ".react-flow__edge polygon") {
        return [mockPolygonWithoutPoints];
      }
      return [];
    });
    mockRenderer.querySelector = jest.fn().mockReturnValue(null);

    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn().mockReturnValue(mockRenderer);

    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    const result = generateSVGContent("test-graph-id");

    expect(result).toBeDefined();
  });

  it("should calculate dimensions from node bounds with padding", () => {
    // Mock a viewport element with specific bounding box
    const mockViewport = createMockElement("div");
    mockViewport.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 250,
      height: 280,
      x: 0,
      y: 0,
      top: 0,
      right: 250,
      bottom: 280,
      left: 0,
    });

    // Mock edge path element
    const mockEdgePath = createMockElement("path");
    mockEdgePath.getAttribute = jest.fn((attr: string) => {
      if (attr === "d") {
        return "M 0 0 L 100 100";
      }
      if (attr === "stroke") {
        return "#000000";
      }
      if (attr === "stroke-width") {
        return "2";
      }
      return null;
    });

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn((selector: string) => {
      if (selector === "[data-id]") {
        return [];
      }
      if (selector === ".react-flow__edge path") {
        return [mockEdgePath];
      }
      if (selector === ".react-flow__edge polygon") {
        return [];
      }
      return [];
    });
    mockRenderer.querySelector = jest.fn((selector: string) => {
      if (selector === ".react-flow__viewport") {
        return mockViewport;
      }
      return null;
    });

    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn((selector: string) => {
      if (selector === ".react-flow__renderer") {
        return mockRenderer;
      }
      return null;
    });

    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    const result = generateSVGContent("test-graph-id");

    expect(result).toContain('width="260px"');
    expect(result).toContain('height="290px"');
    expect(result).toContain('viewBox="-5 -5 260 290"');
  });

  it("should handle nodes with invalid transform values", () => {
    const mockFileNode = createMockElement("div");
    // Set invalid transform that won't match the regex
    mockFileNode.style = { transform: "scale(1.5) rotate(45deg)" };

    const mockFileSvg = createMockElement("svg");
    mockFileSvg.innerHTML = "<text>Test Node</text>";

    mockFileNode.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === "svg") {
        return mockFileSvg;
      }
      return null;
    });

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === "[data-id]") {
        return [mockFileNode];
      }
      if (selector === ".react-flow__edge path") {
        return [];
      }
      if (selector === ".react-flow__edge polygon") {
        return [];
      }
      return [];
    });
    mockRenderer.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === ".react-flow__viewport") {
        return createMockElement("div");
      }
      return null;
    });

    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn().mockReturnValue(mockRenderer);

    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    const result = generateSVGContent("test-graph-id");

    // Should default to position (0, 0) when transform doesn't match expected pattern
    expect(result).toContain('transform="translate(0, 0)"');
    expect(result).toContain("Test Node");
  });

  it("should convert color variables to hex for file nodes", () => {
    const mockFileNode = createMockElement("div");
    mockFileNode.style = { transform: "translate(10px, 20px)" };

    // Set up an SVG with elements that have fill colors using CSS variables.
    const mockFileSvg = createMockElement("svg");
    mockFileSvg.innerHTML =
      '<rect fill="var(--color-status-released-bg)" /><text fill="var(--color-status-archived-bg)">Status</text><circle fill="var(--color-unknown-variable)" />';
    mockFileNode.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === "svg") {
        return mockFileSvg;
      }
      return null;
    });

    // Mock the renderer to return our file node.
    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === "[data-id]") {
        return [mockFileNode];
      }
      if (selector === ".react-flow__edge path") {
        return [];
      }
      if (selector === ".react-flow__edge polygon") {
        return [];
      }
      return [];
    });
    mockRenderer.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === ".react-flow__viewport") {
        return createMockElement("div");
      }
      return null;
    });

    // Mock the container to return our renderer.
    const mockContainer = createMockElement("div");
    mockContainer.querySelector = jest.fn().mockReturnValue(mockRenderer);

    // Mock the document.getElementById to return our container.
    jest
      .spyOn(document, "getElementById")
      .mockReturnValue(mockContainer as any);

    // Call `generateSVGContent` to make sure it does the color variable conversion to hex values.
    const result = generateSVGContent("test-graph-id");

    // CSS variables should be converted to hex values.
    expect(result).toContain('fill="#00a651"');
    expect(result).toContain('fill="#b0b0b0"');

    // Original CSS variables should not remain.
    expect(result).not.toContain("var(--color-status-released-bg)");
    expect(result).not.toContain("var(--color-status-archived-bg)");

    // Unknown variable falls back to the original when colorVariableToColorHex returns falsy.
    expect(result).toContain('fill="var(--color-unknown-variable)"');
  });
});
