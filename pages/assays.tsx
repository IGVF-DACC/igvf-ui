// node_modules
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
// components
import { DataTable } from "../components/data-table";
import PagePreamble from "../components/page-preamble";
// lib
import { type Cell, type DataTableFormat, type Row } from "../lib/data-table";
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { abbreviateNumber, toShishkebabCase } from "../lib/general";
import { type ColumnMap, generateMatrixColumnMap } from "../lib/matrix";
// import { tableData } from "../lib/temp-assay-data";
// root
import type { MatrixResults, MatrixResultsObject } from "../globals";

/**
 * List of sample classifications that should be hidden from the matrix data.
 */
const hiddenClassifications = ["multiplexed sample", "pooled cell specimen"];

/**
 * The first three columns have fixed content that doesn't come from the matrix data.
 */
const fixedHeaderCells: Cell[] = [
  {
    id: "term-category",
    content: "Term Category",
    component: FixedHeaderCell,
    componentProps: { widthClasses: "w-[100px] @xl:w-[140px] @6xl:w-[160px]" },
    isHeaderCell: true,
  },
  {
    id: "assay",
    content: "Assay",
    component: FixedHeaderCell,
    componentProps: { widthClasses: "w-[140px] @xl:w-[200px] @6xl:w-[340px]" },
    isHeaderCell: true,
  },
  {
    id: "preferred-assay-title",
    content: "Preferred Assay Title",
    component: FixedHeaderCell,
    componentProps: { widthClasses: "w-[120px] @xl:w-[180px] @6xl:w-[200px]" },
    isHeaderCell: true,
  },
];

/**
 * Initially blank cell to hold the total count for each row.
 */
const totalCell: Cell = {
  id: "total",
  content: "Grand Total",
  component: CounterHeaderCell,
};

/**
 * Custom cell renderer for the three fixed header cells for Target Category, Assay, and Preferred.
 * @param widthClasses - Tailwind CSS classes to define the width of the cell
 */
function FixedHeaderCell({
  widthClasses,
  children,
}: {
  widthClasses: string;
  children: React.ReactNode;
}) {
  return (
    <th
      className={`bg-assay-summary-matrix-data-column-header sticky top-0 z-[2] border-b border-r border-panel p-2 text-left align-bottom last:border-r-0 ${widthClasses}`}
    >
      {children}
    </th>
  );
}

/**
 * Displays the vertical header cells for the data columns, using sideways text.
 */
function CounterHeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <th className="bg-assay-summary-matrix-data-column-header sticky top-0 z-[2] w-[50px] whitespace-nowrap border-b border-r border-panel px-1 py-2 align-bottom font-semibold text-black last:border-r-0">
      <div className="mx-auto inline-flex rotate-180 justify-self-center text-start text-black [writing-mode:vertical-lr] dark:text-white">
        {children}
      </div>
    </th>
  );
}

/**
 * Displays the data cells for the data columns, using a right-aligned number.
 */
function CounterCell({ children }: { children: React.ReactNode }) {
  return (
    <td
      className={`${
        children
          ? "bg-assay-summary-matrix-data-cell"
          : "bg-white dark:bg-black"
      } w-8 border-b border-r border-panel p-2 text-center align-middle last:border-r-0`}
      data-highlight
    >
      {children}
    </td>
  );
}

/**
 * Displays the total count for each row in the last column of the table.
 */
function TotalCell({ children }: { children: React.ReactNode }) {
  return (
    <td
      className="bg-assay-summary-matrix-total-cell w-8 border-b border-r border-panel p-2 text-center align-middle font-semibold last:border-r-0"
      data-highlight
    >
      {children}
    </td>
  );
}

/**
 * Displays the row header cells for the Target Category, Assay, and Preferred Assay Title columns.
 * @param rowSpan - Number of rows that the cell should span
 */
function RowHeaderCell({
  rowSpan,
  children,
}: {
  rowSpan: number;
  children: React.ReactNode;
}) {
  return (
    <th
      className="border-b border-r border-panel bg-white p-2 text-left align-top font-normal last:border-r-0 dark:bg-black"
      {...(rowSpan > 1 ? { rowSpan } : {})}
    >
      {children}
    </th>
  );
}

