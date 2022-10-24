import { fireEvent, render, screen, within } from "@testing-library/react";
import CollectionTable from "../table";
import SessionContext from "../../session-context";
import "../../__mocks__/intersectionObserverMock";
import profiles from "../__mocks__/profiles";

describe("Test cell renderers in a <CollectionTable>", () => {
  describe("@id, simple array, path, path array cell rendering tests", () => {
    const COLUMN_AT_ID = 0;
    const COLUMN_NUMBER_ARRAY = 1;
    const COLUMN_OBJECT_ARRAY = 2;
    const COLUMN_PI = 3;
    const COLUMN_SUBMITTED_BY = 4;
    const COLUMN_TYPE = 5;
    const COLUMN_URL = 6;

    it("renders the @id, simple array, path array columns", () => {
      const collection = [
        {
          "@id": "/awards/1U01HG011952-01/",
          "@type": ["Award", "Item"],
          number_array: [1, 2, 3],
          object_array: [
            {
              object: "object1",
            },
          ],
          pi: [
            "/users/bb7f009f-8541-4066-ab7e-acbcf587e9f5/",
            "/users/84b1815e-2d39-4396-91ff-2ae3043d06db/",
          ],
          submitted_by: "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/",
          url: "https://www.genome.gov/Funded-Programs-Projects/Impact-of-Genomic-Variation-on-Function-Consortium",
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      // Check @id has a link with the correct text.
      const atIdLinks = cells[COLUMN_AT_ID].querySelector("a");
      expect(atIdLinks).toHaveTextContent("/awards/1U01HG011952-01/");

      // Check number array has a list with comma-separated numbers.
      const numberArrayList = cells[COLUMN_NUMBER_ARRAY];
      expect(numberArrayList).toHaveTextContent("1, 2, 3");

      // Check unknown object array has JSON string and View JSON button.
      const objectArrayList = cells[COLUMN_OBJECT_ARRAY];
      expect(objectArrayList).toHaveTextContent('[{"object":"object1"}]');
      const viewJsonButton = objectArrayList.querySelector("button");
      expect(viewJsonButton).toHaveTextContent("View JSON");

      // Check PI column has two linked paths with the correct text.
      const piLinks = within(cells[COLUMN_PI]).getAllByRole("link");
      expect(piLinks).toHaveLength(2);
      expect(piLinks[0]).toHaveTextContent(
        "/users/bb7f009f-8541-4066-ab7e-acbcf587e9f5/"
      );

      // Check @type column has correct comma-separated text.
      expect(cells[COLUMN_TYPE]).toHaveTextContent("Award, Item");

      // Check submitted_by column has a linked path with the correct text.
      const submittedByLink = cells[COLUMN_SUBMITTED_BY].querySelector("a");
      expect(submittedByLink).toHaveTextContent(
        "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/"
      );

      // Check the URL column has a link with the correct text.
      const urlLink = cells[COLUMN_URL].querySelector("a");
      expect(urlLink).toHaveTextContent(
        "https://www.genome.gov/Funded-Programs-Projects/Impact-of-Genomic-Variation-on-Function-Consortium"
      );
    });

    it("renders a path link when the server has embedded a linkTo object", () => {
      const collection = [
        {
          "@id": "/awards/1U01HG011952-01/",
          "@type": ["Award", "Item"],
          submitted_by: {
            "@id": "/users/8be3a346-1440-4bd6-85e8-3236ae469c0c/",
            "@type": ["User", "Item"],
            uuid: "8be3a346-1440-4bd6-85e8-3236ae469c0c",
            lab: "/labs/j-michael-cherry/",
            title: "Justo Lobortis",
            submits_for: ["/labs/j-michael-cherry/"],
            "@context": "/terms/",
          },
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      // Check PI column has a linked path with the correct text.
      const submittedByLink = cells[COLUMN_SUBMITTED_BY].querySelector("a");
      expect(submittedByLink).toHaveTextContent(
        "/users/8be3a346-1440-4bd6-85e8-3236ae469c0c/"
      );
    });

    it("renders multiple path links when the server has embedded an array of linkTo objects", () => {
      const collection = [
        {
          "@id": "/awards/1U01HG011952-01/",
          "@type": ["Award", "Item"],
          pi: [
            {
              "@id": "/users/bb7f009f-8541-4066-ab7e-acbcf587e9f5/",
              "@type": ["User", "Item"],
              uuid: "bb7f009f-8541-4066-ab7e-acbcf587e9f5",
              lab: "/labs/j-michael-cherry/",
              title: "Justo Lobortis",
              submits_for: ["/labs/j-michael-cherry/"],
              "@context": "/terms/",
            },
            {
              "@id": "/users/84b1815e-2d39-4396-91ff-2ae3043d06db/",
              "@type": ["User", "Item"],
              uuid: "84b1815e-2d39-4396-91ff-2ae3043d06db",
              lab: "/labs/j-michael-cherry/",
              title: "Justo Lobortis",
              submits_for: ["/labs/j-michael-cherry/"],
              "@context": "/terms/",
            },
          ],
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      // Check PI column has two linked paths with the correct text.
      const piLinks = within(cells[COLUMN_PI]).getAllByRole("link");
      expect(piLinks).toHaveLength(2);
      expect(piLinks[0]).toHaveTextContent(
        "/users/bb7f009f-8541-4066-ab7e-acbcf587e9f5/"
      );
      expect(piLinks[1]).toHaveTextContent(
        "/users/84b1815e-2d39-4396-91ff-2ae3043d06db/"
      );
    });
  });

  describe("`attachment` cell rendering tests", () => {
    const COLUMN_ATTACHMENT = 1;

    it("renders the attachment columns", () => {
      const collection = [
        {
          "@id": "/documents/05614b59-a421-47db-b4f7-5c7c8954c7e9",
          "@type": ["Document", "Item"],
          attachment: {
            download: "Antibody_Characterization_IGVF.pdf",
            href: "@@download/attachment/Antibody_Characterization_IGVF.pdf",
            md5sum: "58558ed279ab141939c223838137d5a6",
            type: "application/pdf",
          },
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      const attachmentLink = cells[COLUMN_ATTACHMENT].querySelector("a");
      expect(attachmentLink).toHaveTextContent(
        "Antibody_Characterization_IGVF.pdf"
      );
    });

    it("doesn't render missing `attachment` columns", () => {
      const collection = [
        {
          "@id": "/documents/05614b59-a421-47db-b4f7-5c7c8954c7e9",
          "@type": ["Document", "Item"],
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      const attachmentLink = cells[COLUMN_ATTACHMENT].querySelector("a");
      expect(attachmentLink).toBeNull();
    });
  });

  describe("`external_resources` cell-rendering tests", () => {
    const COLUMN_EXTERNAL_RESOURCES = 1;

    it("renders `external_resources` with a link", () => {
      const collection = [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
          external_resources: [
            {
              resource_url: "https://www.ncbi.nlm.nih.gov/nuccore/S78558.1",
              resource_name:
                "BRCA1 {exon 23, internal fragment} [human, serous papillary ovarian adenocarcinoma, patient sample 61, Genomic Mutant, 68 nt]",
              resource_identifier: "GenBank: S78558.1",
            },
          ],
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      // External resource has a link with resource_identifier text.
      const attachmentLink =
        cells[COLUMN_EXTERNAL_RESOURCES].querySelector("a");
      expect(attachmentLink).toHaveTextContent("GenBank: S78558.");
      expect(cells[COLUMN_EXTERNAL_RESOURCES]).toHaveTextContent(
        "BRCA1 {exon 23, internal fragment} [human, serous papillary ovarian adenocarcinoma, patient sample 61, Genomic Mutant, 68 nt]"
      );
    });

    it("renders `external_resources` without a link", () => {
      const collection = [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
          external_resources: [
            {
              resource_name:
                "BRCA1 {exon 23, internal fragment} [human, serous papillary ovarian adenocarcinoma, patient sample 61, Genomic Mutant, 68 nt]",
              resource_identifier: "GenBank: S78558.1",
            },
          ],
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      // External resource has no link.
      const attachmentLink =
        cells[COLUMN_EXTERNAL_RESOURCES].querySelector("a");
      expect(attachmentLink).toBeNull();
      expect(cells[COLUMN_EXTERNAL_RESOURCES]).toHaveTextContent(
        "GenBank: S78558."
      );
    });

    it("renders nothing when `external_resources` has an empty array", () => {
      const collection = [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
          external_resources: [],
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      // `external_resources` cell is empty.
      const cellDiv = cells[COLUMN_EXTERNAL_RESOURCES].querySelector("div");
      expect(cellDiv).toBeEmptyDOMElement();
    });

    it("renders nothing when `external_resources` doesn't exist", () => {
      const collection = [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      // `external_resources` cell is empty.
      const cellDiv = cells[COLUMN_EXTERNAL_RESOURCES].querySelector("div");
      expect(cellDiv).toBeEmptyDOMElement();
    });
  });

  describe("`heath_status_history cell-rendering tests", () => {
    const COLUMN_HEALTH_STATUS_HISTORY = 2;

    it("shows date range and symptoms for `health_status_history`", () => {
      const collection = [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
          health_status_history: [
            {
              date_end: "2022-01-10",
              date_start: "2022-01-04",
              health_description: "Running fever 103F, feeling tired",
            },
            {
              date_end: "2022-01-10",
              date_start: "2021-12-03",
              health_description: "Running fever 103F, feeling tired",
            },
          ],
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      // External resource has a link with resource_identifier text.
      const histories = within(
        cells[COLUMN_HEALTH_STATUS_HISTORY]
      ).getAllByTestId("health-status-history");
      expect(histories).toHaveLength(2);
      expect(histories[0]).toHaveTextContent(
        "January 4, 2022 – January 10, 2022"
      );
      expect(histories[1]).toHaveTextContent(
        "Running fever 103F, feeling tired"
      );
      expect(histories[1]).toHaveTextContent(
        "December 3, 2021 – January 10, 2022"
      );
      expect(histories[1]).toHaveTextContent(
        "Running fever 103F, feeling tired"
      );
    });

    it("renders nothing when `health_status_history` has an empty array", () => {
      const collection = [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
          health_status_history: [],
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      // External resource has a link with resource_identifier text.
      const cellDiv = cells[COLUMN_HEALTH_STATUS_HISTORY].querySelector("div");
      expect(cellDiv).toBeEmptyDOMElement();
    });

    it("renders nothing when `health_status_history` doesn't exist", () => {
      const collection = [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      // External resource has a link with resource_identifier text.
      const cellDiv = cells[COLUMN_HEALTH_STATUS_HISTORY].querySelector("div");
      expect(cellDiv).toBeEmptyDOMElement();
    });
  });

  describe("Gene `location` cell-rendering tests", () => {
    const COLUMN_LOCATIONS = 1;
    const COLUMN_START = 2;

    it("shows `location` as chromosome coordinate strings", () => {
      const collection = [
        {
          "@id": "/genes/ENSG00000154832/",
          "@type": ["Gene", "Item"],
          locations: [
            {
              end: 50288322,
              start: 50282343,
              assembly: "GRCh38",
              chromosome: "chr18",
            },
            {
              end: 47814692,
              start: 47808713,
              assembly: "hg19",
              chromosome: "chr18",
            },
          ],
          start: 50282343,
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      // Test that `locations` has the correct contents.
      const geneLocation = within(cells[COLUMN_LOCATIONS]).getAllByRole(
        "listitem"
      );
      expect(geneLocation).toHaveLength(2);
      expect(geneLocation[0]).toHaveTextContent("chr18:50282343-50288322");
      expect(geneLocation[0]).toHaveTextContent("GRCh38");
      expect(geneLocation[1]).toHaveTextContent("chr18:47808713-47814692");
      expect(geneLocation[1]).toHaveTextContent("hg19");

      // Test that `start` has the correct contents.
      expect(cells[COLUMN_START]).toHaveTextContent("50282343");
    });

    it("shows nothing when `location` has an empty array", () => {
      const collection = [
        {
          "@id": "/genes/ENSG00000154832/",
          "@type": ["Gene", "Item"],
          locations: [],
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      const geneLocation = within(cells[COLUMN_LOCATIONS]).queryAllByRole(
        "listitem"
      );
      expect(geneLocation).toHaveLength(0);
    });

    it("shows nothing when `location` doesn't exist", () => {
      const collection = [
        {
          "@id": "/genes/ENSG00000154832/",
          "@type": ["Gene", "Item"],
          locations: [],
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      const geneLocation = within(cells[COLUMN_LOCATIONS]).queryAllByRole(
        "listitem"
      );
      expect(geneLocation).toHaveLength(0);
    });
  });

  describe("Page cell-rendering tests", () => {
    const COLUMN_LAYOUT = 1;
    const COLUMN_PARENT = 2;

    it("renders a link for the page's parent and JSON for layout", () => {
      const collection = [
        {
          "@id": "/help/donors/",
          "@type": ["Page", "Item"],
          parent: "/help/",
          layout: {
            blocks: [
              {
                "@id": "#block1",
                body: "# Donor Help This is some help text about donors.",
                "@type": "markdown",
                direction: "ltr",
              },
            ],
          },
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      // Parent link should have correct href.
      const parentLink = within(cells[COLUMN_PARENT]).getByRole("link");
      expect(parentLink).toHaveAttribute("href", "/help");

      // Layout should show truncated JSON.
      const unknown = within(cells[COLUMN_LAYOUT]).getByTestId(
        "unknown-object"
      );
      expect(unknown).toHaveTextContent(
        '{"blocks":[{"@id":"#block1","body":"# Donor Help This is some help text about donors.","@type":"mark...'
      );

      // Layout should have a View JSON button.
      const viewJsonButton = within(cells[COLUMN_LAYOUT]).getByRole("button");
      expect(viewJsonButton).toHaveTextContent("View JSON");

      // Click the View JSON button to open the modal with the complete JSON.
      fireEvent.click(viewJsonButton);
      let previewDialog = screen.getByRole("dialog");
      expect(previewDialog).toHaveTextContent(
        '{ "blocks": [ { "@id": "#block1", "body": "# Donor Help This is some help text about donors.", "@type": "markdown", "direction": "ltr" } ] }'
      );

      // Close the modal.
      const previewDialogCloseButton =
        within(previewDialog).getByRole("button");
      fireEvent.click(previewDialogCloseButton);
      previewDialog = screen.queryByRole("dialog");
      expect(previewDialog).not.toBeInTheDocument();

      // Open the modal again and close it with the ESC key.
      fireEvent.click(viewJsonButton);
      previewDialog = screen.getByRole("dialog");
      fireEvent.keyDown(previewDialog, {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        charCode: 27,
      });
      previewDialog = screen.queryByRole("dialog");
      expect(previewDialog).not.toBeInTheDocument();
    });

    it("renders nothing for `parent` when page's parent doesn't exist", () => {
      const collection = [
        {
          "@id": "/help/donors/",
          "@type": ["Page", "Item"],
        },
      ];

      render(
        <SessionContext.Provider value={{ profiles }}>
          <CollectionTable
            collection={collection}
            pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
          />
        </SessionContext.Provider>
      );
      const cells = screen.getAllByRole("cell");

      const parentLink = within(cells[2]).queryByRole("link");
      expect(parentLink).toBeNull();
    });
  });
});
