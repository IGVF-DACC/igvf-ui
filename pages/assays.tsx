// components
import { DataTable } from "../components/data-table";
import PagePreamble from "../components/page-preamble";
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
        component: TitleHeaderCell,
      },
      {
        id: "assay",
        content: "Assay",
        component: TitleHeaderCell,
      },
      {
        id: "preferred-assay-title",
        content: "Preferred Assay Title",
        component: TitleHeaderCell,
      },
      {
        id: "0",
        content: "3D chromatin structure",
        component: CounterHeaderCell,
      },
      {
        id: "1",
        content: "chromatin accessibility",
        component: CounterHeaderCell,
      },
      {
        id: "2",
        content: "CRISPR screens",
        component: CounterHeaderCell,
      },
      {
        id: "3",
        content: "DNA binding",
        component: CounterHeaderCell,
      },
      {
        id: "4",
        content: "DNA methylation",
        component: CounterHeaderCell,
      },
      {
        id: "5",
        content: "gene expression",
        component: CounterHeaderCell,
      },
      {
        id: "6",
        content: "multiome",
        component: CounterHeaderCell,
      },
      {
        id: "7",
        content: "Protein characterization",
        component: CounterHeaderCell,
      },
      {
        id: "8",
        content: "Reporter",
        component: CounterHeaderCell,
      },
      {
        id: "9",
        content: "Grand Total",
        component: CounterHeaderCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "2",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "12",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "2",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "20",
                        component: CounterCell,
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
        component: TotalCell,
      },
      {
        id: "1",
        content: "32",
        component: TotalCounterCell,
      },
      {
        id: "2",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "3",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "4",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "5",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "6",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "7",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "8",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "9",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "10",
        content: "32",
        component: TotalCounterCell,
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
                component: CounterCell,
              },
              {
                id: "3",
                content: "47",
                component: CounterCell,
              },
              {
                id: "4",
                content: "",
                component: CounterCell,
              },
              {
                id: "5",
                content: "",
                component: CounterCell,
              },
              {
                id: "6",
                content: "",
                component: CounterCell,
              },
              {
                id: "7",
                content: "",
                component: CounterCell,
              },
              {
                id: "8",
                content: "",
                component: CounterCell,
              },
              {
                id: "9",
                content: "",
                component: CounterCell,
              },
              {
                id: "10",
                content: "",
                component: CounterCell,
              },
              {
                id: "11",
                content: "47",
                component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "4",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "4",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "401",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "401",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "75",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "75",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "59",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "59",
                        component: CounterCell,
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
        component: TotalCell,
        colSpan: 3,
      },
      {
        id: "2",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "3",
        content: "51",
        component: TotalCounterCell,
      },
      {
        id: "4",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "5",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "6",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "7",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "8",
        content: "535",
        component: TotalCounterCell,
      },
      {
        id: "9",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "10",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "11",
        content: "586",
        component: TotalCounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "9",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "9",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "4",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "4",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "6",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "6",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "2",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "2",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "38",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "38",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "92",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "92",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "270",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "270",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "489",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "489",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "167",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "167",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "8",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "8",
                        component: CounterCell,
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
                        component: CounterCell,
                      },
                      {
                        id: "3",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "4",
                        content: "31",
                        component: CounterCell,
                      },
                      {
                        id: "5",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "6",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "7",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "8",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "9",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "10",
                        content: "",
                        component: CounterCell,
                      },
                      {
                        id: "11",
                        content: "31",
                        component: CounterCell,
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
        component: TotalCell,
        colSpan: 3,
      },
      {
        id: "2",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "3",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "4",
        content: "1114",
        component: TotalCounterCell,
      },
      {
        id: "5",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "6",
        content: "2",
        component: TotalCounterCell,
      },
      {
        id: "7",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "8",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "9",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "10",
        content: "",
        component: TotalCounterCell,
      },
      {
        id: "11",
        content: "1116",
        component: TotalCounterCell,
      },
    ],
  },
];

function TitleHeaderCell({ children }: { children: string }) {
  return (
    <th className="sticky top-0 z-[2] border-b border-r border-panel bg-[#e0e4eb] p-2 text-left align-bottom font-bold">
      {children}
    </th>
  );
}

function CounterHeaderCell({ children }: { children: string }) {
  return (
    <th className="sticky top-0 z-[2] w-[40px] rotate-180 whitespace-nowrap border-b border-r border-panel bg-[#8392b0] px-1 py-2 text-left font-semibold text-white [writing-mode:vertical-lr]">
      {children}
    </th>
  );
}

function CounterCell({ children }: { children: string }) {
  return (
    <td className="min-w-8 border-b border-r border-panel bg-table-data-cell p-2 text-right align-top last:border-r-0">
      {children}
    </td>
  );
}

function TotalCell({
  rowSpan,
  colSpan,
  children,
}: {
  rowSpan: number;
  colSpan: number;
  children: string;
}) {
  return (
    <td
      className="min-w-40 border-b border-r border-panel bg-[#e0e4eb] p-2 align-top last:border-r-0"
      {...(rowSpan > 1 ? { rowSpan } : {})}
      {...(colSpan > 1 ? { colSpan } : {})}
    >
      {children}
    </td>
  );
}

function TotalCounterCell({
  rowSpan,
  colSpan,
  children,
}: {
  rowSpan: number;
  colSpan: number;
  children: string;
}) {
  return (
    <td
      className="min-w-8 border-b border-r border-panel bg-[#e0e4eb] p-2 text-right align-top last:border-r-0"
      {...(rowSpan > 1 ? { rowSpan } : {})}
      {...(colSpan > 1 ? { colSpan } : {})}
    >
      {children}
    </td>
  );
}

export default function Assays() {
  return (
    <div>
      <PagePreamble pageTitle="Assays" />
      <div role="table" className="overflow-x-auto text-xs">
        <DataTable data={tableData} />
      </div>
    </div>
  );
}