/**
 * Displays the header cell for the Preferred Assay Title column. This includes a hover highlight
 * data attribute.
 * @param rowSpan - Number of rows that the cell should span; for now always 1
 */
function PreferredAssayHeaderCell({
  rowSpan,
  children,
}: {
  rowSpan: number;
  children: React.ReactNode;
}) {
  return (
    <th
      className="border-b border-r border-panel bg-white p-2 text-left align-top font-normal last:border-r-0 dark:bg-black"
      {...(rowSpan > 1 ? { rowSpan } : {})}
      data-highlight
    >
      {children}
    </th>
  );
}

/**
 * Displays the header cell for the Term Category Total row.
 */
function TermCategoryTotalsHeaderCell({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <td
      className="bg-assay-summary-matrix-term-category-total border-b border-r border-panel px-2 py-1 text-left align-middle font-semibold last:border-r-0"
      {...(colSpan > 1 ? { colSpan } : {})}
    >
      {children}
    </td>
  );
}

/**
 * Displays the data cell for the Term Category Total rows.
 */
function TermCategoryTotalsDataCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="bg-assay-summary-matrix-term-category-total w-8 border-b border-r border-panel px-2 py-1 text-center align-middle font-semibold last:border-r-0">
      {children}
    </td>
  );
}

/**
 * Generate the header row for the data table. The leftmost columns are fixed and don't come from
 * the matrix data. The rest of the columns are dynamic and come from the x axis of the matrix
 * data. The last column holds the total count of the dynamic columns in the row.
 * @param columnMap Maps column labels to their 0-based column index in the matrix
 * @returns Data table header row
 */
function generateHeaderRow(columnMap: ColumnMap): Row {
  const dynamicHeaderCells = Object.keys(columnMap).map((key) => ({
    id: toShishkebabCase(key),
    content: key,
    component: CounterHeaderCell,
  }));
  const headerCells = fixedHeaderCells
    .concat(dynamicHeaderCells)
    .concat(totalCell);
  return {
    id: "header",
    cells: headerCells,
    isHeaderRow: true,
  };
}

/**
 * Convert the matrix data to a format that can be used by the `<DataTable>` component.
 * @param matrix `matrix` property from the matrix results object
 * @returns Corresponding data in `DataTableFormat` format
 */
