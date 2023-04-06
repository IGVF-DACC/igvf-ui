import { render, screen, within } from "@testing-library/react";
import "../../__mocks__/intersectionObserverMock";
import profiles from "../../__mocks__/profile";
import { DataGridContainer } from "../../data-grid";
import SessionContext from "../../session-context";
import SortableGrid from "../../sortable-grid";
import { getSortColumn } from "../../../lib/report";
import generateColumns from "../generate-columns";
import ReportHeaderCell from "../header-cell";

describe("Test cell renderers in search results", () => {
  describe("@id, simple array, path, path array cell rendering tests", () => {
    const COLUMN_AT_ID = 0;
    const COLUMN_NUMBER_ARRAY = 2;
    const COLUMN_OBJECT_ARRAY = 3;
    const COLUMN_OFFICE_MANAGER = 4;
    const COLUMN_PI = 5;
    const COLUMN_PROPOSED_BY = 8;
    const COLUMN_SIMPLE_ARRAY = 9;
    const COLUMN_STUDIED_BY = 11;
    const COLUMN_SUBMITTED_BY = 12;
    const COLUMN_TYPE = 14;
    const COLUMN_URL = 15;
    const COLUMN_VERIFIED_BY = 17;

    it("renders the @id, simple array, path array columns", () => {
      const searchResults = {
        "@context": "/terms/",
        "@graph": [
          {
            "@id": "/awards/1U01HG012064-01/",
            "@type": ["Award", "Item"],
            number_array: [1, 2, 3],
            object_array: [
              {
                object: "object1",
              },
            ],
            component: "predictive modeling",
            simple_array: [],
            name: "1U01HG012064-01",
            verified_by: {
              "@id": "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/",
              "@type": ["User", "Item"],
            },
            pis: [
              "/users/bb7f009f-8541-4066-ab7e-acbcf587e9f5/",
              "/users/84b1815e-2d39-4396-91ff-2ae3043d06db/",
            ],
            studied_by: [
              {
                "@id": "/users/592ff43b-be20-4ad3-9d97-b65f714cd199/",
                "@type": ["User", "Item"],
              },
              {
                "@id": "/users/a8390b04-ec45-41bf-b168-7f07d4d15262/",
                "@type": ["User", "Item"],
              },
            ],
            project: "IGVF",
            status: "current",
            url: "https://www.genome.gov/Funded-Programs-Projects/Impact-of-Genomic-Variation-on-Function-Consortium",
            title:
              "Predictive Modeling of the Functional and Phenotypic Impacts of Genetic Variants",
            submitted_by: "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/",
            uuid: "fd6a3054-a67b-4246-beb2-d01a49880e79",
          },
        ],
        "@id": "/report?type=Award",
        "@type": ["Report"],
        clear_filters: "/report?type=Award",
        columns: {
          "@id": {
            title: "ID",
          },
          "@type": {
            title: "Type",
          },
          number_array: {
            title: "Number Array",
          },
          object_array: {
            title: "Object Array",
          },
          simple_array: {
            title: "Simple Array",
          },
          uuid: {
            title: "UUID",
          },
          submitted_by: {
            title: "Submitted By",
          },
          proposed_by: {
            title: "Proposed By",
          },
          verified_by: {
            title: "Verified By",
          },
          title: {
            title: "Title",
          },
          studied_by: {
            title: "Studied By",
          },
          pis: {
            title: "P.I.",
          },
          om: {
            title: "Office Manager",
          },
          name: {
            title: "Name",
          },
          project: {
            title: "Project",
          },
          url: {
            title: "URL",
          },
          component: {
            title: "Component",
          },
          status: {
            title: "Status",
          },
        },
        facet_groups: [],
        filters: [
          {
            field: "type",
            term: "Award",
            remove: "/report",
          },
        ],
        non_sortable: ["pipeline_error_detail", "description", "notes"],
        notification: "Success",
        title: "Report",
        total: 25,
      };

      const onHeaderCellClick = jest.fn();
      const sortedColumnId = getSortColumn(searchResults);
      const columns = generateColumns(searchResults, profiles);
      render(
        <SessionContext.Provider value={{ profiles }}>
          <DataGridContainer>
            <SortableGrid
              data={searchResults["@graph"]}
              columns={columns}
              initialSort={{ isSortingSuppressed: true }}
              meta={{
                onHeaderCellClick,
                sortedColumnId,
                nonSortableColumnIds: searchResults.non_sortable || [],
              }}
              CustomHeaderCell={ReportHeaderCell}
            />
          </DataGridContainer>
        </SessionContext.Provider>
      );

      const cells = screen.getAllByRole("cell");

      // Check @id has a link with the correct text.
      const atIdLinks = cells[COLUMN_AT_ID].querySelector("a");
      expect(atIdLinks).toHaveTextContent("/awards/1U01HG012064-01/");

      // Check number array has a list with comma-separated numbers.
      const numberArrayList = cells[COLUMN_NUMBER_ARRAY];
      expect(numberArrayList).toHaveTextContent("1, 2, 3");

      // Check unknown object array has JSON string.
      const objectArrayList = cells[COLUMN_OBJECT_ARRAY];
      expect(objectArrayList).toHaveTextContent('[{"object":"object1"}]');

      // Check PI column has two linked paths with the correct text.
      const piLinks = within(cells[COLUMN_PI]).getAllByRole("link");
      expect(piLinks).toHaveLength(2);
      expect(piLinks[0]).toHaveTextContent(
        "/users/bb7f009f-8541-4066-ab7e-acbcf587e9f5/"
      );
      expect(piLinks[1]).toHaveTextContent(
        "/users/84b1815e-2d39-4396-91ff-2ae3043d06db/"
      );

      // Check @type column has correct comma-separated text.
      expect(cells[COLUMN_TYPE]).toHaveTextContent("Award, Item");

      // Check submitted_by column has a linked path with the correct text.
      const submittedByLink = cells[COLUMN_SUBMITTED_BY].querySelector("a");
      expect(submittedByLink).toHaveAttribute(
        "href",
        "/users/3787a0ac-f13a-40fc-a524-69628b04cd59"
      );
      expect(submittedByLink).toHaveTextContent(
        "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/"
      );

      // Check the URL column has a link with the correct text.
      const urlLink = cells[COLUMN_URL].querySelector("a");
      expect(urlLink).toHaveTextContent(
        "https://www.genome.gov/Funded-Programs-Projects/Impact-of-Genomic-Variation-on-Function-Consortium"
      );

      // Check that the proposed_by column has a null value because no data exists.
      const proposedByLink = cells[COLUMN_PROPOSED_BY].querySelector("a");
      expect(proposedByLink).toBeNull();

      // Check that the embedded verified_by property appears as a path.
      const verifiedByLink = cells[COLUMN_VERIFIED_BY].querySelector("a");
      expect(verifiedByLink).toHaveAttribute(
        "href",
        "/users/3787a0ac-f13a-40fc-a524-69628b04cd59"
      );
      expect(verifiedByLink).toHaveTextContent(
        "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/"
      );

      // Check that an empty array of paths renders nothing.
      const omLinks = cells[COLUMN_OFFICE_MANAGER].querySelector("a");
      expect(omLinks).toBeNull();

      // Check that the empty array renders nothing.
      const nameLinks = cells[COLUMN_SIMPLE_ARRAY].querySelectorAll("a");
      expect(nameLinks).toHaveLength(0);

      // Check that the array of embedded objects renders an array of paths.
      const studiedByLinks = within(cells[COLUMN_STUDIED_BY]).getAllByRole(
        "link"
      );
      expect(studiedByLinks).toHaveLength(2);
      expect(studiedByLinks[0]).toHaveTextContent(
        "/users/592ff43b-be20-4ad3-9d97-b65f714cd199/"
      );
      expect(studiedByLinks[1]).toHaveTextContent(
        "/users/a8390b04-ec45-41bf-b168-7f07d4d15262/"
      );
    });
  });
});

