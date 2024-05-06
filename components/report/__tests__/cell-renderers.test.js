import { render, screen, within } from "@testing-library/react";
import "../../__mocks__/intersectionObserverMock";
import profiles from "../../__mocks__/profile";
import { DataGridContainer } from "../../data-grid";
import SessionContext from "../../session-context";
import SortableGrid from "../../sortable-grid";
import {
  columnsToColumnSpecs,
  getSelectedTypes,
  getSortColumn,
} from "../../../lib/report";
import generateColumns from "../generate-columns";
import ReportHeaderCell from "../header-cell";

describe("Test cell renderers in search results", () => {
  describe("@id, simple array, path, path array cell rendering tests", () => {
    const COLUMN_AT_ID = 0;
    const COLUMN_NUMBER_ARRAY = 3;
    const COLUMN_OBJECT_ARRAY = 4;
    const COLUMN_OFFICE_MANAGER = 5;
    const COLUMN_PI = 6;
    const COLUMN_PROPOSED_BY = 8;
    const COLUMN_SIMPLE_ARRAY = 9;
    const COLUMN_STUDIED_BY = 11;
    const COLUMN_SUBMITTED_BY = 12;
    const COLUMN_TYPE = 14;
    const COLUMN_URL = 15;
    const COLUMN_VERIFIED_BY = 17;
    const COLUMN_VIRTUAL = 18;

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
            virtual: true,
          },
        ],
        "@id": "/multireport?type=Award",
        "@type": ["Report"],
        clear_filters: "/multireport?type=Award",
        result_columns: {
          "@id": {
            title: "ID",
          },
          component: {
            title: "Component",
          },
          name: {
            title: "Name",
          },
          number_array: {
            title: "Number Array",
          },
          object_array: {
            title: "Object Array",
          },
          om: {
            title: "Office Manager",
          },
          pis: {
            title: "P.I.",
          },
          project: {
            title: "Project",
          },
          proposed_by: {
            title: "Proposed By",
          },
          simple_array: {
            title: "Simple Array",
          },
          status: {
            title: "Status",
          },
          studied_by: {
            title: "Studied By",
          },
          submitted_by: {
            title: "Submitted By",
          },
          title: {
            title: "Title",
          },
          "@type": {
            title: "Type",
          },
          url: {
            title: "URL",
          },
          uuid: {
            title: "UUID",
          },
          verified_by: {
            title: "Verified By",
          },
          virtual: {
            title: "Virtual",
          },
        },
        facet_groups: [],
        filters: [
          {
            field: "type",
            term: "Award",
            remove: "/multireport",
          },
        ],
        non_sortable: ["pipeline_error_detail", "description", "notes"],
        notification: "Success",
        title: "Report",
        total: 25,
      };

      const onHeaderCellClick = jest.fn();
      const sortedColumnId = getSortColumn(searchResults);
      const selectedTypes = getSelectedTypes(searchResults);
      const visibleColumnSpecs = columnsToColumnSpecs(
        searchResults.result_columns
      );
      const columns = generateColumns(
        selectedTypes,
        visibleColumnSpecs,
        profiles.Award.properties
      );
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

      // Check boolean properties render as "true" or "false".
      expect(cells[COLUMN_VIRTUAL]).toHaveTextContent("true");
    });
  });
});

