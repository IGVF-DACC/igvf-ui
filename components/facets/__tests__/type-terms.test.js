import { fireEvent, render, screen, within } from "@testing-library/react";
import profiles from "../../__mocks__/profile";
import SessionContext from "../../session-context";
import TypeTerms from "../custom-facets/type-terms";

describe("Test the <TypeTerms> component", () => {
  it("renders the schema hierarchy with the hierarchy loaded", async () => {
    const updateQuery = jest.fn();

    const hierarchy = {
      Item: {
        Document: {},
        Donor: {
          HumanDonor: {},
          RodentDonor: {},
        },
      },
    };
    profiles._hierarchy = hierarchy;

    const searchResults = {
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO0524BNHN/",
          "@type": ["HumanDonor", "Donor", "Item"],
          accession: "IGVFDO0524BNHN",
          aliases: ["chongyuan-luo:AA F donor of fibroblasts"],
          award: {
            "@id": "/awards/1U01HG012079-01/",
            component: "networks",
          },
          ethnicities: ["African American"],
          lab: {
            "@id": "/labs/chongyuan-luo/",
            title: "Chongyuan Luo, UCLA",
          },
          sex: "female",
          status: "released",
          taxa: "Homo sapiens",
          virtual: false,
        },
      ],
      "@id": "/search/?type=HumanDonor",
      "@type": ["Search"],
      clear_filters: "/search/?type=HumanDonor",
      facet_groups: [
        {
          facet_fields: ["ethnicities", "sex", "virtual"],
          name: "HumanDonor",
          title: "Donor",
        },
        {
          facet_fields: ["collections", "lab.title", "award.component", "type"],
          name: "HumanDonor",
          title: "Provenance",
        },
        {
          facet_fields: ["status"],
          name: "HumanDonor",
          title: "Quality",
        },
      ],
      facets: [
        {
          appended: false,
          field: "type",
          open_on_load: false,
          terms: [
            {
              doc_count: 8,
              key: "Donor",
            },
            {
              doc_count: 8,
              key: "Item",
            },
            {
              doc_count: 7,
              key: "HumanDonor",
            },
            {
              doc_count: 1,
              key: "RodentDonor",
            },
          ],
          title: "Object Type",
          total: 8,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search/",
          term: "HumanDonor",
        },
      ],
      total: 8,
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <TypeTerms
          searchResults={searchResults}
          facet={searchResults.facets[0]}
          updateQuery={updateQuery}
        />
      </SessionContext.Provider>
    );

    // Get all elements with a data-testid starting with "typeterm-" and check
    // that the first one has the text "Donor"
    const elements = screen.getAllByTestId(/^typeterm-/);
    expect(elements).toHaveLength(3);
    expect(elements[0]).toHaveTextContent("Donor");

    // Get all elements with a data-testid starting with "typeterm-" inside the first element
    // and check that the first one has the text "HumanDonor"
    const subElements = within(elements[0]).getAllByTestId(/^typeterm-/);
    expect(subElements).toHaveLength(2);
    expect(subElements[0]).toHaveTextContent("HumanDonor");
    expect(subElements[1]).toHaveTextContent("RodentDonor");

    // Click the first checkbox.
    const checkboxes = screen.getAllByRole("radio");
    expect(checkboxes).toHaveLength(3);
    fireEvent.click(checkboxes[2]);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledWith("type=RodentDonor");
  });

  it("renders nothing if no matching schema hierarchy terms", async () => {
    const updateQuery = jest.fn();

    const hierarchy = {
      Item: {
        Document: {},
      },
    };
    profiles._hierarchy = hierarchy;

    const searchResults = {
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO0524BNHN/",
          "@type": ["HumanDonor", "Donor", "Item"],
          accession: "IGVFDO0524BNHN",
          aliases: ["chongyuan-luo:AA F donor of fibroblasts"],
          award: {
            "@id": "/awards/1U01HG012079-01/",
            component: "networks",
          },
          ethnicities: ["African American"],
          lab: {
            "@id": "/labs/chongyuan-luo/",
            title: "Chongyuan Luo, UCLA",
          },
          sex: "female",
          status: "released",
          taxa: "Homo sapiens",
          virtual: false,
        },
      ],
      "@id": "/search/?type=HumanDonor",
      "@type": ["Search"],
      clear_filters: "/search/?type=HumanDonor",
      facet_groups: [
        {
          facet_fields: ["ethnicities", "sex", "virtual"],
          name: "HumanDonor",
          title: "Donor",
        },
        {
          facet_fields: ["collections", "lab.title", "award.component", "type"],
          name: "HumanDonor",
          title: "Provenance",
        },
        {
          facet_fields: ["status"],
          name: "HumanDonor",
          title: "Quality",
        },
      ],
      facets: [
        {
          appended: false,
          field: "type",
          open_on_load: false,
          terms: [
            {
              doc_count: 1,
              key: "Donor",
            },
            {
              doc_count: 1,
              key: "HumanDonor",
            },
            {
              doc_count: 1,
              key: "Item",
            },
          ],
          title: "Object Type",
          total: 8,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search/",
          term: "HumanDonor",
        },
      ],
      total: 8,
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <TypeTerms
          searchResults={searchResults}
          facet={searchResults.facets[0]}
          updateQuery={updateQuery}
        />
      </SessionContext.Provider>
    );
  });

  it("renders nothing if profiles haven't loaded", async () => {
    const updateQuery = jest.fn();

    const searchResults = {
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO0524BNHN/",
          "@type": ["HumanDonor", "Donor", "Item"],
          accession: "IGVFDO0524BNHN",
          aliases: ["chongyuan-luo:AA F donor of fibroblasts"],
          award: {
            "@id": "/awards/1U01HG012079-01/",
            component: "networks",
          },
          ethnicities: ["African American"],
          lab: {
            "@id": "/labs/chongyuan-luo/",
            title: "Chongyuan Luo, UCLA",
          },
          sex: "female",
          status: "released",
          taxa: "Homo sapiens",
          virtual: false,
        },
      ],
      "@id": "/search/?type=HumanDonor",
      "@type": ["Search"],
      clear_filters: "/search/?type=HumanDonor",
      facet_groups: [
        {
          facet_fields: ["ethnicities", "sex", "virtual"],
          name: "HumanDonor",
          title: "Donor",
        },
        {
          facet_fields: ["collections", "lab.title", "award.component", "type"],
          name: "HumanDonor",
          title: "Provenance",
        },
        {
          facet_fields: ["status"],
          name: "HumanDonor",
          title: "Quality",
        },
      ],
      facets: [
        {
          appended: false,
          field: "type",
          open_on_load: false,
          terms: [
            {
              doc_count: 8,
              key: "Donor",
            },
            {
              doc_count: 8,
              key: "HumanDonor",
            },
            {
              doc_count: 8,
              key: "Item",
            },
          ],
          title: "Object Type",
          total: 8,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search/",
          term: "HumanDonor",
        },
      ],
      total: 8,
    };

    render(
      <SessionContext.Provider value={{ profiles: null }}>
        <TypeTerms
          searchResults={searchResults}
          facet={searchResults.facets[0]}
          updateQuery={updateQuery}
        />
      </SessionContext.Provider>
    );

    // Make sure facet-collections doesn't exist in the DOM.
    const elements = screen.queryByTestId(/^facet-collections$/);
    expect(elements).not.toBeInTheDocument();
  });
});
