import { render, screen } from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import InternalActionAuditTerms from "../custom-facets/audit-internal-action-terms";

jest.mock("@auth0/auth0-react", () => ({
  useAuth0: jest.fn(),
}));

const searchResults = {
  "@id": "/search?type=Gene&taxa!=Homo+sapiens",
  facet_groups: [],
  facets: [
    {
      field: "type",
      title: "Data Type",
      terms: [
        {
          key: "Gene",
          doc_count: 7,
        },
      ],
      total: 7,
      type: "terms",
      appended: false,
      open_on_load: false,
    },
    {
      field: "taxa",
      title: "Taxa",
      terms: [
        {
          key: "Homo sapiens",
          doc_count: 5,
        },
        {
          key: "Mus musculus",
          doc_count: 2,
        },
      ],
      total: 7,
      type: "terms",
      appended: false,
      open_on_load: false,
    },
    {
      field: "status",
      title: "Status",
      terms: [
        {
          key: "released",
          doc_count: 7,
        },
      ],
      total: 7,
      type: "terms",
      appended: false,
      open_on_load: false,
    },
    {
      field: "audit.WARNING.category",
      title: "Audit category: WARNING",
      terms: [
        {
          key: "missing plasmid map",
          doc_count: 2,
        },
      ],
      total: 3,
    },
  ],
  filters: [
    {
      field: "taxa!",
      remove: "/search/?type=Gene",
      term: "Homo sapiens",
    },
    {
      field: "type",
      term: "Gene",
      remove: "/search",
    },
  ],
};

describe("Test the Internal action audit terms component", () => {
  it("renders the internal action audit terms while authorized", () => {
    useAuth0.mockReturnValue({ isAuthenticated: true });

    render(
      <InternalActionAuditTerms
        searchResults={searchResults}
        facet={{
          appended: false,
          field: "audit.INTERNAL_ACTION.category",
          open_on_load: false,
          terms: [
            {
              doc_count: 4,
              key: "mismatched status",
            },
          ],
          title: "Audit category: DCC ACTION",
          total: 5,
          type: "terms",
        }}
        updateQuery={jest.fn()}
      />
    );

    expect(screen.getByText("mismatched status")).toBeInTheDocument();
  });

  it("renders the internal action audit terms while not authorized", () => {
    useAuth0.mockReturnValue({ isAuthenticated: false });

    render(
      <InternalActionAuditTerms
        searchResults={searchResults}
        facet={{
          appended: false,
          field: "audit.INTERNAL_ACTION.category",
          open_on_load: false,
          terms: [
            {
              doc_count: 4,
              key: "mismatched status",
            },
          ],
          title: "Audit category: DCC ACTION",
          total: 5,
          type: "terms",
        }}
        updateQuery={jest.fn()}
      />
    );

    expect(screen.queryByText("mismatched status")).not.toBeInTheDocument();
  });
});
