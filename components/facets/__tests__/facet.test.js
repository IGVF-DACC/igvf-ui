import { fireEvent, render, screen, within } from "@testing-library/react";
import Facet from "../facet";
import FacetTerm from "../facet-term";

describe("Test the <Facet> component", () => {
  it("renders a single facet and its child terms", () => {
    const onTermClick = jest.fn();
    const updateQuery = jest.fn();

    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/treatments/d7562e66-c218-46e8-b0e2-ea6d89978b32/",
          "@type": ["Treatment", "Item"],
          award: {
            component: "data coordination",
          },
          depletion: true,
          lab: {
            title: "J. Michael Cherry, Stanford",
          },
          purpose: "differentiation",
          status: "released",
          summary: "Depletion of new protein",
          treatment_term_id: "NTR:0001189",
          treatment_term_name: "new protein",
          treatment_type: "protein",
          uuid: "d7562e66-c218-46e8-b0e2-ea6d89978b32",
        },
      ],
      "@id": "/search/?type=Treatment&treatment_type=chemical",
      "@type": ["Search"],
      clear_filters: "/search/?type=Treatment",
      columns: {
        "@id": {
          title: "ID",
        },
        "award.component": {
          title: "Award",
        },
        "lab.title": {
          title: "Lab",
        },
        status: {
          title: "Status",
        },
        treatment_term_id: {
          title: "Treatment Term ID",
        },
        treatment_term_name: {
          title: "Treatment Term Name",
        },
        treatment_type: {
          title: "Treatment Type",
        },
      },
      facets: [
        {
          field: "treatment_type",
          terms: [
            {
              doc_count: 3,
              key: "chemical",
            },
            {
              doc_count: 3,
              key: "protein",
            },
          ],
          title: "Treatment Type",
          total: 6,
        },
      ],
      filters: [
        {
          field: "treatment_type",
          remove: "/search/?type=Treatment",
          term: "chemical",
        },
        {
          field: "type",
          remove: "/search/?treatment_type=chemical",
          term: "Treatment",
        },
      ],
      total: 6,
    };

    const facet = searchResults.facets[0];

    render(
      <Facet
        key={facet.field}
        facet={facet}
        searchResults={searchResults}
        updateQuery={updateQuery}
        updateOpen={() => {}}
        isFacetOpen={false}
      >
        {facet.terms.map((term) => {
          return (
            <FacetTerm
              key={term.key}
              field={facet.field}
              term={term}
              isChecked={term.key === "chemical" ? true : false}
              isNegative={false}
              onClick={onTermClick}
            />
          );
        })}
      </Facet>
    );

    // Make sure the facet title has the correct contents.
    expect(screen.getByTestId(`facettitle-${facet.field}`)).toHaveTextContent(
      facet.title
    );

    // Make sure the facet has the correct number of terms and the correct contents.
    const terms = screen.getAllByTestId(/^facetterm-/);
    expect(terms).toHaveLength(facet.terms.length);
    expect(terms[0]).toHaveTextContent(facet.terms[0].key);
    expect(terms[0]).toHaveTextContent(facet.terms[0].doc_count);
    expect(terms[1]).toHaveTextContent(facet.terms[1].key);
    expect(terms[1]).toHaveTextContent(facet.terms[1].doc_count);

    // Make sure the second term is checked.
    let checkbox = within(terms[0]).getByRole("checkbox");
    expect(checkbox).toHaveAttribute("checked");
    checkbox = within(terms[1]).getByRole("checkbox");
    expect(checkbox).not.toHaveAttribute("checked");

    // Check the first term.
    checkbox = within(terms[0]).getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute("checked");
  });
});
