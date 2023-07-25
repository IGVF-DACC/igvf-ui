import { fireEvent, render, screen, within } from "@testing-library/react";
import ReportHeaderCell from "../header-cell";

describe("Test ReportHeaderCell component", () => {
  it("should render a header cell with no sorting icon", () => {
    const headerClickHandler = jest.fn();
    const cells = [
      { id: "@id", content: "ID", role: "columnheader" },
      { id: "accession", content: "Accession", role: "columnheader" },
    ];
    const meta = {
      onHeaderCellClick: headerClickHandler,
      sortedColumnId: "@id",
      nonSortableColumnIds: ["@id"],
    };

    render(
      <ReportHeaderCell cells={cells} cellIndex={1} meta={meta}>
        <div>Accession</div>
      </ReportHeaderCell>,
    );

    // Test that it rendered the text and no icon.
    const headerButton = screen.getByRole("button");
    expect(headerButton).toBeInTheDocument();
    expect(within(headerButton).getByText("Accession")).toBeInTheDocument();
    expect(
      within(headerButton).queryByTestId(/^header-sort-icon/),
    ).not.toBeInTheDocument();

    // Test that it called the header click handler.
    expect(headerClickHandler).not.toHaveBeenCalled();
    fireEvent.click(headerButton);
    expect(headerClickHandler).toHaveBeenCalledWith("accession");
  });

  it("should render a header cell with ascending sorting icon", () => {
    const headerClickHandler = jest.fn();
    const cells = [
      { id: "@id", content: "ID", role: "columnheader" },
      { id: "accession", content: "Accession", role: "columnheader" },
    ];
    const meta = {
      onHeaderCellClick: headerClickHandler,
      sortedColumnId: "accession",
      nonSortableColumnIds: ["@id"],
    };

    render(
      <ReportHeaderCell cells={cells} cellIndex={1} meta={meta}>
        <div>Accession</div>
      </ReportHeaderCell>,
    );

    // Test that it rendered the text and the ascending sorting icon.
    const headerButton = screen.getByRole("button");
    expect(headerButton).toBeInTheDocument();
    expect(within(headerButton).getByText("Accession")).toBeInTheDocument();
    expect(
      within(headerButton).queryByTestId("header-sort-icon-ascending"),
    ).toBeInTheDocument();
  });

  it("should render a header cell with descending sorting icon", () => {
    const headerClickHandler = jest.fn();
    const cells = [
      { id: "@id", content: "ID", role: "columnheader" },
      { id: "accession", content: "Accession", role: "columnheader" },
    ];
    const meta = {
      onHeaderCellClick: headerClickHandler,
      sortedColumnId: "-accession",
      nonSortableColumnIds: ["@id"],
    };

    render(
      <ReportHeaderCell cells={cells} cellIndex={1} meta={meta}>
        <div>Accession</div>
      </ReportHeaderCell>,
    );

    // Test that it rendered the text and the descending sorting icon.
    const headerButton = screen.getByRole("button");
    expect(headerButton).toBeInTheDocument();
    expect(within(headerButton).getByText("Accession")).toBeInTheDocument();
    expect(
      within(headerButton).queryByTestId("header-sort-icon-descending"),
    ).toBeInTheDocument();
  });
});
