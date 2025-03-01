// components
import { DataTable } from "../components/data-table";
// lib
import {
  calculateRowSpan,
  type Cell,
  type DataTableFormat,
  type Row,
} from "../lib/data-table";

const basicTableData: DataTableFormat = [
  {
    id: "1",
    cells: [
      { id: "1", content: "Title 1 example" },
      { id: "2", content: "Title 2 example" },
      { id: "3", content: "Title 3 example" },
      { id: "4", content: "Title 4 example" },
    ],
  },
  {
    id: "2",
    cells: [
      { id: "1", content: "Title 5 example" },
      { id: "2", content: "Title 6 example" },
      { id: "3", content: "Title 7 example" },
      { id: "4", content: "Title 8 example" },
    ],
  },
  {
    id: "3",
    cells: [
      { id: "1", content: "Title 9 example" },
      { id: "2", content: "Title 10 example" },
      { id: "3", content: "Title 11 example" },
      { id: "4", content: "Title 12 example" },
    ],
  },
];

const tableData: DataTableFormat = [
  {
    // New <tr> 1 **********
    id: "1",
    cells: [
      {
        id: "1",
        content: "Title 1 example",
        childRows: [
          {
            id: "1",
            cells: [
              { id: "2", content: "Title 2 example" },
              { id: "3", content: "Title 3 example" },
              { id: "4", content: "Title 4 example" },
            ],
          },
          {
            id: "3",
            cells: [
              // New <tr> 2 **********
              { id: "5", content: "Title 5 example" },
              { id: "6", content: "Title 6 example" },
              { id: "7", content: "Title 7 example" },
            ],
          },
          {
            id: "4",
            cells: [
              // New <tr> 3 **********
              { id: "8", content: "Title 8 example" },
              { id: "9", content: "Title 9 example" },
              { id: "10", content: "Title 10 example" },
            ],
          },
        ],
      },
    ],
  },
];

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const holyGrailData: DataTableFormat = [
  {
    // New <tr> 1 **********
    id: "1",
    cells: [
      {
        id: "1",
        content: "Title 1 example",
        childRows: [
          {
            id: "1",
            cells: [
              {
                id: "2",
                content: "Title 2 example",
                childRows: [
                  {
                    id: "3",
                    cells: [
                      {
                        id: "3",
                        content: "Title 3 example",
                        childRows: [
                          {
                            id: "4",
                            cells: [
                              {
                                id: "4",
                                content: "Title 4 example",
                              },
                            ],
                          },
                          {
                            // New <tr> 2 **********
                            id: "5",
                            cells: [
                              {
                                id: "5",
                                content: "Title 5 example",
                              },
                            ],
                          },
                          {
                            // New <tr> 3 **********
                            id: "6",
                            cells: [
                              {
                                id: "6",
                                content: "Title 6 example",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    // New <tr> 4 **********
                    id: "7",
                    cells: [
                      {
                        id: "7",
                        content: "Title 7 example",
                        childRows: [
                          {
                            id: "8",
                            cells: [{ id: "8", content: "Title 8 example" }],
                          },
                          {
                            // New <tr> 5 **********
                            id: "9",
                            cells: [{ id: "9", content: "Title 9 example" }],
                          },
                          {
                            // New <tr> 6 **********
                            id: "10",
                            cells: [{ id: "10", content: "Title 10 example" }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            // New <tr> 7 **********
            id: "11",
            cells: [
              { id: "11", content: "Title 11 example" },
              { id: "12", content: "Title 12 example" },
              { id: "13", content: "Title 13 example" },
            ],
          },
          {
            // New <tr> 8 **********
            id: "14",
            cells: [
              {
                id: "14",
                content: "Title 14 example",
                childRows: [
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
                            // New <tr> 9 **********
                            id: "17",
                            cells: [{ id: "17", content: "Title 17 example" }],
                          },
                          {
                            // New <tr> 10 **********
                            id: "18",
                            cells: [{ id: "18", content: "Title 18 example" }],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    // New <tr> 11 **********
                    id: "19",
                    cells: [
                      { id: "19", content: "Title 19 example" },
                      { id: "20", content: "Title 20 example" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    // New <tr> 12 **********
    id: "2",
    cells: [
      {
        id: "21",
        content: "Title 21 example",
        childRows: [
          {
            id: "22",
            cells: [
              {
                id: "22",
                content: "Title 22 example",
                childRows: [
                  {
                    id: "23",
                    cells: [
                      {
                        id: "23",
                        content: "Title 23 example",
                        childRows: [
                          {
                            id: "24",
                            cells: [{ id: "24", content: "Title 24 example" }],
                          },
                          {
                            // New <tr> 13 **********
                            id: "25",
                            cells: [{ id: "25", content: "Title 25 example" }],
                          },
                          {
                            // New <tr> 14 **********
                            id: "26",
                            cells: [{ id: "26", content: "Title 26 example" }],
                          },
                          {
                            // New <tr> 15 **********
                            id: "27",
                            cells: [{ id: "27", content: "Title 27 example" }],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    // New <tr> 16 **********
                    id: "28",
                    cells: [
                      {
                        id: "28",
                        content: "Title 28 example",
                        childRows: [
                          {
                            id: "29",
                            cells: [{ id: "29", content: "Title 29 example" }],
                          },
                          {
                            // New <tr> 17 **********
                            id: "30",
                            cells: [{ id: "30", content: "Title 30 example" }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            // New <tr> 18 **********
            id: "31",
            cells: [
              { id: "31", content: "Title 31 example" },
              { id: "32", content: "Title 32 example" },
              { id: "33", content: "Title 33 example" },
            ],
          },
        ],
      },
    ],
  },
];

function Buildup() {
  return (
    <table className="my-4 border">
      <tbody className="[&>tr>td]:border [&>tr>td]:border-gray-800">
        <tr>
          <td rowSpan={3}>Title 1 example</td>
          <td>Title 2 example</td>
          <td>Title 3 example</td>
          <td>Title 4 example</td>
        </tr>
        <tr>
          <td>Title 5 example</td>
          <td>Title 6 example</td>
          <td>Title 7 example</td>
        </tr>
        <tr>
          <td>Title 8 example</td>
          <td>Title 9 example</td>
          <td>Title 10 example</td>
        </tr>
      </tbody>
    </table>
  );
}

function HolyGrail() {
  return (
    <table className="my-4 border">
      <tbody className="[&>tr>td]:border [&>tr>td]:border-gray-800">
        <tr>
          <td rowSpan={11}>Title 1 example</td>
          <td rowSpan={6}>Title 2 example</td>
          <td rowSpan={3}>Title 3 example</td>
          <td rowSpan={1}>Title 4 example</td>
        </tr>
        <tr>
          <td rowSpan={1}>Title 5 example</td>
        </tr>
        <tr>
          <td rowSpan={1}>Title 6 example</td>
        </tr>
        <tr>
          <td rowSpan={3}>Title 7 example</td>
          <td rowSpan={1}>Title 8 example</td>
        </tr>
        <tr>
          <td rowSpan={1}>Title 9 example</td>
        </tr>
        <tr>
          <td rowSpan={1}>Title 10 example</td>
        </tr>
        <tr>
          <td rowSpan={1}>Title 11 example</td>
          <td rowSpan={1}>Title 12 example</td>
          <td rowSpan={1}>Title 13 example</td>
        </tr>
        <tr>
          <td rowSpan={4}>Title 14 example</td>
          <td rowSpan={3}>Title 15 example</td>
          <td rowSpan={1}>Title 16 example</td>
        </tr>
        <tr>
          <td rowSpan={1}>Title 17 example</td>
        </tr>
        <tr>
          <td rowSpan={1}>Title 18 example</td>
        </tr>
        <tr>
          <td rowSpan={1}>Title 19 example</td>
          <td rowSpan={1}>Title 20 example</td>
        </tr>
        <tr>
          <td rowSpan={7}>Title 21 example</td>
          <td rowSpan={6}>Title 22 example</td>
          <td rowSpan={4}>Title 23 example</td>
          <td rowSpan={1}>Title 24 example</td>
        </tr>
        <tr>
          <td rowSpan={1}>Title 25 example</td>
        </tr>
        <tr>
          <td rowSpan={1}>Title 26 example</td>
        </tr>
        <tr>
          <td rowSpan={1}>Title 27 example</td>
        </tr>
        <tr>
          <td rowSpan={2}>Title 28 example</td>
          <td rowSpan={1}>Title 29 example</td>
        </tr>
        <tr>
          <td rowSpan={1}>Title 30 example</td>
        </tr>
        <tr>
          <td rowSpan={1}>Title 31 example</td>
          <td rowSpan={1}>Title 32 example</td>
          <td rowSpan={1}>Title 33 example</td>
        </tr>
      </tbody>
    </table>
  );
}

function collectRows(
  rows: Row[],
  segment = 0
): { rows: Cell[]; updatedSegment: number } {
  const tableCells: Cell[] = [];
  let lastCellHasChildRows = true;

  rows.forEach((row) => {
    row.cells.forEach((cell, i) => {
      cell._rowSpan = calculateRowSpan(cell);
      if (!lastCellHasChildRows && i === 0) {
        segment += 1;
      }
      cell._segment = segment;

      tableCells.push(cell);
      if (cell.childRows) {
        const { rows: childRowCells, updatedSegment } = collectRows(
          cell.childRows,
          segment
        );
        tableCells.push(...childRowCells);
        segment = updatedSegment;
      }

      lastCellHasChildRows = Boolean(cell.childRows);
    });
  });
  return { rows: tableCells, updatedSegment: segment + 1 };
}

export default function Assays() {
  const { rows: data } = collectRows(holyGrailData);
  console.log(data);
  return (
    <>
      <div className="mb-4">
        <DataTable data={tableData} />
      </div>
      <Buildup />
      <HolyGrail />
    </>
  );
}
