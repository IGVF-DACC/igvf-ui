import { render, screen } from "@testing-library/react";
import { FileObject } from "../../globals";
import { CheckfilesVersion } from "../checkfiles-version";

describe("Test <CheckfilesVersion />", () => {
  it("renders a link to a specific checkfiles version on GitHub", () => {
    const file: FileObject = {
      "@context": "/terms/",
      "@id": "/alignment-files/IGVFFI0000ALGN/",
      "@type": ["AlignmentFile", "File", "Item"],
      accession: "IGVFFI0000ALGN",
      assay_titles: ["yN2H"],
      assembly: "GRCh38",
      award: "/awards/HG012012/",
      checkfiles_version: "v2",
      content_summary: "unfiltered alignments",
      content_type: "alignments",
      controlled_access: false,
      creation_timestamp: "2025-02-12T15:48:16.484438+00:00",
      file_format: "bam",
      file_set: "/analysis-sets/IGVFDS8063WIFB/",
      reference_files: ["/reference-files/IGVFFI0001GNRF/"],
      release_timestamp: "2024-03-06T12:34:56Z",
      status: "released",
      submitted_file_name: "/Users/igvf/igvf_files/alignments.bam",
      summary: "GRCh38 unfiltered alignments",
      upload_status: "validated",
      uuid: "f5c8a277-e11d-ea86-cc75-bc735eb802c8",
    };

    render(<CheckfilesVersion file={file} />);

    // Test that it renders a link with https://github.com/IGVF-DACC/checkfiles/releases/tag/v2
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/IGVF-DACC/checkfiles/releases/tag/v2"
    );
  });

  it("renders a link to a specific checkfiles version on GitHub even with upload_status 'validation exempted'", () => {
    const file: FileObject = {
      "@context": "/terms/",
      "@id": "/alignment-files/IGVFFI0000ALGN/",
      "@type": ["AlignmentFile", "File", "Item"],
      accession: "IGVFFI0000ALGN",
      assay_titles: ["yN2H"],
      assembly: "GRCh38",
      award: "/awards/HG012012/",
      checkfiles_version: "v2",
      content_summary: "unfiltered alignments",
      content_type: "alignments",
      controlled_access: false,
      creation_timestamp: "2025-02-12T15:48:16.484438+00:00",
      file_format: "bam",
      file_set: "/analysis-sets/IGVFDS8063WIFB/",
      reference_files: ["/reference-files/IGVFFI0001GNRF/"],
      release_timestamp: "2024-03-06T12:34:56Z",
      status: "released",
      submitted_file_name: "/Users/igvf/igvf_files/alignments.bam",
      summary: "GRCh38 unfiltered alignments",
      upload_status: "validation exempted",
      uuid: "f5c8a277-e11d-ea86-cc75-bc735eb802c8",
    };

    render(<CheckfilesVersion file={file} />);

    // Test that it renders a link with https://github.com/IGVF-DACC/checkfiles/releases/tag/v2
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/IGVF-DACC/checkfiles/releases/tag/v2"
    );
  });

  it("renders a non-linked message with upload_status 'validation exempted'", () => {
    const file: FileObject = {
      "@context": "/terms/",
      "@id": "/alignment-files/IGVFFI0000ALGN/",
      "@type": ["AlignmentFile", "File", "Item"],
      accession: "IGVFFI0000ALGN",
      assay_titles: ["yN2H"],
      assembly: "GRCh38",
      award: "/awards/HG012012/",
      content_summary: "unfiltered alignments",
      content_type: "alignments",
      controlled_access: false,
      creation_timestamp: "2025-02-12T15:48:16.484438+00:00",
      file_format: "bam",
      file_set: "/analysis-sets/IGVFDS8063WIFB/",
      reference_files: ["/reference-files/IGVFFI0001GNRF/"],
      release_timestamp: "2024-03-06T12:34:56Z",
      status: "released",
      submitted_file_name: "/Users/igvf/igvf_files/alignments.bam",
      summary: "GRCh38 unfiltered alignments",
      upload_status: "validation exempted",
      uuid: "f5c8a277-e11d-ea86-cc75-bc735eb802c8",
    };

    render(<CheckfilesVersion file={file} />);

    // Test that it renders a message with "No version due to exemption" and no link.
    const link = screen.queryByRole("link");
    expect(link).toBeNull();
    expect(screen.getByText("No version due to exemption")).toBeInTheDocument();
  });

  it("renders a link to the root checkfiles versions with no checkfiles_version and validated status", () => {
    const file: FileObject = {
      "@context": "/terms/",
      "@id": "/alignment-files/IGVFFI0000ALGN/",
      "@type": ["AlignmentFile", "File", "Item"],
      accession: "IGVFFI0000ALGN",
      assay_titles: ["yN2H"],
      assembly: "GRCh38",
      award: "/awards/HG012012/",
      content_summary: "unfiltered alignments",
      content_type: "alignments",
      controlled_access: false,
      creation_timestamp: "2025-02-12T15:48:16.484438+00:00",
      file_format: "bam",
      file_set: "/analysis-sets/IGVFDS8063WIFB/",
      reference_files: ["/reference-files/IGVFFI0001GNRF/"],
      release_timestamp: "2024-03-06T12:34:56Z",
      status: "released",
      submitted_file_name: "/Users/igvf/igvf_files/alignments.bam",
      summary: "GRCh38 unfiltered alignments",
      upload_status: "validated",
      uuid: "f5c8a277-e11d-ea86-cc75-bc735eb802c8",
    };

    render(<CheckfilesVersion file={file} />);

    // Test that it renders a link to the root checkfiles versions.
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/IGVF-DACC/checkfiles/tags"
    );
    expect(
      screen.getByText("Legacy version of checkfiles")
    ).toBeInTheDocument();
  });

  it("renders a link to the root checkfiles versions with no checkfiles_version and invalidated status", () => {
    const file: FileObject = {
      "@context": "/terms/",
      "@id": "/alignment-files/IGVFFI0000ALGN/",
      "@type": ["AlignmentFile", "File", "Item"],
      accession: "IGVFFI0000ALGN",
      assay_titles: ["yN2H"],
      assembly: "GRCh38",
      award: "/awards/HG012012/",
      content_summary: "unfiltered alignments",
      content_type: "alignments",
      controlled_access: false,
      creation_timestamp: "2025-02-12T15:48:16.484438+00:00",
      file_format: "bam",
      file_set: "/analysis-sets/IGVFDS8063WIFB/",
      reference_files: ["/reference-files/IGVFFI0001GNRF/"],
      release_timestamp: "2024-03-06T12:34:56Z",
      status: "released",
      submitted_file_name: "/Users/igvf/igvf_files/alignments.bam",
      summary: "GRCh38 unfiltered alignments",
      upload_status: "invalidated",
      uuid: "f5c8a277-e11d-ea86-cc75-bc735eb802c8",
    };

    render(<CheckfilesVersion file={file} />);

    // Test that it renders a link to the root checkfiles versions.
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/IGVF-DACC/checkfiles/tags"
    );
    expect(
      screen.getByText("Legacy version of checkfiles")
    ).toBeInTheDocument();
  });

  it("renders nothing with no checkfiles_version and no validated, invalidated, or exempted status", () => {
    const file: FileObject = {
      "@context": "/terms/",
      "@id": "/alignment-files/IGVFFI0000ALGN/",
      "@type": ["AlignmentFile", "File", "Item"],
      accession: "IGVFFI0000ALGN",
      assay_titles: ["yN2H"],
      assembly: "GRCh38",
      award: "/awards/HG012012/",
      content_summary: "unfiltered alignments",
      content_type: "alignments",
      controlled_access: false,
      creation_timestamp: "2025-02-12T15:48:16.484438+00:00",
      file_format: "bam",
      file_set: "/analysis-sets/IGVFDS8063WIFB/",
      reference_files: ["/reference-files/IGVFFI0001GNRF/"],
      release_timestamp: "2024-03-06T12:34:56Z",
      status: "released",
      submitted_file_name: "/Users/igvf/igvf_files/alignments.bam",
      summary: "GRCh38 unfiltered alignments",
      upload_status: "uploading",
      uuid: "f5c8a277-e11d-ea86-cc75-bc735eb802c8",
    };

    render(<CheckfilesVersion file={file} />);

    // Test that it renders nothing.
    expect(screen.queryByRole("link")).toBeNull();
  });
});
