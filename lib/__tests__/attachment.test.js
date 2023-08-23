import { attachmentToServerHref } from "../attachment";

describe("Test the attachment to server href function", () => {
  it("generates a good link from a document attachment", () => {
    const attachment = {
      download: "Antibody_Characterization_IGVF.pdf",
      href: "@@download/attachment/Antibody_Characterization_IGVF.pdf",
    };
    const ownerPath = "/documents/bcb5f3c8-d5e9-40d2-805f-4274f940c36d/";
    const href = attachmentToServerHref(attachment, ownerPath);
    expect(href).toBe(
      "/documents/bcb5f3c8-d5e9-40d2-805f-4274f940c36d/@@download/attachment/Antibody_Characterization_IGVF.pdf"
    );
  });
});
