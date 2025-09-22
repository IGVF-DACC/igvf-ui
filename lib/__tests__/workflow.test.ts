import {
  WorkflowObject,
  workflowTextTitle,
  hasIndexedVersions,
  hasIndexedWorkflows,
  getAnalysisStepWorkflows,
} from "../workflow";
import type {
  AnalysisStepObject,
  AnalysisStepVersionObject,
} from "../../globals";

// Mock workflow objects for testing
const mockWorkflow1: WorkflowObject = {
  "@id": "/workflows/workflow-1/",
  "@type": ["Workflow"],
  name: "RNA-seq Pipeline",
  source_url: "https://example.com/workflow1",
  workflow_version: "v1.0.0",
};

const mockWorkflow2: WorkflowObject = {
  "@id": "/workflows/workflow-2/",
  "@type": ["Workflow"],
  name: "ChIP-seq Analysis",
  source_url: "https://example.com/workflow2",
  workflow_version: "v2.1.0",
};

const mockWorkflow3: WorkflowObject = {
  "@id": "/workflows/workflow-3/",
  "@type": ["Workflow"],
  name: "ATAC-seq Pipeline",
  source_url: "https://example.com/workflow3",
  // No version number for this workflow
};

// Mock analysis step version objects
const mockAnalysisStepVersion1: AnalysisStepVersionObject = {
  "@id": "/analysis-step-versions/version-1/",
  "@type": ["AnalysisStepVersion"],
  analysis_step: "/analysis-steps/step-1/",
  software_versions: [],
  workflows: [mockWorkflow1, mockWorkflow2],
};

const mockAnalysisStepVersion2: AnalysisStepVersionObject = {
  "@id": "/analysis-step-versions/version-2/",
  "@type": ["AnalysisStepVersion"],
  analysis_step: "/analysis-steps/step-1/",
  software_versions: [],
  workflows: [mockWorkflow2, mockWorkflow3], // Contains duplicate workflow2
};

const mockAnalysisStepVersionWithStringWorkflows: AnalysisStepVersionObject = {
  "@id": "/analysis-step-versions/version-3/",
  "@type": ["AnalysisStepVersion"],
  analysis_step: "/analysis-steps/step-1/",
  software_versions: [],
  workflows: ["/workflows/workflow-1/", "/workflows/workflow-2/"], // String array (not indexed)
};

const mockAnalysisStepVersionWithoutWorkflows: AnalysisStepVersionObject = {
  "@id": "/analysis-step-versions/version-4/",
  "@type": ["AnalysisStepVersion"],
  analysis_step: "/analysis-steps/step-1/",
  software_versions: [],
  // No workflows property
};

describe("workflowTextTitle", () => {
  it("should return name and version when both are available", () => {
    const result = workflowTextTitle(mockWorkflow1);
    expect(result).toBe("RNA-seq Pipeline v1.0.0");
  });

  it("should return only name when version is not available", () => {
    const result = workflowTextTitle(mockWorkflow3);
    expect(result).toBe("ATAC-seq Pipeline");
  });

  it("should handle workflow with empty version string", () => {
    const workflowWithEmptyVersion: WorkflowObject = {
      ...mockWorkflow1,
      workflow_version: "",
    };
    const result = workflowTextTitle(workflowWithEmptyVersion);
    expect(result).toBe("RNA-seq Pipeline");
  });

  it("should handle workflow with undefined version", () => {
    const workflowWithUndefinedVersion: WorkflowObject = {
      ...mockWorkflow1,
      workflow_version: undefined,
    };
    const result = workflowTextTitle(workflowWithUndefinedVersion);
    expect(result).toBe("RNA-seq Pipeline");
  });
});

