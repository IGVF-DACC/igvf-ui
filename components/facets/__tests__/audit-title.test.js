import { render, screen } from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import AuditTitle from "../custom-facets/audit-title";

/**
 * Method to mock the useAuth0 hook comes from:
 * https://stackoverflow.com/questions/45758366/how-to-change-jest-mock-function-return-value-in-each-testanswer-45758767
 * This method lets you change the return values of the hook between tests.
 */
jest.mock("@auth0/auth0-react", () => ({
  useAuth0: jest.fn(),
}));

describe("Test the facet audit title component", () => {
  const searchResults = {
    "@context": "/terms/",
    "@graph": [
      {
        "@id": "/measurement-sets/IGVFDS0304VIEK/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        accession: "IGVFDS0304VIEK",
        audit: {
          INTERNAL_ACTION: [
            {
              path: "/rodent-donors/IGVFDO9834IAJR/",
              level_name: "INTERNAL_ACTION",
              level: 30,
              name: "audit_item_status",
              detail:
                "Released rodent donor [IGVFDO9834IAJR](/rodent-donors/IGVFDO9834IAJR/) has in progress subobject document [bcb5f3c8-d5e9-40d2-805f-4274f940c36d](/documents/bcb5f3c8-d5e9-40d2-805f-4274f940c36d/).",
              category: "mismatched status",
            },
          ],
        },
        award: {
          component: "networks",
          "@id": "/awards/1U01HG012103-01/",
          title:
            "Deciphering the Genomics of Gene Network Regulation of T Cell and Fibroblast States in Autoimmune Inflammation",
          contact_pi: {
            "@id": "/users/fa9feeb4-28ba-4356-8c24-50f4e6562029/",
            title: "Christina Leslie",
          },
        },
        file_set_type: "experimental data",
        lab: {
          "@id": "/labs/christina-leslie/",
          title: "Christina Leslie, MSKCC",
        },
        preferred_assay_title: "STARR-seq",
        status: "released",
        uuid: "f64b07a2-6f85-478a-9b39-1703811e40a1",
      },
    ],
    "@id": "/search/?type=MeasurementSet",
    "@type": ["Search"],
    all: "/search/?type=MeasurementSet&limit=all",
    clear_filters: "/search/?type=MeasurementSet",
    facets: [
      {
        field: "audit.INTERNAL_ACTION.category",
        title: "Audit category: DCC ACTION",
        terms: [
          {
            key: "mismatched status",
            doc_count: 21,
          },
          {
            key: "NTR term ID",
            doc_count: 5,
          },
          {
            key: "missing sequence specification",
            doc_count: 1,
          },
        ],
        total: 27,
        type: "terms",
        appended: false,
        open_on_load: false,
      },
      {
        field: "audit.ERROR.category",
        title: "Audit category: ERROR",
        terms: [
          {
            key: "inconsistent parent sample",
            doc_count: 16,
          },
        ],
        total: 27,
        type: "terms",
        appended: false,
        open_on_load: false,
      },
    ],
    filters: [
      {
        field: "type",
        term: "MeasurementSet",
        remove: "/search/",
      },
    ],
    title: "Search",
    total: 27,
  };

  it("renders the internal actions audit facet title while authorized", () => {
    useAuth0.mockReturnValue({ isAuthenticated: true });

    render(
      <AuditTitle
        facet={searchResults.facets[0]}
        searchResults={searchResults}
        isFacetOpen
      />
    );

    expect(screen.getByText("Audit Internal Action")).toBeInTheDocument();
  });

  it("doesn't render the internal actions audit facet title while not authorized", () => {
    useAuth0.mockReturnValue({ isAuthenticated: false });

    render(
      <AuditTitle
        facet={searchResults.facets[0]}
        searchResults={searchResults}
        isFacetOpen={false}
      />
    );

    expect(screen.queryByText("Audit Internal Action")).not.toBeInTheDocument();
  });

  it("renders the error audit facet title while authorized", () => {
    useAuth0.mockReturnValue({ isAuthenticated: true });

    render(
      <AuditTitle
        facet={searchResults.facets[1]}
        searchResults={searchResults}
        isFacetOpen={false}
      />
    );

    expect(screen.getByText("Audit Error")).toBeInTheDocument();
  });

  it("renders the error audit facet title while not authorized", () => {
    useAuth0.mockReturnValue({ isAuthenticated: true });

    render(
      <AuditTitle
        facet={searchResults.facets[1]}
        searchResults={searchResults}
        isFacetOpen={false}
      />
    );

    expect(screen.getByText("Audit Error")).toBeInTheDocument();
  });
});
