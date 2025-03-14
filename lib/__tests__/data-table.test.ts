import {
  calculateRowSpan,
  flattenCells,
  splitRowsIntoSegments,
  type Cell,
  type DataTableFormat,
  type Row,
} from "../data-table";

describe("Test splitRowsIntoSegments()", () => {
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

    const result = splitRowsIntoSegments(rows);
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
    const result = splitRowsIntoSegments([]);
    expect(result).toEqual([]);
  });

  it("handles only header rows", () => {
    const rows: DataTableFormat = [
      { id: "1", cells: [{ id: "1", content: "Header 1" }], isHeaderRow: true },
      { id: "2", cells: [{ id: "1", content: "Header 2" }], isHeaderRow: true },
    ];

    const result = splitRowsIntoSegments(rows);
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

    const result = splitRowsIntoSegments(rows);
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

    const result = splitRowsIntoSegments(rows);
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

    const result = splitRowsIntoSegments(rows);
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

    const result = splitRowsIntoSegments(rows);
    expect(result).toEqual([
      [{ id: "1", cells: [{ id: "1", content: "Data 1" }] }],
    ]);
  });
});

describe("Test calculateRowSpan()", () => {
  it("calculates the row span of a cell with child rows", () => {
    const cell: Cell = {
      id: "0",
      content: "Cell 1",
      childRows: [
        {
          id: "0",
          cells: [
            {
              id: "1",
              content: "Cell",
              childRows: [
                {
                  id: "0",
                  cells: [{ id: "1", content: "Cell" }],
                },
                {
                  id: "1",
                  cells: [{ id: "2", content: "Cell" }],
                },
              ],
            },
          ],
        },
        {
          id: "1",
          cells: [
            {
              id: "1",
              content: "Cell",
              childRows: [
                {
                  id: "0",
                  cells: [{ id: "1", content: "Cell" }],
                },
                {
                  id: "1",
                  cells: [{ id: "2", content: "Cell" }],
                },
              ],
            },
          ],
        },
      ],
    };

    const result = calculateRowSpan(cell);
    expect(result).toEqual(4);
  });

  it("calculates the row span of a cells with single child rows", () => {
    const cell = {
      id: "1",
      content: "Cell 1",
      childRows: [
        {
          id: "2",
          cells: [{ id: "1", content: "Cell 2" }],
          childRows: [
            {
              id: "3",
              cells: [{ id: "1", content: "Cell 3" }],
            },
          ],
        },
      ],
    };

    const result = calculateRowSpan(cell);
    expect(result).toEqual(1);
  });

  it("handles a cell with no child rows", () => {
    const cell = {
      id: "1",
      content: "Cell 1",
    };

    const result = calculateRowSpan(cell);
    expect(result).toEqual(1);
  });
});

describe("Test flattenCells()", () => {
  it("flattens a row with no child rows", () => {
    const row: Row = {
      id: "1",
      cells: [
        { id: "1", content: "Cell 1" },
        { id: "2", content: "Cell 2" },
      ],
    };

    const { rows, updatedSegment } = flattenCells([row]);
    expect(rows).toEqual([
      {
        id: "1",
        content: "Cell 1",
        _rowSpan: 1,
        _htmlRowId: 0,
      },
      {
        id: "2",
        content: "Cell 2",
        _rowSpan: 1,
        _htmlRowId: 0,
      },
    ]);
    expect(updatedSegment).toEqual(1);
  });

  it("flattens a row with single child rows", () => {
    const row: Row = {
      id: "1",
      cells: [
        {
          id: "1",
          content: "Cell 1",
          childRows: [
            {
              id: "2",
              cells: [{ id: "1", content: "Cell 2" }],
            },
          ],
        },
      ],
    };

    const { rows, updatedSegment } = flattenCells([row]);
    expect(rows).toEqual([
      {
        id: "1",
        content: "Cell 1",
        childRows: [
          {
            id: "2",
            cells: [
              {
                id: "1",
                content: "Cell 2",
                _rowSpan: 1,
                _htmlRowId: 0,
              },
            ],
          },
        ],
        _rowSpan: 1,
        _htmlRowId: 0,
      },
      {
        id: "1",
        content: "Cell 2",
        _rowSpan: 1,
        _htmlRowId: 0,
      },
    ]);
    expect(updatedSegment).toEqual(2);
  });

  it("flattens a row with multiple child rows", () => {
    const testRows: Row[] = [
      {
        id: "15",
        cells: [
          {
            id: "15",
            content: "Title 15 example",
            childRows: [
              {
                id: "16",
                cells: [{ id: "16", content: "Title 16 example" }],
              },
              {
                id: "17",
                cells: [{ id: "17", content: "Title 17 example" }],
              },
              {
                id: "18",
                cells: [{ id: "18", content: "Title 18 example" }],
              },
            ],
          },
        ],
      },
      {
        id: "19",
        cells: [
          { id: "19", content: "Title 19 example" },
          { id: "20", content: "Title 20 example" },
        ],
      },
    ];

    const { rows, updatedSegment } = flattenCells(testRows);
    expect(rows).toEqual([
      {
        id: "15",
        content: "Title 15 example",
        childRows: [
          {
            id: "16",
            cells: [
              {
                id: "16",
                content: "Title 16 example",
                _rowSpan: 1,
                _htmlRowId: 0,
              },
            ],
          },
          {
            id: "17",
            cells: [
              {
                id: "17",
                content: "Title 17 example",
                _rowSpan: 1,
                _htmlRowId: 1,
              },
            ],
          },
          {
            id: "18",
            cells: [
              {
                id: "18",
                content: "Title 18 example",
                _rowSpan: 1,
                _htmlRowId: 2,
              },
            ],
          },
        ],
        _rowSpan: 3,
        _htmlRowId: 0,
      },
      {
        id: "16",
        content: "Title 16 example",
        _rowSpan: 1,
        _htmlRowId: 0,
      },
      {
        id: "17",
        content: "Title 17 example",
        _rowSpan: 1,
        _htmlRowId: 1,
      },
      {
        id: "18",
        content: "Title 18 example",
        _rowSpan: 1,
        _htmlRowId: 2,
      },
      {
        id: "19",
        content: "Title 19 example",
        _rowSpan: 1,
        _htmlRowId: 3,
      },
      {
        id: "20",
        content: "Title 20 example",
        _rowSpan: 1,
        _htmlRowId: 3,
      },
    ]);
    expect(updatedSegment).toEqual(4);
  });
});
