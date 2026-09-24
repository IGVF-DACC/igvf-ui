// node_modules
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
import { useContext } from "react";
// components
import { AnnotatedValue } from "../components/annotated-value";
import { DataTable } from "../components/data-table";
import { LinkedTableCell } from "../components/matrix";
import PagePreamble from "../components/page-preamble";
import SessionContext from "../components/session-context";
// lib
import {
  createCell,
  type Cell,
  type DataTableFormat,
  type Row,
} from "../lib/data-table";
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import {
  abbreviateNumber,
  arbitraryTypeToText,
  toShishkebabCase,
} from "../lib/general";
import {
  generateEmptyRowCells,
  generateMatrixColumnMap,
  getMatrixAxisGroups,
  getMatrixBuckets,
  isMatrixResultsObject,
  type ColumnMap,
  type MatrixResults,
  type MatrixResultsObject,
} from "../lib/matrix";
import { type PageProps } from "../lib/next-js";
import {
  getAssayTitleDescriptionMap,
  getPreferredAssayTitleDescriptionMap,
} from "../lib/ontology-terms";
import { encodeUriElement } from "../lib/query-encoding";
// root
import type { Profiles } from "../globals";

/**
 * Base query string for the Assay Summary page.
 */
const BASE_PAGE_QUERY = "type=MeasurementSet&status=released";

/**
 * Props for the Assay Summary page component from getServerSideProps. This doesn't extend
 * `PageProps` because this page doesn't use many of its properties.
 *
 * @property assaySummary - The matrix results object for the assay summary.
 * @property assayTitleDescriptionMap - A mapping of assay titles to their descriptions.
 * @property pageQuery - The base query string used for the page.
 * @property pageContext - Contextual information for the page, including the title.
 */
interface Props extends PageProps {
  assaySummary: MatrixResultsObject;
  assayTitleDescriptionMap: Record<string, string>;
  pageQuery: string;
}

type AssayTableMeta = {
  assayTitleDescriptionMap: Record<string, string>;
  preferredAssayTitleDescriptionMap: Record<string, string>;
  pageQuery: string;
};

/**
 * List of sample classifications that should be hidden from the matrix data.
 */
const hiddenClassifications = ["multiplexed sample", "pooled cell specimen"];

/**
 * Responsive width and maximum width for the Assay column.
 */
const assayColumnWidthClasses =
  "w-[140px] max-w-[140px] @xl:w-[200px] @xl:max-w-[200px] @6xl:w-[340px] @6xl:max-w-[340px]";

/**
 * The first three columns have fixed content that doesn't come from the matrix data.
 */
const fixedHeaderCells: Cell[] = [
  createCell({
    id: "term-category",
    content: "Term Category",
    component: FixedHeaderCell,
    componentProps: { widthClasses: "w-[100px] @xl:w-[140px] @6xl:w-[160px]" },
    isHeaderCell: true,
  }),
  createCell({
    id: "assay",
    content: "Assay",
    component: FixedHeaderCell,
    componentProps: { widthClasses: assayColumnWidthClasses },
    isHeaderCell: true,
  }),
  createCell({
    id: "preferred-assay-title",
    content: "Preferred Assay Title",
    component: FixedHeaderCell,
    componentProps: { widthClasses: "w-[120px] @xl:w-[180px] @6xl:w-[200px]" },
    isHeaderCell: true,
  }),
];

/**
 * Initially blank cell to hold the total count for each row.
 */
const totalCell: Cell = {
  id: "total",
  content: "Grand Total",
  component: CounterHeaderCell,
  componentProps: {
    isTotalCell: true,
  },
};

/**
 * Main component for the Assay Summary page.
 */
