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
        isNegative={false}
        onClick={onClick}
      />
    );

    const facetTerm = screen.getByTestId(
      "facetterm-assay_slims-massively-parallel-reporter-assay"
    );
    expect(facetTerm).toBeInTheDocument();
    const label = within(facetTerm).getByLabelText(
      `${term.key} with ${term.doc_count} result`
    );
    expect(label).toBeInTheDocument();
    const resultCount = within(facetTerm).getByText(term.doc_count);
    expect(resultCount).toBeInTheDocument();
    const checkbox = within(facetTerm).getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    fireEvent.mouseDown(checkbox);
    fireEvent.mouseUp(checkbox);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith("assay_slims", term, false, null);
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
        isNegative={false}
        onClick={onClick}
      />
    );

    const facetTerm = screen.getByTestId(
      "facetterm-assay_slims-massively-parallel-reporter-assay"
    );
    expect(facetTerm).toBeInTheDocument();
    const label = within(facetTerm).getByLabelText(
      `${term.key} with ${term.doc_count} results`
    );
    expect(label).toBeInTheDocument();
    const resultCount = within(facetTerm).getByText(term.doc_count);
    expect(resultCount).toBeInTheDocument();
    const checkbox = within(facetTerm).getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();

    fireEvent.mouseDown(checkbox);
    fireEvent.mouseUp(checkbox);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders an unchecked facet term and reacts to a long click", async () => {
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
        isNegative={false}
        onClick={onClick}
      />
    );

    const facetTerm = screen.getByTestId(
      "facetterm-assay_slims-massively-parallel-reporter-assay"
    );
    expect(facetTerm).toBeInTheDocument();
    const label = within(facetTerm).getByLabelText(
      `${term.key} with ${term.doc_count} result`
    );
    expect(label).toBeInTheDocument();
    const resultCount = within(facetTerm).getByText(term.doc_count);
    expect(resultCount).toBeInTheDocument();
    const checkbox = within(facetTerm).getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    // Send a mousedown event to the checkbox, wait 500ms, then send a mouseup.
    // This should trigger a long click event.
    fireEvent.mouseDown(checkbox);
    await new Promise((r) => setTimeout(r, 500));
    fireEvent.mouseUp(checkbox);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith("assay_slims", term, true, null);
  });

  it("renders a negative facet term", () => {
    const term = {
      doc_count: 1,
      key: "Massively parallel reporter assay",
    };
    const onClick = jest.fn();

    render(
      <FacetTerm
        field="assay_slims"
        term={term}
        isChecked={true}
        isNegative={true}
        onClick={onClick}
      />
    );

    const facetTerm = screen.getByTestId(
      "facetterm-assay_slims-massively-parallel-reporter-assay"
    );
    expect(facetTerm).toBeInTheDocument();
    const label = within(facetTerm).getByLabelText(
      `${term.key} with ${term.doc_count} result`
    );
    expect(label).toBeInTheDocument();
    const resultCount = within(facetTerm).queryByText(term.doc_count);
    expect(resultCount).toBeNull();
    const checkbox = within(facetTerm).getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();

    const checkboxLabel = screen.getByTestId("checkbox-label");
    expect(checkboxLabel).toHaveClass("line-through");
  });

  it("renders a child term with a parent term", () => {
    const term = {
      doc_count: 1,
      key: "Massively parallel reporter assay",
    };
    const parent = {
      field: "assay_slims",
      term: {
        key: "assay",
        doc_count: 2,
        subfacet: {
          field: "term_name",
          terms: [
            {
              key: "Massively parallel reporter assay",
              doc_count: 1,
            },
          ],
          title: "Term Name",
        },
      },
    };
    const onClick = jest.fn();

    render(
      <FacetTerm
        field="assay_slims"
        term={term}
        isChecked={false}
        isNegative={false}
        parent={parent}
        onClick={onClick}
      />
    );

    const facetTerm = screen.getByTestId(
      "facetterm-assay_slims-massively-parallel-reporter-assay-assay"
    );
    expect(facetTerm).toBeInTheDocument();
    const label = within(facetTerm).getByLabelText(
      `${term.key} with ${term.doc_count} result`
    );
    expect(label).toBeInTheDocument();
    const resultCount = within(facetTerm).getByText(term.doc_count);
    expect(resultCount).toBeInTheDocument();
    const checkbox = within(facetTerm).getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    fireEvent.mouseDown(checkbox);
    fireEvent.mouseUp(checkbox);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith("assay_slims", term, false, parent);
  });
});