describe("hasIndexedVersions", () => {
  it("should return true for indexed analysis step versions array", () => {
    const indexedVersions = [
      mockAnalysisStepVersion1,
      mockAnalysisStepVersion2,
    ];
    expect(hasIndexedVersions(indexedVersions)).toBe(true);
  });

  it("should return false for string array (not indexed)", () => {
    const stringVersions = [
      "/analysis-step-versions/version-1/",
      "/analysis-step-versions/version-2/",
    ];
    expect(hasIndexedVersions(stringVersions)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(hasIndexedVersions(undefined)).toBe(false);
  });

  it("should return false for empty array", () => {
    expect(hasIndexedVersions([])).toBe(false);
  });

  it("should return false for non-array input", () => {
    // @ts-expect-error - Testing runtime behavior with invalid input
    expect(hasIndexedVersions("not-an-array")).toBe(false);
  });

  it("should return false for array with objects no workflows", () => {
    const versionsWithoutWorkflows = [
      {
        "@id": "/analysis-step-versions/version-1/",
        "@type": ["AnalysisStepVersion"],
        analysis_step: "/analysis-steps/step-1/",
        software_versions: [],
      },
    ];
    expect(hasIndexedVersions(versionsWithoutWorkflows)).toBe(false);
  });
});

describe("hasIndexedWorkflows", () => {
  it("should return true for indexed workflows array", () => {
    const indexedWorkflows = [mockWorkflow1, mockWorkflow2];
    expect(hasIndexedWorkflows(indexedWorkflows)).toBe(true);
  });

  it("should return false for string array (not indexed)", () => {
    const stringWorkflows = [
      "/workflows/workflow-1/",
      "/workflows/workflow-2/",
    ];
    expect(hasIndexedWorkflows(stringWorkflows)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(hasIndexedWorkflows(undefined)).toBe(false);
  });

  it("should return false for empty array", () => {
    expect(hasIndexedWorkflows([])).toBe(false);
  });

  it("should return false for non-array input", () => {
    // @ts-expect-error - Testing runtime behavior with invalid input
    expect(hasIndexedWorkflows("not-an-array")).toBe(false);
  });

  it("should return false for array with objects missing name property", () => {
    const workflowsWithoutName = [
      {
        "@id": "/workflows/workflow-1/",
        "@type": ["Workflow"],
        source_url: "https://example.com/workflow1",
        // Missing name property
      },
    ] as any[];
    expect(hasIndexedWorkflows(workflowsWithoutName)).toBe(false);
  });
});

describe("getAnalysisStepWorkflows", () => {
  it("should return de-duplicated workflows from multiple analysis step versions", () => {
    const analysisStep: AnalysisStepObject = {
      "@id": "/analysis-steps/step-1/",
      "@type": ["AnalysisStep"],
      analysis_step_types: ["quantification"],
      input_content_types: ["reads"],
      output_content_types: ["alignments"],
      step_label: "alignment",
      title: "Test Analysis Step",
      analysis_step_versions: [
        mockAnalysisStepVersion1,
        mockAnalysisStepVersion2,
      ],
    };

    const result = getAnalysisStepWorkflows(analysisStep);

    // Should contain workflow1, workflow2 (deduplicated), and workflow3
    expect(result).toHaveLength(3);
    expect(result.map((w) => w["@id"])).toContain("/workflows/workflow-1/");
    expect(result.map((w) => w["@id"])).toContain("/workflows/workflow-2/");
    expect(result.map((w) => w["@id"])).toContain("/workflows/workflow-3/");

    // Verify workflow2 is not duplicated
    const workflow2Count = result.filter(
      (workflow) => workflow["@id"] === "/workflows/workflow-2/"
    ).length;
    expect(workflow2Count).toBe(1);
  });

  it("should return empty array when analysis step has no versions", () => {
    const analysisStep: AnalysisStepObject = {
      "@id": "/analysis-steps/step-1/",
      "@type": ["AnalysisStep"],
      analysis_step_types: ["quantification"],
      input_content_types: ["reads"],
      output_content_types: ["alignments"],
      step_label: "alignment",
      title: "Test Analysis Step",
    };

    const result = getAnalysisStepWorkflows(analysisStep);
    expect(result).toEqual([]);
  });

  it("should return empty array when analysis step versions are string array (not indexed)", () => {
    const analysisStep: AnalysisStepObject = {
      "@id": "/analysis-steps/step-1/",
      "@type": ["AnalysisStep"],
      analysis_step_types: ["quantification"],
      input_content_types: ["reads"],
      output_content_types: ["alignments"],
      step_label: "alignment",
      title: "Test Analysis Step",
      analysis_step_versions: [
        "/analysis-step-versions/version-1/",
        "/analysis-step-versions/version-2/",
      ],
    };

    const result = getAnalysisStepWorkflows(analysisStep);
    expect(result).toEqual([]);
  });

  it("should return empty array when analysis step versions have empty array", () => {
    const analysisStep: AnalysisStepObject = {
      "@id": "/analysis-steps/step-1/",
      "@type": ["AnalysisStep"],
      analysis_step_types: ["quantification"],
      input_content_types: ["reads"],
      output_content_types: ["alignments"],
      step_label: "alignment",
      title: "Test Analysis Step",
      analysis_step_versions: [],
    };

    const result = getAnalysisStepWorkflows(analysisStep);
    expect(result).toEqual([]);
  });

  it("should handle analysis step versions with string workflows (not indexed)", () => {
    const analysisStep: AnalysisStepObject = {
      "@id": "/analysis-steps/step-1/",
      "@type": ["AnalysisStep"],
      analysis_step_types: ["quantification"],
      input_content_types: ["reads"],
      output_content_types: ["alignments"],
      step_label: "alignment",
      title: "Test Analysis Step",
      analysis_step_versions: [mockAnalysisStepVersionWithStringWorkflows],
    };

    const result = getAnalysisStepWorkflows(analysisStep);
    expect(result).toEqual([]);
  });

  it("should handle analysis step versions without workflows property", () => {
    const analysisStep: AnalysisStepObject = {
      "@id": "/analysis-steps/step-1/",
      "@type": ["AnalysisStep"],
      analysis_step_types: ["quantification"],
      input_content_types: ["reads"],
      output_content_types: ["alignments"],
      step_label: "alignment",
      title: "Test Analysis Step",
      analysis_step_versions: [mockAnalysisStepVersionWithoutWorkflows],
    };

    const result = getAnalysisStepWorkflows(analysisStep);
    expect(result).toEqual([]);
  });

  it("should handle mixed analysis step versions (some with workflows, some without)", () => {
    const analysisStep: AnalysisStepObject = {
      "@id": "/analysis-steps/step-1/",
      "@type": ["AnalysisStep"],
      analysis_step_types: ["quantification"],
      input_content_types: ["reads"],
      output_content_types: ["alignments"],
      step_label: "alignment",
      title: "Test Analysis Step",
      analysis_step_versions: [
        mockAnalysisStepVersion1, // Has indexed workflows
        mockAnalysisStepVersionWithStringWorkflows, // Has string workflows
        mockAnalysisStepVersionWithoutWorkflows, // No workflows
      ],
    };

    const result = getAnalysisStepWorkflows(analysisStep);

    // Should only include workflows from mockAnalysisStepVersion1
    expect(result).toHaveLength(2);
    expect(result.map((w) => w["@id"])).toContain("/workflows/workflow-1/");
    expect(result.map((w) => w["@id"])).toContain("/workflows/workflow-2/");
  });

  it("should return single workflow when only one version has workflows", () => {
    const singleVersionAnalysisStep: AnalysisStepObject = {
      "@id": "/analysis-steps/step-1/",
      "@type": ["AnalysisStep"],
      analysis_step_types: ["quantification"],
      input_content_types: ["reads"],
      output_content_types: ["alignments"],
      step_label: "alignment",
      title: "Test Analysis Step",
      analysis_step_versions: [mockAnalysisStepVersion1],
    };

    const result = getAnalysisStepWorkflows(singleVersionAnalysisStep);
    expect(result).toHaveLength(2);
    expect(result.map((w) => w["@id"])).toContain("/workflows/workflow-1/");
    expect(result.map((w) => w["@id"])).toContain("/workflows/workflow-2/");
  });

  it("should handle analysis step versions with empty workflows array", () => {
    const versionWithEmptyWorkflows: AnalysisStepVersionObject = {
      "@id": "/analysis-step-versions/version-empty/",
      "@type": ["AnalysisStepVersion"],
      analysis_step: "/analysis-steps/step-1/",
      software_versions: [],
      workflows: [],
    };

    const analysisStep: AnalysisStepObject = {
      "@id": "/analysis-steps/step-1/",
      "@type": ["AnalysisStep"],
      analysis_step_types: ["quantification"],
      input_content_types: ["reads"],
      output_content_types: ["alignments"],
      step_label: "alignment",
      title: "Test Analysis Step",
      analysis_step_versions: [versionWithEmptyWorkflows],
    };

    const result = getAnalysisStepWorkflows(analysisStep);
    expect(result).toEqual([]);
  });
});