export default function AssaySummary({
  assaySummary,
  assayTitleDescriptionMap,
  pageQuery,
}: Props) {
  const sessionContext = useContext(SessionContext);
  const preferredAssayTitleDescriptionMap =
    sessionContext && "profiles" in sessionContext
      ? getPreferredAssayTitleDescriptionMap(
          sessionContext.profiles as Profiles
        )
      : {};

  const assayTableData = convertMatrixToDataTable(assaySummary);

  return (
    <div className="@container">
      <PagePreamble />
      <div
        id="assay-summary-table"
        role="table"
        className="overflow-x-auto text-xs"
      >
        <DataTable<AssayTableMeta>
          data={assayTableData}
          meta={{
            assayTitleDescriptionMap,
            preferredAssayTitleDescriptionMap,
            pageQuery,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Custom cell renderer for the three fixed header cells for Target Category, Assay, and Preferred.
 *
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
      className={`bg-assay-summary-matrix-data-column-header border-panel sticky top-0 z-2 border-r border-b p-2 text-left align-bottom last:border-r-0 ${widthClasses}`}
    >
      {children}
    </th>
  );
}

/**
 * Displays the vertical header cells for the data columns, using sideways text.
 */
function CounterHeaderCell({
  isTotalCell,
  meta,
  children,
}: {
  isTotalCell: boolean;
  meta?: AssayTableMeta;
  children: string;
}) {
  if (isTotalCell) {
    // This header cell shows the grand total, so it shouldn't link to a search.
    return (
      <th className="bg-assay-summary-matrix-data-column-header border-panel sticky top-0 z-2 w-12.5 border-r border-b px-1 py-2 align-bottom font-semibold whitespace-nowrap text-black last:border-r-0">
        <div className="mx-auto inline-flex rotate-180 justify-self-center text-start text-black [writing-mode:vertical-lr] dark:text-white">
          {children}
        </div>
      </th>
    );
  }

  // Not a cell that shows the grand total, so it should link to a corresponding search.
  return (
    <LinkedTableCell
      href={`/search/?${meta.pageQuery}&samples.classifications=${encodeUriElement(children)}`}
      as="th"
      className="bg-assay-summary-matrix-data-column-header border-panel sticky top-0 z-2 w-12.5 border-r border-b px-1 py-2 align-bottom font-semibold whitespace-nowrap text-black last:border-r-0"
    >
      <div className="mx-auto inline-flex rotate-180 justify-self-center text-start text-black [writing-mode:vertical-lr] dark:text-white">
        {children}
      </div>
    </LinkedTableCell>
  );
}

/**
 * Displays the data cells for the data columns, using a right-aligned number.
 */
function CounterCell({
  assaySlims,
  assayTerms,
  preferredAssay,
  samplesClassification,
  children,
}: {
  assaySlims: string;
  assayTerms: string;
  preferredAssay: string;
  samplesClassification: string;
  children: string;
}) {
  if (children) {
    return (
      <LinkedTableCell
        href={`/search/?${BASE_PAGE_QUERY}&assay_term.assay_slims=${encodeUriElement(assaySlims)}&assay_term.term_name=${encodeUriElement(assayTerms)}&preferred_assay_titles=${encodeUriElement(preferredAssay)}&samples.classifications=${encodeUriElement(samplesClassification)}`}
        className={`${
          children
            ? "bg-assay-summary-matrix-data-cell"
            : "bg-white dark:bg-black"
        } border-panel w-8 border-r border-b p-2 text-center align-middle last:border-r-0`}
        data-highlight
      >
        {children}
      </LinkedTableCell>
    );
  }

  return (
    <td
      className={`${
        children
          ? "bg-assay-summary-matrix-data-cell"
          : "bg-white dark:bg-black"
      } border-panel w-8 border-r border-b p-2 text-center align-middle last:border-r-0`}
    >
      {children}
    </td>
  );
}

/**
 * Displays the total count for each row in the last column of the table.
 */
function TotalCell({
  assaySlims,
  assayTerms,
  preferredAssay,
  children,
}: {
  assaySlims: string;
  assayTerms: string;
  preferredAssay: string;
  children: string;
}) {
  return (
    <LinkedTableCell
      href={`/search/?${BASE_PAGE_QUERY}&assay_term.assay_slims=${encodeUriElement(assaySlims)}&assay_term.term_name=${encodeUriElement(assayTerms)}&preferred_assay_titles=${encodeUriElement(preferredAssay)}`}
      className="bg-assay-summary-matrix-total-cell border-panel w-8 border-r border-b p-2 text-center align-middle font-semibold last:border-r-0"
      data-highlight
    >
      {children}
    </LinkedTableCell>
  );
}

/**
 * Displays the row header cells for the Target Category, Assay, and Preferred Assay Title columns.
 *
 * @param rowSpan - Number of rows that the cell should span
 */
function RowHeaderCell({
  rowSpan,
  children,
}: {
  rowSpan: number;
  children: string;
}) {
  return (
    <LinkedTableCell
      href={`/search/?${BASE_PAGE_QUERY}&assay_term.assay_slims=${encodeUriElement(children)}`}
      className="border-panel border-r border-b bg-white p-2 text-left align-top font-normal last:border-r-0 dark:bg-black"
      as="th"
      {...(rowSpan > 1 ? { rowSpan } : {})}
    >
      {children}
    </LinkedTableCell>
  );
}

/**
 * Displays the assay title cell with a tooltip for the corresponding definition, if any.
 *
 * @param rowSpan - Number of rows that the cell should span
 * @param meta - Contains the Assay title to definition map
 */
function AssayCell({
  rowSpan,
  assaySlims,
  meta,
  children,
}: {
  rowSpan: number;
  assaySlims: string;
  meta?: AssayTableMeta;
  children: string;
}) {
  // Convert children to assayTitle regardless of type, and use that to get the corresponding
  // definition.
  const assayTitle = arbitraryTypeToText(children);

  return (
    <LinkedTableCell
      href={`/search/?${BASE_PAGE_QUERY}&assay_term.assay_slims=${encodeUriElement(assaySlims)}&assay_term.term_name=${encodeUriElement(children)}`}
      className={`${assayColumnWidthClasses} border-panel border-r border-b bg-white p-2 text-left align-top font-normal last:border-r-0 dark:bg-black [&>a]:wrap-break-word [&>a]:whitespace-normal`}
      as="th"
      {...(rowSpan > 1 ? { rowSpan } : {})}
    >
      <AnnotatedValue
        className="relative z-1"
        externalAnnotations={meta?.assayTitleDescriptionMap}
      >
        {assayTitle}
      </AnnotatedValue>
    </LinkedTableCell>
  );
}

/**
 * Displays the header cell for the Preferred Assay Title column. This includes a hover highlight
 * data attribute.
 *
 * @param rowSpan - Number of rows that the cell should span; for now always 1
 * @param meta - Contains the preferred assay title to description map
 */
function PreferredAssayHeaderCell({
  rowSpan,
  assaySlims,
  assayTerms,
  meta,
  children,
}: {
  rowSpan: number;
  assaySlims: string;
  assayTerms: string;
  meta?: AssayTableMeta;
  children: string;
}) {
  const preferredAssayTitle = arbitraryTypeToText(children);

  return (
    <LinkedTableCell
      href={`/search/?${BASE_PAGE_QUERY}&assay_term.assay_slims=${encodeUriElement(assaySlims)}&assay_term.term_name=${encodeUriElement(assayTerms)}&preferred_assay_titles=${encodeUriElement(children)}`}
      className="border-panel border-r border-b bg-white p-2 text-left align-top font-normal last:border-r-0 dark:bg-black"
      {...(rowSpan > 1 ? { rowSpan } : {})}
      data-highlight
    >
      <AnnotatedValue
        className="relative z-1"
        externalAnnotations={meta?.preferredAssayTitleDescriptionMap}
      >
        {preferredAssayTitle}
      </AnnotatedValue>
    </LinkedTableCell>
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
      className="bg-assay-summary-matrix-term-category-total border-panel border-r border-b px-2 py-1 text-left align-middle font-semibold last:border-r-0"
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
    <td className="bg-assay-summary-matrix-term-category-total border-panel w-8 border-r border-b px-2 py-1 text-center align-middle font-semibold last:border-r-0">
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
    id: `counter-${toShishkebabCase(key)}`,
    content: key,
    component: CounterHeaderCell,
    componentProps: {
      isTotalCell: false,
    },
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
  const [xProp] = getMatrixAxisGroups(matrix.x);
  const [yProp0, yProp1, yProp2] = getMatrixAxisGroups(matrix.y);
  if (!xProp || !yProp0 || !yProp1 || !yProp2) {
    throw new Error("Assay summary matrix has unexpected axis groups");
  }

  const columnBuckets = getMatrixBuckets(matrix.x, xProp);
  const columnMap = generateMatrixColumnMap(
    columnBuckets,
    hiddenClassifications
  );

  // Generate the data rows for the table, one row with child rows for each term category. Use a
  // `forEach` loop instead of `map` so we can insert total-count rows after each term category row.
  const dataRows = [];
  const termCategoryBuckets = getMatrixBuckets(matrix.y, yProp0);
  termCategoryBuckets.forEach((bucket0) => {
    const columnTotals = Array(Object.keys(columnMap).length + 1).fill(0);

    // Generate the term category header cell for the row.
    const termCategoryCell: Cell = {
      id: `term-category-${toShishkebabCase(bucket0.key)}`,
      content: bucket0.key,
      component: RowHeaderCell,
    };

    // Generate the assay child rows for the term category row
    const assayRows = getMatrixBuckets(bucket0, yProp1).map((bucket1) => {
      // Generate the assay cell for the row.
      const assayCell: Cell = {
        id: `assay-${toShishkebabCase(bucket1.key)}`,
        content: bucket1.key,
        component: AssayCell,
        componentProps: {
          assaySlims: bucket0.key,
        },
      };

      // Generate the preferred assay title child rows for the assay row.
      const preferredAssayRows = getMatrixBuckets(bucket1, yProp2).map(
        (bucket2) => {
          const preferredAssayCell: Cell = {
            id: `preferred-assay-${toShishkebabCase(bucket2.key)}`,
            content: bucket2.key,
            component: PreferredAssayHeaderCell,
            componentProps: {
              assaySlims: bucket0.key,
              assayTerms: bucket1.key,
            },
          };

          // Initialize the data cells with empty content, and add a last Total cell.
          const dataCells = generateEmptyRowCells(
            Object.keys(columnMap).length + 1
          );
          Object.entries(columnMap).forEach(([key, value]) => {
            dataCells[value] = {
              id: toShishkebabCase(key),
              content: "",
              component: CounterCell,
            };
          });

          // Fill in the data cells with the actual data from the matrix.
          let rowTotal = 0;
          getMatrixBuckets(bucket2, xProp).forEach((bucket) => {
            const columnIndex = columnMap[bucket.key];
            if (columnIndex !== undefined) {
              dataCells[columnIndex] = {
                id: `counter-${toShishkebabCase(bucket.key)}`,
                content: abbreviateNumber(bucket.doc_count),
                component: CounterCell,
                componentProps: {
                  assaySlims: bucket0.key,
                  assayTerms: bucket1.key,
                  preferredAssay: bucket2.key,
                  samplesClassification: bucket.key,
                },
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
            componentProps: {
              assaySlims: bucket0.key,
              assayTerms: bucket1.key,
              preferredAssay: bucket2.key,
            },
          };
          columnTotals[dataCells.length - 1] += rowTotal;

          // Compose the preferred assay title row with its data cells.
          return {
            id: `row-${bucket0.key}-${bucket1.key}-${bucket2.key}`,
            cells: [preferredAssayCell].concat(dataCells),
          } as Row;
        }
      );

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
 * Get a list of unique assay term names from the assay summary matrix.
 * @param assaySummary Assay matrix data
 * @returns All unique assay term names found in the assay matrix
 */
function getAssayTerms(assaySummary: MatrixResultsObject): string[] {
  const terms = new Set<string>();
  const [slimsProp, termNameProp] = getMatrixAxisGroups(assaySummary.y);
  if (slimsProp && termNameProp) {
    getMatrixBuckets(assaySummary.y, slimsProp).forEach((bucket) => {
      getMatrixBuckets(bucket, termNameProp).forEach((termBucket) => {
        terms.add(termBucket.key);
      });
    });
  }
  return [...terms];
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
  const assaySummary = (
    await request.getObject<MatrixResults>(
      `/matrix/?${BASE_PAGE_QUERY}&config=AssaySummary${
        extraQueryParams ? `&${extraQueryParams}` : ""
      }`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(assaySummary)) {
    if (!isMatrixResultsObject(assaySummary)) {
      throw new Error("Unexpected response shape for assay summary data");
    }

    // Get the mapping of assay terms to their titles and descriptions.
    const assayTerms = getAssayTerms(assaySummary.matrix);
    const assayTitleDescriptionMap = await getAssayTitleDescriptionMap(
      assayTerms,
      request
    );

    return {
      props: {
        assaySummary: assaySummary.matrix,
        assayTitleDescriptionMap,
        pageQuery: `${BASE_PAGE_QUERY}${extraQueryParams ? `&${extraQueryParams}` : ""}`,
        pageContext: { title: "Assay Summary" },
        isJson: false,
      },
    };
  }
  return errorObjectToProps(assaySummary);
}
