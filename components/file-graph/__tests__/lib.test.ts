import {
  collectRelevantFileSetStats,
  extractD3DagErrorObject,
  extractD3DagErrorObjectIds,
  generateGraphData,
  getFileMetrics,
  trimIsolatedNodes,
  NODE_WIDTH,
  NODE_HEIGHT,
} from "../lib";
import type { FileObject, FileSetObject } from "../../../globals";
import { type QualityMetricObject } from "../../../lib/quality-metric";

describe("Test trimIsolatedNodes()", () => {
  it("trims all files when all files are disconnected", () => {
    const fileSets: FileSetObject[] = [
      {
        "@id": "/file-sets/IGVFFS0001FILS",
        "@type": ["FileSet", "Item"],
        files: ["/files/IGVFFI0001FSTQ"],
        file_set_type: "file-set",
        summary: "Test file set",
      },
    ];

    const files: FileObject[] = [
      {
        "@id": "/files/IGVFFI0001FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        file_format: "fastq",
        file_set: fileSets[0],
        quality_metrics: [],
        reference_files: [],
      },
      {
        "@id": "/files/IGVFFI0002FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        file_format: "fastq",
        file_set: fileSets[0],
        quality_metrics: [],
        reference_files: [],
      },
    ];
    const results = generateGraphData(files, fileSets, []);
    const trimmedResults = trimIsolatedNodes(results);
    expect(trimmedResults).toEqual([]);
  });
});

describe("Test collectRelevantFileSetStats()", () => {
  it("finds file-set types in a basic file configuration", () => {
    const fileSets: FileSetObject[] = [
      {
        "@id": "/measurement-sets/IGVFFS0001MSET",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        files: ["/files/IGVFFI0001FSTQ"],
        file_set_type: "file-set",
        summary: "Test file set",
      },
      {
        "@id": "/analysis-sets/IGVFFS0001ASET",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        files: ["/files/IGVFFI0001FSTQ"],
        file_set_type: "file-set",
        summary: "Test file set",
      },
    ];

    const files: FileObject[] = [
      {
        "@id": "/files/IGVFFI0001FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        file_format: "fastq",
        file_set: fileSets[0],
        quality_metrics: [],
        reference_files: [],
      },
      {
        "@id": "/files/IGVFFI0002FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        derived_from: ["/files/IGVFFI0001FSTQ", "/files/IGVFFI0003FSTQ"],
        file_format: "fastq",
        file_set: fileSets[0],
        quality_metrics: [],
        reference_files: [],
      },
    ];

    const externalFiles: FileObject[] = [
      {
        "@id": "/files/IGVFFI0003FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        file_format: "fastq",
        file_set: fileSets[1],
        quality_metrics: [],
        reference_files: [],
      },
    ];
    const results = generateGraphData(files, fileSets, [
      files[0],
      externalFiles[0],
    ]);
    const stats = collectRelevantFileSetStats(results);
    expect(stats).toEqual({
      MeasurementSet: 1,
      AnalysisSet: 1,
    });
  });
});

