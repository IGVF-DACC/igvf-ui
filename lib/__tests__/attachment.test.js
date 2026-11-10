import {
  attachmentToServerHref,
  isAttachmentObject,
  isSupportedMimeType,
} from "../attachment";

it("recognizes a supported MIME type", () => {
  expect(isSupportedMimeType("text/html")).toBe(true);
});

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

describe("Test attachment object type guard", () => {
  const attachment = {
    download: "image.png",
    href: "@@download/attachment/image.png",
    type: "image/png",
  };

  it("accepts attachment objects", () => {
    expect(isAttachmentObject(attachment)).toBe(true);
    expect(
      isAttachmentObject({
        ...attachment,
        md5sum: "fc3ff98e8c6a0d3087d515c0473f8677",
        size: 1024,
        width: 640,
        height: 480,
      })
    ).toBe(true);
  });

  it.each([null, undefined, "image.png", [], 42])(
    "rejects non-object value %p",
    (value) => {
      expect(isAttachmentObject(value)).toBe(false);
    }
  );

  it.each(["download", "href", "type"])(
    "rejects an attachment without a valid %s",
    (property) => {
      expect(isAttachmentObject({ ...attachment, [property]: undefined })).toBe(
        false
      );
    }
  );

  it("rejects unsupported MIME types", () => {
    expect(isAttachmentObject({ ...attachment, type: "application/zip" })).toBe(
      false
    );
  });

  it.each(["md5sum", "size", "width", "height"])(
    "rejects an invalid optional %s",
    (property) => {
      expect(isAttachmentObject({ ...attachment, [property]: null })).toBe(
        false
      );
    }
  );
});
