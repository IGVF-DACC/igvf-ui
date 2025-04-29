import { render, screen } from "@testing-library/react";
import { SeqspecDocumentLink } from "../seqspec-document";
import type { DocumentObject } from "../../globals";

describe("Test SeqspecDocumentLink component", () => {
  it("renders the correct link and title", () => {
    const mockDocument: DocumentObject = {
      "@context": "/terms/",
      "@id": "/documents/c7870a38-4286-42fc-9551-22436306e22a/",
      "@type": ["Document", "Item"],
      attachment: {
        download: "mouse_H3K4me3_07-473_validation_Hardison.pdf",
        href: "@@download/attachment/mouse_H3K4me3_07-473_validation_Hardison.pdf",
        md5sum: "a7c2c98ff7d0f198fdbc6f0ccbfcb411",
        type: "application/pdf",
      },
      characterization_method: "immunofluorescence",
      description: "Characterization of a sample using immunofluorescence.",
      document_type: "characterization",
      standardized_file_format: false,
      status: "in progress",
      summary: "Characterization of a sample using immunofluorescence.",
      uuid: "c7870a38-4286-42fc-9551-22436306e22a",
    };

    render(<SeqspecDocumentLink seqspecDocument={mockDocument} />);

    const link = screen.getByRole("link", {
      name: "mouse_H3K4me3_07-473_validation_Hardison.pdf",
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "/documents/c7870a38-4286-42fc-9551-22436306e22a"
    );
    const downloadLink = screen.getByRole("link", {
      name: "Download mouse_H3K4me3_07-473_validation_Hardison.pdf",
    });
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute(
      "href",
      "/documents/c7870a38-4286-42fc-9551-22436306e22a/@@download/attachment/mouse_H3K4me3_07-473_validation_Hardison.pdf"
    );
  });

  it("renders the link and title with extra Tailwind CSS classes", () => {});
  it("renders the link and title with a child element", () => {});
});