describe("Test generateGraphData()", () => {
  it("should return an array of nodes for a basic file configuration", () => {
    const fileSets: FileSetObject[] = [
      {
        "@id": "/file-sets/IGVFFS0001FILS",
        "@type": ["FileSet", "Item"],
        files: ["/files/IGVFFI0001FSTQ"],
        file_set_type: "file-set",
        summary: "Test file set",
      },
    ];

    const files: FileObject[] = [
      {
        "@id": "/files/IGVFFI0001FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        file_format: "fastq",
        file_set: fileSets[0],
        quality_metrics: [],
        reference_files: [],
      },
      {
        "@id": "/files/IGVFFI0002FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        derived_from: ["/files/IGVFFI0001FSTQ"],
        file_format: "fastq",
        file_set: fileSets[0],
        quality_metrics: [],
        reference_files: [],
      },
    ];
    const results = generateGraphData(files, fileSets, [files[0]]);
    expect(results).toEqual([
      {
        id: "/files/IGVFFI0001FSTQ",
        parentIds: [],
        type: "file",
        file: {
          "@id": "/files/IGVFFI0001FSTQ",
          "@type": ["File", "Item"],
          content_type: "alignments",
          file_format: "fastq",
          file_set: {
            "@id": "/file-sets/IGVFFS0001FILS",
            "@type": ["FileSet", "Item"],
            files: ["/files/IGVFFI0001FSTQ"],
            file_set_type: "file-set",
            summary: "Test file set",
          },
          quality_metrics: [],
          reference_files: [],
        },
        externalFiles: [],
      },
      {
        id: "/files/IGVFFI0002FSTQ",
        parentIds: [
          "/files/IGVFFI0001FSTQ",
          "/file-sets/IGVFFS0001FILS-53cbacb7",
        ],
        type: "file",
        file: {
          "@id": "/files/IGVFFI0002FSTQ",
          "@type": ["File", "Item"],
          content_type: "alignments",
          derived_from: ["/files/IGVFFI0001FSTQ"],
          file_format: "fastq",
          file_set: {
            "@id": "/file-sets/IGVFFS0001FILS",
            "@type": ["FileSet", "Item"],
            files: ["/files/IGVFFI0001FSTQ"],
            file_set_type: "file-set",
            summary: "Test file set",
          },
          quality_metrics: [],
          reference_files: [],
        },
        externalFiles: [
          {
            "@id": "/files/IGVFFI0001FSTQ",
            "@type": ["File", "Item"],
            content_type: "alignments",
            file_format: "fastq",
            file_set: {
              "@id": "/file-sets/IGVFFS0001FILS",
              "@type": ["FileSet", "Item"],
              files: ["/files/IGVFFI0001FSTQ"],
              file_set_type: "file-set",
              summary: "Test file set",
            },
            quality_metrics: [],
            reference_files: [],
          },
        ],
      },
      {
        id: "/file-sets/IGVFFS0001FILS-53cbacb7",
        parentIds: [],
        type: "file-set",
        fileSet: {
          "@id": "/file-sets/IGVFFS0001FILS",
          "@type": ["FileSet", "Item"],
          files: ["/files/IGVFFI0001FSTQ"],
          file_set_type: "file-set",
          summary: "Test file set",
        },
        files: [
          {
            "@id": "/files/IGVFFI0001FSTQ",
            "@type": ["File", "Item"],
            content_type: "alignments",
            file_format: "fastq",
            file_set: {
              "@id": "/file-sets/IGVFFS0001FILS",
              "@type": ["FileSet", "Item"],
              files: ["/files/IGVFFI0001FSTQ"],
              file_set_type: "file-set",
              summary: "Test file set",
            },
            quality_metrics: [],
            reference_files: [],
          },
        ],
        childFile: {
          "@id": "/files/IGVFFI0002FSTQ",
          "@type": ["File", "Item"],
          content_type: "alignments",
          derived_from: ["/files/IGVFFI0001FSTQ"],
          file_format: "fastq",
          file_set: {
            "@id": "/file-sets/IGVFFS0001FILS",
            "@type": ["FileSet", "Item"],
            files: ["/files/IGVFFI0001FSTQ"],
            file_set_type: "file-set",
            summary: "Test file set",
          },
          quality_metrics: [],
          reference_files: [],
        },
      },
    ]);
  });

  it("should generate nodes with files in an external file set", () => {
    const fileSets: FileSetObject[] = [
      {
        "@id": "/file-sets/IGVFFS0001FILS",
        "@type": ["FileSet", "Item"],
        files: ["/files/IGVFFI0001FSTQ"],
        file_set_type: "file-set",
        summary: "Test file set",
      },
      {
        "@id": "/file-sets/IGVFFS0002FILS",
        "@type": ["FileSet", "Item"],
        files: ["/files/IGVFFI0002FSTQ"],
        file_set_type: "file-set",
        summary: "Test file set 2",
      },
    ];

    const files: FileObject[] = [
      {
        "@id": "/files/IGVFFI0001FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        file_format: "fastq",
        file_set: fileSets[0],
        quality_metrics: [],
        reference_files: [],
      },
      {
        "@id": "/files/IGVFFI0002FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        derived_from: [
          "/files/IGVFFI0001FSTQ",
          "/files/IGVFFI1003FSTQ",
          "/files/IGVFFI1004FSTQ",
        ],
        file_format: "fastq",
        file_set: fileSets[0],
        quality_metrics: [],
        reference_files: [],
      },
      {
        "@id": "/files/IGVFFI0003FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        derived_from: ["/files/IGVFFI0002FSTQ"],
        file_format: "fastq",
        file_set: fileSets[0],
        quality_metrics: [],
        reference_files: [],
      },
      {
        "@id": "/files/IGVFFI0004FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        derived_from: ["/files/IGVFFI0002FSTQ"],
        file_format: "fastq",
        file_set: fileSets[0],
        quality_metrics: [],
        reference_files: [],
      },
    ];
    const externalFiles: FileObject[] = [
      {
        "@id": "/files/IGVFFI1003FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        file_format: "fastq",
        file_set: fileSets[1],
        quality_metrics: [],
        reference_files: [],
      },
      {
        "@id": "/files/IGVFFI1004FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        file_format: "fastq",
        file_set: fileSets[1],
        quality_metrics: [],
        reference_files: [],
      },
    ];
    const results = generateGraphData(files, fileSets, [
      files[0],
      files[1],
      externalFiles[0],
      externalFiles[1],
    ]);
    expect(results).toEqual([
      {
        id: "/files/IGVFFI0001FSTQ",
        parentIds: [],
        type: "file",
        file: {
          "@id": "/files/IGVFFI0001FSTQ",
          "@type": ["File", "Item"],
          content_type: "alignments",
          file_format: "fastq",
          file_set: {
            "@id": "/file-sets/IGVFFS0001FILS",
            "@type": ["FileSet", "Item"],
            files: ["/files/IGVFFI0001FSTQ"],
            file_set_type: "file-set",
            summary: "Test file set",
          },
          quality_metrics: [],
          reference_files: [],
        },
        externalFiles: [],
      },
      {
        id: "/files/IGVFFI0002FSTQ",
        parentIds: [
          "/files/IGVFFI0001FSTQ",
          "/file-sets/IGVFFS0001FILS-53cbacb7",
          "/file-sets/IGVFFS0002FILS-8ba84d47",
        ],
        type: "file",
        file: {
          "@id": "/files/IGVFFI0002FSTQ",
          "@type": ["File", "Item"],
          content_type: "alignments",
          derived_from: [
            "/files/IGVFFI0001FSTQ",
            "/files/IGVFFI1003FSTQ",
            "/files/IGVFFI1004FSTQ",
          ],
          file_format: "fastq",
          file_set: {
            "@id": "/file-sets/IGVFFS0001FILS",
            "@type": ["FileSet", "Item"],
            files: ["/files/IGVFFI0001FSTQ"],
            file_set_type: "file-set",
            summary: "Test file set",
          },
          quality_metrics: [],
          reference_files: [],
        },
        externalFiles: [
          {
            "@id": "/files/IGVFFI0001FSTQ",
            "@type": ["File", "Item"],
            content_type: "alignments",
            file_format: "fastq",
            file_set: {
              "@id": "/file-sets/IGVFFS0001FILS",
              "@type": ["FileSet", "Item"],
              files: ["/files/IGVFFI0001FSTQ"],
              file_set_type: "file-set",
              summary: "Test file set",
            },
            quality_metrics: [],
            reference_files: [],
          },
          {
            "@id": "/files/IGVFFI1003FSTQ",
            "@type": ["File", "Item"],
            content_type: "alignments",
            file_format: "fastq",
            file_set: {
              "@id": "/file-sets/IGVFFS0002FILS",
              "@type": ["FileSet", "Item"],
              files: ["/files/IGVFFI0002FSTQ"],
              file_set_type: "file-set",
              summary: "Test file set 2",
            },
            quality_metrics: [],
            reference_files: [],
          },
          {
            "@id": "/files/IGVFFI1004FSTQ",
            "@type": ["File", "Item"],
            content_type: "alignments",
            file_format: "fastq",
            file_set: {
              "@id": "/file-sets/IGVFFS0002FILS",
              "@type": ["FileSet", "Item"],
              files: ["/files/IGVFFI0002FSTQ"],
              file_set_type: "file-set",
              summary: "Test file set 2",
            },
            quality_metrics: [],
            reference_files: [],
          },
        ],
      },
      {
        id: "/files/IGVFFI0003FSTQ",
        parentIds: [
          "/files/IGVFFI0002FSTQ",
          "/file-sets/IGVFFS0001FILS-33e07923",
        ],
        type: "file",
        file: {
          "@id": "/files/IGVFFI0003FSTQ",
          "@type": ["File", "Item"],
          content_type: "alignments",
          derived_from: ["/files/IGVFFI0002FSTQ"],
          file_format: "fastq",
          file_set: {
            "@id": "/file-sets/IGVFFS0001FILS",
            "@type": ["FileSet", "Item"],
            files: ["/files/IGVFFI0001FSTQ"],
            file_set_type: "file-set",
            summary: "Test file set",
          },
          quality_metrics: [],
          reference_files: [],
        },
        externalFiles: [
          {
            "@id": "/files/IGVFFI0002FSTQ",
            "@type": ["File", "Item"],
            content_type: "alignments",
            derived_from: [
              "/files/IGVFFI0001FSTQ",
              "/files/IGVFFI1003FSTQ",
              "/files/IGVFFI1004FSTQ",
            ],
            file_format: "fastq",
            file_set: {
              "@id": "/file-sets/IGVFFS0001FILS",
              "@type": ["FileSet", "Item"],
              files: ["/files/IGVFFI0001FSTQ"],
              file_set_type: "file-set",
              summary: "Test file set",
            },
            quality_metrics: [],
            reference_files: [],
          },
        ],
      },
      {
        id: "/files/IGVFFI0004FSTQ",
        parentIds: [
          "/files/IGVFFI0002FSTQ",
          "/file-sets/IGVFFS0001FILS-33e07923",
        ],
        type: "file",
        file: {
          "@id": "/files/IGVFFI0004FSTQ",
          "@type": ["File", "Item"],
          content_type: "alignments",
          derived_from: ["/files/IGVFFI0002FSTQ"],
          file_format: "fastq",
          file_set: {
            "@id": "/file-sets/IGVFFS0001FILS",
            "@type": ["FileSet", "Item"],
            files: ["/files/IGVFFI0001FSTQ"],
            file_set_type: "file-set",
            summary: "Test file set",
          },
          quality_metrics: [],
          reference_files: [],
        },
        externalFiles: [
          {
            "@id": "/files/IGVFFI0002FSTQ",
            "@type": ["File", "Item"],
            content_type: "alignments",
            derived_from: [
              "/files/IGVFFI0001FSTQ",
              "/files/IGVFFI1003FSTQ",
              "/files/IGVFFI1004FSTQ",
            ],
            file_format: "fastq",
            file_set: {
              "@id": "/file-sets/IGVFFS0001FILS",
              "@type": ["FileSet", "Item"],
              files: ["/files/IGVFFI0001FSTQ"],
              file_set_type: "file-set",
              summary: "Test file set",
            },
            quality_metrics: [],
            reference_files: [],
          },
        ],
      },
      {
        id: "/file-sets/IGVFFS0001FILS-53cbacb7",
        parentIds: [],
        type: "file-set",
        fileSet: {
          "@id": "/file-sets/IGVFFS0001FILS",
          "@type": ["FileSet", "Item"],
          files: ["/files/IGVFFI0001FSTQ"],
          file_set_type: "file-set",
          summary: "Test file set",
        },
        files: [
          {
            "@id": "/files/IGVFFI0001FSTQ",
            "@type": ["File", "Item"],
            content_type: "alignments",
            file_format: "fastq",
            file_set: {
              "@id": "/file-sets/IGVFFS0001FILS",
              "@type": ["FileSet", "Item"],
              files: ["/files/IGVFFI0001FSTQ"],
              file_set_type: "file-set",
              summary: "Test file set",
            },
            quality_metrics: [],
            reference_files: [],
          },
        ],
        childFile: {
          "@id": "/files/IGVFFI0002FSTQ",
          "@type": ["File", "Item"],
          content_type: "alignments",
          derived_from: [
            "/files/IGVFFI0001FSTQ",
            "/files/IGVFFI1003FSTQ",
            "/files/IGVFFI1004FSTQ",
          ],
          file_format: "fastq",
          file_set: {
            "@id": "/file-sets/IGVFFS0001FILS",
            "@type": ["FileSet", "Item"],
            files: ["/files/IGVFFI0001FSTQ"],
            file_set_type: "file-set",
            summary: "Test file set",
          },
          quality_metrics: [],
          reference_files: [],
        },
      },
      {
        id: "/file-sets/IGVFFS0002FILS-8ba84d47",
        parentIds: [],
        type: "file-set",
        fileSet: {
          "@id": "/file-sets/IGVFFS0002FILS",
          "@type": ["FileSet", "Item"],
          files: ["/files/IGVFFI0002FSTQ"],
          file_set_type: "file-set",
          summary: "Test file set 2",
        },
        files: [
          {
            "@id": "/files/IGVFFI1003FSTQ",
            "@type": ["File", "Item"],
            content_type: "alignments",
            file_format: "fastq",
            file_set: {
              "@id": "/file-sets/IGVFFS0002FILS",
              "@type": ["FileSet", "Item"],
              files: ["/files/IGVFFI0002FSTQ"],
              file_set_type: "file-set",
              summary: "Test file set 2",
            },
            quality_metrics: [],
            reference_files: [],
          },
          {
            "@id": "/files/IGVFFI1004FSTQ",
            "@type": ["File", "Item"],
            content_type: "alignments",
            file_format: "fastq",
            file_set: {
              "@id": "/file-sets/IGVFFS0002FILS",
              "@type": ["FileSet", "Item"],
              files: ["/files/IGVFFI0002FSTQ"],
              file_set_type: "file-set",
              summary: "Test file set 2",
            },
            quality_metrics: [],
            reference_files: [],
          },
        ],
        childFile: {
          "@id": "/files/IGVFFI0002FSTQ",
          "@type": ["File", "Item"],
          content_type: "alignments",
          derived_from: [
            "/files/IGVFFI0001FSTQ",
            "/files/IGVFFI1003FSTQ",
            "/files/IGVFFI1004FSTQ",
          ],
          file_format: "fastq",
          file_set: {
            "@id": "/file-sets/IGVFFS0001FILS",
            "@type": ["FileSet", "Item"],
            files: ["/files/IGVFFI0001FSTQ"],
            file_set_type: "file-set",
            summary: "Test file set",
          },
          quality_metrics: [],
          reference_files: [],
        },
      },
      {
        id: "/file-sets/IGVFFS0001FILS-33e07923",
        parentIds: [],
        type: "file-set",
        fileSet: {
          "@id": "/file-sets/IGVFFS0001FILS",
          "@type": ["FileSet", "Item"],
          files: ["/files/IGVFFI0001FSTQ"],
          file_set_type: "file-set",
          summary: "Test file set",
        },
        files: [
          {
            "@id": "/files/IGVFFI0002FSTQ",
            "@type": ["File", "Item"],
            content_type: "alignments",
            derived_from: [
              "/files/IGVFFI0001FSTQ",
              "/files/IGVFFI1003FSTQ",
              "/files/IGVFFI1004FSTQ",
            ],
            file_format: "fastq",
            file_set: {
              "@id": "/file-sets/IGVFFS0001FILS",
              "@type": ["FileSet", "Item"],
              files: ["/files/IGVFFI0001FSTQ"],
              file_set_type: "file-set",
              summary: "Test file set",
            },
            quality_metrics: [],
            reference_files: [],
          },
        ],
        childFile: {
          "@id": "/files/IGVFFI0003FSTQ",
          "@type": ["File", "Item"],
          content_type: "alignments",
          derived_from: ["/files/IGVFFI0002FSTQ"],
          file_format: "fastq",
          file_set: {
            "@id": "/file-sets/IGVFFS0001FILS",
            "@type": ["FileSet", "Item"],
            files: ["/files/IGVFFI0001FSTQ"],
            file_set_type: "file-set",
            summary: "Test file set",
          },
          quality_metrics: [],
          reference_files: [],
        },
      },
    ]);
  });

  it("should handle files with no file set", () => {
    const fileSets: FileSetObject[] = [];

    const files: FileObject[] = [
      {
        "@id": "/files/IGVFFI0001FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        file_format: "fastq",
        file_set: "/file-sets/IGVFFS0001FILS",
        quality_metrics: [],
        reference_files: [],
      },
      {
        "@id": "/files/IGVFFI0002FSTQ",
        "@type": ["File", "Item"],
        content_type: "alignments",
        derived_from: ["/files/IGVFFI0001FSTQ"],
        file_format: "fastq",
        file_set: "/file-sets/IGVFFS0001FILS",
        quality_metrics: [],
        reference_files: [],
      },
    ];
    const results = generateGraphData(files, fileSets, [files[0]]);
    expect(results).toEqual([
      {
        id: "/files/IGVFFI0001FSTQ",
        parentIds: [],
        type: "file",
        file: {
          "@id": "/files/IGVFFI0001FSTQ",
          "@type": ["File", "Item"],
          content_type: "alignments",
          file_format: "fastq",
          file_set: "/file-sets/IGVFFS0001FILS",
          quality_metrics: [],
          reference_files: [],
        },
        externalFiles: [],
      },
      {
        id: "/files/IGVFFI0002FSTQ",
        parentIds: ["/files/IGVFFI0001FSTQ"],
        type: "file",
        file: {
          "@id": "/files/IGVFFI0002FSTQ",
          "@type": ["File", "Item"],
          content_type: "alignments",
          derived_from: ["/files/IGVFFI0001FSTQ"],
          file_format: "fastq",
          file_set: "/file-sets/IGVFFS0001FILS",
          quality_metrics: [],
          reference_files: [],
        },
        externalFiles: [
          {
            "@id": "/files/IGVFFI0001FSTQ",
            "@type": ["File", "Item"],
            content_type: "alignments",
            file_format: "fastq",
            file_set: "/file-sets/IGVFFS0001FILS",
            quality_metrics: [],
            reference_files: [],
          },
        ],
      },
    ]);
  });
});