describe("Boolean cell-rendering tests", () => {
  it("renders a boolean value", () => {
    const COLUMN_EMBRYONIC = 2;
    const COLUMN_COUNT = 3;

    const searchResults = {
      "@id": "/multireport?type=WholeOrganism",
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
      result_columns: {
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
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.WholeOrganism.properties
    );
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
      "@id": "/multireport?type=Document",
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
      result_columns: {
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
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.Document.properties
    );
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
      "@id": "/multireport?type=Document",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/documents/05614b59-a421-47db-b4f7-5c7c8954c7e9",
          "@type": ["Document", "Item"],
        },
      ],
      result_columns: {
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
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.Document.properties
    );
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

describe("`aliases` cell-rendering tests", () => {
  it("renders a single alias", () => {
    const COLUMN_ALIASES = 1;

    const searchResults = {
      "@id": "/multireport?type=HumanDonor",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
          aliases: ["igvf:testing_alias"],
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        aliases: {
          title: "Aliases",
        },
      },
      filters: [
        {
          field: "type",
          term: "HumanDonor",
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.HumanDonor.properties
    );
    render(
      <SessionContext.Provider value={{ profiles }}>
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
      </SessionContext.Provider>
    );
    const cells = screen.getAllByRole("cell");

    // Test that the alias has the correct text.
    const aliasLink = cells[COLUMN_ALIASES].querySelector("li");
    expect(aliasLink).toHaveTextContent("igvf:testing_alias");
  });

  it("renders multiple aliases", () => {
    const COLUMN_ALIASES = 1;

    const searchResults = {
      "@id": "/multireport?type=HumanDonor",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
          aliases: ["igvf:testing_alias", "igvf:another_alias"],
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        aliases: {
          title: "Aliases",
        },
      },
      filters: [
        {
          field: "type",
          term: "HumanDonor",
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.HumanDonor.properties
    );
    render(
      <SessionContext.Provider value={{ profiles }}>
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
      </SessionContext.Provider>
    );
    const cells = screen.getAllByRole("cell");

    const aliases = cells[COLUMN_ALIASES].querySelectorAll("li");
    expect(aliases).toHaveLength(2);
    expect(aliases[0]).toHaveTextContent("igvf:testing_alias");
    expect(aliases[1]).toHaveTextContent("igvf:another_alias");
  });

  it("renders nothing when `aliases` is an empty array", () => {
    const COLUMN_ALIASES = 1;

    const searchResults = {
      "@id": "/multireport?type=HumanDonor",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
          aliases: [],
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        aliases: {
          title: "Aliases",
        },
      },
      filters: [
        {
          field: "type",
          term: "HumanDonor",
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.HumanDonor.properties
    );
    render(
      <SessionContext.Provider value={{ profiles }}>
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
      </SessionContext.Provider>
    );
    const cells = screen.getAllByRole("cell");

    const aliases = cells[COLUMN_ALIASES].querySelectorAll("li");
    expect(aliases).toHaveLength(0);
  });

  it("renders nothing when `aliases` doesn't exist", () => {
    const COLUMN_ALIASES = 1;

    const searchResults = {
      "@id": "/multireport?type=HumanDonor",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        aliases: {
          title: "Aliases",
        },
      },
      filters: [
        {
          field: "type",
          term: "HumanDonor",
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.HumanDonor.properties
    );
    render(
      <SessionContext.Provider value={{ profiles }}>
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
      </SessionContext.Provider>
    );
    const cells = screen.getAllByRole("cell");

    const aliases = cells[COLUMN_ALIASES].querySelectorAll("li");
    expect(aliases).toHaveLength(0);
  });
});

describe("Gene `locations` cell-rendering tests", () => {
  const COLUMN_LOCATIONS = 1;
  const COLUMN_START = 2;

  it("shows `locations` as chromosome coordinate strings", () => {
    const searchResults = {
      "@id": "/multireport?type=Gene",
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
      result_columns: {
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
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.Gene.properties
    );
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
      "@id": "/multireport?type=Gene",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/genes/ENSG00000154832/",
          "@type": ["Gene", "Item"],
          locations: [],
          start: 50282343,
        },
      ],
      result_columns: {
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
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.Gene.properties
    );
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
      "@id": "/multireport?type=Page",
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
      result_columns: {
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
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.Page.properties
    );
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
      '{"blocks":[{"@id":"#block1","body":"# Donor Help This is some help text about donors.","@type":"markdown","direction":"ltr"}]}'
    );
  });

  it("renders nothing for `parent` when page's parent doesn't exist", () => {
    const searchResults = {
      "@id": "/multireport?type=Page",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/help/donors/",
          "@type": ["Page", "Item"],
        },
      ],
      result_columns: {
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
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.Page.properties
    );
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

describe("Unknown-field cell-rendering tests", () => {
  it("renders a simple unknown field", () => {
    const COLUMN_UNKNOWN = 1;

    const searchResults = {
      "@id": "/multireport?type=HumanDonor&field=%40id&field=sex",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO499FAP/",
          "@type": ["HumanDonor", "Item"],
          sex: "female",
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        sex: {
          title: "Sex",
        },
      },
      filters: [
        {
          field: "type",
          term: "HumanDonor",
          remove: "/multireport",
        },
      ],
    };

    const properties = {
      "@id": {
        title: "ID",
        type: "string",
      },
      "@type": {
        items: {
          type: "string",
        },
        title: "Type",
        type: "array",
      },
      accession: {
        title: "Accession",
        type: "string",
      },
      ethnicities: {
        items: {
          enum: [
            "African American",
            "African Caribbean",
            "Arab",
            "Asian",
            "Black",
            "Black African",
            "Chinese",
            "Colombian",
            "Dai Chinese",
            "Esan",
            "Eskimo",
            "European",
            "Gambian",
            "Han Chinese",
            "Hispanic",
            "Indian",
            "Japanese",
            "Kinh Vietnamese",
            "Luhya",
            "Maasai",
            "Mende",
            "Native Hawaiian",
            "Pacific Islander",
            "Puerto Rican",
            "Yoruba",
          ],
          type: "string",
        },
        title: "Ethnicity",
        type: "array",
      },
      sex: {
        enum: ["male", "female", "unspecified"],
        title: "Sex",
        type: "string",
      },
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      properties
    );
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

    // Test that the unknown field has the correct contents.
    expect(cells[COLUMN_UNKNOWN]).toHaveTextContent("female");
  });

  it("renders an unknown field containing an array of objects with @ids", () => {
    const COLUMN_UNKNOWN = 1;

    const searchResults = {
      "@id": "/multireport?type=InVitroSystem&field=%40id&field=sample_terms",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/in-vitro-systems/IGVFSM0000AAAZ/",
          "@type": ["InVitroSystem", "Item"],
          sample_terms: [
            {
              "@id": "/sample-terms/CL_0011001/",
              term_name: "motor neuron",
            },
            {
              "@id": "/sample-terms/EFO_0007093/",
              term_name: "HUES8",
            },
          ],
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        sample_terms: {
          title: "Sample Terms",
        },
      },
      filters: [
        {
          field: "type",
          term: "InVitroSystem",
          remove: "/multireport/?field=%40id&field=sample_terms",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.InVitroSystem.properties
    );
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

    // Test that the unknown field has two links.
    const unknownLinks = within(cells[COLUMN_UNKNOWN]).getAllByRole("link");
    expect(unknownLinks).toHaveLength(2);
    expect(unknownLinks[0]).toHaveTextContent("motor neuron");
    expect(unknownLinks[1]).toHaveTextContent("HUES8");
  });

  it("renders an unknown field containing an array simple objects", () => {
    const COLUMN_UNKNOWN = 1;

    const searchResults = {
      "@id": "/multireport?type=HumanDonor&field=%40id&field=ethnicities",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO1080XFGV/",
          "@type": ["HumanDonor", "Item"],
          ethnicities: ["Eskimo", "Arab"],
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        ethnicities: {
          title: "Ethnicities",
        },
      },
      filters: [
        {
          field: "type",
          term: "HumanDonor",
          remove: "/multireport/?field=%40id&field=ethnicities",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.HumanDonor.properties
    );
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

    // Test that the unknown field has the correct contents.
    expect(cells[COLUMN_UNKNOWN]).toHaveTextContent("Arab, Eskimo");
  });

  it("renders an unknown field containing an object with an @id", () => {
    const COLUMN_UNKNOWN = 1;

    const searchResults = {
      "@id": "/multireport/?type=InVitroSystem&field=%40id&field=lab",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO1080XFGV/",
          "@type": ["HumanDonor", "Item"],
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        lab: {
          title: "Lab",
        },
      },
      filters: [
        {
          field: "type",
          term: "InVitroSystem",
          remove: "/multireport/?field=%40id&field=lab",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.HumanDonor.properties
    );
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

    // Test that the unknown field is a link with the correct path.
    const unknownLink = within(cells[COLUMN_UNKNOWN]).getByRole("link");
    expect(unknownLink).toHaveAttribute("href", "/labs/j-michael-cherry");
    expect(unknownLink).toHaveTextContent("/labs/j-michael-cherry");
  });

  it("renders an unknown field containing an object with no @id", () => {
    const COLUMN_UNKNOWN = 1;

    const searchResults = {
      "@id": "/multireport/?type=Page&field=%40id&field=layout",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/help/donors/",
          "@type": ["Page", "Item"],
          layout: {
            blocks: [
              {
                "@id": "#block1",
                "@type": "markdown",
                body: "# Donor Help",
                direction: "ltr",
              },
            ],
          },
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        layout: {
          title: "Page Layout",
        },
      },
      filters: [
        {
          field: "type",
          term: "Page",
          remove: "/multireport/?field=%40id&field=layout",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.HumanDonor.properties
    );
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

    // Test that the unknown field has the correct contents.
    expect(cells[COLUMN_UNKNOWN]).toHaveTextContent(
      `{"blocks":[{"@id":"#block1","@type":"markdown","body":"# Donor Help","direction":"ltr"}]}`
    );
  });

  it("renders an unknown field containing an array of objects", () => {
    const COLUMN_UNKNOWN = 1;

    const searchResults = {
      "@id": "/multireport/?type=ConstructLibrarySet&field=%40id&field=loci",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/construct-library-sets/IGVFDS0941AYWH/",
          "@type": ["ConstructLibrarySet", "FileSet", "Item"],
          loci: [
            {
              assembly: "GRCh38",
              chromosome: "chr1",
              end: 10,
              start: 1,
            },
          ],
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        loci: {
          title: "Loci",
        },
      },
      filters: [
        {
          field: "type",
          term: "ConstructLibrarySet",
          remove: "/multireport/?field=%40id&field=loci",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.InVitroSystem.properties
    );
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

    // Test that the unknown field has the correct contents.
    expect(cells[COLUMN_UNKNOWN]).toHaveTextContent(
      `[{"assembly":"GRCh38","chromosome":"chr1","end":10,"start":1}]`
    );
  });

  it("renders an unknown embedded field contained within an array of objects", () => {
    const COLUMN_UNKNOWN = 1;

    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/in-vitro-systems/IGVFSM0000AAAZ/",
          "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
          sample_terms: [
            {
              term_name: "motor neuron",
            },
          ],
        },
      ],
      "@id":
        "/multireport/?type=InVitroSystem&sample_terms.term_name=motor+neuron&field=%40id&field=sample_terms.term_name",
      "@type": ["Report"],
      clear_filters: "/multireport/?type=InVitroSystem",
      columns: {
        "@id": {
          title: "ID",
        },
        accession: {
          title: "Accession",
        },
        award: {
          title: "Award",
        },
        classification: {
          title: "Classification",
        },
        lab: {
          title: "Lab",
        },
        sample_terms: {
          title: "Sample Terms",
        },
        status: {
          title: "Status",
        },
      },
      facets: [
        {
          appended: false,
          field: "sample_terms.term_name",
          open_on_load: false,
          terms: [
            {
              doc_count: 3,
              key: "motor neuron",
            },
            {
              doc_count: 1,
              key: "HUES8",
            },
          ],
          title: "Sample Terms",
          total: 4,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "sample_terms.term_name",
          remove:
            "/multireport/?type=InVitroSystem&field=%40id&field=sample_terms.term_name",
          term: "motor neuron",
        },
        {
          field: "type",
          remove:
            "/multireport/?sample_terms.term_name=motor+neuron&field=%40id&field=sample_terms.term_name",
          term: "InVitroSystem",
        },
      ],
      notification: "Success",
      result_columns: {
        "@id": {
          title: "ID",
        },
        "sample_terms.term_name": {
          title: "sample_terms.term_name",
        },
      },
      sort: {
        date_created: {
          order: "desc",
          unmapped_type: "keyword",
        },
        label: {
          order: "desc",
          unmapped_type: "keyword",
        },
        uuid: {
          order: "desc",
          unmapped_type: "keyword",
        },
      },
      title: "Report",
      total: 3,
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.InVitroSystem.properties
    );
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

    expect(cells[COLUMN_UNKNOWN]).toHaveTextContent("motor neuron");
  });

  it("renders a blank sample-terms column when the data doesn't exist", () => {
    const COLUMN_SAMPLE_TERM = 1;

    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/genes/ENSG00000163930/",
          "@type": ["Gene", "Item"],
        },
        {
          "@id": "/tissues/IGVFSM0003DDDD/",
          "@type": ["Tissue", "Biosample", "Sample", "Item"],
          sample_terms: [
            {
              "@id": "/sample-terms/UBERON_0002048/",
              term_name: "lung",
            },
          ],
        },
      ],
      "@id": "/multireport/?type=Sample&type=Gene",
      "@type": ["Report"],
      clear_filters: "/multireport/?type=Sample&type=Gene",
      columns: {
        "@id": {
          title: "ID",
        },
        accession: {
          title: "Accession",
        },
        sample_terms: {
          title: "Sample Terms",
        },
      },
      facets: [
        {
          appended: false,
          field: "sample_terms.term_name",
          open_on_load: false,
          terms: [],
          title: "Sample Terms",
          total: 4,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/multireport/?type=Gene",
          term: "Sample",
        },
        {
          field: "type",
          remove: "/multireport/?type=Sample",
          term: "Gene",
        },
      ],
      notification: "Success",
      result_columns: {
        "@id": {
          title: "ID",
        },
        sample_terms: {
          title: "Sample Terms",
        },
      },
      title: "Report",
      total: 3,
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.InVitroSystem.properties
    );
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

    // Make sure the cell is empty.
    expect(cells[COLUMN_SAMPLE_TERM]).not.toHaveTextContent();
  });
});

describe("`attachment.href` cell rendering tests", () => {
  const COLUMN_ATTACHMENT_HREF = 1;

  it("renders the attachment.href columns", () => {
    const searchResults = {
      "@id": "/multireport?type=Document",
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
      result_columns: {
        "@id": {
          title: "ID",
        },
        "attachment.href": {
          title: "attachment.href",
        },
      },
      filters: [
        {
          field: "type",
          term: "Document",
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.Document.properties
    );
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

    const attachmentHref = cells[COLUMN_ATTACHMENT_HREF];
    expect(attachmentHref).toHaveTextContent(
      "@@download/attachment/Antibody_Characterization_IGVF.pdf"
    );
  });

  it("doesn't render missing `attachment.href` columns", () => {
    const searchResults = {
      "@id": "/multireport?type=Document",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/documents/05614b59-a421-47db-b4f7-5c7c8954c7e9",
          "@type": ["Document", "Item"],
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        "attachment.href": {
          title: "attachment.href",
        },
      },
      filters: [
        {
          field: "type",
          term: "Document",
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.Document.properties
    );
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
    const attachmentHref = cells[COLUMN_ATTACHMENT_HREF];
    expect(attachmentHref).toHaveTextContent("");
  });
});

describe("`files.href` cell rendering tests", () => {
  const COLUMN_FILES_HREF = 1;

  it("renders the files.href columns", () => {
    const searchResults = {
      "@id": "/multireport?type=FileSet",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/auxiliary-sets/IGVFDS0001AUXI/",
          "@type": ["AuxiliarySet", "FileSet", "Item"],
          files: [
            {
              href: "/reference-files/IGVFFI0001SQBR/@@download/IGVFFI0001SQBR.txt.gz",
            },
            {
              href: "/reference-files/IGVFFI00016QBR/@@download/IGVFFI00016QBR.txt.gz",
            },
          ],
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        "files.href": {
          title: "files.href",
        },
      },
      filters: [
        {
          field: "type",
          term: "FileSet",
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.Document.properties
    );
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

    const filesHref = cells[COLUMN_FILES_HREF];
    expect(filesHref).toHaveTextContent(
      "/reference-files/IGVFFI0001SQBR/@@download/IGVFFI0001SQBR.txt.gz"
    );
  });

  it("doesn't render missing `files.href` columns", () => {
    const searchResults = {
      "@id": "/multireport?type=FileSet",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/auxiliary-sets/IGVFDS0001AUXI/",
          "@type": ["AuxiliarySet", "FileSet", "Item"],
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        "files.href": {
          title: "files.href",
        },
      },
      filters: [
        {
          field: "type",
          term: "FileSet",
          remove: "/multireport",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.Document.properties
    );
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
    const filesHref = cells[COLUMN_FILES_HREF];
    expect(filesHref).toHaveTextContent("");
  });
});

describe("file_size cell rendering tests", () => {
  it("renders the file_size columns", () => {
    const COLUMN_FILES_FILE_SIZE = 1;
    const searchResults = {
      "@id": "/multireport/?type=File&field=%40id&field=file_size",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/alignment-files/IGVFFI0000ALGN/",
          "@type": ["AlignmentFile", "File", "Item"],
          file_size: 9828031,
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        file_size: {
          title: "File Size",
        },
      },
      filters: [
        {
          field: "type",
          remove: "/multireport/?field=%40id&field=file_size",
          term: "File",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.Document.properties
    );
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
    const filesHref = cells[COLUMN_FILES_FILE_SIZE];
    expect(filesHref).toHaveTextContent("9.8 MB");
  });

  it("renders the file_size columns", () => {
    const COLUMN_FILES_FILE_SIZE = 1;
    const searchResults = {
      "@id": "/multireport/?type=File&field=%40id&field=file_size",
      "@type": ["Report"],
      "@graph": [
        {
          "@id": "/alignment-files/IGVFFI0000ALGN/",
          "@type": ["AlignmentFile", "File", "Item"],
        },
      ],
      result_columns: {
        "@id": {
          title: "ID",
        },
        file_size: {
          title: "File Size",
        },
      },
      filters: [
        {
          field: "type",
          remove: "/multireport/?field=%40id&field=file_size",
          term: "File",
        },
      ],
    };

    const onHeaderCellClick = jest.fn();
    const sortedColumnId = getSortColumn(searchResults);
    const selectedTypes = getSelectedTypes(searchResults);
    const visibleColumnSpecs = columnsToColumnSpecs(
      searchResults.result_columns
    );
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      profiles.Document.properties
    );
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
    const filesHref = cells[COLUMN_FILES_FILE_SIZE];
    expect(filesHref).toHaveTextContent("");
  });
});
