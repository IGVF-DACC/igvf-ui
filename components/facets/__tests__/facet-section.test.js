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

    render(<FacetSection searchResults={searchResults} />);

    // Check for no facet group buttons.
    const facetGroupButtonSection = screen.queryByTestId("facet-group-buttons");
    expect(facetGroupButtonSection).toBeNull();

    // Check for the correct number of facets.
    const facetSections = screen.getAllByTestId(/^facet-/);
    expect(facetSections).toHaveLength(3);

    // Make sure the first facet has the correct title.
    const facetTitle = within(facetSections[0]).getByRole("heading", {
      name: /^Taxa$/,
    });
    expect(facetTitle).toBeInTheDocument();

    // Make sure the first facet has the correct terms.
    let terms = within(facetSections[0]).getAllByTestId(/^facetterm-/);
    expect(terms).toHaveLength(2);
    expect(terms[0]).toHaveTextContent(/^Homo sapiens/);
    expect(terms[1]).toHaveTextContent(/^Mus musculus/);
    expect(terms[1]).toHaveTextContent(/2$/);

    // Make sure the second facet has the correct terms.
    terms = within(facetSections[1]).getAllByTestId(/^facetterm-/);
    expect(terms).toHaveLength(1);
    expect(terms[0]).toHaveTextContent(/^released/);
    expect(terms[0]).toHaveTextContent(/7$/);

    // Make sure the third facet has the correct title.
    const auditFacetTitle = within(facetSections[2]).getByRole("heading", {
      name: /^Audit Warning$/,
    });
    expect(auditFacetTitle).toBeInTheDocument();
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
    const terms = within(facetSections[0]).getAllByTestId(/^facetterm-/);
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

  it("clears all filters when clicking the Clear All button", () => {
    const searchResults = {
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO9494FQMY/",
          "@type": ["HumanDonor", "Donor", "Item"],
          accession: "IGVFDO9494FQMY",
          aliases: ["igvf:alias_human_donor_child"],
          award: {
            "@id": "/awards/HG012012/",
            component: "data coordination",
          },
          collections: ["ENCODE"],
          ethnicities: ["Eskimo", "Arab"],
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          sex: "female",
          status: "released",
          taxa: "Homo sapiens",
          uuid: "38d6630f-5b87-47a1-ae7d-174eab5758d2",
          virtual: false,
        },
      ],
      "@id": "/search/?type=HumanDonor&sex=female",
      "@type": ["Search"],
      clear_filters: "/search/?type=HumanDonor",
      facet_groups: [],
      facets: [
        {
          appended: false,
          field: "sex",
          open_on_load: false,
          terms: [
            {
              doc_count: 3,
              key: "female",
            },
            {
              doc_count: 1,
              key: "male",
            },
          ],
          title: "Sex",
          total: 4,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "sex",
          remove: "/search/?type=HumanDonor",
          term: "female",
        },
        {
          field: "type",
          remove: "/search/?sex=female",
          term: "HumanDonor",
        },
      ],
    };

    render(<FacetSection searchResults={searchResults} />);

    // Click the Clear All button and check that the router push function was called with the
    // correct URL.
    const clearAllButton = screen.getByLabelText(/Clear all filters/);
    fireEvent.click(clearAllButton);
    expect(window.location.href).toBe(
      "https://www.example.com/search/?type=HumanDonor"
    );
  });

  it("reacts to the user clicking the All and None buttons", () => {
    const searchResults = {
      "@graph": [
        {
          "@id": "/in-vitro-systems/IGVFSM0008HUES/",
          "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
          accession: "IGVFSM0008HUES",
          sample_terms: [
            {
              "@id": "/sample-terms/EFO_0007093/",
              term_name: "HUES8",
            },
          ],
          status: "released",
        },
      ],
      "@id": "/search/?type=InVitroSystem",
      "@type": ["Search"],
      clear_filters: "/search/?type=InVitroSystem",
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
      facet_groups: [],
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
          field: "type",
          remove: "/search/",
          term: "InVitroSystem",
        },
      ],
      notification: "Success",
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
      title: "Search",
      total: 4,
    };

    render(<FacetSection searchResults={searchResults} />);

    // Click the All button and check that the router gets called with both terms selected.
    const allButton = screen.getByLabelText(/Select all Sample Terms/);
    fireEvent.click(allButton);
    expect(window.location.href).toBe(
      "https://www.example.com/search/?type=InVitroSystem&sample_terms.term_name=motor+neuron&sample_terms.term_name=HUES8"
    );

    // Click the None button and check that the router gets called with no terms selected.
    const noneButton = screen.getByLabelText(/Select no Sample Terms/);
    fireEvent.click(noneButton);
    expect(window.location.href).toBe(
      "https://www.example.com/search/?type=InVitroSystem"
    );
  });
});
