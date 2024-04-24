import { render, screen } from "@testing-library/react";
import MarkdownSection from "../markdown-section";

describe("Test the MarkdownSection component", () => {
  it("renders the markdown section", () => {
    render(<MarkdownSection>Test markdown section</MarkdownSection>);

    expect(screen.getByText("Test markdown section")).toBeInTheDocument();
  });

  it("applies additional Tailwind CSS classes", () => {
    render(
      <MarkdownSection className="test-class" testid="jest-test">
        Test markdown section
      </MarkdownSection>
    );

    expect(screen.getByTestId("jest-test").firstChild).toHaveClass(
      "test-class"
    );
  });

  it("renders an <a> tag for external links within the markdown", () => {
    render(<MarkdownSection>[Test link](https://example.com)</MarkdownSection>);

    expect(screen.getByText("Test link")).toHaveAttribute(
      "href",
      "https://example.com"
    );
  });

  it("renders an <a> tag for internal links within the markdown", () => {
    render(<MarkdownSection>[Test link](/example)</MarkdownSection>);

    expect(screen.getByText("Test link")).toHaveAttribute("href", "/example");
  });

  it("renders an <a> tag without a target for hash tags within the markdown", () => {
    render(<MarkdownSection>[Test link](#example)</MarkdownSection>);

    expect(screen.getByText("Test link")).not.toHaveAttribute("target");
  });

  it("renders an <a> tag with a name attribute for tags targeting a hashtag", () => {
    render(<MarkdownSection>[Test link](example)</MarkdownSection>);

    expect(screen.getByText("Test link")).toHaveAttribute("name", "example");
  });

  it("renders a table within a wrapper div", () => {
    render(
      <MarkdownSection>
        {"| Header 1 | Header 2 |\n| --- | --- |\n| Row 1 | Row 2 |"}
      </MarkdownSection>
    );

    // Test the wrapper div around the table contains the markdown-table CSS class.
    expect(screen.getByRole("table").parentElement).toHaveClass(
      "markdown-table"
    );
    expect(screen.getByText("Header 1")).toBeInTheDocument();
    expect(screen.getByText("Header 2")).toBeInTheDocument();
    expect(screen.getByText("Row 1")).toBeInTheDocument();
    expect(screen.getByText("Row 2")).toBeInTheDocument();
  });
});
