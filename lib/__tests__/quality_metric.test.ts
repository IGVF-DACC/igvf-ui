import {
  isMpraQualityMetric,
  isPerturbSeqQualityMetric,
  isSingleCellAtacSeqQualityMetric,
  isSingleCellRnaSeqQualityMetric,
  isStarrSeqQualityMetric,
  qualityMetricTitle,
  type QualityMetricObject,
} from "../quality-metric";

describe("Test isMpraQualityMetric() type guard", () => {
  it("returns true for objects with `@type` including `MpraQualityMetric`", () => {
    const qc: QualityMetricObject = {
      "@id": "/quality_metrics/1",
      "@type": ["MpraQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      quality_metric_of: ["/files/1"],
    };
    expect(isMpraQualityMetric(qc)).toBe(true);
  });

  it("returns false when `@type` does not start with `MpraQualityMetric`", () => {
    const qc: QualityMetricObject = {
      "@id": "/quality_metrics/1",
      "@type": ["SomeOtherMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      quality_metric_of: ["/files/1"],
    };
    expect(isMpraQualityMetric(qc)).toBe(false);
  });
});

describe("Test isPerturbSeqQualityMetric() type guard", () => {
  it("returns true for objects with `@type` including `PerturbSeqQualityMetric`", () => {
    const qc: QualityMetricObject = {
      "@id": "/quality_metrics/1",
      "@type": ["PerturbSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      quality_metric_of: ["/files/1"],
    };
    expect(isPerturbSeqQualityMetric(qc)).toBe(true);
  });

  it("returns false when `@type` does not start with `PerturbSeqQualityMetric`", () => {
    const qc: QualityMetricObject = {
      "@id": "/quality_metrics/1",
      "@type": ["SomeOtherMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      quality_metric_of: ["/files/1"],
    };
    expect(isPerturbSeqQualityMetric(qc)).toBe(false);
  });
});

describe("Test isSingleCellAtacSeqQualityMetric() type guard", () => {
  it("returns true for objects with `@type` including `SingleCellAtacSeqQualityMetric`", () => {
    const qc: QualityMetricObject = {
      "@id": "/quality_metrics/1",
      "@type": ["SingleCellAtacSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      quality_metric_of: ["/files/1"],
    };
    expect(isSingleCellAtacSeqQualityMetric(qc)).toBe(true);
  });

  it("returns false when `@type` does not start with `SingleCellAtacSeqQualityMetric`", () => {
    const qc: QualityMetricObject = {
      "@id": "/quality_metrics/1",
      "@type": ["SomeOtherMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      quality_metric_of: ["/files/1"],
    };
    expect(isSingleCellAtacSeqQualityMetric(qc)).toBe(false);
  });
});

describe("Test isSingleCellRnaSeqQualityMetric() type guard", () => {
  it("returns true for objects with `@type` including `SingleCellRnaSeqQualityMetric`", () => {
    const qc: QualityMetricObject = {
      "@id": "/quality_metrics/1",
      "@type": ["SingleCellRnaSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      quality_metric_of: ["/files/1"],
    };
    expect(isSingleCellRnaSeqQualityMetric(qc)).toBe(true);
  });

  it("returns false when `@type` does not start with `SingleCellRnaSeqQualityMetric`", () => {
    const qc: QualityMetricObject = {
      "@id": "/quality_metrics/1",
      "@type": ["SomeOtherMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      quality_metric_of: ["/files/1"],
    };
    expect(isSingleCellRnaSeqQualityMetric(qc)).toBe(false);
  });
});

describe("Test isStarrSeqQualityMetric() type guard", () => {
  it("returns true for objects with `@type` including `StarrSeqQualityMetric`", () => {
    const qc: QualityMetricObject = {
      "@id": "/quality_metrics/1",
      "@type": ["StarrSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      quality_metric_of: ["/files/1"],
    };
    expect(isStarrSeqQualityMetric(qc)).toBe(true);
  });

  it("returns false when `@type` does not start with `StarrSeqQualityMetric`", () => {
    const qc: QualityMetricObject = {
      "@id": "/quality_metrics/1",
      "@type": ["SomeOtherMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      quality_metric_of: ["/files/1"],
    };
    expect(isStarrSeqQualityMetric(qc)).toBe(false);
  });
});

describe("Test qualityMetricTitle() function", () => {
  it("returns the correct title for MpraQualityMetric with a short description", () => {
    const qc: QualityMetricObject = {
      "@id": "/quality_metrics/1",
      "@type": ["MpraQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      description: "This is a short description.",
      quality_metric_of: ["/files/1"],
      summary: "This is a summary.",
    };
    expect(qualityMetricTitle(qc)).toBe("This is a short description.");
  });

  it("returns the correct title for PerturbSeqQualityMetric with a long title", () => {
    const qc: QualityMetricObject = {
      "@id": "/quality_metrics/2",
      "@type": ["PerturbSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      description:
        "This is a long title that should be truncated because it goes beyond the sixty character limit.",
      quality_metric_of: ["/files/2"],
      summary: "This is a summary.",
    };
    expect(qualityMetricTitle(qc)).toBe(
      "This is a long title that should be truncated because it…"
    );
  });

  it("returns the summary if no description is provided", () => {
    const qc: QualityMetricObject = {
      "@id": "/quality_metrics/3",
      "@type": ["SingleCellAtacSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      quality_metric_of: ["/files/3"],
      summary: "This is a summary without a description.",
    };
    expect(qualityMetricTitle(qc)).toBe(
      "This is a summary without a description."
    );
  });
});
