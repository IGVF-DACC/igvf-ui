import { render, screen } from "@testing-library/react";
import DocumentAttachmentLink from "../document-link";

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
