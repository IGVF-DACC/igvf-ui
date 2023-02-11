import PropTypes from "prop-types";
import { render, screen, within } from "@testing-library/react";
import DataGrid, { DataGridContainer } from "../data-grid";

function SpecialCell({ value }) {
  return <div className="font-semibold">{value}</div>;
}

SpecialCell.propTypes = {
  value: PropTypes.string,
};

function HeaderRow({ meta, children }) {
  return <div style={{ backgroundColor: `${meta.color}` }}>{children}</div>;
}

HeaderRow.propTypes = {
  meta: PropTypes.exact({
    color: PropTypes.string.isRequired,
  }).isRequired,
};

describe("DataGrid", () => {
  it("renders a table with a row span in the first column", () => {
    const data = [
      {
        id: "two-row-span",
        cells: [{ id: "span-cell", content: "Spans two rows" }],
        children: [
          {
            id: "first-sub-row",
            cells: [
              { id: "sub-row-cell-1", content: "1" },
              { id: "sub-row-cell-2", content: "2" },
            ],
          },
          {
            id: "second-sub-row",
            cells: [
              { id: "sub-row-cell-1", content: <SpecialCell value="3" /> },
              { id: "sub-row-cell-2", content: "4" },
            ],
          },
        ],
      },
    ];

    render(
      <DataGridContainer>
        <DataGrid data={data} />
      </DataGridContainer>
    );

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    const cells = within(table).getAllByRole("cell");
    expect(cells).toHaveLength(5);

    expect(cells[0]).toHaveStyle({ gridRow: "1 / 3", gridColumn: "1 / 2" });
    expect(cells[1]).toHaveStyle({ gridRow: "1 / 2", gridColumn: "2 / 3" });
    expect(cells[2]).toHaveStyle({ gridRow: "1 / 2", gridColumn: "3 / 4" });
    expect(cells[3]).toHaveStyle({ gridRow: "2 / 3", gridColumn: "2 / 3" });
    expect(cells[4]).toHaveStyle({ gridRow: "2 / 3", gridColumn: "3 / 4" });

    const cellContent = within(cells[3]).getByText("3");
    expect(cellContent).toHaveClass("font-semibold");
  });

  it("renders a table with column spans", () => {
    const data = [
      {
        id: "header",
        cells: [
          {
            id: "header-cell-1",
            content: "Header 1",
            columns: 2,
            role: "columnheader",
          },
          {
            id: "header-cell-2",
            content: "Header 2",
            columns: 2,
            role: "columnheader",
          },
        ],
        RowComponent: HeaderRow,
      },
      {
        id: "row-1",
        cells: [
          {
            id: "cell-1",
            content: "Cell 1",
          },
          {
            id: "cell-2",
            content: "Cell 2",
          },
          {
            id: "cell-3",
            content: (cell, meta) => {
              return <div style={{ color: `${meta.color}` }}>3</div>;
            },
          },
          {
            id: "cell-4",
            content: "Cell 4",
          },
        ],
      },
    ];

    render(
      <DataGridContainer className="bg-slate-900">
        <DataGrid data={data} meta={{ color: "#ffff00" }} />
      </DataGridContainer>
    );

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass("bg-slate-900");

    const headers = within(table).getAllByRole("columnheader");
    expect(headers).toHaveLength(2);
    const cells = within(table).getAllByRole("cell");
    expect(cells).toHaveLength(4);

    expect(headers[0]).toHaveStyle({ gridRow: "1 / 2", gridColumn: "1 / 3" });
    expect(headers[1]).toHaveStyle({ gridRow: "1 / 2", gridColumn: "3 / 5" });
    expect(cells[0]).toHaveStyle({ gridRow: "2 / 3", gridColumn: "1 / 2" });
    expect(cells[1]).toHaveStyle({ gridRow: "2 / 3", gridColumn: "2 / 3" });
    expect(cells[2]).toHaveStyle({ gridRow: "2 / 3", gridColumn: "3 / 4" });
    expect(cells[3]).toHaveStyle({ gridRow: "2 / 3", gridColumn: "4 / 5" });

    let headerCell = within(headers[0]).getByText("Header 1");
    expect(headerCell).toHaveStyle({ backgroundColor: "#ffff00" });
    headerCell = within(headers[1]).getByText("Header 2");
    expect(headerCell).toHaveStyle({ backgroundColor: "#ffff00" });

    const contentCell = within(cells[2]).getByText("3");
    expect(contentCell).toHaveStyle({ color: "#ffff00" });
  });
});
