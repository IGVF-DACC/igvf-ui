import { render, screen } from "@testing-library/react";
import {
  FileAccessionAndDownload,
  FileDownload,
  FileHeaderDownload,
} from "../file-download";

describe("Test FileDownload component", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.API_URL = "http://localhost/";
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it("renders a download link for a file", () => {
    const file = {
      "@id": "/reference-files/IGVFFI0001SQBR/",
      "@type": ["ReferenceFile", "File", "Item"],
      accession: "IGVFFI0001SQBR",
      file_format: "txt",
      href: "/reference-files/IGVFFI0001SQBR/@@download/IGVFFI0001SQBR.txt.gz",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      upload_status: "invalidated",
    };

    render(<FileDownload file={file} />);

    const downloadLink = screen.getByRole("link");
    expect(downloadLink).toHaveAttribute(
      "href",
      "/reference-files/IGVFFI0001SQBR/@@download/IGVFFI0001SQBR.txt.gz"
    );
    expect(downloadLink).not.toHaveAttribute("disabled");
    expect(downloadLink).toHaveAttribute(
      "aria-label",
      "Download file IGVFFI0001SQBR"
    );
  });

  it("renders a download link for a file with a custom class", () => {
    const file = {
      "@id": "/reference-files/IGVFFI0001SQBR/",
      "@type": ["ReferenceFile", "File", "Item"],
      accession: "IGVFFI0001SQBR",
      file_format: "txt",
      href: "/reference-files/IGVFFI0001SQBR/@@download/IGVFFI0001SQBR.txt.gz",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      upload_status: "invalidated",
    };

    render(<FileDownload file={file} className="text-red-500" />);

    const downloadLink = screen.getByRole("link");
    expect(downloadLink).toHaveAttribute(
      "href",
      "/reference-files/IGVFFI0001SQBR/@@download/IGVFFI0001SQBR.txt.gz"
    );
    expect(downloadLink).not.toHaveAttribute("disabled");
    expect(downloadLink).toHaveAttribute(
      "aria-label",
      "Download file IGVFFI0001SQBR"
    );
    expect(downloadLink).toHaveClass("text-red-500");
  });

  it("renders a download link for a file with an externally hosted URL", () => {
    const file = {
      "@id": "/files/ENCFF000VZB/",
      "@type": ["File", "Item"],
      accession: "ENCFF000VZB",
      externally_hosted: true,
      external_host_url: "https://example.com/",
      status: "released",
      upload_status: "validated",
    };

    render(<FileDownload file={file} />);
    const downloadLink = screen.getByRole("link");
    expect(downloadLink).toHaveAttribute("href", "https://example.com/");
    expect(screen.getByTestId("icon-externally-hosted")).toBeInTheDocument();
  });

  it("renders a disabled download link for a file", () => {
    const file = {
      "@id": "/reference-files/IGVFFI0001SQBR/",
      "@type": ["ReferenceFile", "File", "Item"],
      accession: "IGVFFI0001SQBR",
      file_format: "txt",
      href: "/reference-files/IGVFFI0001SQBR/@@download/IGVFFI0001SQBR.txt.gz",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      upload_status: "pending",
    };

    render(<FileDownload file={file} />);

    const downloadLink = screen.getByLabelText("Download file IGVFFI0001SQBR");
    expect(downloadLink).not.toHaveAttribute("href");
  });
});

describe("Test FileHeaderDownload component", () => {
  it("renders the proper classes around the download link", () => {
    const file = {
      "@id": "/reference-files/IGVFFI0001SQBR/",
      "@type": ["ReferenceFile", "File", "Item"],
      accession: "IGVFFI0001SQBR",
      file_format: "txt",
      href: "/reference-files/IGVFFI0001SQBR/@@download/IGVFFI0001SQBR.txt.gz",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      upload_status: "validated",
    };

    render(<FileHeaderDownload file={file} />);

    const downloadLink = screen.getByTestId("file-header-download");
    expect(downloadLink).toHaveClass("flex items-center gap-1");

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "/reference-files/IGVFFI0001SQBR/@@download/IGVFFI0001SQBR.txt.gz"
    );
  });
});

describe("Test FileAccessionAndDownload component", () => {
  it("renders the file accession and download link", () => {
    const file = {
      "@id": "/reference-files/IGVFFI0001SQBR/",
      "@type": ["ReferenceFile", "File", "Item"],
      accession: "IGVFFI0001SQBR",
      file_format: "txt",
      href: "/reference-files/IGVFFI0001SQBR/@@download/IGVFFI0001SQBR.txt.gz",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      upload_status: "validated",
    };

    render(<FileAccessionAndDownload file={file} />);

    const outerDiv = screen.getByTestId("file-accession-and-download");
    expect(outerDiv).toHaveClass("flex items-center gap-1");

    const accessionLinks = screen.getAllByRole("link");
    expect(accessionLinks[0]).toHaveAttribute(
      "href",
      "/reference-files/IGVFFI0001SQBR"
    );
    expect(accessionLinks[0]).toHaveTextContent("IGVFFI0001SQBR");

    const downloadLink = screen.getByRole("link", {
      name: "Download file IGVFFI0001SQBR",
    });
    expect(downloadLink).toHaveAttribute(
      "href",
      "/reference-files/IGVFFI0001SQBR/@@download/IGVFFI0001SQBR.txt.gz"
    );
  });

  it("renders the file access and download link as an inline flex", () => {
    const file = {
      "@id": "/reference-files/IGVFFI0001SQBR/",
      "@type": ["ReferenceFile", "File", "Item"],
      accession: "IGVFFI0001SQBR",
      file_format: "txt",
      href: "/reference-files/IGVFFI0001SQBR/@@download/IGVFFI0001SQBR.txt.gz",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      upload_status: "validated",
    };

    render(<FileAccessionAndDownload file={file} isInline />);

    const outerDiv = screen.getByTestId("file-accession-and-download");
    expect(outerDiv).toHaveClass("inline-flex items-center gap-1");
  });
});

describe("Test controlled access/Anvil file download disabling", () => {
  it("disables download link for controlled access files with Anvil URL", () => {
    const file = {
      "@id": "/files/ENCFF000VZB/",
      "@type": ["File", "Item"],
      accession: "ENCFF000VZB",
      controlled_access: true,
      anvil_url: "https://anvil.terra.bio/",
      href: "/files/ENCFF000VZB/@@download/ENCFF000VZB.txt.gz",
      status: "released",
      upload_status: "validated",
    };

    render(<FileDownload file={file} />);

    const downloadLink = screen.getByLabelText("Download file ENCFF000VZB");
    expect(downloadLink).not.toHaveAttribute("href");
  });

  it("enables download link for the same file but without controlled access nor Anvil URL", () => {
    const file = {
      "@id": "/files/ENCFF000VZB/",
      "@type": ["File", "Item"],
      accession: "ENCFF000VZB",
      href: "/files/ENCFF000VZB/@@download/ENCFF000VZB.txt.gz",
      status: "released",
      upload_status: "validated",
    };

    render(<FileDownload file={file} />);

    const downloadLink = screen.getByLabelText("Download file ENCFF000VZB");
    expect(downloadLink).toHaveAttribute(
      "href",
      "/files/ENCFF000VZB/@@download/ENCFF000VZB.txt.gz"
    );
  });
});