describe("Test getFileMetrics()", () => {
  it("should return an empty array for an empty file", () => {
    const file: FileObject = {
      "@id": "/files/IGVFFI0001FSTQ",
      "@type": ["File", "Item"],
      content_type: "alignments",
      file_format: "fastq",
      file_set: "/file-sets/IGVFFS0001FILS",
      quality_metrics: [],
      reference_files: [],
    };
    const qualityMetrics: QualityMetricObject[] = [];
    const results = getFileMetrics(file, qualityMetrics);
    expect(results).toEqual([]);
  });

  it("should return an empty array for a file with no quality metrics", () => {
    const file: FileObject = {
      "@id": "/files/IGVFFI0001FSTQ",
      "@type": ["File", "Item"],
      content_type: "alignments",
      file_format: "fastq",
      file_set: "/file-sets/IGVFFS0001FILS",
      quality_metrics: [],
      reference_files: [],
    };
    const qualityMetrics: QualityMetricObject[] = [
      {
        "@id": "/quality-metrics/1",
        "@type": ["QualityMetric", "Item"],
        analysis_step_version: "/analysis-step-versions/1",
        quality_metric_of: ["/files/IGVFFI0001FSTQ"],
      },
      {
        "@id": "/quality-metrics/2",
        "@type": ["QualityMetric", "Item"],
        analysis_step_version: "/analysis-step-versions/2",
        quality_metric_of: ["/files/IGVFFI0001FSTQ"],
      },
    ];
    const results = getFileMetrics(file, qualityMetrics);
    expect(results).toEqual([]);
  });

  it("should return quality metrics for a file with matching quality metrics", () => {
    const file: FileObject = {
      "@id": "/files/IGVFFI0001FSTQ",
      "@type": ["File", "Item"],
      content_type: "alignments",
      file_format: "fastq",
      file_set: "/file-sets/IGVFFS0001FILS",
      quality_metrics: ["/quality-metrics/1"],
      reference_files: [],
    };
    const qualityMetrics: QualityMetricObject[] = [
      {
        "@id": "/quality-metrics/1",
        "@type": ["QualityMetric", "Item"],
        analysis_step_version: "/analysis-step-versions/1",
        quality_metric_of: ["/files/IGVFFI0001FSTQ"],
      },
      {
        "@id": "/quality-metrics/2",
        "@type": ["QualityMetric", "Item"],
        analysis_step_version: "/analysis-step-versions/2",
        quality_metric_of: ["/files/IGVFFI0001FSTQ"],
      },
    ];
    const results = getFileMetrics(file, qualityMetrics);
    expect(results).toHaveLength(1);
    expect(results[0]["@id"]).toEqual("/quality-metrics/1");
  });

  it("should return multiple quality metrics for a file with multiple matching quality metrics", () => {
    const file: FileObject = {
      "@id": "/files/IGVFFI0001FSTQ",
      "@type": ["File", "Item"],
      content_type: "alignments",
      file_format: "fastq",
      file_set: "/file-sets/IGVFFS0001FILS",
      quality_metrics: ["/quality-metrics/1", "/quality-metrics/2"],
      reference_files: [],
    };
    const qualityMetrics: QualityMetricObject[] = [
      {
        "@id": "/quality-metrics/1",
        "@type": ["QualityMetric", "Item"],
        analysis_step_version: "/analysis-step-versions/1",
        quality_metric_of: ["/files/IGVFFI0001FSTQ"],
      },
      {
        "@id": "/quality-metrics/2",
        "@type": ["QualityMetric", "Item"],
        analysis_step_version: "/analysis-step-versions/2",
        quality_metric_of: ["/files/IGVFFI0001FSTQ"],
      },
      {
        "@id": "/quality-metrics/3",
        "@type": ["QualityMetric", "Item"],
        analysis_step_version: "/analysis-step-versions/3",
        quality_metric_of: ["/files/IGVFFI0001FSTQ"],
      },
    ];
    const results = getFileMetrics(file, qualityMetrics);
    expect(results).toHaveLength(2);
    expect(results[0]["@id"]).toEqual("/quality-metrics/1");
    expect(results[1]["@id"]).toEqual("/quality-metrics/2");
  });
});

