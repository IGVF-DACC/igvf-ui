import { fireEvent, render, screen, within } from "@testing-library/react";
import FacetSection from "../facet-section";

jest.mock("next/router", () => {
  // Mock the window.location object so we can test the router.push() function.
  const location = new URL("https://www.example.com");
  location.assign = jest.fn();
  location.replace = jest.fn();
  location.reload = jest.fn();
  delete window.location;
  window.location = location;

  return {
    useRouter() {
      return {
        route: "/",
        pathname: "",
        query: "",
        asPath: "",
        push: jest.fn().mockImplementation((href) => {
          window.location.href = `https://www.example.com${href}`;
        }),
      };
    },
  };
});

describe("Test <FacetSection> component", () => {
  it("renders the correct facets without facet groups", () => {
    const searchResults = {
      "@id": "/search?type=Gene",
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
      ],
      filters: [
        {
          field: "type",
          term: "Gene",
          remove: "/search",
        },
      ],
    };

    render(<FacetSection searchResults={searchResults} />);

    // Check for no facet group buttons.
    const facetGroupButtonSection = screen.queryByTestId("facet-group-buttons");
    expect(facetGroupButtonSection).toBeNull();

    // Check for the correct number of facets.
    const facetSections = screen.getAllByTestId(/^facet-/);
    expect(facetSections).toHaveLength(2);

    // Make sure the first facet has the correct title.
    const facetTitle = within(facetSections[0]).getByRole("heading", {
      name: /^Taxa$/,
    });
    expect(facetTitle).toBeInTheDocument();

    // Make sure the first facet has the correct terms.
    let terms = within(facetSections[0]).getAllByTestId(/^facetterm-/);
    expect(terms).toHaveLength(2);
    expect(terms[0]).toHaveTextContent(/^Homo sapiens/);
    expect(terms[0]).toHaveTextContent(/5$/);
    expect(terms[1]).toHaveTextContent(/^Mus musculus/);
    expect(terms[1]).toHaveTextContent(/2$/);

    // Make sure the second facet has the correct terms.
    terms = within(facetSections[1]).getAllByTestId(/^facetterm-/);
    expect(terms).toHaveLength(1);
    expect(terms[0]).toHaveTextContent(/^released/);
    expect(terms[0]).toHaveTextContent(/7$/);
  });

  it("renders the correct facets with facet groups", () => {
    const searchResults = {
      "@id": "/search?type=AssayTerm",
      facet_groups: [
        {
          name: "AssayTerm",
          title: "Assay",
          facet_fields: ["assay_slims", "category_slims", "objective_slims"],
        },
        {
          name: "AssayTerm",
          title: "Quality",
          facet_fields: ["status"],
        },
      ],
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [
            {
              key: "AssayTerm",
              doc_count: 7,
            },
            {
              key: "OntologyTerm",
              doc_count: 7,
            },
          ],
          total: 7,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "assay_slims",
          title: "Assay Type",
          terms: [
            {
              key: "Massively parallel reporter assay",
              doc_count: 2,
            },
            {
              key: "DNA binding",
              doc_count: 1,
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
      ],
      filters: [
        {
          field: "type",
          term: "Gene",
          remove: "/search",
        },
      ],
    };

    render(<FacetSection searchResults={searchResults} />);

    // Check for the correct number facet group buttons.
    const facetGroupButtonSection =
      screen.queryByTestId(/^facetgroup-buttons$/);
    expect(facetGroupButtonSection).toBeInTheDocument();
    const facetGroupButtons = within(facetGroupButtonSection).getAllByRole(
      "button"
    );
    expect(facetGroupButtons).toHaveLength(2);

    // Check for the correct number of facets.
    const facetSections = screen.getAllByTestId(/^facet-/);
    expect(facetSections).toHaveLength(1);

    // Make sure the first facet has the correct title.
    const facetTitle = within(facetSections[0]).getByRole("heading", {
      name: /^Assay Type$/,
    });
    expect(facetTitle).toBeInTheDocument();

    // Make sure the first facet has the correct terms.
    let terms = within(facetSections[0]).getAllByTestId(/^facetterm-/);
    expect(terms).toHaveLength(2);
    expect(terms[0]).toHaveTextContent(/^Massively parallel reporter assay/);
    expect(terms[0]).toHaveTextContent(/2$/);
    expect(terms[1]).toHaveTextContent(/^DNA binding/);
    expect(terms[1]).toHaveTextContent(/1$/);

    // Make sure the Status facet doesn't exist because its group isn't selected.
    const statusFacet = screen.queryByTestId(/^facettitle-status$/);
    expect(statusFacet).toBeNull();
  });

  it("renders no facets if only a type facet exists", () => {
    const searchResults = {
      "@id": "/search?type=Gene",
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
      ],
      filters: [
        {
          field: "type",
          term: "Gene",
          remove: "/search",
        },
      ],
    };

    render(<FacetSection searchResults={searchResults} />);

    // Check for no facet group buttons.
    const facetGroupButtonSection = screen.queryByTestId("facet-group-buttons");
    expect(facetGroupButtonSection).toBeNull();

    // Check for no facets.
    const facetSections = screen.queryAllByTestId(/^facet-/);
    expect(facetSections).toHaveLength(0);
  });

  it("selects the correct facet group when clicking one", () => {
    const searchResults = {
      "@id": "/search?type=AssayTerm",
      facet_groups: [
        {
          name: "AssayTerm",
          title: "Assay",
          facet_fields: ["assay_slims"],
        },
        {
          name: "AssayTerm",
          title: "Quality",
          facet_fields: ["status"],
        },
      ],
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [
            {
              key: "AssayTerm",
              doc_count: 7,
            },
            {
              key: "OntologyTerm",
              doc_count: 7,
            },
          ],
          total: 7,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "assay_slims",
          title: "Assay Type",
          terms: [
            {
              key: "Massively parallel reporter assay",
              doc_count: 2,
            },
            {
              key: "DNA binding",
              doc_count: 1,
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
      ],
      filters: [
        {
          field: "type",
          term: "Gene",
          remove: "/search",
        },
      ],
    };

    render(<FacetSection searchResults={searchResults} />);

    // Check for the correct number facet group buttons.
    const facetGroupButtonSection =
      screen.queryByTestId(/^facetgroup-buttons$/);
    const facetGroupButtons = within(facetGroupButtonSection).getAllByRole(
      "button"
    );
    expect(facetGroupButtons).toHaveLength(2);

    // Check that the first button has an aria label indicating it's selected and the second button
    // has an aria label indicating it's not.
    expect(facetGroupButtons[0]).toHaveAttribute(
      "aria-label",
      "Assay selected filter group"
    );
    expect(facetGroupButtons[1]).toHaveAttribute(
      "aria-label",
      "Quality filter group"
    );

    // Click the second button and check that its new aria label indicates it's selected and the
    // first button's aria label indicates it's not.
    fireEvent.click(facetGroupButtons[1]);
    expect(facetGroupButtons[0]).toHaveAttribute(
      "aria-label",
      "Assay filter group"
    );
    expect(facetGroupButtons[1]).toHaveAttribute(
      "aria-label",
      "Quality selected filter group"
    );
  });
});
