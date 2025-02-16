import {
  splitHeaderAndDataRows,
  type DataTableFormat,
  type Row,
} from "../data-table";

describe("Test splitHeaderAndDataRows()", () => {
  it("splits data into header and data rows", () => {
    const rows: DataTableFormat = [
      { id: "1", cells: [{ id: "1", content: "Header 1" }], isHeaderRow: true },
      { id: "2", cells: [{ id: "1", content: "Header 2" }], isHeaderRow: true },
      { id: "3", cells: [{ id: "1", content: "Data 1" }] },
      { id: "4", cells: [{ id: "1", content: "Data 2" }] },
      { id: "5", cells: [{ id: "1", content: "Header 3" }], isHeaderRow: true },
      { id: "6", cells: [{ id: "1", content: "Data 3" }] },
      { id: "7", cells: [{ id: "1", content: "Data 4" }] },
      { id: "8", cells: [{ id: "1", content: "Data 5" }] },
    ];

    const result = splitHeaderAndDataRows(rows);
    expect(result).toEqual([
      [
        {
          id: "1",
          cells: [{ id: "1", content: "Header 1" }],
          isHeaderRow: true,
        },
        {
          id: "2",
          cells: [{ id: "1", content: "Header 2" }],
          isHeaderRow: true,
        },
      ],
      [
        { id: "3", cells: [{ id: "1", content: "Data 1" }] },
        { id: "4", cells: [{ id: "1", content: "Data 2" }] },
      ],
      [
        {
          id: "5",
          cells: [{ id: "1", content: "Header 3" }],
          isHeaderRow: true,
        },
      ],
      [
        { id: "6", cells: [{ id: "1", content: "Data 3" }] },
        { id: "7", cells: [{ id: "1", content: "Data 4" }] },
        { id: "8", cells: [{ id: "1", content: "Data 5" }] },
      ],
    ]);
  });

  it("handles empty input", () => {
    const result = splitHeaderAndDataRows([]);
    expect(result).toEqual([]);
  });

  it("handles only header rows", () => {
    const rows: DataTableFormat = [
      { id: "1", cells: [{ id: "1", content: "Header 1" }], isHeaderRow: true },
      { id: "2", cells: [{ id: "1", content: "Header 2" }], isHeaderRow: true },
    ];

    const result = splitHeaderAndDataRows(rows);
    expect(result).toEqual([
      [
        {
          id: "1",
          cells: [{ id: "1", content: "Header 1" }],
          isHeaderRow: true,
        },
        {
          id: "2",
          cells: [{ id: "1", content: "Header 2" }],
          isHeaderRow: true,
        },
      ],
    ]);
  });

  it("handles only data rows", () => {
    const rows: Row[] = [
      { id: "1", cells: [{ id: "1", content: "Data 1" }] },
      { id: "2", cells: [{ id: "1", content: "Data 2" }] },
    ];

    const result = splitHeaderAndDataRows(rows);
    expect(result).toEqual([
      [
        { id: "1", cells: [{ id: "1", content: "Data 1" }] },
        { id: "2", cells: [{ id: "1", content: "Data 2" }] },
      ],
    ]);
  });

  it("handles alternating header and data rows", () => {
    const rows: DataTableFormat = [
      { id: "1", cells: [{ id: "1", content: "Header 1" }], isHeaderRow: true },
      { id: "2", cells: [{ id: "1", content: "Data 1" }], isHeaderRow: false },
      { id: "3", cells: [{ id: "1", content: "Header 2" }], isHeaderRow: true },
      { id: "4", cells: [{ id: "1", content: "Data 2" }], isHeaderRow: false },
      { id: "5", cells: [{ id: "1", content: "Header 3" }], isHeaderRow: true },
    ];

    const result = splitHeaderAndDataRows(rows);
    expect(result).toEqual([
      [
        {
          id: "1",
          cells: [{ id: "1", content: "Header 1" }],
          isHeaderRow: true,
        },
      ],
      [
        {
          id: "2",
          cells: [{ id: "1", content: "Data 1" }],
          isHeaderRow: false,
        },
      ],
      [
        {
          id: "3",
          cells: [{ id: "1", content: "Header 2" }],
          isHeaderRow: true,
        },
      ],
      [
        {
          id: "4",
          cells: [{ id: "1", content: "Data 2" }],
          isHeaderRow: false,
        },
      ],
      [
        {
          id: "5",
          cells: [{ id: "1", content: "Header 3" }],
          isHeaderRow: true,
        },
      ],
    ]);
  });

  it("handles a single header row", () => {
    const rows: DataTableFormat = [
      { id: "1", cells: [{ id: "1", content: "Header 1" }], isHeaderRow: true },
    ];

    const result = splitHeaderAndDataRows(rows);
    expect(result).toEqual([
      [
        {
          id: "1",
          cells: [{ id: "1", content: "Header 1" }],
          isHeaderRow: true,
        },
      ],
    ]);
  });

  it("handles a single data row", () => {
    const rows: DataTableFormat = [
      { id: "1", cells: [{ id: "1", content: "Data 1" }] },
    ];

    const result = splitHeaderAndDataRows(rows);
    expect(result).toEqual([
      [{ id: "1", cells: [{ id: "1", content: "Data 1" }] }],
    ]);
  });
});