describe("Test extractD3DagErrorObject()", () => {
  it("should return an empty array for an empty string", () => {
    const results = extractD3DagErrorObject("");
    expect(results).toEqual([]);
  });

  it("should return an empty array for a string without JSON", () => {
    const results = extractD3DagErrorObject(
      "This does not contain a JSON string"
    );
    expect(results).toEqual([]);
  });

  it("should return an empty array for a string with invalid JSON", () => {
    const results = extractD3DagErrorObject("Error: '{invalid: json,}'");
    expect(results).toEqual([]);
  });

  it("should return a parsed object for a string containing a valid JSON string", () => {
    const validJsonString = `node '{"id":"/sequence-files/IGVFFI0001FSTQ/"}' has a cycle`;
    const results = extractD3DagErrorObject(validJsonString);
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ id: "/sequence-files/IGVFFI0001FSTQ/" });
  });

  it("should return multiple parsed objects for a string containing multiple JSON strings", () => {
    const validJsonString = `node '{"id":"/sequence-files/IGVFFI0001FSTQ/"}' and node '{"id":"/sequence-files/IGVFFI0002FSTQ/"}'`;
    const results = extractD3DagErrorObject(validJsonString);
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ id: "/sequence-files/IGVFFI0001FSTQ/" });
    expect(results[1]).toEqual({ id: "/sequence-files/IGVFFI0002FSTQ/" });
  });

  it("should deduplicate parsed objects with the same id", () => {
    const validJsonString = `node '{"id":"/sequence-files/IGVFFI0001FSTQ/"}', node '{"id":"/sequence-files/IGVFFI9998FSTQ/"}' and node '{"id":"/sequence-files/IGVFFI0001FSTQ/"}'`;
    const results = extractD3DagErrorObject(validJsonString);
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ id: "/sequence-files/IGVFFI0001FSTQ/" });
    expect(results[1]).toEqual({ id: "/sequence-files/IGVFFI9998FSTQ/" });
  });
});