describe("Boolean cell-rendering tests", () => {
  it("renders a boolean value", () => {
    const COLUMN_EMBRYONIC = 2;
    const COLUMN_COUNT = 3;

    const searchResults = {
      "@id": "/report?type=WholeOrganism",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/whole-organisms/IGVFSM003KAS/",
          accession: "IGVFSM003KAS",
          "@type": ["WholeOrganism", "Item"],
          embryonic: true,
        },
        {
          "@id": "/whole-organisms/IGVFSM000KAS/",
          "@type": ["WholeOrganism", "Item"],
          accession: "IGVFSM000KAS",
          embryonic: false,
        },
        {
          "@id": "/whole-organisms/IGVFSM001KAS/",
          "@type": ["WholeOrganism", "Item"],
          accession: "IGVFSM001KAS",
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
        accession: {
          title: "Accession",
        },
        embryonic: {
          title: "Embryonic",
        },
      },
      filters: [
        {
          field: "type",
          term: "WholeOrganism",
          remove: "/report",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const columns = generateColumns(searchResults, profiles);
    render(
      <SessionContext.Provider value={{ profiles }}>
        <DataGridContainer>
          <SortableGrid
            data={searchResults["@graph"]}
            columns={columns}
            initialSort={{ isSortingSuppressed: true }}
            meta={{
              onHeaderCellClick,
              sortedColumnId,
              nonSortableColumnIds: searchResults.non_sortable || [],
            }}
            CustomHeaderCell={ReportHeaderCell}
          />
        </DataGridContainer>
      </SessionContext.Provider>
    );
    const cells = screen.getAllByRole("cell");

    // Test a true embryonic value.
    let embryonicCell = cells[COLUMN_EMBRYONIC + 0 * COLUMN_COUNT];
    let embryonicCellContent =
      within(embryonicCell).queryByTestId("cell-type-boolean");
    expect(embryonicCellContent).toBeInTheDocument();

    // Test a false embryonic value.
    embryonicCell = cells[COLUMN_EMBRYONIC + 1 * COLUMN_COUNT];
    embryonicCellContent =
      within(embryonicCell).queryByTestId("cell-type-boolean");
    expect(embryonicCellContent).toBeInTheDocument();

    // Test a non-existent embryonic value.
    embryonicCell = cells[COLUMN_EMBRYONIC + 2 * COLUMN_COUNT];
    embryonicCellContent =
      within(embryonicCell).queryByTestId("cell-type-boolean");
    expect(embryonicCellContent).toBeNull();
  });
});

describe("`attachment` cell rendering tests", () => {
  const COLUMN_ATTACHMENT = 1;

  it("renders the attachment columns", () => {
    const searchResults = {
      "@id": "/report?type=Document",
      "@type": ["Report"],
      "@graph": [
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
      ],
      columns: {
        "@id": {
          title: "ID",
        },
        attachment: {
          title: "Accession",
        },
      },
      filters: [
        {
          field: "type",
          term: "Document",
          remove: "/report",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const columns = generateColumns(searchResults, profiles);
    render(
      <SessionContext.Provider value={{ profiles }}>
        <DataGridContainer>
          <SortableGrid
            data={searchResults["@graph"]}
            columns={columns}
            initialSort={{ isSortingSuppressed: true }}
            meta={{
              onHeaderCellClick,
              sortedColumnId,
              nonSortableColumnIds: searchResults.non_sortable || [],
            }}
            CustomHeaderCell={ReportHeaderCell}
          />
        </DataGridContainer>
      </SessionContext.Provider>
    );
    const cells = screen.getAllByRole("cell");

    const attachmentLink = cells[COLUMN_ATTACHMENT].querySelector("a");
    expect(attachmentLink).toHaveTextContent(
      "Antibody_Characterization_IGVF.pdf"
    );
  });

  it("doesn't render missing `attachment` columns", () => {
    const searchResults = {
      "@id": "/report?type=Document",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/documents/05614b59-a421-47db-b4f7-5c7c8954c7e9",
          "@type": ["Document", "Item"],
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
        attachment: {
          title: "Attachment",
        },
      },
      filters: [
        {
          field: "type",
          term: "Document",
          remove: "/report",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const columns = generateColumns(searchResults, profiles);
    render(
      <SessionContext.Provider value={{ profiles }}>
        <DataGridContainer>
          <SortableGrid
            data={searchResults["@graph"]}
            columns={columns}
            initialSort={{ isSortingSuppressed: true }}
            meta={{
              onHeaderCellClick,
              sortedColumnId,
              nonSortableColumnIds: searchResults.non_sortable || [],
            }}
            CustomHeaderCell={ReportHeaderCell}
          />
        </DataGridContainer>
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
    const searchResults = {
      "@id": "/report?type=HumanDonor",
      "@type": ["Report"],
      "@graph": [
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
      ],
      columns: {
        "@id": {
          title: "ID",
        },
        external_resources: {
          title: "External resources",
        },
      },
      filters: [
        {
          field: "type",
          term: "HumanDonor",
          remove: "/report",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const columns = generateColumns(searchResults, profiles);
    render(
      <SessionContext.Provider value={{ profiles }}>
        <DataGridContainer>
          <SortableGrid
            data={searchResults["@graph"]}
            columns={columns}
            initialSort={{ isSortingSuppressed: true }}
            meta={{
              onHeaderCellClick,
              sortedColumnId,
              nonSortableColumnIds: searchResults.non_sortable || [],
            }}
            CustomHeaderCell={ReportHeaderCell}
          />
        </DataGridContainer>
      </SessionContext.Provider>
    );
    const cells = screen.getAllByRole("cell");

    // External resource has a link with resource_identifier text.
    const attachmentLink = cells[COLUMN_EXTERNAL_RESOURCES].querySelector("a");
    expect(attachmentLink).toHaveTextContent("GenBank: S78558.");
    expect(cells[COLUMN_EXTERNAL_RESOURCES]).toHaveTextContent(
      "BRCA1 {exon 23, internal fragment} [human, serous papillary ovarian adenocarcinoma, patient sample 61, Genomic Mutant, 68 nt]"
    );
  });

  it("renders `external_resources` without a link", () => {
    const searchResults = {
      "@id": "/report?type=HumanDonor",
      "@type": ["Report"],
      "@graph": [
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
      ],
      columns: {
        "@id": {
          title: "ID",
        },
        external_resources: {
          title: "External resources",
        },
      },
      filters: [
        {
          field: "type",
          term: "HumanDonor",
          remove: "/report",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const columns = generateColumns(searchResults, profiles);
    render(
      <SessionContext.Provider value={{ profiles }}>
        <DataGridContainer>
          <SortableGrid
            data={searchResults["@graph"]}
            columns={columns}
            initialSort={{ isSortingSuppressed: true }}
            meta={{
              onHeaderCellClick,
              sortedColumnId,
              nonSortableColumnIds: searchResults.non_sortable || [],
            }}
            CustomHeaderCell={ReportHeaderCell}
          />
        </DataGridContainer>
      </SessionContext.Provider>
    );
    const cells = screen.getAllByRole("cell");

    // External resource has no link.
    const attachmentLink = cells[COLUMN_EXTERNAL_RESOURCES].querySelector("a");
    expect(attachmentLink).toBeNull();
    expect(cells[COLUMN_EXTERNAL_RESOURCES]).toHaveTextContent(
      "GenBank: S78558."
    );
  });

  it("renders nothing when `external_resources` has an empty array", () => {
    const searchResults = {
      "@id": "/report?type=HumanDonor",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
          external_resources: [],
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
        external_resources: {
          title: "External resources",
        },
      },
      filters: [
        {
          field: "type",
          term: "HumanDonor",
          remove: "/report",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const columns = generateColumns(searchResults, profiles);
    render(
      <SessionContext.Provider value={{ profiles }}>
        <DataGridContainer>
          <SortableGrid
            data={searchResults["@graph"]}
            columns={columns}
            initialSort={{ isSortingSuppressed: true }}
            meta={{
              onHeaderCellClick,
              sortedColumnId,
              nonSortableColumnIds: searchResults.non_sortable || [],
            }}
            CustomHeaderCell={ReportHeaderCell}
          />
        </DataGridContainer>
      </SessionContext.Provider>
    );
    const cells = screen.getAllByRole("cell");

    // `external_resources` cell is empty.
    const cellDiv = cells[COLUMN_EXTERNAL_RESOURCES].querySelector("div");
    expect(cellDiv).toBeEmptyDOMElement();
  });

  it("renders nothing when `external_resources` doesn't exist", () => {
    const searchResults = {
      "@id": "/report?type=HumanDonor",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
          external_resources: [],
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
        external_resources: {
          title: "External resources",
        },
      },
      filters: [
        {
          field: "type",
          term: "HumanDonor",
          remove: "/report",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const columns = generateColumns(searchResults, profiles);
    render(
      <SessionContext.Provider value={{ profiles }}>
        <DataGridContainer>
          <SortableGrid
            data={searchResults["@graph"]}
            columns={columns}
            initialSort={{ isSortingSuppressed: true }}
            meta={{
              onHeaderCellClick,
              sortedColumnId,
              nonSortableColumnIds: searchResults.non_sortable || [],
            }}
            CustomHeaderCell={ReportHeaderCell}
          />
        </DataGridContainer>
      </SessionContext.Provider>
    );
    const cells = screen.getAllByRole("cell");

    // `external_resources` cell is empty.
    const cellDiv = cells[COLUMN_EXTERNAL_RESOURCES].querySelector("div");
    expect(cellDiv).toBeEmptyDOMElement();
  });
});

describe("Gene `locations` cell-rendering tests", () => {
  const COLUMN_LOCATIONS = 1;
  const COLUMN_START = 2;

  it("shows `locations` as chromosome coordinate strings", () => {
    const searchResults = {
      "@id": "/report?type=Gene",
      "@type": ["Report"],
      "@graph": [
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
      ],
      columns: {
        "@id": {
          title: "ID",
        },
        locations: {
          title: "Gene Locations",
        },
        start: {
          title: "Start",
        },
      },
      filters: [
        {
          field: "type",
          term: "Gene",
          remove: "/report",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const columns = generateColumns(searchResults, profiles);
    render(
      <SessionContext.Provider value={{ profiles }}>
        <DataGridContainer>
          <SortableGrid
            data={searchResults["@graph"]}
            columns={columns}
            initialSort={{ isSortingSuppressed: true }}
            meta={{
              onHeaderCellClick,
              sortedColumnId,
              nonSortableColumnIds: searchResults.non_sortable || [],
            }}
            CustomHeaderCell={ReportHeaderCell}
          />
        </DataGridContainer>
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
    const searchResults = {
      "@id": "/report?type=Gene",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/genes/ENSG00000154832/",
          "@type": ["Gene", "Item"],
          locations: [],
          start: 50282343,
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
        locations: {
          title: "Gene Locations",
        },
        start: {
          title: "Start",
        },
      },
      filters: [
        {
          field: "type",
          term: "Gene",
          remove: "/report",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const columns = generateColumns(searchResults, profiles);
    render(
      <SessionContext.Provider value={{ profiles }}>
        <DataGridContainer>
          <SortableGrid
            data={searchResults["@graph"]}
            columns={columns}
            initialSort={{ isSortingSuppressed: true }}
            meta={{
              onHeaderCellClick,
              sortedColumnId,
              nonSortableColumnIds: searchResults.non_sortable || [],
            }}
            CustomHeaderCell={ReportHeaderCell}
          />
        </DataGridContainer>
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
    const searchResults = {
      "@id": "/report?type=Page",
      "@type": ["Report"],
      "@graph": [
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
      ],
      columns: {
        "@id": {
          title: "ID",
        },
        layout: {
          title: "Page Layout",
        },
        parent: {
          title: "Parent Page",
        },
      },
      filters: [
        {
          field: "type",
          term: "Page",
          remove: "/report",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const columns = generateColumns(searchResults, profiles);
    render(
      <SessionContext.Provider value={{ profiles }}>
        <DataGridContainer>
          <SortableGrid
            data={searchResults["@graph"]}
            columns={columns}
            initialSort={{ isSortingSuppressed: true }}
            meta={{
              onHeaderCellClick,
              sortedColumnId,
              nonSortableColumnIds: searchResults.non_sortable || [],
            }}
            CustomHeaderCell={ReportHeaderCell}
          />
        </DataGridContainer>
      </SessionContext.Provider>
    );
    const cells = screen.getAllByRole("cell");

    // Parent link should have correct href.
    const parentLink = within(cells[COLUMN_PARENT]).getByRole("link");
    expect(parentLink).toHaveAttribute("href", "/help");

    // Layout should show truncated JSON.
    const unknown = within(cells[COLUMN_LAYOUT]).getByTestId(
      "cell-type-unknown-object"
    );
    expect(unknown).toHaveTextContent(
      '{"blocks":[{"@id":"#block1","body":"# Donor Help This is some help text about donors.","@type":"mark...'
    );
  });

  it("renders nothing for `parent` when page's parent doesn't exist", () => {
    const searchResults = {
      "@id": "/report?type=Page",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/help/donors/",
          "@type": ["Page", "Item"],
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
        layout: {
          title: "Page Layout",
        },
        parent: {
          title: "Parent Page",
        },
      },
      filters: [
        {
          field: "type",
          term: "Page",
          remove: "/report",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const columns = generateColumns(searchResults, profiles);
    render(
      <SessionContext.Provider value={{ profiles }}>
        <DataGridContainer>
          <SortableGrid
            data={searchResults["@graph"]}
            columns={columns}
            initialSort={{ isSortingSuppressed: true }}
            meta={{
              onHeaderCellClick,
              sortedColumnId,
              nonSortableColumnIds: searchResults.non_sortable || [],
            }}
            CustomHeaderCell={ReportHeaderCell}
          />
        </DataGridContainer>
      </SessionContext.Provider>
    );
    const cells = screen.getAllByRole("cell");

    const parentLink = within(cells[2]).queryByRole("link");
    expect(parentLink).toBeNull();
  });
});