function convertMatrixToDataTable(
  matrix: MatrixResultsObject
): DataTableFormat {
  const xProp = matrix.x.group_by as string;
  const [yProp0, yProp1, yProp2] = matrix.y.group_by as string[];
  const columnMap = generateMatrixColumnMap(
    matrix.x[xProp].buckets,
    hiddenClassifications
  );

  // Generate the data rows for the table, one row with child rows for each term category. Use a
  // `forEach` loop instead of `map` so we can insert total-count rows after each term category row.
  const dataRows = [];
  matrix.y[yProp0].buckets.forEach((bucket0) => {
    const columnTotals = Array(Object.keys(columnMap).length + 1).fill(0);

    // Generate the term category header cell for the row.
    const termCategoryCell: Cell = {
      id: toShishkebabCase(bucket0.key),
      content: bucket0.key,
      component: RowHeaderCell,
    };

    // Generate the assay child rows for the term category row
    const assayRows = bucket0[yProp1].buckets.map((bucket1) => {
      // Generate the assay cell for the row.
      const assayCell: Cell = {
        id: toShishkebabCase(bucket1.key),
        content: bucket1.key,
        component: RowHeaderCell,
      };

      // Generate the preferred assay title child rows for the assay row.
      const preferredAssayRows = bucket1[yProp2].buckets.map((bucket2) => {
        const preferredAssayCell: Cell = {
          id: `toShishkebabCase(bucket2.key)`,
          content: bucket2.key,
          component: PreferredAssayHeaderCell,
        };

        // Initialize the data cells with empty content, and add a last Total cell.
        const dataCells = Array(Object.keys(columnMap).length + 1).fill({});
        Object.entries(columnMap).forEach(([key, value]) => {
          dataCells[value] = {
            id: toShishkebabCase(key),
            content: "",
            component: CounterCell,
          };
        });

        // Fill in the data cells with the actual data from the matrix.
        let rowTotal = 0;
        bucket2[xProp].buckets.forEach((bucket) => {
          const columnIndex = columnMap[bucket.key];
          if (columnIndex !== undefined) {
            dataCells[columnIndex] = {
              id: toShishkebabCase(bucket.key),
              content: abbreviateNumber(bucket.doc_count),
              component: CounterCell,
            };

            // Update the totals for the row and column.
            rowTotal += bucket.doc_count;
            columnTotals[columnIndex] += bucket.doc_count;
          }
        });

        // Add the row total cell to the end of the data cells. Add the row totals to the column
        // for the row totals.
        dataCells[dataCells.length - 1] = {
          id: "total",
          content: abbreviateNumber(rowTotal),
          component: TotalCell,
        };
        columnTotals[dataCells.length - 1] += rowTotal;

        // Compose the preferred assay title row with its data cells.
        return {
          id: `row-${bucket0.key}-${bucket1.key}-${bucket2.key}`,
          cells: [preferredAssayCell].concat(dataCells),
        } as Row;
      });

      // Add the preferred assay title child rows to the assay header cell.
      assayCell.childRows = preferredAssayRows;

      // Generate the assay row.
      return {
        id: `row-${bucket0.key}-${bucket1.key}`,
        cells: [assayCell],
      } as Row;
    });

    // Add the assay child rows to the term category header cell.
    termCategoryCell.childRows = assayRows;

    // Generate the term category row.
    const termCategoryKey = toShishkebabCase(bucket0.key);
    dataRows.push({
      id: `row-${termCategoryKey}`,
      cells: [termCategoryCell],
    } as Row);

    // Generate the cell for the term category totals row.
    const termCategoryHeaderCell: Cell = {
      id: `term-category-header-${termCategoryKey}`,
      content: `${bucket0.key} Total`,
      component: TermCategoryTotalsHeaderCell,
      colSpan: fixedHeaderCells.length,
    };

    // Generate the total cells for the term category row.
    const totalCells = columnTotals.map((total, i) => ({
      id: `total-${termCategoryKey}-${i}`,
      content: total ? abbreviateNumber(total) : "",
      component: TermCategoryTotalsDataCell,
    }));

    // Push the term category totals row to the data rows.
    dataRows.push({
      id: `row-${bucket0.key}-total`,
      cells: [termCategoryHeaderCell].concat(totalCells),
    });
  });

  // Generate the header row and combine it with the data rows.
  const headerRow = generateHeaderRow(columnMap);
  return [headerRow].concat(dataRows);
}

/**
 * Main component for the Assay Summary page.
 */
export default function AssaySummary({
  assaySummary,
}: {
  assaySummary: MatrixResultsObject;
}) {
  const assayTableData = convertMatrixToDataTable(assaySummary);

  return (
    <div className="@container">
      <PagePreamble pageTitle="Assays" />
      <div
        id="assay-summary-table"
        role="table"
        className="overflow-x-auto text-xs"
      >
        <DataTable data={assayTableData} />
      </div>
    </div>
  );
}

interface Props {
  assaySummary: MatrixResultsObject;
  pageContext: {
    title: string;
  };
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Props>> {
  const { req, query } = context;

  // Convert the query parameters to a URL query string to append to the backend request.
  const params = new URLSearchParams();
  for (const key in query) {
    const value = query[key];
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.append(key, value);
    }
  }

  // Add any extra query parameters to the request.
  const extraQueryParams = params.toString();
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const results = (
    await request.getObject(
      `/omnimatrix/?type=MeasurementSet&config=AssaySummary${
        extraQueryParams ? `&${extraQueryParams}` : ""
      }`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(results)) {
    const assaySummary = results as unknown as MatrixResults;
    return {
      props: {
        assaySummary: assaySummary.matrix,
        pageContext: { title: "Assay Summary" },
      },
    };
  }
  return errorObjectToProps(results) as GetServerSidePropsResult<Props>;
}
