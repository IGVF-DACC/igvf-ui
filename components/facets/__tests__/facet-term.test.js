import { fireEvent, render, screen, within } from "@testing-library/react";
import FacetTerm from "../facet-term";

describe("Test the <FacetTerms> component", () => {
  it("renders an unchecked facet term with a result count of 1", () => {
    const term = {
      doc_count: 1,
      key: "Massively parallel reporter assay",
    };
    const onClick = jest.fn();

    render(
      <FacetTerm
        field="assay_slims"
        term={term}
        isChecked={false}
        onClick={onClick}
      />,
    );

    const facetTerm = screen.getByTestId(`facetterm-${term.key}`);
    expect(facetTerm).toBeInTheDocument();
    const label = within(facetTerm).getByLabelText(
      `${term.key} with ${term.doc_count} result`,
    );
    expect(label).toBeInTheDocument();
    const resultCount = within(facetTerm).getByText(term.doc_count);
    expect(resultCount).toBeInTheDocument();
    const checkbox = within(facetTerm).getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a checked facet term with a result count greater than 1", () => {
    const term = {
      doc_count: 2,
      key: "Massively parallel reporter assay",
    };
    const onClick = jest.fn();

    render(
      <FacetTerm
        field="assay_slims"
        term={term}
        isChecked={true}
        onClick={onClick}
      />,
    );

    const facetTerm = screen.getByTestId(`facetterm-${term.key}`);
    expect(facetTerm).toBeInTheDocument();
    const label = within(facetTerm).getByLabelText(
      `${term.key} with ${term.doc_count} results`,
    );
    expect(label).toBeInTheDocument();
    const resultCount = within(facetTerm).getByText(term.doc_count);
    expect(resultCount).toBeInTheDocument();
    const checkbox = within(facetTerm).getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
