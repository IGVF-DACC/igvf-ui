import { render, screen } from "@testing-library/react";
import AlternateAccessions from "../alternate-accessions";

describe("Test AlternateAccessions component", () => {
  it("renders a single alternate accession", () => {
    render(<AlternateAccessions alternateAccessions={["1234"]} />);
    expect(screen.getByText("Alternate Accession: 1234")).toBeInTheDocument();
  });

  it("renders multiple alternate accessions", () => {
    render(<AlternateAccessions alternateAccessions={["1234", "5678"]} />);
    expect(
      screen.getByText("Alternate Accessions: 1234, 5678")
    ).toBeInTheDocument();
  });

  it("renders nothing when no alternate accessions are provided", () => {
    render(<AlternateAccessions alternateAccessions={[]} />);
    expect(screen.queryByText(/Alternate Accessions?/)).not.toBeInTheDocument();
  });

  it("renders nothing when no alternate accessions are provided", () => {
    render(<AlternateAccessions />);
    expect(screen.queryByText(/Alternate Accessions?/)).not.toBeInTheDocument();
  });
});
