import { render, screen } from "@testing-library/react";
import LinkedIdAndStatus from "../linked-id-and-status";

describe("Regular file download link", () => {
  it("renders a download link with the correct link and status", () => {
    const file = {
      "@id": "/files/IGVFFI0000AAAA/",
      status: "released",
    };
    render(<LinkedIdAndStatus item={file}>File</LinkedIdAndStatus>);

    // Renders a link with the correct href and contents
    const link = screen.getByText("File");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/files/IGVFFI0000AAAA");
    const status = screen.getByTestId("status-abbr-released");
    expect(status).toBeInTheDocument();
  });

  it("renders the link with an overridden status", () => {
    const file = {
      "@id": "/files/IGVFFI0000AAAA/",
      status: "released",
    };
    render(
      <LinkedIdAndStatus item={file} status="archived">
        File
      </LinkedIdAndStatus>
    );

    // Renders the status as "archived"
    const link = screen.getByText("File");
    expect(link).toBeInTheDocument();
    const status = screen.getByTestId("status-abbr-archived");
    expect(status).toBeInTheDocument();
  });

  it("renders the link with target=_blank", () => {
    const file = {
      "@id": "/files/IGVFFI0000AAAA/",
      status: "released",
    };
    render(
      <LinkedIdAndStatus item={file} isTargetBlank>
        File
      </LinkedIdAndStatus>
    );

    // Renders the status as "archived"
    const link = screen.getByText("File");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the link with custom Tailwind CSS classes", () => {
    const file = {
      "@id": "/files/IGVFFI0000AAAA/",
      status: "released",
    };
    render(
      <LinkedIdAndStatus item={file} className="text-red-500">
        File
      </LinkedIdAndStatus>
    );

    const link = screen.getByText("File");
    expect(link).toBeInTheDocument();
    expect(link.parentElement.parentElement).toHaveClass("text-red-500");
  });
});
