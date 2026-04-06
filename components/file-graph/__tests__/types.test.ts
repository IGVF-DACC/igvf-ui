import {
  NODE_KINDS,
  fileSetTypeColorMap,
  isFileNodeMetadata,
  isFileSetNodeMetadata,
} from "../types";
import {
  isGroupNodeMetadata,
  isFileSetNode,
  type ElkNodeEx,
  type FileMetadata,
  type FileSetMetadata,
  type FileSetStats,
  type FileSetTypeColorMap,
  type NodeKind,
  type NodeMetadata,
} from "../types";
import type { FileObject } from "../../../globals";
import type { QualityMetricObject } from "../../../lib/quality-metric";
import { type FileSetObject } from "../../../lib/file-sets";

describe("types.ts", () => {
  describe("NODE_KINDS constant", () => {
    it("should have correct values", () => {
      expect(NODE_KINDS.FILE).toBe("file");
      expect(NODE_KINDS.FILESET).toBe("fileset");
      expect(NODE_KINDS.GROUP).toBe("group");
    });

    it("should have only the expected keys", () => {
      expect(Object.keys(NODE_KINDS)).toEqual(["FILE", "FILESET", "GROUP"]);
    });

    it("should be used as const assertion", () => {
      // Test that NODE_KINDS is properly typed as const
      const fileKind: "file" = NODE_KINDS.FILE;
      const filesetKind: "fileset" = NODE_KINDS.FILESET;
      const groupKind: "group" = NODE_KINDS.GROUP;

      expect(fileKind).toBe("file");
      expect(filesetKind).toBe("fileset");
      expect(groupKind).toBe("group");
    });
  });

  describe("NodeKind type", () => {
    it("should accept valid node kinds", () => {
      const fileKind: NodeKind = "file";
      const filesetKind: NodeKind = "fileset";

      expect(fileKind).toBe("file");
      expect(filesetKind).toBe("fileset");
    });
  });

  describe("FileMetadata type", () => {
    it("should create valid FileMetadata objects", () => {
      const mockFile: FileObject = {
        "@id": "/files/test",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        md5sum: "d41d8cd98f00b204e9800998ecf8427e",
        status: "released",
      };

      const mockQualityMetric: QualityMetricObject = {
        "@id": "/quality-metrics/test",
        "@type": ["QualityMetric", "Item"],
        analysis_step_version: "/analysis-step-versions/test",
        quality_metric_of: ["/files/test"],
        status: "released",
      };

      const fileMetadata: FileMetadata = {
        kind: NODE_KINDS.FILE,
        file: mockFile,
        upstreamNativeFiles: [],
        upstreamExternalFiles: [],
        upstreamFileSetNodes: [],
        referenceFiles: [],
        qualityMetrics: [mockQualityMetric],
      };

      expect(fileMetadata.kind).toBe("file");
      expect(fileMetadata.file["@id"]).toBe("/files/test");
      expect(fileMetadata.qualityMetrics).toHaveLength(1);
    });
  });

  describe("FileSetMetadata type", () => {
    it("should create valid FileSetMetadata objects", () => {
      const mockFileSet: FileSetObject = {
        "@id": "/file-sets/test",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        accession: "TEST001",
        file_set_type: "principal analysis",
        files: [],
        status: "released",
        summary: "Test file set",
      };

      const mockFile: FileObject = {
        "@id": "/files/downstream",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        md5sum: "d41d8cd98f00b204e9800998ecf8427e",
        status: "released",
      };

      const fileSetMetadata: FileSetMetadata = {
        kind: NODE_KINDS.FILESET,
        fileSet: mockFileSet,
        externalFiles: [],
        downstreamFile: mockFile,
      };

      expect(fileSetMetadata.kind).toBe("fileset");
      expect(fileSetMetadata.fileSet.accession).toBe("TEST001");
      expect(fileSetMetadata.downstreamFile["@id"]).toBe("/files/downstream");
    });
  });

  describe("NodeMetadata type", () => {
    it("should accept FileMetadata", () => {
      const mockFile: FileObject = {
        "@id": "/files/test",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        md5sum: "d41d8cd98f00b204e9800998ecf8427e",
        status: "released",
      };

      const fileMetadata: NodeMetadata = {
        kind: NODE_KINDS.FILE,
        file: mockFile,
        upstreamNativeFiles: [],
        upstreamExternalFiles: [],
        upstreamFileSetNodes: [],
        referenceFiles: [],
        qualityMetrics: [],
      };

      expect(fileMetadata.kind).toBe("file");
    });

    it("should accept FileSetMetadata", () => {
      const mockFileSet: FileSetObject = {
        "@id": "/file-sets/test",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        accession: "TEST001",
        file_set_type: "intermediate analysis",
        files: [],
        status: "released",
        summary: "Test file set",
      };

      const mockFile: FileObject = {
        "@id": "/files/downstream",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        md5sum: "d41d8cd98f00b204e9800998ecf8427e",
        status: "released",
      };

      const fileSetMetadata: NodeMetadata = {
        kind: NODE_KINDS.FILESET,
        fileSet: mockFileSet,
        externalFiles: [],
        downstreamFile: mockFile,
      };

      expect(fileSetMetadata.kind).toBe("fileset");
    });
  });

  describe("ElkNodeEx interface", () => {
    it("should extend ElkNode with optional metadata", () => {
      const elkNodeWithMetadata: ElkNodeEx = {
        id: "test-node",
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        metadata: {
          kind: NODE_KINDS.FILE,
          file: {
            "@id": "/files/test",
            "@type": ["File", "Item"],
            content_type: "reads",
            file_format: "fastq",
            file_set: "/file-sets/test",
            md5sum: "d41d8cd98f00b204e9800998ecf8427e",
            status: "released",
          },
          upstreamNativeFiles: [],
          upstreamExternalFiles: [],
          upstreamFileSetNodes: [],
          referenceFiles: [],
          qualityMetrics: [],
        },
      };

      expect(elkNodeWithMetadata.id).toBe("test-node");
      expect(elkNodeWithMetadata.metadata?.kind).toBe("file");
    });

    it("should allow ElkNode without metadata", () => {
      const elkNodeWithoutMetadata: ElkNodeEx = {
        id: "test-node",
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        // metadata is optional
      };

      expect(elkNodeWithoutMetadata.id).toBe("test-node");
      expect(elkNodeWithoutMetadata.metadata).toBeUndefined();
    });
  });

  describe("FileSetTypeColorMap type", () => {
    it("should create valid color maps", () => {
      const colorMap: FileSetTypeColorMap = {
        TestSet: {
          bg: "bg-test",
          bgCount: "bg-test-count",
          border: "border-test",
          borderColor: "#000000",
          bgColor: "#123456",
        },
      };

      expect(colorMap.TestSet.bg).toBe("bg-test");
      expect(colorMap.TestSet.bgColor).toBe("#123456");
    });
  });

  describe("FileSetStats type", () => {
    it("should create valid file set statistics", () => {
      const stats: FileSetStats = {
        AnalysisSet: 5,
        AuxiliarySet: 2,
        ConstructLibrarySet: 1,
        CuratedSet: 3,
        MeasurementSet: 4,
        ModelSet: 1,
        PredictionSet: 2,
        unknown: 1,
      };

      expect(stats.AnalysisSet).toBe(5);
      expect(stats.MeasurementSet).toBe(4);
      expect(stats.unknown).toBe(1);
    });

    it("should allow partial statistics", () => {
      const partialStats: FileSetStats = {
        AnalysisSet: 3,
        MeasurementSet: 2,
        // Other properties are optional
      };

      expect(partialStats.AnalysisSet).toBe(3);
      expect(partialStats.AuxiliarySet).toBeUndefined();
    });

    it("should allow empty statistics", () => {
      const emptyStats: FileSetStats = {};
      expect(Object.keys(emptyStats)).toHaveLength(0);
    });
  });

  describe("fileSetTypeColorMap constant", () => {
    it("should have all expected file set types", () => {
      const expectedTypes = [
        "AnalysisSet",
        "AuxiliarySet",
        "ConstructLibrarySet",
        "CuratedSet",
        "MeasurementSet",
        "ModelSet",
        "PredictionSet",
        "unknown",
      ];

      expectedTypes.forEach((type) => {
        expect(fileSetTypeColorMap[type]).toBeDefined();
      });
    });

    it("should have valid color specifications for each type", () => {
      Object.values(fileSetTypeColorMap).forEach((colorSpec) => {
        expect(colorSpec.bg).toBeDefined();
        expect(colorSpec.bgCount).toBeDefined();
        expect(colorSpec.border).toBeDefined();
        expect(colorSpec.bgColor).toBeDefined();
        expect(colorSpec.bgColor).toMatch(/^#[0-9a-f]{6}$/i); // Valid hex color
      });
    });

    it("should have specific color values for known types", () => {
      expect(fileSetTypeColorMap.AnalysisSet.bgColor).toBe("#faafff");
      expect(fileSetTypeColorMap.AuxiliarySet.bgColor).toBe("#60fa72");
      expect(fileSetTypeColorMap.ConstructLibrarySet.bgColor).toBe("#ff84aa");
      expect(fileSetTypeColorMap.CuratedSet.bgColor).toBe("#faac60");
      expect(fileSetTypeColorMap.MeasurementSet.bgColor).toBe("#7cc0ff");
      expect(fileSetTypeColorMap.ModelSet.bgColor).toBe("#f5fa60");
      expect(fileSetTypeColorMap.PredictionSet.bgColor).toBe("#60f5fa");
      expect(fileSetTypeColorMap.unknown.bgColor).toBe("#c0c0c0");
    });

    it("should have consistent naming patterns for CSS classes", () => {
      // Test known types with expected prefixes
      const knownTypes = [
        { type: "AnalysisSet", prefix: "analysis" },
        { type: "AuxiliarySet", prefix: "auxiliary" },
        { type: "ConstructLibrarySet", prefix: "construct-library" },
        { type: "CuratedSet", prefix: "curated" },
        { type: "MeasurementSet", prefix: "measurement" },
        { type: "ModelSet", prefix: "model" },
        { type: "PredictionSet", prefix: "prediction" },
      ];

      knownTypes.forEach(({ type, prefix }) => {
        const colorSpec = fileSetTypeColorMap[type];
        expect(colorSpec.bg).toBe(`bg-file-graph-${prefix}`);
        expect(colorSpec.bgCount).toBe(`bg-file-graph-${prefix}-count`);
        expect(colorSpec.border).toBe(`border-file-graph-${prefix}`);
      });

      // Test unknown type separately
      const unknownSpec = fileSetTypeColorMap.unknown;
      expect(unknownSpec.bg).toBe("bg-file-graph-unknown");
      expect(unknownSpec.bgCount).toBe("bg-file-graph-unknown-count");
      expect(unknownSpec.border).toBe("border-file-graph-unknown");
    });
  });

  describe("isFileNodeMetadata function", () => {
    it("should return true for file metadata", () => {
      const fileMetadata: FileMetadata = {
        kind: NODE_KINDS.FILE,
        file: {
          "@id": "/files/test",
          "@type": ["File", "Item"],
          content_type: "reads",
          file_format: "fastq",
          file_set: "/file-sets/test",
          md5sum: "d41d8cd98f00b204e9800998ecf8427e",
          status: "released",
        },
        upstreamNativeFiles: [],
        upstreamExternalFiles: [],
        upstreamFileSetNodes: [],
        referenceFiles: [],
        qualityMetrics: [],
      };

      expect(isFileNodeMetadata(fileMetadata)).toBe(true);
    });

    it("should return false for file set metadata", () => {
      const fileSetMetadata: FileSetMetadata = {
        kind: NODE_KINDS.FILESET,
        fileSet: {
          "@id": "/file-sets/test",
          "@type": ["AnalysisSet", "FileSet", "Item"],
          accession: "TEST001",
          file_set_type: "principal analysis",
          files: [],
          status: "released",
          summary: "Test file set",
        },
        externalFiles: [],
        downstreamFile: {
          "@id": "/files/downstream",
          "@type": ["File", "Item"],
          content_type: "reads",
          file_format: "fastq",
          file_set: "/file-sets/test",
          md5sum: "d41d8cd98f00b204e9800998ecf8427e",
          status: "released",
        },
      };

      expect(isFileNodeMetadata(fileSetMetadata)).toBe(false);
    });

    it("should properly type guard FileMetadata", () => {
      const metadata: NodeMetadata = {
        kind: NODE_KINDS.FILE,
        file: {
          "@id": "/files/test",
          "@type": ["File", "Item"],
          content_type: "reads",
          file_format: "fastq",
          file_set: "/file-sets/test",
          md5sum: "d41d8cd98f00b204e9800998ecf8427e",
          status: "released",
        },
        upstreamNativeFiles: [],
        upstreamExternalFiles: [],
        upstreamFileSetNodes: [],
        referenceFiles: [],
        qualityMetrics: [],
      };

      // Verify the type guard returns true
      expect(isFileNodeMetadata(metadata)).toBe(true);

      // Verify TypeScript type narrowing works correctly
      const fileMetadata = metadata as FileMetadata;
      expect(fileMetadata.file["@id"]).toBe("/files/test");
      expect(fileMetadata.upstreamNativeFiles).toBeDefined();
    });
  });

  describe("isFileSetNodeMetadata function", () => {
    it("should return true for file set metadata", () => {
      const fileSetMetadata: FileSetMetadata = {
        kind: NODE_KINDS.FILESET,
        fileSet: {
          "@id": "/file-sets/test",
          "@type": ["AnalysisSet", "FileSet", "Item"],
          accession: "TEST001",
          file_set_type: "principal analysis",
          files: [],
          status: "released",
          summary: "Test file set",
        },
        externalFiles: [],
        downstreamFile: {
          "@id": "/files/downstream",
          "@type": ["File", "Item"],
          content_type: "reads",
          file_format: "fastq",
          file_set: "/file-sets/test",
          md5sum: "d41d8cd98f00b204e9800998ecf8427e",
          status: "released",
        },
      };

      expect(isFileSetNodeMetadata(fileSetMetadata)).toBe(true);
    });

    it("should return false for file metadata", () => {
      const fileMetadata: FileMetadata = {
        kind: NODE_KINDS.FILE,
        file: {
          "@id": "/files/test",
          "@type": ["File", "Item"],
          content_type: "reads",
          file_format: "fastq",
          file_set: "/file-sets/test",
          md5sum: "d41d8cd98f00b204e9800998ecf8427e",
          status: "released",
        },
        upstreamNativeFiles: [],
        upstreamExternalFiles: [],
        upstreamFileSetNodes: [],
        referenceFiles: [],
        qualityMetrics: [],
      };

      expect(isFileSetNodeMetadata(fileMetadata)).toBe(false);
    });

    it("should properly type guard FileSetMetadata", () => {
      const metadata: NodeMetadata = {
        kind: NODE_KINDS.FILESET,
        fileSet: {
          "@id": "/file-sets/test",
          "@type": ["AnalysisSet", "FileSet", "Item"],
          accession: "TEST001",
          file_set_type: "principal analysis",
          files: [],
          status: "released",
          summary: "Test file set",
        },
        externalFiles: [],
        downstreamFile: {
          "@id": "/files/downstream",
          "@type": ["File", "Item"],
          content_type: "reads",
          file_format: "fastq",
          file_set: "/file-sets/test",
          md5sum: "d41d8cd98f00b204e9800998ecf8427e",
          status: "released",
        },
      };

      // Verify the type guard returns true
      expect(isFileSetNodeMetadata(metadata)).toBe(true);

      // Verify TypeScript type narrowing works correctly
      const fileSetMetadata = metadata as FileSetMetadata;
      expect(fileSetMetadata.fileSet.accession).toBe("TEST001");
      expect(fileSetMetadata.downstreamFile).toBeDefined();
    });
  });

  describe("Type guards edge cases", () => {
    it("should handle mixed usage correctly", () => {
      const fileMetadata: NodeMetadata = {
        kind: NODE_KINDS.FILE,
        file: {
          "@id": "/files/test",
          "@type": ["File", "Item"],
          content_type: "reads",
          file_format: "fastq",
          file_set: "/file-sets/test",
          md5sum: "d41d8cd98f00b204e9800998ecf8427e",
          status: "released",
        },
        upstreamNativeFiles: [],
        upstreamExternalFiles: [],
        upstreamFileSetNodes: [],
        referenceFiles: [],
        qualityMetrics: [],
      };

      const fileSetMetadata: NodeMetadata = {
        kind: NODE_KINDS.FILESET,
        fileSet: {
          "@id": "/file-sets/test",
          "@type": ["AnalysisSet", "FileSet", "Item"],
          accession: "TEST001",
          file_set_type: "principal analysis",
          files: [],
          status: "released",
          summary: "Test file set",
        },
        externalFiles: [],
        downstreamFile: {
          "@id": "/files/downstream",
          "@type": ["File", "Item"],
          content_type: "reads",
          file_format: "fastq",
          file_set: "/file-sets/test",
          md5sum: "d41d8cd98f00b204e9800998ecf8427e",
          status: "released",
        },
      };

      // Type guards should be mutually exclusive
      expect(isFileNodeMetadata(fileMetadata)).toBe(true);
      expect(isFileSetNodeMetadata(fileMetadata)).toBe(false);

      expect(isFileSetNodeMetadata(fileSetMetadata)).toBe(true);
      expect(isFileNodeMetadata(fileSetMetadata)).toBe(false);
    });
  });
});

describe("isGroupNodeMetadata function", () => {
  it("should return true for group metadata", () => {
    const groupMetadata: NodeMetadata = {
      kind: NODE_KINDS.GROUP,
      targetFileIds: ["/files/test1", "/files/test2"],
    };

    expect(isGroupNodeMetadata(groupMetadata)).toBe(true);
  });

  it("should return false for file metadata", () => {
    const fileMetadata: NodeMetadata = {
      kind: NODE_KINDS.FILE,
      file: {
        "@id": "/files/test",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        md5sum: "d41d8cd98f00b204e9800998ecf8427e",
        status: "released",
      },
      upstreamNativeFiles: [],
      upstreamExternalFiles: [],
      upstreamFileSetNodes: [],
      referenceFiles: [],
      qualityMetrics: [],
    };

    expect(isGroupNodeMetadata(fileMetadata)).toBe(false);
  });

  it("should return false for file set metadata", () => {
    const fileSetMetadata: NodeMetadata = {
      kind: NODE_KINDS.FILESET,
      fileSet: {
        "@id": "/file-sets/test",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        accession: "TEST001",
        file_set_type: "principal analysis",
        files: [],
        status: "released",
        summary: "Test file set",
      },
      externalFiles: [],
      downstreamFile: {
        "@id": "/files/downstream",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        md5sum: "d41d8cd98f00b204e9800998ecf8427e",
        status: "released",
      },
    };

    expect(isGroupNodeMetadata(fileSetMetadata)).toBe(false);
  });
});

describe("isFileSetNode function", () => {
  it("should return true for nodes with FileSetMetadata", () => {
    const fileSetNode: ElkNodeEx = {
      id: "fileset-node",
      metadata: {
        kind: NODE_KINDS.FILESET,
        fileSet: {
          "@id": "/file-sets/test",
          "@type": ["AnalysisSet", "FileSet", "Item"],
          accession: "TEST001",
          file_set_type: "principal analysis",
          files: [],
          status: "released",
          summary: "Test file set",
        },
        externalFiles: [],
        downstreamFile: {
          "@id": "/files/downstream",
          "@type": ["File", "Item"],
          content_type: "reads",
          file_format: "fastq",
          file_set: "/file-sets/test",
          md5sum: "d41d8cd98f00b204e9800998ecf8427e",
          status: "released",
        },
      },
    };

    expect(isFileSetNode(fileSetNode)).toBe(true);
  });

  it("should return false for nodes without FileSetMetadata", () => {
    const nonFileSetNode: ElkNodeEx = {
      id: "non-fileset-node",
      metadata: {
        kind: NODE_KINDS.FILE,
        file: {
          "@id": "/files/test",
          "@type": ["File", "Item"],
          content_type: "reads",
          file_format: "fastq",
          file_set: "/file-sets/test",
          md5sum: "d41d8cd98f00b204e9800998ecf8427e",
          status: "released",
        },
        upstreamNativeFiles: [],
        upstreamExternalFiles: [],
        upstreamFileSetNodes: [],
        referenceFiles: [],
        qualityMetrics: [],
      },
    };

    expect(isFileSetNode(nonFileSetNode)).toBe(false);
  });
});
