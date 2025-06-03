import { render, screen, waitFor } from "@testing-library/react";
import {
  QCMetricPanel,
  QualityMetricField,
  QualityMetricModal,
  QualityMetricPanel,
} from "../quality-metric";
import {
  type QualityMetricFieldAttr,
  type QualityMetricObject,
} from "../../lib/quality-metric";
import type { FileObject } from "../../globals";

describe("Test QCMetricPanel component", () => {
  it("renders a quality metric panel for MPRA quality metric", () => {
    const qualityMetrics: QualityMetricObject = {
      "@id": "/mpra-quality-metric/1",
      "@type": ["MpraQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      quality_metric_of: ["/files/1"],
      description: "This is a quality metric for MPRA.",
      fraction_assigned_oligos: 0.95,
    };

    render(<QCMetricPanel qualityMetric={qualityMetrics} isSmall />);

    // Check that the area has the correct classes for small size.
    const dataArea = screen.getByTestId("dataarea");
    expect(dataArea.className).toContain(
      "@xs:grid @xs:grid-cols-data-item-small @xs:gap-2 text-sm"
    );

    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(
      screen.getByText("This is a quality metric for MPRA.")
    ).toBeInTheDocument();
    expect(screen.getByText("Fraction of Assigned Oligos")).toBeInTheDocument();
    expect(screen.getByText("0.95")).toBeInTheDocument();
  });

  it("renders a quality metric panel for PerturbSeq quality metric", () => {
    const qualityMetrics: QualityMetricObject = {
      "@id": "/perturb-seq-quality-metrics/2",
      "@type": ["PerturbSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/2",
      quality_metric_of: ["/files/2"],
      alignment_percentage: 98,
      avg_cells_per_target: 12.93,
      description: "This is a quality metric for PerturbSeq.",
      attachment: {
        download: "Subpool_6_report.pdf",
        href: "@@download/attachment/Subpool_6_report.pdf",
        md5sum: "6ede3e127e2d3d229cb58d4308c1712b",
        type: "application/pdf",
      },
    };

    render(<QCMetricPanel qualityMetric={qualityMetrics} />);

    // Check that the area has the correct classes for small size.
    const dataArea = screen.getByTestId("dataarea");
    expect(dataArea.className).toContain(
      "@md:grid @md:grid-cols-data-item @md:gap-4"
    );

    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(
      screen.getByText("This is a quality metric for PerturbSeq.")
    ).toBeInTheDocument();
    expect(screen.getByText("Alignment Percentage")).toBeInTheDocument();
    expect(screen.getByText("98%")).toBeInTheDocument();
    expect(screen.getByText("Average Cells Per Target")).toBeInTheDocument();
    expect(screen.getByText("12.93")).toBeInTheDocument();

    expect(screen.getByText("Attachment")).toBeInTheDocument();
    const link = screen.getByRole("link", {
      name: /Subpool_6_report\.pdf/i,
    });
    expect(link).toHaveAttribute(
      "href",
      "/perturb-seq-quality-metrics/2@@download/attachment/Subpool_6_report.pdf"
    );
  });

  it("renders a quality metric panel for SingleCellAtacSeq quality metric", () => {
    const qualityMetrics: QualityMetricObject = {
      "@id": "/single-cell-atac-seq-quality-metric/3",
      "@type": ["SingleCellAtacSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/3",
      quality_metric_of: ["/files/3"],
      description: "This is a quality metric for SingleCellAtacSeq.",
      multi_mappings: 0.05,
      pct_duplicates: 0.1,
    };

    render(<QCMetricPanel qualityMetric={qualityMetrics} />);

    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(
      screen.getByText("This is a quality metric for SingleCellAtacSeq.")
    ).toBeInTheDocument();
    expect(screen.getByText("Multi-Mappings")).toBeInTheDocument();
    expect(screen.getByText("0.05")).toBeInTheDocument();
    expect(screen.getByText("Percent Duplicates")).toBeInTheDocument();
    expect(screen.getByText("0.1%")).toBeInTheDocument();
  });

  it("renders a quality metric panel for SingleCellRnaSeq quality metric", () => {
    const qualityMetrics: QualityMetricObject = {
      "@id": "/single-cell-rna-seq-quality-metric/4",
      "@type": ["SingleCellRnaSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/4",
      quality_metric_of: ["/files/4"],
      description: "This is a quality metric for SingleCellRnaSeq.",
      gt_records: 1000,
      p_pseudoaligned: 0.95,
    };

    render(<QCMetricPanel qualityMetric={qualityMetrics} />);

    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(
      screen.getByText("This is a quality metric for SingleCellRnaSeq.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Good-Toulmin Estimation Records")
    ).toBeInTheDocument();
    expect(screen.getByText("1,000")).toBeInTheDocument();
    expect(
      screen.getByText("Percentage of Reads Pseudoaligned")
    ).toBeInTheDocument();
    expect(screen.getByText("0.95%")).toBeInTheDocument();
  });

  it("renders a quality metric panel for StarrSeq quality metric", () => {
    const qualityMetrics: QualityMetricObject = {
      "@id": "/starr-seq-quality-metric/5",
      "@type": ["StarrSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/5",
      quality_metric_of: ["/files/5"],
      coverage: 30,
      description: "This is a quality metric for StarrSeq.",
    };

    render(<QCMetricPanel qualityMetric={qualityMetrics} />);

    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(
      screen.getByText("This is a quality metric for StarrSeq.")
    ).toBeInTheDocument();
    expect(screen.getByText("Coverage")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });
});

describe("Test QualityMetricField component", () => {
  it("renders a quality metric field with a string value", () => {
    const fieldAttr: QualityMetricFieldAttr = {
      name: "description",
      title: "Description",
      type: "string",
    };
    const qualityMetrics: QualityMetricObject = {
      "@id": "/starr-seq-quality-metric/5",
      "@type": ["StarrSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/5",
      quality_metric_of: ["/files/5"],
      coverage: 30,
      description: "This is a quality metric for StarrSeq.",
    };

    render(
      <QualityMetricField
        fieldAttr={fieldAttr}
        qualityMetric={qualityMetrics}
      />
    );

    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(
      screen.getByText("This is a quality metric for StarrSeq.")
    ).toBeInTheDocument();
  });

  it("renders a quality metric field with a number value", () => {
    const fieldAttr: QualityMetricFieldAttr = {
      name: "coverage",
      title: "Coverage",
      type: "number",
    };
    const qualityMetrics: QualityMetricObject = {
      "@id": "/starr-seq-quality-metric/5",
      "@type": ["StarrSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/5",
      quality_metric_of: ["/files/5"],
      coverage: 30,
      description: "This is a quality metric for StarrSeq.",
    };

    render(
      <QualityMetricField
        fieldAttr={fieldAttr}
        qualityMetric={qualityMetrics}
      />
    );

    expect(screen.getByText("Coverage")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("renders a quality metric field with a percentage value", () => {
    const fieldAttr: QualityMetricFieldAttr = {
      name: "alignment_percentage",
      title: "Alignment Percentage",
      type: "percent",
    };
    const qualityMetrics: QualityMetricObject = {
      "@id": "/perturb-seq-quality-metrics/2",
      "@type": ["PerturbSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/2",
      quality_metric_of: ["/files/2"],
      alignment_percentage: 98,
      description: "This is a quality metric for PerturbSeq.",
    };

    render(
      <QualityMetricField
        fieldAttr={fieldAttr}
        qualityMetric={qualityMetrics}
      />
    );

    expect(screen.getByText("Alignment Percentage")).toBeInTheDocument();
    expect(screen.getByText("98%")).toBeInTheDocument();
  });

  it("renders a quality metric field with a file attachment", () => {
    const fieldAttr: QualityMetricFieldAttr = {
      name: "attachment",
      title: "Attachment",
      type: "attachment",
    };
    const qualityMetrics: QualityMetricObject = {
      "@id": "/perturb-seq-quality-metrics/2",
      "@type": ["PerturbSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/2",
      quality_metric_of: ["/files/2"],
      attachment: {
        download: "Subpool_6_report.pdf",
        href: "@@download/attachment/Subpool_6_report.pdf",
        md5sum: "6ede3e127e2d3d229cb58d4308c1712b",
        type: "application/pdf",
      },
    };

    render(
      <QualityMetricField
        fieldAttr={fieldAttr}
        qualityMetric={qualityMetrics}
      />
    );

    expect(screen.getByText("Attachment")).toBeInTheDocument();
    const link = screen.getByRole("link", {
      name: /Subpool_6_report\.pdf/i,
    });
    expect(link).toHaveAttribute(
      "href",
      "/perturb-seq-quality-metrics/2@@download/attachment/Subpool_6_report.pdf"
    );
  });
});

describe("Test QualityMetricModal component", () => {
  it("renders a quality metric modal with correct data", async () => {
    const file: FileObject = {
      "@id": "/files/1",
      "@type": ["File", "Item"],
      accession: "IGVFFI0000AAAA",
      content_type: "reads",
      file_format: "fastq",
      file_set: "/file_sets/1",
      quality_metrics: ["/quality_metrics/1"],
      reference_files: ["/reference_files/1"],
    };
    const qualityMetric: QualityMetricObject = {
      "@id": "/quality_metrics/1",
      "@type": ["PerturbSeqQualityMetric", "QualityMetric"],
      analysis_step_version: "/analysis_steps/1",
      quality_metric_of: ["/files/1"],
      description: "This is a quality metric for testing.",
      avg_cells_per_target: 1000,
      alignment_percentage: 95,
      attachment: {
        download: "Subpool_6_report.pdf",
        href: "@@download/attachment/Subpool_6_report.pdf",
        md5sum: "6ede3e127e2d3d229cb58d4308c1712b",
        type: "application/pdf",
      },
    };

    const onClose = jest.fn();

    render(
      <QualityMetricModal
        file={file}
        qualityMetrics={[qualityMetric]}
        onClose={onClose}
      />
    );
    await waitFor(() => {
      // some assertion or just wait for the transition effect to settle
    });

    expect(screen.getByText("PerturbSeqQualityMetric")).toBeInTheDocument();
  });
});

describe("Test QualityMetricPanel component", () => {
  it("renders an array of more than one quality metric", () => {
    const qualityMetrics: QualityMetricObject[] = [
      {
        "@id": "/quality_metrics/1",
        "@type": ["MpraQualityMetric", "QualityMetric"],
        analysis_step_version: "/analysis_steps/1",
        quality_metric_of: ["/files/1"],
      },
      {
        "@id": "/quality_metrics/2",
        "@type": ["PerturbSeqQualityMetric", "QualityMetric"],
        analysis_step_version: "/analysis_steps/2",
        quality_metric_of: ["/files/2"],
      },
      {
        "@id": "/quality_metrics/3",
        "@type": ["SingleCellAtacSeqQualityMetric", "QualityMetric"],
        analysis_step_version: "/analysis_steps/3",
        quality_metric_of: ["/files/3"],
      },
      {
        "@id": "/quality_metrics/4",
        "@type": ["SingleCellRnaSeqQualityMetric", "QualityMetric"],
        analysis_step_version: "/analysis_steps/3",
        quality_metric_of: ["/files/3"],
      },
      {
        "@id": "/quality_metrics/5",
        "@type": ["StarrSeqQualityMetric", "QualityMetric"],
        analysis_step_version: "/analysis_steps/3",
        quality_metric_of: ["/files/3"],
      },
    ];

    render(<QualityMetricPanel qualityMetrics={qualityMetrics} />);

    expect(screen.getByText("MpraQualityMetric")).toBeInTheDocument();
    expect(screen.getByText("PerturbSeqQualityMetric")).toBeInTheDocument();
    expect(
      screen.getByText("SingleCellAtacSeqQualityMetric")
    ).toBeInTheDocument();
    expect(
      screen.getByText("SingleCellRnaSeqQualityMetric")
    ).toBeInTheDocument();
    expect(screen.getByText("StarrSeqQualityMetric")).toBeInTheDocument();

    const dataPanels = screen.getAllByTestId("datapanel");
    expect(dataPanels).toHaveLength(6);
  });

  it("renders a single quality metric", () => {
    const qualityMetrics: QualityMetricObject[] = [
      {
        "@id": "/quality_metrics/1",
        "@type": ["MpraQualityMetric", "QualityMetric"],
        analysis_step_version: "/analysis_steps/1",
        quality_metric_of: ["/files/1"],
      },
    ];

    render(<QualityMetricPanel qualityMetrics={qualityMetrics} />);

    expect(screen.getByText("MpraQualityMetric")).toBeInTheDocument();

    const dataPanels = screen.getAllByTestId("datapanel");
    expect(dataPanels).toHaveLength(1);
  });

  it("renders nothing with an empty array of quality metrics", () => {
    const { container } = render(<QualityMetricPanel qualityMetrics={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing with no quality metrics prop", () => {
    const { container } = render(<QualityMetricPanel />);
    expect(container).toBeEmptyDOMElement();
  });
});
