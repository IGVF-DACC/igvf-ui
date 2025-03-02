// components
import { DataTable } from "../components/data-table";
// lib
import { type DataTableFormat } from "../lib/data-table";

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const tableData: DataTableFormat = [
  {
    id: "header",
    cells: [
      {
        id: "term-category",
        content: "Term Category",
      },
      {
        id: "assay",
        content: "Assay",
      },
      {
        id: "preferred-assay-title",
        content: "Preferred Assay Title",
      },
      {
        id: "0",
        content: "3D chromatin structure",
      },
      {
        id: "1",
        content: "chromatin accessibility",
      },
      {
        id: "2",
        content: "CRISPR screens",
      },
      {
        id: "3",
        content: "DNA binding",
      },
      {
        id: "4",
        content: "DNA methylation",
      },
      {
        id: "5",
        content: "gene expression",
      },
      {
        id: "6",
        content: "multiome",
      },
      {
        id: "7",
        content: "Protein characterization",
      },
      {
        id: "8",
        content: "Reporter",
      },
      {
        id: "9",
        content: "Grand Total",
      },
    ],
    isHeaderRow: true,
  },
  {
    id: "1",
    cells: [
      {
        id: "1",
        content: "3D chromatin structure",
        childRows: [
          {
            id: "3",
            cells: [
              {
                id: "2",
                content: "Hi-C assay",
                childRows: [
                  {
                    id: "4",
                    cells: [
                      {
                        id: "0",
                        content: "Hi-C",
                      },
                      {
                        id: "1",
                        content: "12",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "12",
                      },
                    ],
                  },
                  {
                    id: "5",
                    cells: [
                      {
                        id: "5",
                        content: "HiCAR",
                      },
                      {
                        id: "1",
                        content: "20",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "20",
                      },
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
    id: "3d-chromatin-structure-total",
    cells: [
      {
        id: "3d-chromatin-structure-total",
        content: "3D chromatin structure total",
        colSpan: 3,
      },
      {
        id: "1",
        content: "32",
      },
      {
        id: "2",
        content: "",
      },
      {
        id: "3",
        content: "",
      },
      {
        id: "4",
        content: "",
      },
      {
        id: "5",
        content: "",
      },
      {
        id: "6",
        content: "",
      },
      {
        id: "7",
        content: "",
      },
      {
        id: "8",
        content: "",
      },
      {
        id: "9",
        content: "",
      },
      {
        id: "10",
        content: "32",
      },
    ],
  },
  {
    id: "chromatin-accessibility",
    cells: [
      {
        id: "chromatin-accessibility",
        content: "Chromatin accessibility",
        childRows: [
          {
            id: "0",
            cells: [
              {
                id: "0",
                content:
                  "bulk assay for transposase-accessible chromatin using sequencing",
              },
              {
                id: "1",
                content: "ATAC-seq",
              },
              {
                id: "2",
                content: "",
              },
              {
                id: "3",
                content: "47",
              },
              {
                id: "4",
                content: "",
              },
              {
                id: "5",
                content: "",
              },
              {
                id: "6",
                content: "",
              },
              {
                id: "7",
                content: "",
              },
              {
                id: "8",
                content: "",
              },
              {
                id: "9",
                content: "",
              },
              {
                id: "10",
                content: "",
              },
              {
                id: "11",
                content: "47",
              },
            ],
          },
          {
            id: "1",
            cells: [
              {
                id: "0",
                content: "single-cell ATAC-seq",
                childRows: [
                  {
                    id: "0",
                    cells: [
                      {
                        id: "0",
                        content: "scATAC-seq",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "4",
                      },
                      {
                        id: "4",
                        content: "",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "4",
                      },
                    ],
                  },
                  {
                    id: "1",
                    cells: [
                      {
                        id: "0",
                        content: "SHARE-seq",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "401",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "401",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: "2",
            cells: [
              {
                id: "0",
                content: "single-nucleus ATAC-seq",
                childRows: [
                  {
                    id: "0",
                    cells: [
                      {
                        id: "0",
                        content: "10x multiome",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "75",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "75",
                      },
                    ],
                  },
                  {
                    id: "1",
                    cells: [
                      {
                        id: "0",
                        content: "10x multiome with MULTI-seq",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "59",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "59",
                      },
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
    id: "chromatin-accessibility-total",
    cells: [
      {
        id: "chromatin-accessibility-total",
        content: "chromatin accessibility Total",
        colSpan: 3,
      },
      {
        id: "2",
        content: "",
      },
      {
        id: "3",
        content: "51",
      },
      {
        id: "4",
        content: "",
      },
      {
        id: "5",
        content: "",
      },
      {
        id: "6",
        content: "",
      },
      {
        id: "7",
        content: "",
      },
      {
        id: "8",
        content: "535",
      },
      {
        id: "9",
        content: "",
      },
      {
        id: "10",
        content: "",
      },
      {
        id: "11",
        content: "586",
      },
    ],
  },
  {
    id: "crispr-screens",
    cells: [
      {
        id: "0",
        content: "CRISPR screens",
        childRows: [
          {
            id: "0",
            cells: [
              {
                id: "0",
                content: "in vitro CRISPR screen assay",
                childRows: [
                  {
                    id: "0",
                    cells: [
                      {
                        id: "0",
                        content: "CRISPR MACS screen",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "9",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "9",
                      },
                    ],
                  },
                  {
                    id: "1",
                    cells: [
                      {
                        id: "0",
                        content: "Growth CRISPR screen",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "4",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "4",
                      },
                    ],
                  },
                  {
                    id: "2",
                    cells: [
                      {
                        id: "0",
                        content: "Migration CRISPR screen",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "6",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "6",
                      },
                    ],
                  },
                  {
                    id: "3",
                    cells: [
                      {
                        id: "0",
                        content: "Parse SPLIT-seq",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "2",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "2",
                      },
                    ],
                  },
                  {
                    id: "4",
                    cells: [
                      {
                        id: "0",
                        content: "Proliferation CRISPR screen",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "38",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "38",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: "1",
            cells: [
              {
                id: "0",
                content: "in vitro CRISPRa screen using flow cytometry",
                childRows: [
                  {
                    id: "0",
                    cells: [
                      {
                        id: "0",
                        content: "CRISPR FACS screen",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "92",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "92",
                      },
                    ],
                  },
                  {
                    id: "1",
                    cells: [
                      {
                        id: "0",
                        content: "CRISPR FlowFISH screen",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "270",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "270",
                      },
                    ],
                  },
                  {
                    id: "2",
                    cells: [
                      {
                        id: "0",
                        content: "Variant-EFFECTS",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "489",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "489",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: "2",
            cells: [
              {
                id: "0",
                content: "in vitro CRISPR screen using single-cell RNA-seq",
                childRows: [
                  {
                    id: "0",
                    cells: [
                      {
                        id: "0",
                        content: "Perturb-seq",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "167",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "167",
                      },
                    ],
                  },
                  {
                    id: "1",
                    cells: [
                      {
                        id: "0",
                        content: "scCRISPR screen",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "8",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "8",
                      },
                    ],
                  },
                  {
                    id: "2",
                    cells: [
                      {
                        id: "0",
                        content: "TAP-seq",
                      },
                      {
                        id: "2",
                        content: "",
                      },
                      {
                        id: "3",
                        content: "",
                      },
                      {
                        id: "4",
                        content: "31",
                      },
                      {
                        id: "5",
                        content: "",
                      },
                      {
                        id: "6",
                        content: "",
                      },
                      {
                        id: "7",
                        content: "",
                      },
                      {
                        id: "8",
                        content: "",
                      },
                      {
                        id: "9",
                        content: "",
                      },
                      {
                        id: "10",
                        content: "",
                      },
                      {
                        id: "11",
                        content: "31",
                      },
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
    id: "chromatin-accessibility-total",
    cells: [
      {
        id: "chromatin-accessibility-total",
        content: "chromatin accessibility Total",
        colSpan: 3,
      },
      {
        id: "2",
        content: "",
      },
      {
        id: "3",
        content: "",
      },
      {
        id: "4",
        content: "1114",
      },
      {
        id: "5",
        content: "",
      },
      {
        id: "6",
        content: "2",
      },
      {
        id: "7",
        content: "",
      },
      {
        id: "8",
        content: "",
      },
      {
        id: "9",
        content: "",
      },
      {
        id: "10",
        content: "",
      },
      {
        id: "11",
        content: "1116",
      },
    ],
  },
];

export default function Assays() {
  return (
    <>
      <div className="mb-4">
        <DataTable data={tableData} />
      </div>
    </>
  );
}
