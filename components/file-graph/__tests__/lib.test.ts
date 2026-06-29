import {
  collectRelevantFileSetStats,
  convertGroupsToElkNodes,
  countFileNodes,
  elkToReactFlow,
  elkToReactFlowNodes,
  generateGraphData,
  generateGroupEdges,
  generateIncludedFiles,
  generateSVGContent,
  getFileMetrics,
  NODE_WIDTH,
  NODE_HEIGHT,
  trimIsolatedFiles,
} from "../lib";
import type { FileObject } from "../../../globals";
import { type FileSetObject } from "../../../lib/file-sets";
import { type QualityMetricObject } from "../../../lib/quality-metric";
import type { Node } from "@xyflow/react";
import {
  FileSetNode,
  isFileSetNodeMetadata,
  NODE_KINDS,
  type ElkNodeEx,
  type NodeMetadata,
} from "../types";
import { GroupNodeId } from "../grouping-pipeline/types";

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
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
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
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/file1"],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
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
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
      {
        "@id": "/files/connected1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/connected2"],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
      {
        "@id": "/files/connected2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
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
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
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
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
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
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
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
          downstreamFiles: [
            {
              "@id": "/files/file1",
              "@type": ["File", "Item"],
              content_type: "reads",
              file_format: "fastq",
              file_set: "/file-sets/test",
            } as FileObject,
          ],
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
          downstreamFiles: [
            {
              "@id": "/files/file2",
              "@type": ["File", "Item"],
              content_type: "reads",
              file_format: "fastq",
              file_set: "/file-sets/test",
            } as FileObject,
          ],
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
          downstreamFiles: [
            {
              "@id": "/files/file3",
              "@type": ["File", "Item"],
              content_type: "reads",
              file_format: "fastq",
              file_set: "/file-sets/test",
            } as FileObject,
          ],
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
      md5sum: "02d89923100d9385f7fa351e9c35d4ca",
      quality_metrics: ["/quality-metrics/metric1", "/quality-metrics/metric2"],
      status: "released",
    };

    const qualityMetrics: QualityMetricObject[] = [
      {
        "@id": "/quality-metrics/metric1",
        "@type": ["QualityMetric", "Item"],
        quality_metric_of: ["/files/file1"],
        analysis_step_version: "/analysis-step-versions/test",
        status: "released",
      },
      {
        "@id": "/quality-metrics/metric2",
        "@type": ["QualityMetric", "Item"],
        quality_metric_of: ["/files/file1"],
        analysis_step_version: "/analysis-step-versions/test",
        status: "released",
      },
      {
        "@id": "/quality-metrics/metric3",
        "@type": ["QualityMetric", "Item"],
        quality_metric_of: ["/files/other"],
        analysis_step_version: "/analysis-step-versions/test",
        status: "released",
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
      md5sum: "02d89923100d9385f7fa351e9c35d4ca",
      quality_metrics: [],
      status: "released",
    };

    const qualityMetrics: QualityMetricObject[] = [
      {
        "@id": "/quality-metrics/metric1",
        "@type": ["QualityMetric", "Item"],
        quality_metric_of: ["/files/other"],
        analysis_step_version: "/analysis-step-versions/test",
        status: "released",
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
      md5sum: "02d89923100d9385f7fa351e9c35d4ca",
      status: "released",
      // quality_metrics is undefined
    };

    const qualityMetrics: QualityMetricObject[] = [
      {
        "@id": "/quality-metrics/metric1",
        "@type": ["QualityMetric", "Item"],
        quality_metric_of: ["/files/file1"],
        analysis_step_version: "/analysis-step-versions/test",
        status: "released",
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
      md5sum: "02d89923100d9385f7fa351e9c35d4ca",
      quality_metrics: ["/quality-metrics/metric1"],
      status: "released",
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
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
    ];
    const externalFiles: FileObject[] = [];
    const fileFileSets: FileSetObject[] = [
      {
        "@id": "/file-sets/reference",
        "@type": ["ReferenceFileSet", "FileSet", "Item"],
        accession: "REF001",
        file_set_type: "reference data",
        files: [],
        summary: "Reference file set",
        status: "released",
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
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
    ];
    const externalFiles: FileObject[] = [
      {
        "@id": "/files/external1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: {
          "@id": "/file-sets/external",
        },
        derived_from: [],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
    ] as FileObject[];
    const fileFileSets: FileSetObject[] = [
      {
        "@id": "/file-sets/external",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        accession: "EXT001",
        file_set_type: "reference data",
        files: [],
        summary: "External file set",
        status: "released",
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

  it("should reuse an external file-set node and append downstream files", () => {
    const nativeFiles: FileObject[] = [
      {
        "@id": "/files/native1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/native",
        derived_from: ["/files/external1"],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
      {
        "@id": "/files/native2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/native",
        derived_from: ["/files/external1"],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
    ];
    const externalFiles: FileObject[] = [
      {
        "@id": "/files/external1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: {
          "@id": "/file-sets/external",
        },
        derived_from: [],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
    ] as FileObject[];
    const fileFileSets: FileSetObject[] = [
      {
        "@id": "/file-sets/external",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        accession: "EXT001",
        file_set_type: "reference data",
        files: [],
        summary: "External file set",
        status: "released",
      },
    ];

    const result = generateGraphData(
      nativeFiles,
      externalFiles,
      fileFileSets,
      [],
      []
    );

    expect(result).not.toBeNull();
    const externalFileSetNode = (
      result?.children as ElkNodeEx[] | undefined
    )?.find(
      (node) =>
        isFileSetNodeMetadata(node.metadata) &&
        node.metadata.fileSet?.["@id"] === "/file-sets/external"
    );
    expect(externalFileSetNode).toBeDefined();
    expect(isFileSetNodeMetadata(externalFileSetNode?.metadata)).toBe(true);

    const downstreamIds = (
      externalFileSetNode as FileSetNode
    ).metadata.downstreamFiles
      .map((file) => file["@id"])
      .sort();
    expect(downstreamIds).toEqual(["/files/native1", "/files/native2"]);
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
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
    ];
    const externalFiles: FileObject[] = [];
    const fileFileSets: FileSetObject[] = [
      {
        "@id": "/file-sets/reference",
        "@type": ["ReferenceFileSet", "FileSet", "Item"],
        accession: "REF001",
        file_set_type: "reference data",
        files: [],
        summary: "Reference file set",
        status: "released",
      },
    ];
    const referenceFiles: FileObject[] = [
      {
        "@id": "/files/reference1",
        "@type": ["ReferenceFile", "File", "Item"],
        content_type: "genome reference",
        file_format: "fasta",
        file_set: {
          "@id": "/file-sets/reference",
        },
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
    ] as FileObject[];
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
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
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
        status: "released",
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

describe("generateGroupEdges", () => {
  it("should return empty array when no group nodes are provided", () => {
    const nonGroupNodes = [
      {
        id: "/files/file1",
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
        id: "set-1",
        metadata: {
          kind: NODE_KINDS.FILESET,
          fileSet: {
            "@id": "/file-sets/set-1/",
            "@type": ["AnalysisSet", "FileSet", "Item"],
            accession: "SET001",
            file_set_type: "analysis",
            summary: "test set",
          } as FileSetObject,
          downstreamFiles: [
            {
              "@id": "/files/file1",
              "@type": ["File", "Item"],
              content_type: "reads",
              file_format: "fastq",
              file_set: "/file-sets/test",
            } as FileObject,
          ],
          externalFiles: [],
        },
      },
    ];

    const result = generateGroupEdges(nonGroupNodes as any);

    expect(result).toEqual([]);
  });

  it("should return empty array when group node has no target file ids", () => {
    const groupNodes = [
      {
        id: "group-empty",
        metadata: {
          kind: NODE_KINDS.GROUP,
          targetFileIds: [],
        },
      },
    ];

    const result = generateGroupEdges(groupNodes as any);

    expect(result).toEqual([]);
  });

  it("should generate one edge per target file id for each group", () => {
    const groupNodes = [
      {
        id: "group-a",
        metadata: {
          kind: NODE_KINDS.GROUP,
          targetFileIds: ["/files/file1", "/files/file2"],
        },
      },
      {
        id: "group-b",
        metadata: {
          kind: NODE_KINDS.GROUP,
          targetFileIds: ["/files/file3"],
        },
      },
      {
        id: "not-a-group",
        metadata: {
          kind: NODE_KINDS.FILESET,
          fileSet: {
            "@id": "/file-sets/set-2/",
            "@type": ["AnalysisSet", "FileSet", "Item"],
            accession: "SET002",
            file_set_type: "analysis",
            summary: "test set 2",
          } as FileSetObject,
          downstreamFiles: [
            {
              "@id": "/files/file3",
              "@type": ["File", "Item"],
              content_type: "reads",
              file_format: "fastq",
              file_set: "/file-sets/test",
            } as FileObject,
          ],
          externalFiles: [],
        },
      },
    ];

    const result = generateGroupEdges(groupNodes as any);

    expect(result).toHaveLength(3);
    expect(result).toEqual(
      expect.arrayContaining([
        {
          id: "layout-group-a-/files/file1",
          sources: ["group-a"],
          targets: ["/files/file1"],
        },
        {
          id: "layout-group-a-/files/file2",
          sources: ["group-a"],
          targets: ["/files/file2"],
        },
        {
          id: "layout-group-b-/files/file3",
          sources: ["group-b"],
          targets: ["/files/file3"],
        },
      ])
    );
  });
});

describe("Test generateIncludedFiles function", () => {
  it("should return empty array when no files are included", () => {
    const result = generateIncludedFiles([], []);
    expect(result).toEqual([]);
  });

  it("should return same files when all files are connected", () => {
    const files: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/file2"],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
    ];
    const derivedFromFiles = [files[0]];

    const result = generateIncludedFiles(files, derivedFromFiles);
    expect(result).toHaveLength(2);
    expect(result.map((f) => f["@id"])).toEqual([
      "/files/file1",
      "/files/file2",
    ]);
  });

  it("should filter out derived-from files not included", () => {
    const files: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/file2"],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/file3"],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
    ];

    const derivedFromFiles = [files[1]]; // Only file1 is included
    const result = generateIncludedFiles(files, derivedFromFiles);
    expect(result).toHaveLength(2);
    expect(result[0].derived_from).toEqual(["/files/file2"]);
    expect(result[1].derived_from).toEqual([]);
  });

  it("should handle files without derived_from property", () => {
    const files: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["/files/file2"],
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        md5sum: "02d89923100d9385f7fa351e9c35d4ca",
        status: "released",
        // No derived_from property at all
      },
    ];

    const derivedFromFiles = [files[1]];
    const result = generateIncludedFiles(files, derivedFromFiles);
    expect(result).toHaveLength(2);
    expect(result[0].derived_from).toEqual(["/files/file2"]);
    expect(result[1].derived_from).toEqual([]);
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
            downstreamFiles: [
              {
                "@id": "/files/downstream",
                "@type": ["File", "Item"],
                content_type: "reads",
                file_format: "fastq",
                file_set: "/file-sets/test",
              } as FileObject,
            ],
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

describe("elkToReactFlowNodes", () => {
  it("should convert a top-level non-group node without parentId", () => {
    const elkNodes = [
      {
        id: "file-node-1",
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        metadata: {
          kind: NODE_KINDS.FILE,
          file: {
            "@id": "/files/file-node-1/",
            "@type": ["File", "Item"],
            content_type: "reads",
            file_format: "fastq",
            file_set: "/file-sets/test/",
          } as FileObject,
          upstreamNativeFiles: [],
          upstreamExternalFiles: [],
          upstreamFileSetNodes: [],
          referenceFiles: [],
          qualityMetrics: [],
        },
      },
    ];

    const result = elkToReactFlowNodes(elkNodes as any);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: "file-node-1",
        type: NODE_KINDS.FILE,
        position: { x: 10, y: 20 },
        width: 100,
        height: 50,
        style: { width: 100, height: 50 },
        draggable: false,
        selectable: false,
      })
    );
    expect(result[0]).not.toHaveProperty("parentId");
  });

  it("should include parentId for non-group children nested under a group", () => {
    const elkNodes = [
      {
        id: "parent-group",
        x: 0,
        y: 0,
        width: 90,
        height: 70,
        metadata: {
          kind: NODE_KINDS.GROUP,
          targetFileIds: ["/files/file-node-child/"],
        },
        children: [
          {
            id: "file-node-child",
            x: 1,
            y: 2,
            width: 50,
            height: 30,
            metadata: {
              kind: NODE_KINDS.FILE,
              file: {
                "@id": "/files/file-node-child/",
                "@type": ["File", "Item"],
                content_type: "reads",
                file_format: "fastq",
                file_set: "/file-sets/test/",
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
    ];

    const result = elkToReactFlowNodes(elkNodes as any);

    expect(result).toHaveLength(2);
    const childNode = result.find((node) => node.id === "file-node-child");
    expect(childNode?.parentId).toBe("parent-group");
  });

  it("should place group nodes before descendants and recurse through children", () => {
    const elkNodes = [
      {
        id: "group-1",
        x: 0,
        y: 0,
        width: 300,
        height: 200,
        metadata: {
          kind: NODE_KINDS.GROUP,
          targetFileIds: ["/files/target-1/"],
        },
        children: [
          {
            id: "fileset-1",
            x: 10,
            y: 10,
            width: 150,
            height: 60,
            metadata: {
              kind: NODE_KINDS.FILESET,
              fileSet: {
                "@id": "/file-sets/fileset-1/",
                "@type": ["AnalysisSet", "FileSet", "Item"],
                accession: "FS001",
                file_set_type: "analysis",
                summary: "file set",
              } as FileSetObject,
              externalFiles: [],
              downstreamFiles: [
                {
                  "@id": "/files/downstream-1/",
                  "@type": ["File", "Item"],
                  content_type: "reads",
                  file_format: "fastq",
                  file_set: "/file-sets/fileset-1/",
                } as FileObject,
              ],
            },
            children: [
              {
                id: "file-1",
                x: 20,
                y: 20,
                width: 120,
                height: 55,
                metadata: {
                  kind: NODE_KINDS.FILE,
                  file: {
                    "@id": "/files/file-1/",
                    "@type": ["File", "Item"],
                    content_type: "reads",
                    file_format: "fastq",
                    file_set: "/file-sets/fileset-1/",
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
      },
    ];

    const result = elkToReactFlowNodes(elkNodes as any);

    expect(result.map((node) => node.id)).toEqual([
      "group-1",
      "fileset-1",
      "file-1",
    ]);

    expect(result[0]).toEqual(
      expect.objectContaining({
        id: "group-1",
        type: NODE_KINDS.GROUP,
        position: { x: 0, y: 0 },
        style: { width: 300, height: 200 },
        draggable: false,
        selectable: false,
      })
    );
    expect(result[0]).not.toHaveProperty("parentId");

    const fileSetNode = result.find((node) => node.id === "fileset-1");
    expect(fileSetNode?.parentId).toBe("group-1");

    const fileNode = result.find((node) => node.id === "file-1");
    expect(fileNode?.parentId).toBe("fileset-1");
  });

  it("should convert a group node with no children", () => {
    const elkNodes = [
      {
        id: "group-no-children",
        x: 5,
        y: 6,
        width: 111,
        height: 112,
        metadata: {
          kind: NODE_KINDS.GROUP,
          targetFileIds: [],
        },
      },
    ];

    const result = elkToReactFlowNodes(elkNodes as any);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("group-no-children");
    expect(result[0].type).toBe(NODE_KINDS.GROUP);
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
          downstreamFiles: [
            {
              "@id": "/files/downstream",
              "@type": ["File", "Item"],
              content_type: "reads",
              file_format: "fastq",
              file_set: "/file-sets/test",
            } as FileObject,
          ],
        },
      },
    ];

    const result = countFileNodes(_nodes);
    expect(result).toBe(2);
  });
});

describe("generateSVGContent", () => {
  const mockGraphBounds = {
    x: 0,
    y: 0,
    width: 250,
    height: 280,
  };

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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return undefined when ReactFlow renderer is not found", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    jest.spyOn(document, "getElementById").mockReturnValue(null);

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);
    expect(result).toContain('font-family="Helvetica, Arial, sans-serif"');
  });

  it("should include file set nodes with rounded corners", () => {
    const mockFileSetNode = createMockElement("div");
    mockFileSetNode.style = {
      transform: "translate(50px, 100px)",
      width: "156px",
      height: "60px",
    };

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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

    expect(result).toContain("Measurement FileSet");
    expect(result).toContain(`rx="${NODE_HEIGHT / 2}"`);
  });

  it("should use rendered dimensions for file set nodes", () => {
    const mockFileSetNode = createMockElement("div");
    mockFileSetNode.style = {
      transform: "translate(50px, 100px)",
      width: "156px",
      height: "60px",
    };

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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

    expect(result).toContain('width="156"');
    expect(result).toContain('height="60"');
    expect(result).toContain('rx="30"');
  });

  it("should handle file set nodes with unknown type", () => {
    const mockFileSetNode = createMockElement("div");
    mockFileSetNode.style = {
      transform: "translate(0px, 0px)",
      width: "156px",
      height: "60px",
    };

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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

    expect(result).toContain("Unknown FileSet");
    expect(result).toContain(`rx="${NODE_HEIGHT / 2}"`); // Should still have rounded corners
  });

  it("should handle file set nodes without data-fileset-type attribute", () => {
    const mockFileSetNode = createMockElement("div");
    mockFileSetNode.style = {
      transform: "translate(0px, 0px)",
      width: "156px",
      height: "60px",
    };

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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

    expect(result).toContain('width="270px"');
    expect(result).toContain('height="300px"');
    expect(result).toContain('viewBox="-10 -10 270 300"');
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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

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
    const result = generateSVGContent("test-graph-id", mockGraphBounds);

    // CSS variables should be converted to hex values.
    expect(result).toContain('fill="#00a651"');
    expect(result).toContain('fill="#b0b0b0"');

    // Original CSS variables should not remain.
    expect(result).not.toContain("var(--color-status-released-bg)");
    expect(result).not.toContain("var(--color-status-archived-bg)");

    // Unknown variable falls back to the original when colorVariableToColorHex returns falsy.
    expect(result).toContain('fill="var(--color-unknown-variable)"');
  });

  it("should render group nodes behind edges and regular nodes in SVG output", () => {
    const mockGroupNode = createMockElement("div");
    mockGroupNode.style = {
      transform: "translate(5px, 10px)",
      width: "300px",
      height: "180px",
    };

    const mockGroupSvg = createMockElement("svg");
    mockGroupSvg.hasAttribute = jest.fn().mockImplementation((attr) => {
      return attr === "data-group-node";
    });
    mockGroupSvg.innerHTML = "";
    mockGroupNode.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === "svg") {
        return mockGroupSvg;
      }
      return null;
    });

    const mockFileNode = createMockElement("div");
    mockFileNode.style = { transform: "translate(50px, 60px)" };
    const mockFileSvg = createMockElement("svg");
    mockFileSvg.innerHTML = "<text>Regular Node</text>";
    mockFileNode.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === "svg") {
        return mockFileSvg;
      }
      return null;
    });

    const mockPath = createMockElement("path");
    mockPath.getAttribute = jest.fn().mockImplementation((attr) => {
      if (attr === "d") {
        return "M0,0 L100,100";
      }
      if (attr === "stroke") {
        return "#000000";
      }
      return null;
    });

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === "[data-id]") {
        return [mockGroupNode, mockFileNode];
      }
      if (selector === ".react-flow__edge path") {
        return [mockPath];
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

    const result = generateSVGContent(
      "test-graph-id",
      mockGraphBounds
    ) as string;

    const groupIndex = result.indexOf('transform="translate(5, 10)"');
    const edgeIndex = result.indexOf('<path d="M0,0 L100,100"');
    const regularNodeIndex = result.indexOf("Regular Node");

    expect(groupIndex).toBeGreaterThan(-1);
    expect(edgeIndex).toBeGreaterThan(-1);
    expect(regularNodeIndex).toBeGreaterThan(-1);
    expect(groupIndex).toBeLessThan(edgeIndex);
    expect(edgeIndex).toBeLessThan(regularNodeIndex);
    expect(result).toContain('width="300"');
    expect(result).toContain('height="180"');
  });

  it("should use computedStyle size for real group node elements", () => {
    const realGroupNode = document.createElement("div");
    realGroupNode.style.transform = "translate(1px, 2px)";

    const realGroupSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    realGroupSvg.setAttribute("data-group-node", "true");
    realGroupNode.appendChild(realGroupSvg);

    const computedStyleSpy = jest
      .spyOn(window, "getComputedStyle")
      .mockReturnValue({
        width: "321px",
        height: "123px",
      } as CSSStyleDeclaration);

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === "[data-id]") {
        return [realGroupNode];
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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

    expect(result).toContain('width="321"');
    expect(result).toContain('height="123"');
    computedStyleSpy.mockRestore();
  });

  it("should fall back to boundingClientRect size for group nodes", () => {
    const realGroupNode = document.createElement("div");
    realGroupNode.style.transform = "translate(3px, 4px)";
    jest.spyOn(realGroupNode, "getBoundingClientRect").mockReturnValue({
      width: 444,
      height: 222,
      x: 0,
      y: 0,
      top: 0,
      right: 444,
      bottom: 222,
      left: 0,
      toJSON: () => ({}),
    });

    const realGroupSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    realGroupSvg.setAttribute("data-group-node", "true");
    realGroupNode.appendChild(realGroupSvg);

    const computedStyleSpy = jest
      .spyOn(window, "getComputedStyle")
      .mockReturnValue({ width: "", height: "" } as CSSStyleDeclaration);

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === "[data-id]") {
        return [realGroupNode];
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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

    expect(result).toContain('width="444"');
    expect(result).toContain('height="222"');
    computedStyleSpy.mockRestore();
  });

  it("should fall back to default group size when style, computedStyle, and rect dimensions are zero", () => {
    const mockGroupNode = createMockElement("div");
    mockGroupNode.style = { transform: "translate(7px, 8px)" };
    mockGroupNode.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      toJSON: () => ({}),
    });

    const mockGroupSvg = createMockElement("svg");
    mockGroupSvg.hasAttribute = jest.fn().mockImplementation((attr) => {
      return attr === "data-group-node";
    });
    mockGroupNode.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === "svg") {
        return mockGroupSvg;
      }
      return null;
    });

    const mockRenderer = createMockElement("div");
    mockRenderer.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === "[data-id]") {
        return [mockGroupNode];
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

    const result = generateSVGContent("test-graph-id", mockGraphBounds);

    expect(result).toContain(`width="${NODE_WIDTH - 2}"`);
    expect(result).toContain(`height="${NODE_HEIGHT - 2}"`);
  });
});

describe("convertGroupsToElkNodes", () => {
  it("should convert groups to ELK nodes with correct metadata", () => {
    const groupNodeMap = new Map<GroupNodeId, FileSetNode[]>();
    groupNodeMap.set("group-1", [
      {
        id: "fileset-node-1",
        metadata: {
          kind: NODE_KINDS.FILESET,
          fileSet: {
            "@id": "/file-sets/test",
            "@type": ["FileSet", "Item"],
            accession: "TEST001",
            file_set_type: "measurement",
            files: [],
            status: "released",
            summary: "Test file set",
          },
          externalFiles: [],
          downstreamFiles: [
            {
              "@id": "/files/downstream",
              "@type": ["File", "Item"],
              content_type: "reads",
              file_format: "fastq",
              file_set: "/file-sets/test",
              md5sum: "02d89923100d9385f7fa351e9c35d4ca",
              status: "released",
            },
          ],
        },
      },
    ]);

    const result = convertGroupsToElkNodes(groupNodeMap);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("group-1");
    expect(result[0].metadata.kind).toBe(NODE_KINDS.GROUP);
  });
});
