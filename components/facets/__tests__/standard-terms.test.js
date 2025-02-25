import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StandardTerms from "../custom-facets/standard-terms";

describe("Test the StandardTerms component", () => {
  test("a normal small StandardTerms", async () => {
    const user = userEvent.setup();
    const searchResults = {
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
          open_on_load: false,
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
          open_on_load: false,
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
          open_on_load: false,
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
    const searchResults = {
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
          open_on_load: false,
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
      notification: "Success",
      title: "Search",
      total: 30,
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

    // Click the parent term. Make sure it also selects the child terms "MPRA" and "STARR-seq".
    const parentTerm = screen.getByTestId(
      /^facetterm-assay_term.assay_slims-massively-parallel-reporter-assay$/
    );
    expect(parentTerm).toBeInTheDocument();
    const checkbox = within(parentTerm).getByRole("checkbox");
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

    // Click the child term "STARR-seq" and make sure it also selects the parent term.
    childTerm = screen.getByTestId(
      /^facetterm-assay_term.term_name-starr-seq-massively-parallel-reporter-assay$/
    );
    expect(childTerm).toBeInTheDocument();
    childCheckbox = within(childTerm).getByRole("checkbox");
    await user.click(childCheckbox);
    expect(updateQuery).toHaveBeenCalledWith(
      "type=MeasurementSet&assay_term.assay_slims=Massively+parallel+reporter+assay&assay_term.term_name=MPRA&assay_term.term_name=STARR-seq"
    );

    // Click to remove the child term "STARR-seq" and make sure it removes the parent term.
    await user.click(childCheckbox);
    expect(updateQuery).toHaveBeenCalledWith(
      "type=MeasurementSet&assay_term.term_name=MPRA"
    );
  });
});
