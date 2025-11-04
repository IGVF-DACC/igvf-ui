import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SearchResults } from "../../../globals";
import StandardTerms from "../custom-facets/standard-terms";

// Mock window.scrollTo for framer-motion animations
global.scrollTo = jest.fn();

describe("Test the StandardTerms component", () => {
  test("a normal small StandardTerms", async () => {
    const user = userEvent.setup();
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/genes/ENSG00000207705/",
          "@type": ["Gene", "Item"],
          dbxrefs: ["RefSeq:NR_029596.1", "miRBase:MI0000252", "HGNC:31512"],
          geneid: "ENSG00000207705",
          status: "released",
          symbol: "MIR129-1",
          synonyms: ["MIRN129-1", "mir-129-1", "hsa-mir-129-1", "MIR-129b"],
          title: "MIR129-1 (Homo sapiens)",
          uuid: "cb9e336d-f19e-41df-90ee-62599f04d77b",
        },
        {
          "@id": "/genes/ENSG00000039600/",
          "@type": ["Gene", "Item"],
          dbxrefs: ["HGNC:30635"],
          geneid: "ENSG00000039600",
          status: "released",
          symbol: "SOX30",
          title: "SOX30 (Homo sapiens)",
          uuid: "b7f92a60-64e6-4c3e-bb0a-9c5b8c8c2f98",
        },
      ],
      "@id": "/search/?type=Gene&taxa=Homo+sapiens",
      "@type": ["Search"],
      clear_filters: "/search/?type=Gene",
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [
            {
              key: "Gene",
              doc_count: 11,
            },
          ],
          total: 11,
          type: "terms",
          appended: false,
        },
        {
          field: "taxa",
          title: "Taxa",
          terms: [
            {
              key: "Homo sapiens",
              doc_count: 8,
            },
            {
              key: "Mus musculus",
              doc_count: 3,
            },
          ],
          total: 11,
          type: "terms",
          appended: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [
            {
              key: "released",
              doc_count: 10,
            },
            {
              key: "archived",
              doc_count: 1,
            },
          ],
          total: 11,
          type: "terms",
          appended: false,
        },
      ],
      filters: [
        {
          field: "taxa",
          term: "Homo sapiens",
          remove: "/search/?type=Gene",
        },
        {
          field: "type",
          term: "Gene",
          remove: "/search/?taxa=Homo+sapiens",
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
      },
      notification: "Success",
      title: "Search",
      total: 11,
    };
    const facet = searchResults.facets[1];
    const updateQuery = jest.fn();

    render(
      <StandardTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );

    const homoSapiensTerm = screen.getByTestId(/^facetterm-taxa-homo-sapiens$/);
    const musMusculusTerm = screen.getByTestId(/^facetterm-taxa-mus-musculus$/);
    expect(homoSapiensTerm).toBeInTheDocument();
    expect(musMusculusTerm).toBeInTheDocument();

    // Click the Mus musculus term to include it in the query string.
    let checkbox = within(musMusculusTerm).getByRole("checkbox");
    await user.click(checkbox);
    expect(updateQuery).toHaveBeenCalledWith(
      "type=Gene&taxa=Homo+sapiens&taxa=Mus+musculus"
    );

    // Click the Homo sapiens term to remove it from the query string.
    checkbox = within(homoSapiensTerm).getByRole("checkbox");
    await user.click(checkbox);
    expect(updateQuery).toHaveBeenCalledWith("type=Gene&taxa=Mus+musculus");
  });

  test("a StandardTerms with a hierarchical facet", async () => {
    const user = userEvent.setup();
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=MeasurementSet",
      "@type": ["Search"],
      all: "/search/?type=MeasurementSet&limit=all",
      clear_filters: "/search/?type=MeasurementSet",
      facets: [
        {
          field: "type",
          title: "Object Type",
          terms: [
            {
              key: "FileSet",
              doc_count: 30,
            },
            {
              key: "Item",
              doc_count: 30,
            },
            {
              key: "MeasurementSet",
              doc_count: 30,
            },
          ],
          total: 30,
          type: "terms",
          appended: false,
        },
        {
          field: "assay_term.assay_slims",
          title: "Assay",
          terms: [
            {
              key: "Massively parallel reporter assay",
              doc_count: 6,
              subfacet: {
                field: "assay_term.term_name",
                title: "Assay Term Name",
                terms: [
                  {
                    key: "MPRA",
                    doc_count: 3,
                  },
                  {
                    key: "STARR-seq",
                    doc_count: 3,
                  },
                ],
              },
            },
          ],
          total: 30,
          type: "hierarchical",
        },
        {
          field: "preferred_assay_title",
          title: "Preferred Assay Title",
          terms: [
            {
              key: "10x multiome",
              doc_count: 2,
            },
          ],
          total: 30,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "type",
          term: "MeasurementSet",
          remove: "/search/",
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
      },
      notification: "Success",
      title: "Search",
      total: 30,
    };
    const facet = searchResults.facets[1];
    // mock the updateQuery function, but have the mock display something to console.log
    const updateQuery = jest.fn();

    render(
      <StandardTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );

    // Click the parent term. Make sure it also selects the child terms "MPRA" and "STARR-seq".
    let parentTerm = screen.getByTestId(
      /^facetterm-assay_term.assay_slims-massively-parallel-reporter-assay$/
    );
    expect(parentTerm).toBeInTheDocument();
    let checkbox = within(parentTerm).getByRole("checkbox");
    await user.click(checkbox);
    expect(updateQuery).toHaveBeenCalledWith(
      "type=MeasurementSet&assay_term.assay_slims=Massively+parallel+reporter+assay&assay_term.term_name=MPRA&assay_term.term_name=STARR-seq"
    );

    // Click the parent again and make sure it clears itself and the child terms.
    await user.click(checkbox);
    expect(updateQuery).toHaveBeenCalledWith("type=MeasurementSet");

    // Click the child term "MPRA" and make sure it doesn't select the parent term.
    let childTerm = screen.getByTestId(
      /^facetterm-assay_term.term_name-mpra-massively-parallel-reporter-assay$/
    );
    expect(childTerm).toBeInTheDocument();
    let childCheckbox = within(childTerm).getByRole("checkbox");
    await user.click(childCheckbox);
    expect(updateQuery).toHaveBeenCalledWith(
      "type=MeasurementSet&assay_term.term_name=MPRA"
    );

    // Click the child term "STARR-seq" and make sure it doesn't select the parent term.
    childTerm = screen.getByTestId(
      /^facetterm-assay_term.term_name-starr-seq-massively-parallel-reporter-assay$/
    );
    expect(childTerm).toBeInTheDocument();
    childCheckbox = within(childTerm).getByRole("checkbox");
    await user.click(childCheckbox);
    expect(updateQuery).toHaveBeenCalledWith(
      "type=MeasurementSet&assay_term.term_name=MPRA&assay_term.term_name=STARR-seq"
    );

    // Click the parent term to select both children.
    parentTerm = screen.getByTestId(
      /^facetterm-assay_term.assay_slims-massively-parallel-reporter-assay$/
    );
    checkbox = within(parentTerm).getByRole("checkbox");
    await user.click(checkbox);
    expect(updateQuery).toHaveBeenCalledWith(
      "type=MeasurementSet&assay_term.assay_slims=Massively+parallel+reporter+assay&assay_term.term_name=MPRA&assay_term.term_name=STARR-seq"
    );

    // Click the child term "STARR-seq" and make sure the parent term is still selected.
    childTerm = screen.getByTestId(
      /^facetterm-assay_term.term_name-starr-seq-massively-parallel-reporter-assay$/
    );
    expect(childTerm).toBeInTheDocument();
    childCheckbox = within(childTerm).getByRole("checkbox");
    await user.click(childCheckbox);
    expect(updateQuery).toHaveBeenCalledWith(
      "type=MeasurementSet&assay_term.assay_slims=Massively+parallel+reporter+assay&assay_term.term_name=MPRA"
    );

    // Click the child term "MPRA" and make sure the parent term gets deselected.
    childTerm = screen.getByTestId(
      /^facetterm-assay_term.term_name-mpra-massively-parallel-reporter-assay$/
    );
    expect(childTerm).toBeInTheDocument();
    childCheckbox = within(childTerm).getByRole("checkbox");
    await user.click(childCheckbox);
    expect(updateQuery).toHaveBeenCalledWith("type=MeasurementSet");
  });

  it("detects a boolean facet and renders it correctly", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Item",
      "@type": ["Search"],
      facets: [
        {
          field: "controlled_access",
          title: "Controlled Access",
          terms: [
            {
              key: 1,
              key_as_string: "true",
              doc_count: 6,
            },
            {
              key: 0,
              key_as_string: "false",
              doc_count: 5,
            },
          ],
          total: 11,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "type",
          term: "InstitutionalCertificate",
          remove: "/search/?status%21=deleted",
        },
      ],
      clear_filters: "/search/?type=Item",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      notification: "Success",
      title: "Search",
      total: 11,
    };
    const facet = searchResults.facets[0];

    render(
      <StandardTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={() => {}}
      />
    );

    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons).toHaveLength(3);
    expect(radioButtons[0].nextElementSibling).toHaveTextContent("true");
    expect(radioButtons[0].nextElementSibling).toHaveTextContent("6");
    expect(radioButtons[1].nextElementSibling).toHaveTextContent("false");
    expect(radioButtons[1].nextElementSibling).toHaveTextContent("5");
    expect(radioButtons[2].nextElementSibling).toHaveTextContent("any");
    expect(radioButtons[2].nextElementSibling).toHaveTextContent("11");
    expect(radioButtons[0]).not.toBeChecked();
    expect(radioButtons[1]).not.toBeChecked();
    expect(radioButtons[2]).toBeChecked();
  });

  test("a StandardTerms with many terms shows term filter and collapse control", async () => {
    const user = userEvent.setup();
    // Create a facet with 25 terms to trigger both the filter (MIN_FILTER_COUNT=20)
    // and the collapse control (COLLAPSED_TERMS_COUNT=15)
    const terms = Array.from({ length: 25 }, (_, i) => ({
      key: `term-${i}`,
      doc_count: i + 1,
    }));

    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Item",
      "@type": ["Search"],
      clear_filters: "/search/?type=Item",
      facets: [
        {
          field: "test_field",
          title: "Test Field",
          terms,
          total: 25,
          type: "terms",
          appended: false,
        },
      ],
      filters: [
        {
          field: "type",
          term: "Item",
          remove: "/search/",
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
      },
      notification: "Success",
      title: "Search",
      total: 25,
    };
    const facet = searchResults.facets[0];
    const updateQuery = jest.fn();

    render(
      <StandardTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );

    // Check that the term filter is displayed
    const termFilter = screen.getByTestId("facet-term-filter-test_field");
    expect(termFilter).toBeInTheDocument();
    const filterInput = screen.getByPlaceholderText("Term filter");
    expect(filterInput).toBeInTheDocument();

    // Check that the collapse control is displayed
    const collapseControl = screen.getByTestId(
      "facet-term-collapse-test_field"
    );
    expect(collapseControl).toBeInTheDocument();
    expect(collapseControl).toHaveTextContent("See all 25 terms");

    // Initially, only 15 terms should be visible
    expect(
      screen.getByTestId(/^facetterm-test_field-term-0$/)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(/^facetterm-test_field-term-14$/)
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(/^facetterm-test_field-term-15$/)
    ).not.toBeInTheDocument();

    // Click the collapse control to expand
    await user.click(collapseControl);
    expect(collapseControl).toHaveTextContent("See fewer terms");

    // Now all 25 terms should be visible
    expect(
      screen.getByTestId(/^facetterm-test_field-term-15$/)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(/^facetterm-test_field-term-24$/)
    ).toBeInTheDocument();

    // Click again to collapse - the button text should change
    await user.click(collapseControl);
    expect(collapseControl).toHaveTextContent("See all 25 terms");
  });

  test("term filter works correctly and shows 'no matches' message", async () => {
    const user = userEvent.setup();
    // Create a facet with 25 terms to trigger the filter
    const terms = Array.from({ length: 25 }, (_, i) => ({
      key: `term-${i}`,
      doc_count: i + 1,
    }));

    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Item",
      "@type": ["Search"],
      clear_filters: "/search/?type=Item",
      facets: [
        {
          field: "test_field",
          title: "Test Field",
          terms,
          total: 25,
          type: "terms",
          appended: false,
        },
      ],
      filters: [
        {
          field: "type",
          term: "Item",
          remove: "/search/",
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
      },
      notification: "Success",
      title: "Search",
      total: 25,
    };
    const facet = searchResults.facets[0];
    const updateQuery = jest.fn();

    render(
      <StandardTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );

    const filterInput = screen.getByPlaceholderText("Term filter");

    // Filter for a specific term
    await user.type(filterInput, "term-5");
    expect(filterInput).toHaveValue("term-5");

    // Only term-5 should be visible
    expect(
      screen.getByTestId(/^facetterm-test_field-term-5$/)
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(/^facetterm-test_field-term-0$/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(/^facetterm-test_field-term-1$/)
    ).not.toBeInTheDocument();

    // Clear the filter using the clear button
    const clearButton = screen.getByTestId("facet-term-clear-test_field");
    await user.click(clearButton);
    expect(filterInput).toHaveValue("");

    // All terms should be visible again
    expect(
      screen.getByTestId(/^facetterm-test_field-term-0$/)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(/^facetterm-test_field-term-1$/)
    ).toBeInTheDocument();

    // Filter for a non-existent term
    await user.type(filterInput, "nonexistent");
    expect(filterInput).toHaveValue("nonexistent");

    // Should show "Filter matches no terms" message
    expect(screen.getByText("Filter matches no terms.")).toBeInTheDocument();

    // No terms should be visible
    expect(
      screen.queryByTestId(/^facetterm-test_field-term-0$/)
    ).not.toBeInTheDocument();
  });

  test("handles negative term selection with long click", async () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Gene&taxa=Homo+sapiens",
      "@type": ["Search"],
      clear_filters: "/search/?type=Gene",
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [
            {
              key: "Gene",
              doc_count: 11,
            },
          ],
          total: 11,
          type: "terms",
          appended: false,
        },
        {
          field: "taxa",
          title: "Taxa",
          terms: [
            {
              key: "Homo sapiens",
              doc_count: 8,
            },
            {
              key: "Mus musculus",
              doc_count: 3,
            },
          ],
          total: 11,
          type: "terms",
          appended: false,
        },
      ],
      filters: [
        {
          field: "taxa",
          term: "Homo sapiens",
          remove: "/search/?type=Gene",
        },
        {
          field: "type",
          term: "Gene",
          remove: "/search/?taxa=Homo+sapiens",
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
      },
      notification: "Success",
      title: "Search",
      total: 11,
    };
    const facet = searchResults.facets[1];
    const updateQuery = jest.fn();

    render(
      <StandardTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );

    const musMusculusTerm = screen.getByTestId(/^facetterm-taxa-mus-musculus$/);
    const checkbox = within(musMusculusTerm).getByRole("checkbox");

    // Simulate a long click by using fireEvent for mouseDown, waiting, then mouseUp
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.mouseDown(checkbox);
    await new Promise((resolve) => setTimeout(resolve, 500));
    fireEvent.mouseUp(checkbox);

    // Should add the term with negative polarity (taxa!=Mus+musculus)
    expect(updateQuery).toHaveBeenCalledWith(
      "type=Gene&taxa=Homo+sapiens&taxa!=Mus+musculus"
    );
  });

  test("handles numeric term keys", async () => {
    const user = userEvent.setup();
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Item",
      "@type": ["Search"],
      clear_filters: "/search/?type=Item",
      facets: [
        {
          field: "numeric_field",
          title: "Numeric Field",
          terms: [
            {
              key: 123,
              doc_count: 5,
            },
            {
              key: 456,
              doc_count: 3,
            },
          ],
          total: 8,
          type: "terms",
          appended: false,
        },
      ],
      filters: [
        {
          field: "type",
          term: "Item",
          remove: "/search/",
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
      },
      notification: "Success",
      title: "Search",
      total: 8,
    };
    const facet = searchResults.facets[0];
    const updateQuery = jest.fn();

    render(
      <StandardTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );

    // Check that numeric keys are rendered
    const term123 = screen.getByTestId(/^facetterm-numeric_field-123$/);
    expect(term123).toBeInTheDocument();

    // Click the numeric term
    const checkbox = within(term123).getByRole("checkbox");
    await user.click(checkbox);

    expect(updateQuery).toHaveBeenCalledWith("type=Item&numeric_field=123");
  });

  test("handles negative filters in search results", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Gene&taxa!=Homo+sapiens",
      "@type": ["Search"],
      clear_filters: "/search/?type=Gene",
      facets: [
        {
          field: "taxa",
          title: "Taxa",
          terms: [
            {
              key: "Homo sapiens",
              doc_count: 8,
            },
            {
              key: "Mus musculus",
              doc_count: 3,
            },
          ],
          total: 11,
          type: "terms",
          appended: false,
        },
      ],
      filters: [
        {
          field: "taxa!",
          term: "Homo sapiens",
          remove: "/search/?type=Gene",
        },
        {
          field: "type",
          term: "Gene",
          remove: "/search/?taxa!=Homo+sapiens",
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
      },
      notification: "Success",
      title: "Search",
      total: 3,
    };
    const facet = searchResults.facets[0];
    const updateQuery = jest.fn();

    render(
      <StandardTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );

    // Check that the negative term is displayed with line-through
    const homoSapiensTerm = screen.getByTestId(/^facetterm-taxa-homo-sapiens$/);
    expect(homoSapiensTerm).toBeInTheDocument();
    const checkboxLabel = within(homoSapiensTerm).getByTestId("checkbox-label");
    expect(checkboxLabel).toHaveClass("line-through");
  });
});
