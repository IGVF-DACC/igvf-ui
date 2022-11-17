import { fireEvent, render, screen, within } from "@testing-library/react";
import "../../__mocks__/intersectionObserverMock";
import CollectionDownload from "../download";

describe("Test the <CollectionDownload> component", () => {
  const columns = [
    { id: "@id", title: "ID" },
    { id: "aliases", title: "Aliases" },
    { id: "attachment", title: "Attachment" },
    { id: "award", title: "Award" },
    { id: "characterization_method", title: "Characterization Method" },
    { id: "creation_timestamp", title: "Creation Timestamp" },
    { id: "description", title: "Description" },
    { id: "document_type", title: "Document Type" },
    { id: "lab", title: "Lab" },
    { id: "notes", title: "Notes" },
    { id: "schema_version", title: "Schema Version" },
    { id: "status", title: "Status" },
    { id: "submitted_by", title: "Submitted By" },
    { id: "submitter_comment", title: "Submitter Comment" },
    { id: "summary", title: "Summary" },
    { id: "@type", title: "Type" },
    { id: "urls", title: "URL" },
    { id: "uuid", title: "UUID" },
  ];

  const collection = [
    {
      "@id": "/documents/05614b59-a421-47db-b4f7-5c7c8954c7e9/",
      "@type": ["Document", "Item"],
      aliases: ["j-michael-cherry:characterization_sequencing_insert"],
      attachment: {
        href: "@@download/attachment/mouse_H3K4me3_07-473_validation_Hardison.pdf",
        type: "application/pdf",
        md5sum: "a7c2c98ff7d0f198fdbc6f0ccbfcb411",
        download: "mouse_H3K4me3_07-473_validation_Hardison.pdf",
      },
      award: "/awards/1UM1HG011996-01/",
      description: "Characterization of a sample using sequencing.",
      lab: "/labs/j-michael-cherry/",
      status: "in progress",
      submitted_by: "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/",
      uuid: "05614b59-a421-47db-b4f7-5c7c8954c7e9",
    },
  ];

  it("renders the download button that brings up download modal when clicked", () => {
    render(
      <CollectionDownload
        collection={collection}
        columns={columns}
        hiddenColumns={[]}
        collectionType="Document"
      />
    );

    // Test that the "Download TSV" button gets rendered, then click it to make sure the download
    // modal gets rendered.
    const downloadButton = screen.getByText("Download TSV");
    expect(downloadButton).toBeInTheDocument();
    fireEvent.click(downloadButton);
    const downloadDialog = screen.getByRole("dialog");
    expect(downloadDialog).toBeInTheDocument();

    // Test that the "Download TSV" button in the download modal gets rendered, then click it to make
    // sure the download modal gets closed.
    const downloadTsvButton = within(downloadDialog).getByText("Download TSV");
    expect(downloadTsvButton).toBeInTheDocument();
    fireEvent.click(downloadTsvButton);
    expect(downloadDialog).not.toBeInTheDocument();
  });

  it("can close the modal with ESC and cancel button", () => {
    render(
      <CollectionDownload
        collection={collection}
        columns={columns}
        hiddenColumns={[]}
        collectionType="Document"
      />
    );

    // Click the "Download TSV" button on the page to make sure the download modal gets rendered.
    const downloadButton = screen.getByText("Download TSV");
    fireEvent.click(downloadButton);
    let downloadDialog = screen.getByRole("dialog");

    // Click the "Cancel" button to make sure the download modal gets closed.
    const cancelButton = within(downloadDialog).getByText("Close");
    expect(cancelButton).toBeInTheDocument();
    fireEvent.click(cancelButton);
    expect(downloadDialog).not.toBeInTheDocument();

    // Open the modal again, then test that the modal can be closed with the ESC key.
    fireEvent.click(downloadButton);
    downloadDialog = screen.getByRole("dialog");
    fireEvent.keyDown(downloadDialog, { key: "Escape", code: "Escape" });
    expect(downloadDialog).not.toBeInTheDocument();

    // Open the modal again, then test that the modal can be closed with the icon button in the
    // header.
    fireEvent.click(downloadButton);
    downloadDialog = screen.getByRole("dialog");
    const headerCloseButton = screen.getByLabelText("Close dialog");
    expect(headerCloseButton).toBeInTheDocument();
    fireEvent.click(headerCloseButton);
    expect(downloadDialog).not.toBeInTheDocument();
  });
});
