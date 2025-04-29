import { render, screen } from "@testing-library/react";
import {
  DataUseLimitationStatus,
  DataUseLimitationSummaries,
} from "../data-use-limitation-status";

describe("Test DataUseLimitationsStatus component", () => {
  it("Generates badge for limitation only", () => {
    render(<DataUseLimitationStatus limitation="GRU" />);
    const limitation = screen.getByTestId(/^limitation-gru$/);
    expect(limitation).toBeInTheDocument();
    const modifiers = screen.queryAllByTestId(/^modifier-.*$/);
    expect(modifiers).toHaveLength(0);
  });

  it("Generates badge with modifiers given both limitation and modifiers", () => {
    render(
      <DataUseLimitationStatus limitation="DS" modifiers={["HMB", "UNK"]} />
    );
    const limitation = screen.getByTestId(/^limitation-ds$/);
    expect(limitation).toBeInTheDocument();
    const modifiers = screen.queryAllByTestId(/^modifier-.*$/);
    expect(modifiers).toHaveLength(2);
    expect(modifiers[0]).toHaveTextContent("HMB");
    expect(modifiers[1]).toHaveTextContent("UNK");
  });

  it("generates a badge with limitation and modifiers from a summary string", () => {
    render(<DataUseLimitationStatus summary="DS-COL-GSO" />);
    const limitation = screen.getByTestId(/^limitation-ds$/);
    expect(limitation).toBeInTheDocument();
    const icon = screen.getByTestId(/^icon-limitation-ds$/);
    expect(icon).toBeInTheDocument();

    const modifiers = screen.queryAllByTestId(/^modifier-.*$/);
    expect(modifiers).toHaveLength(2);
    expect(modifiers[0]).toHaveTextContent("COL");
    expect(modifiers[1]).toHaveTextContent("GSO");
  });

  it("generates a badge with `other` icon if limitation is not found", () => {
    render(<DataUseLimitationStatus limitation="XYZ" />);

    const limitation = screen.getByTestId(/^limitation-xyz$/);
    expect(limitation).toHaveTextContent("XYZ");
    const icon = screen.getByTestId(/^icon-limitation-none$/);
    expect(icon).toBeInTheDocument();
  });

  it("generates no badge if no limitation, modifiers, or summary provided", () => {
    render(<DataUseLimitationStatus />);
    const limitation = screen.getByTestId(/^limitation-.*$/);
    expect(limitation).toHaveTextContent("no limitations");
  });

  it("renders nothing if summary contains `no certificate`", () => {
    render(<DataUseLimitationStatus summary="no certificate" />);
    const limitation = screen.queryByTestId(/^limitation-.*$/);
    expect(limitation).not.toBeInTheDocument();
    const icon = screen.queryByTestId(/^icon-limitation-.*$/);
    expect(icon).not.toBeInTheDocument();
    const modifiers = screen.queryAllByTestId(/^modifier-.*$/);
    expect(modifiers).toHaveLength(0);
  });

  it("throws an error if both summary and limitation are provided", () => {
    // This test catches exceptions but not before Jest displays an "uncaught exception" message.
    // Suppress the console.error output for this test.
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() =>
      render(<DataUseLimitationStatus limitation="DS" summary="DS-COL-GSO" />)
    ).toThrow("Use the limitation/modifiers or the summary; not both.");

    // Restore console.error after the test
    consoleError.mockRestore();
  });

  it("throws an error if both summary and modifiers are provided", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() =>
      render(
        <DataUseLimitationStatus
          modifiers={["HMB", "UNK"]}
          summary="DS-COL-GSO"
        />
      )
    ).toThrow("Use the limitation/modifiers or the summary; not both.");

    consoleError.mockRestore();
  });

  // Throws error if all of summary, limitation, and modifiers provided
  it("throws an error if all of summary, limitation, and modifiers are provided", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() =>
      render(
        <DataUseLimitationStatus
          limitation="DS"
          modifiers={["HMB", "UNK"]}
          summary="DS-COL-GSO"
        />
      )
    ).toThrow("Use the limitation/modifiers or the summary; not both.");

    consoleError.mockRestore();
  });
});

describe("Test DataUseLimitationSummaries component", () => {
  it("renders no badge if no summaries provided", () => {
    render(<DataUseLimitationSummaries />);
    const limitation = screen.queryByTestId(/^limitation-.*$/);
    expect(limitation).not.toBeInTheDocument();
  });

  it("renders the badge with the summary if one summary provided", () => {
    render(<DataUseLimitationSummaries summaries={["DS-COL-GSO"]} />);
    const limitation = screen.getByTestId(/^limitation-ds$/);
    expect(limitation).toBeInTheDocument();
    expect(limitation).toHaveTextContent("DS");
    const modifiers = screen.queryAllByTestId(/^modifier-.*$/);
    expect(modifiers).toHaveLength(2);
    expect(modifiers[0]).toHaveTextContent("COL");
    expect(modifiers[1]).toHaveTextContent("GSO");
  });

  it("renders a badge with `multiple` if multiple conflicting summaries provided", () => {
    render(
      <DataUseLimitationSummaries summaries={["DS-COL-GSO", "DS-HMB-UNK"]} />
    );
    const limitation = screen.getByTestId(/^limitation-multiple$/);
    expect(limitation).toBeInTheDocument();
    expect(limitation).toHaveTextContent("multiple");
  });

  it("renders the badge with the summary if multiple identical summaries provided", () => {
    render(
      <DataUseLimitationSummaries summaries={["DS-COL-GSO", "DS-COL-GSO"]} />
    );
    const limitation = screen.getByTestId(/^limitation-ds$/);
    expect(limitation).toBeInTheDocument();
    expect(limitation).toHaveTextContent("DS");
    const modifiers = screen.queryAllByTestId(/^modifier-.*$/);
    expect(modifiers).toHaveLength(2);
    expect(modifiers[0]).toHaveTextContent("COL");
    expect(modifiers[1]).toHaveTextContent("GSO");
  });
});
