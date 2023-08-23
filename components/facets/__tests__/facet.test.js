import { render, screen, within } from "@testing-library/react";
import Facet from "../facet";
import FacetTerm from "../facet-term";

describe("Test the <Facet> component", () => {
  it("renders a single facet and its child terms", () => {
    const onTermClick = jest.fn();

    const facet = {
      field: "treatments.treatment_term_name",
      title: "Treatments",
      terms: [
        {
          key: "new compound",
          doc_count: 1,
        },
        {
          key: "resorcinol",
          doc_count: 1,
        },
      ],
    };

    render(
      <Facet key={facet.field} facet={facet}>
        {facet.terms.map((term) => {
          return (
            <FacetTerm
              key={term.key}
              field={facet.field}
              term={term}
              isChecked={term.key === "resorcinol" ? true : false}
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
    expect(checkbox).not.toHaveAttribute("checked");
    checkbox = within(terms[1]).getByRole("checkbox");
    expect(checkbox).toHaveAttribute("checked");
  });
});