describe("Test extractD3DagErrorObjectIds()", () => {
  it("should return an empty array for an empty string", () => {
    const results = extractD3DagErrorObjectIds("");
    expect(results).toEqual([]);
  });

  it("should return an empty array for a string without JSON", () => {
    const results = extractD3DagErrorObjectIds(
      "This does not contain a JSON string"
    );
    expect(results).toEqual([]);
  });

  it("should return an empty array for a string with invalid JSON", () => {
    const results = extractD3DagErrorObjectIds("Error: '{invalid: json,}'");
    expect(results).toEqual([]);
  });

  it("should return paths for valid JSON strings in the error message", () => {
    const validJsonString = `node '{"id":"/sequence-files/IGVFFI0001FSTQ/"}' has a cycle`;
    const results = extractD3DagErrorObjectIds(validJsonString);
    expect(results).toHaveLength(1);
    expect(results[0]).toBe("IGVFFI0001FSTQ");
  });

  it("should return multiple paths for multiple valid JSON strings", () => {
    const validJsonString = `node '{"id":"/sequence-files/IGVFFI0001FSTQ/"}' and node '{"id":"/sequence-files/IGVFFI0002FSTQ/"}'`;
    const results = extractD3DagErrorObjectIds(validJsonString);
    expect(results).toHaveLength(2);
    expect(results[0]).toBe("IGVFFI0001FSTQ");
    expect(results[1]).toBe("IGVFFI0002FSTQ");
  });

  it("should deduplicate paths for valid JSON strings with the same id", () => {
    const validJsonString = `node '{"id":"/sequence-files/IGVFFI0001FSTQ/"}', node '{"id":"/sequence-files/IGVFFI9998FSTQ/"}' and node '{"id":"/sequence-files/IGVFFI0001FSTQ/"}'`;
    const results = extractD3DagErrorObjectIds(validJsonString);
    expect(results).toHaveLength(2);
    expect(results[0]).toBe("IGVFFI0001FSTQ");
    expect(results[1]).toBe("IGVFFI9998FSTQ");
  });
});

describe("Test global consts for full statement coverage", () => {
  it("should have valid NODE_WIDTH", () => {
    expect(NODE_WIDTH).toBeDefined();
  });

  it("should have valid NODE_HEIGHT", () => {
    expect(NODE_HEIGHT).toBeDefined();
  });
});
