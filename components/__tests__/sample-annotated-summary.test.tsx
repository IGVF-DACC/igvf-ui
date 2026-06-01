import { fireEvent, render, screen } from "@testing-library/react";
import { type OntologyTermObject } from "../../lib/ontology-terms";
import { SampleAnnotatedSummary } from "../sample-annotated-summary";

describe("SampleAnnotatedSummary", () => {
  it("renders summary with annotated terms", async () => {
    const summary = "This is a sample summary with term1 and term2.";
    const terms: OntologyTermObject[] = [
      {
        "@id": "/ontology-terms/TERM_1",
        "@type": ["OntologyTerm", "Item"],
        term_id: "TERM_1",
        term_name: "term1",
        definition: "Definition of term1",
        status: "released",
      },
      {
        "@id": "/ontology-terms/TERM_2",
        "@type": ["OntologyTerm", "Item"],
        term_id: "TERM_2",
        term_name: "term2",
        definition: "Definition of term2",
        status: "released",
      },
    ];

    const { container } = render(
      <SampleAnnotatedSummary summary={summary} terms={terms} />
    );

    // Check that the summary text is rendered
    expect(
      screen.getByText(/This is a sample summary with/)
    ).toBeInTheDocument();
    expect(screen.getByText(/and/)).toBeInTheDocument();

    // Find the element with `aria-describedby="tooltip-term1-1"` and hover the mouse over it.
    const term1Element = container.querySelector(
      '[aria-describedby="tooltip-term1-1"]'
    );
    expect(term1Element).toBeInTheDocument();
    fireEvent.mouseEnter(term1Element);

    // Check that the tooltip for term1 is displayed with the correct definition.
    const tooltip1 = await screen.findByTestId("tooltip-term1-1");
    expect(tooltip1).toBeInTheDocument();
    expect(tooltip1).toHaveTextContent("Definition of term1");

    // Find the element with `aria-describedby="tooltip-term2-1"` and hover the mouse over it.
    const term2Element = container.querySelector(
      '[aria-describedby="tooltip-term2-3"]'
    );
    expect(term2Element).toBeInTheDocument();
    fireEvent.mouseEnter(term2Element);

    // Check that the tooltip for term2 is displayed with the correct definition.
    const tooltip2 = await screen.findByTestId("tooltip-term2-3");
    expect(tooltip2).toBeInTheDocument();
    expect(tooltip2).toHaveTextContent("Definition of term2");
  });

  it("renders summary without annotations when no terms are provided", () => {
    const summary = "This is a sample summary without terms.";
    const terms: OntologyTermObject[] = [];

    const { container } = render(
      <SampleAnnotatedSummary summary={summary} terms={terms} />
    );

    // Check that the summary text is rendered as a single node without annotations.
    expect(screen.getByText(summary)).toBeInTheDocument();

    const describedElements = container.querySelectorAll("[aria-describedby]");
    expect(describedElements.length).toBe(0);
  });

  it("renders summary without annotating terms that are parts of other words", () => {
    const summary = "This is a sample summary with term1 and term12.";
    const terms: OntologyTermObject[] = [
      {
        "@id": "/ontology-terms/TERM_1",
        "@type": ["OntologyTerm", "Item"],
        term_id: "TERM_1",
        term_name: "term1",
        definition: "Definition of term1",
        status: "released",
      },
    ];

    const { container } = render(
      <SampleAnnotatedSummary summary={summary} terms={terms} />
    );

    // Check that only the exact match "term1" is annotated, and "term12" is not.
    const term1Element = container.querySelector(
      '[aria-describedby="tooltip-term1-1"]'
    );
    expect(term1Element).toBeInTheDocument();
    expect(term1Element).toHaveTextContent("term1");

    const term12Element = container.querySelector(
      '[aria-describedby="tooltip-term1-2"]'
    );
    expect(term12Element).not.toBeInTheDocument();
  });
});
