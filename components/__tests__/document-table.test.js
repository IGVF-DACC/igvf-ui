import { fireEvent, render, screen } from "@testing-library/react";
import DocumentTable from "../document-table";

describe("Test the document table", () => {
  beforeAll(() => {
    window.scrollTo = jest.fn();
  });

  it("generates a good document table from the given documents", () => {
    /**
     * Array of test documents.
     */
    const documents = [
      {
        lab: "/labs/j-michael-cherry/",
        award: "/awards/1UM1HG012053-01/",
        status: "in progress",
        aliases: ["j-michael-cherry:image_tif_insert"],
        attachment: {
          href: "@@download/attachment/hnRNPA1_aviva-1_WB_HeLa_Fu.TIF",
          type: "image/tiff",
          width: 3072,
          height: 2304,
          md5sum: "2750c9b1b90c6c65e73d1a460ae3e260",
          download: "hnRNPA1_aviva-1_WB_HeLa_Fu.TIF",
        },
        description: "Pathology high resolution image.",
        submitted_by: "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/",
        document_type: "image",
        schema_version: "2",
        standardized_file_format: "true",
        creation_timestamp: "2022-08-12T21:10:14.258976+00:00",
        "@id": "/documents/ad1f3c3e-23bf-4e33-3b4d-7333eb1ba33e/",
        "@type": ["Document", "Item"],
        uuid: "ad1f3c3e-23bf-4e33-3b4d-7333eb1ba33e",
      },
      {
        lab: "/labs/j-michael-cherry/",
        award: "/awards/1UM1HG012053-01/",
        status: "in progress",
        aliases: ["j-michael-cherry:plasmid_map_insert"],
        attachment: {
          href: "@@download/attachment/pLKO1_vector.png",
          type: "image/png",
          width: 480,
          height: 380,
          md5sum: "21b394a0b91964d0613a77d52e1f3dac",
          download: "pLKO1_vector.png",
        },
        description: "Vector map.",
        submitted_by: "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/",
        document_type: "plasmid map",
        schema_version: "2",
        creation_timestamp: "2022-08-12T21:10:14.325203+00:00",
        "@id": "/documents/ad1f4c5e-27bf-4e37-8b4d-7933eb1ba89e/",
        "@type": ["Document", "Item"],
        uuid: "ad1f4c5e-27bf-4e37-8b4d-7933eb1ba89e",
      },
    ];

    function PageWithDocuments() {
      return <DocumentTable documents={documents} />;
    }

    render(<PageWithDocuments />);

    // Check the size of the table.
    const columnHeaders = screen.getAllByRole("columnheader");
    expect(columnHeaders.length).toBe(6);
    const cells = screen.getAllByRole("cell");
    expect(cells.length).toBe(12);

    // Check the contents of the table.
    const pageLinks = screen.getAllByLabelText(
      "View page for document Pathology high resolution image."
    );
    expect(pageLinks).toHaveLength(1);
    expect(pageLinks[0].href).toEqual(
      "http://localhost/documents/ad1f3c3e-23bf-4e33-3b4d-7333eb1ba33e"
    );
    let downloadLinks = screen.getAllByLabelText(
      "Download hnRNPA1_aviva-1_WB_HeLa_Fu.TIF"
    );
    expect(downloadLinks).toHaveLength(1);
    expect(downloadLinks[0].href).toEqual(
      "http://localhost/documents/ad1f3c3e-23bf-4e33-3b4d-7333eb1ba33e/@@download/attachment/hnRNPA1_aviva-1_WB_HeLa_Fu.TIF"
    );

    // Find the header cell containing a button for "Download" and click it.
    const downloadHeaderButton = screen.getByRole("button", {
      name: "Download",
    });
    expect(downloadHeaderButton).toBeInTheDocument();
    fireEvent.click(downloadHeaderButton);

    downloadLinks = screen.getAllByLabelText("Download pLKO1_vector.png");
    expect(downloadLinks).toHaveLength(1);
  });
});
