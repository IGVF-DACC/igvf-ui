import { fireEvent, render, screen, within } from "@testing-library/react";
import AttachmentThumbnail from "../attachment-thumbnail";
import "../__mocks__/intersectionObserverMock";

describe("Test AttachmentThumbnail component for non-previewable attachments", () => {
  let ownerPath;
  let attachment;

  beforeEach(() => {
    ownerPath = "/documents/bcb5f3c8-d5e9-40d2-805f-4274f940c36d/";
    attachment = {
      href: "@@download/attachment/Antibody_Characterization_IGVF.pdf",
      type: "application/pdf",
      md5sum: "58558ed279ab141939c223838137d5a6",
      download: "Antibody_Characterization_IGVF.pdf",
    };
  });

  it("properly renders a non-previewable attachment with the default size", () => {
    render(
      <AttachmentThumbnail
        attachment={attachment}
        ownerPath={ownerPath}
        alt="Basic non-previewable image attachment"
      />,
    );
    const link = screen.getByRole("link");
    const downloadUrl = `http://localhost${ownerPath}${attachment.href}`;
    expect(link.href).toEqual(downloadUrl);
    expect(link).toHaveStyle("width: 100px");
    expect(link).toHaveStyle("height: 100px");
  });

  it("properly renders an unknown attachment type", () => {
    attachment.type = "application/octet-stream";
    render(
      <AttachmentThumbnail
        attachment={attachment}
        ownerPath={ownerPath}
        alt="Basic non-previewable image attachment"
      />,
    );
    const link = screen.getByRole("link");
    const downloadUrl = `http://localhost${ownerPath}${attachment.href}`;
    expect(link.href).toEqual(downloadUrl);
    expect(link).toHaveStyle("width: 100px");
    expect(link).toHaveStyle("height: 100px");
  });

  it("properly renders a non-previewable attachment with a custom size", () => {
    render(
      <AttachmentThumbnail
        attachment={attachment}
        ownerPath={ownerPath}
        alt="Basic non-previewable image attachment"
        size={50}
      />,
    );
    const link = screen.getByRole("link");
    const downloadUrl = `http://localhost${ownerPath}${attachment.href}`;
    expect(link.href).toEqual(downloadUrl);
    expect(link).toHaveStyle("width: 50px");
    expect(link).toHaveStyle("height: 50px");
  });
});

describe("Test AttachmentThumbnail with previewable attachments", () => {
  let ownerPath;
  let attachment;

  beforeEach(() => {
    ownerPath = "/documents/bcb5f3c8-d5e9-40d2-805f-4274f940c36d/";
    attachment = {
      href: "@@download/attachment/transparent.gif",
      type: "image/gif",
      md5sum: "58558ed279ab141939c223838137d5a6",
      download: "transparent.gif",
    };
  });

  it("properly renders a previewable attachment with the default size", () => {
    render(
      <AttachmentThumbnail
        attachment={attachment}
        ownerPath={ownerPath}
        alt="Basic previewable image attachment"
      />,
    );

    // Make sure it generates an img tag with the correct image src.
    const thumbnailImage = document.querySelector("img");
    expect(thumbnailImage.src).toContain("transparent.gif");

    // Click the button to make the preview appear.
    const thumbnailButton = screen.getByRole("button");
    fireEvent.click(thumbnailButton);
    let previewDialog = screen.getByRole("dialog");
    expect(previewDialog).toBeInTheDocument();
    const previewImage = within(previewDialog).getByRole("img");
    expect(previewImage.src).toContain("transparent.gif");

    // Type ESC to close the preview.
    previewDialog = screen.getByRole("dialog");
    fireEvent.keyDown(previewDialog, {
      key: "Escape",
      code: "Escape",
      keyCode: 27,
      charCode: 27,
    });

    // Make sure the preview is gone.
    previewDialog = screen.queryByRole("dialog");
    expect(previewDialog).toBeNull();
  });

  it("properly renders a previewable attachment with a custom size", () => {
    render(
      <AttachmentThumbnail
        attachment={attachment}
        ownerPath={ownerPath}
        alt="Basic previewable image attachment"
        size={200}
      />,
    );

    // Make sure it generates an img tag with the correct image src.
    const thumbnailImage = document.querySelector("img");
    expect(thumbnailImage.src).toContain("transparent.gif");

    // Click the button to make the preview appear.
    const thumbnailButton = screen.getByRole("button");
    fireEvent.click(thumbnailButton);
    let previewDialog = screen.getByRole("dialog");
    expect(previewDialog).toBeInTheDocument();

    // Click the close box to close the preview.
    const previewCloseBox = screen.getByLabelText(
      "Close the full-size preview image",
    );
    fireEvent.click(previewCloseBox);

    // Make sure the preview is gone.
    previewDialog = screen.queryByRole("dialog");
    expect(previewDialog).toBeNull();
  });
});
