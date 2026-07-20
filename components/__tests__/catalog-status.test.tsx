import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FileObject } from "../../globals";
import { CatalogStatus, CatalogStatusGlyph } from "../catalog-status";

describe("CatalogStatus", () => {
  const baseTestFile: FileObject = {
    "@id": "/alignment-files/IGVFFI0000AAAA/",
    "@type": ["File", "Item"],
    accession: "IGVFFI0000AAAA",
    content_type: "alignments",
    file_format: "bam",
    file_set: "/measurement-sets/IGVFDS0000AAAA/",
    md5sum: "9f4c2d8b7e6a1f30c5d94b18a2ef7c61",
    status: "in progress",
  };

  it("renders the catalog status icon with default tooltip", async () => {
    const user = userEvent.setup();

    render(<CatalogStatus file={baseTestFile} />);

    // Make sure the catalog icon appears in the DOM.
    const icon = screen.getByTestId("catalog-status-icon-IGVFFI0000AAAA");
    expect(icon).toBeInTheDocument();

    // In preparation for testing the tooltip, make sure the tooltip trigger is in the DOM.
    const tooltipTrigger = icon.querySelector(
      '[aria-describedby="tooltip-node-status-tooltip-catalog-igvffi0000aaaa"]'
    );
    expect(tooltipTrigger).toBeInTheDocument();

    // Hover over the catalog status and wait for the tooltip to appear. Then check that the tooltip
    // text is correct.
    await user.hover(tooltipTrigger!);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Catalog file"
    );
  });

  it("renders the catalog status icon with custom tooltip", async () => {
    const user = userEvent.setup();

    render(<CatalogStatus file={baseTestFile} tooltip="Custom tooltip" />);

    // Make sure the catalog icon appears in the DOM.
    const icon = screen.getByTestId("catalog-status-icon-IGVFFI0000AAAA");
    expect(icon).toBeInTheDocument();

    const tooltipTrigger = icon.querySelector(
      '[aria-describedby="tooltip-node-status-tooltip-catalog-igvffi0000aaaa"]'
    );
    expect(tooltipTrigger).toBeInTheDocument();

    // Hover over the catalog status and wait for the tooltip to appear. Then check that the tooltip
    // text is correct.
    await user.hover(tooltipTrigger!);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Custom tooltip"
    );
  });
});

it("renders the standalone catalog glyph", async () => {
  const user = userEvent.setup();

  const { container } = render(
    <svg>
      <CatalogStatusGlyph id="IGVFFI0000AAAA" />
    </svg>
  );

  // Make sure the catalog glyph appears in the DOM.
  const tooltipTrigger = container.querySelector("[aria-describedby]");
  expect(tooltipTrigger).toBeInTheDocument();

  // Hover over the catalog status and wait for the tooltip to appear. Then check that the tooltip
  // text is correct.
  await user.hover(tooltipTrigger!);
  expect(await screen.findByRole("tooltip")).toHaveTextContent("Catalog file");
});
