import { render, screen } from "@testing-library/react";
import { DocumentAttachmentLink, DocumentListAbbr } from "../documents";

describe("Test the document attachment link", () => {
  it("generates a good link from a document attachment", () => {
    const document = {
      "@id": "/documents/bcb5f3c8-d5e9-40d2-805f-4274f940c36d/",
      attachment: {
        download: "Antibody_Characterization_IGVF.pdf",
        href: "@@download/attachment/Antibody_Characterization_IGVF.pdf",
      },
    };
    render(<DocumentAttachmentLink document={document} />);
    const link = screen.getByRole("link");
    expect(link.href).toBe(
      `http://localhost/documents/bcb5f3c8-d5e9-40d2-805f-4274f940c36d/@@download/attachment/Antibody_Characterization_IGVF.pdf`
    );
    screen.getByLabelText("Download Antibody_Characterization_IGVF.pdf");
  });
});

describe("Test the document list", () => {
  it("removes a legacy description prefix before truncating", () => {
    const document = {
      "@id": "/documents/test-document/",
      description: "FILE FORMAT FOR Variant call format specification",
    };

    render(<DocumentListAbbr documents={[document]} maxLength={13} />);

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Variant call…");
    expect(link.getAttribute("aria-describedby")).toMatch(/^tooltip-/);
  });

  it("uses the default abbreviation length", () => {
    const document = {
      "@id": "/documents/abbreviated-document/",
      description: "A description that is longer than twenty characters",
    };

    render(<DocumentListAbbr documents={[document]} />);

    expect(screen.getByRole("link")).toHaveTextContent("A description that…");
  });

  it("uses unique tooltip IDs for repeated documents", () => {
    const document = {
      "@id": "/documents/repeated-document/",
      description: "A description long enough to require truncation",
    };

    render(
      <>
        <DocumentListAbbr documents={[document]} />
        <DocumentListAbbr documents={[document]} />
      </>
    );

    const describedByIds = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("aria-describedby"));
    expect(describedByIds[0]).not.toBe(describedByIds[1]);
  });

  it("omits aria-describedby when the description does not need a tooltip", () => {
    const document = {
      "@id": "/documents/short-document/",
      description: "Short description",
    };

    render(<DocumentListAbbr documents={[document]} />);

    expect(screen.getByRole("link")).not.toHaveAttribute("aria-describedby");
  });
});
