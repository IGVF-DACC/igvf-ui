import {
  countFileNodes,
  NODE_WIDTH,
  NODE_HEIGHT,
  trimIsolatedFiles,
  collectRelevantFileSetStats,
  generateGraphData,
  getFileMetrics,
  elkToReactFlow,
} from "../lib";
import { NODE_KINDS } from "../types";
import type { FileObject, FileSetObject } from "../../../globals";
import type { QualityMetricObject } from "../../../lib/quality-metric";
import type { Node } from "@xyflow/react";
import type { NodeMetadata } from "../types";

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
    const nodes: Node<NodeMetadata>[] = [
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

    const result = collectRelevantFileSetStats(nodes);
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
    const nodes: Node<NodeMetadata>[] = [
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

    const result = collectRelevantFileSetStats(nodes);
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
    const nodes: Node<NodeMetadata>[] = [
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

    const result = countFileNodes(nodes);
    expect(result).toBe(2);
  });
});
