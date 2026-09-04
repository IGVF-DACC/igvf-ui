// node_modules
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
import { useContext } from "react";
// components
import { AnnotatedValue } from "../components/annotated-value";
import { DataTable } from "../components/data-table";
import Link from "../components/link-no-prefetch";
import { LabelXAxis, LabelYAxis, LinkedTableCell } from "../components/matrix";
import NoCollectionData from "../components/no-collection-data";
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
import { toShishkebabCase } from "../lib/general";
import { getPreferredAssayTitleDescriptionMap } from "../lib/ontology-terms";
import { encodeUriElement } from "../lib/query-encoding";
import {
  generateEmptyRowCells,
  generateMatrixColumnMap,
  getMatrixBuckets,
  getMatrixAxisGroups,
  type ColumnMap,
  type MatrixBucket,
  type MatrixResults,
  type MatrixResultsObject,
} from "../lib/matrix";
import { type PageProps } from "../lib/next-js";

/**
 * Props for the DifferentiationSeries page component.
 */
interface DifferentiationSeriesProps extends PageProps {
  matrix: MatrixResultsObject;
}

/**
 * Classification of cell specimens as indicated in the matrix data.
 */
type Classification =
  "differentiated cell specimen" | "reprogrammed cell specimen";

/**
 * Main component for rendering the cell fates data table.
 *
 * @param matrix - The matrix results object containing the data to be displayed
 */
export default function DifferentiationSeries({
  matrix,
}: DifferentiationSeriesProps) {
  const dataGrid = convertMatrixToDataGrid(matrix);

  if (dataGrid.length === 0) {
    return (
      <>
        <PagePreamble />
        <NoCollectionData pageTitle="cell fates" />
      </>
    );
  }

  return (
    <div>
      <PagePreamble />
      <p className="my-4">
        This table displays samples from differentiated and reprogrammed cell
        specimens. You can also explore a{" "}
        <Link href="/search/?type=AnalysisSet&samples.classifications=*&advancedQuery=samples.classifications:(%22multiplexed+sample%22+AND+%22differentiated+cell+specimen%22)+OR+samples.classifications:(%22multiplexed+sample%22+AND+%22reprogrammed+cell+specimen%22)">
          list of multiplexed samples
        </Link>
        .
      </p>
      <div className="mt-4">
        <LabelXAxis label={matrix.x.label} />
        <div className="flex">
          <LabelYAxis label={matrix.y.label} />
          <div
            role="table"
            className="border-panel mb-8 grid w-max auto-rows-min gap-px overflow-x-auto border bg-gray-400 text-sm dark:bg-gray-600 dark:outline-gray-700"
          >
            <DataTable className="table-row-hl" data={dataGrid} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Custom cell renderer for the three fixed header cells for Target Category, Assay, and Preferred.
 */
export function MatrixXAxisCornerCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="bg-table-data-cell border-matrix-lines sticky top-0 z-2 border-r border-b px-2 py-1 text-left align-bottom last:border-r-0">
      {children}
    </th>
  );
}

/**
 * Displays the vertical header cells for the data columns, using sideways text.
 */
function MatrixXAxisHeaderCell({
  children,
}: {
  children: string | number | React.ReactNode;
}) {
  if (typeof children !== "string") {
    throw new TypeError("Matrix X-axis header content must be a string");
  }

  const assay = children;
  const { profiles } = useContext(SessionContext);
  const preferredAssayTitleDescriptionMap =
    getPreferredAssayTitleDescriptionMap(profiles);
  const assayQuery = `preferred_assay_titles=${encodeUriElement(assay)}`;
  const href = `/search/?type=AnalysisSet&samples.classifications!=multiplexed+sample&file_set_type=principal+analysis&${assayQuery}`;

  return (
    <LinkedTableCell
      href={href}
      className="bg-matrix-header sticky top-0 z-2 w-8 min-w-8 align-bottom last:border-r-0 [&>a]:pt-2"
      as="th"
    >
      <div className="relative z-1 flex w-full justify-center pb-2">
        <div className="inline-flex rotate-180 text-start [writing-mode:vertical-lr]">
          <AnnotatedValue
            className="border-help-underline border-l border-dotted no-underline"
            externalAnnotations={preferredAssayTitleDescriptionMap}
          >
            {assay}
          </AnnotatedValue>
        </div>
      </div>
    </LinkedTableCell>
  );
}

/**
 * Renders a header cell for the Y-axis of the matrix, which might span multiple rows.
 *
 * @param rowSpan - Number of rows the header cell should span
 * @param isBottomEdgeCell - Whether this cell is at the bottom edge of the matrix
 * @param classification - Classification of the cell specimen
 * @param sampleTerm - sample term name associated with the cell specimen
 */
function MatrixYAxisHeaderCell({
  rowSpan,
  isBottomEdgeCell,
  classification,
  sampleTerm,
  children,
}: {
  rowSpan: number;
  isBottomEdgeCell: boolean;
  classification: Classification;
  sampleTerm: string;
  children: React.ReactNode;
}) {
  const headerCellClass =
    classification === "differentiated cell specimen"
      ? "bg-cell-fates-diff-matrix-header"
      : "bg-cell-fates-repr-matrix-header";

  const classificationQuery = `samples.classifications=${encodeUriElement(classification)}`;
  const sampleTermQuery = `samples.sample_terms.term_name=${encodeUriElement(sampleTerm)}`;

  return (
    <LinkedTableCell
      href={`/search/?type=AnalysisSet&samples.classifications!=multiplexed+sample&file_set_type=principal+analysis&${classificationQuery}&${sampleTermQuery}`}
      rowSpan={rowSpan}
      className={`font-semibold ${headerCellClass} ${isBottomEdgeCell ? "border-b-0" : ""}`}
      as="th"
    >
      {children}
    </LinkedTableCell>
  );
}

/**
 * Renders a subheader cell for the Y-axis of the matrix.
 *
 * @param isBottomEdgeCell - True if this cell is at the bottom edge of the matrix
 * @param classification - Classification of the cell specimen
 * @param sampleTerm - Sample term name associated with the cell specimen
 * @param targetedSampleTerm - Targeted sample term name associated with the cell specimen
 */
function MatrixYAxisSubheaderCell({
  isBottomEdgeCell,
  classification,
  sampleTerm,
  targetedSampleTerm,
  children,
}: {
  isBottomEdgeCell: boolean;
  classification: Classification;
  sampleTerm: string;
  targetedSampleTerm: string;
  children: React.ReactNode;
}) {
  const subheaderCellClass =
    classification === "differentiated cell specimen"
      ? "bg-cell-fates-diff-matrix-subheader row-hl-cell-fates-diff-matrix-subheader-hl"
      : "bg-cell-fates-repr-matrix-subheader row-hl-cell-fates-repr-matrix-subheader-hl";

  const classificationQuery = `samples.classifications=${encodeUriElement(classification)}`;
  const sampleTermQuery = `samples.sample_terms.term_name=${encodeUriElement(sampleTerm)}`;
  const targetedSampleTermQuery = `samples.targeted_sample_term.term_name=${encodeUriElement(targetedSampleTerm)}`;

  return (
    <LinkedTableCell
      href={`/search/?type=AnalysisSet&samples.classifications!=multiplexed+sample&file_set_type=principal+analysis&${classificationQuery}&${sampleTermQuery}&${targetedSampleTermQuery}`}
      className={`font-normal [&>a]:py-1 ${subheaderCellClass} ${isBottomEdgeCell ? "border-b-0" : ""}`}
      as="th"
      data-highlight
    >
      {children}
    </LinkedTableCell>
  );
}

/**
 * Renders a title row for a classification section of the matrix.
 *
 * @param classification - Classification of the matrix section
 * @param colSpan - Number of columns across the entire matrix
 */
function MatrixClassificationTitleRow({
  classification,
  colSpan,
  children,
}: {
  classification: Classification;
  colSpan: number;
  children: React.ReactNode;
}) {
  const headerCellClass =
    classification === "differentiated cell specimen"
      ? "bg-cell-fates-diff-matrix-classification"
      : "bg-cell-fates-repr-matrix-classification";

  return (
    <th
      className={`border-matrix-lines border-b py-0.5 whitespace-nowrap capitalize ${headerCellClass}`}
      colSpan={colSpan}
    >
      {children}
    </th>
  );
}

/**
 * Renders a data cell for the matrix.
 *
 * @param hasData - Whether this cell has data
 * @param isBottomEdgeCell - Whether this cell is at the bottom edge of the matrix
 * @param classification - Classification of the cell specimen
 * @param sampleTerm - Sample term name associated with the cell specimen
 * @param targetedSampleTerm - Targeted sample term name associated with the cell specimen
 * @param assay - Assay associated with the cell specimen
 */
function MatrixDataCell({
  hasData,
  isBottomEdgeCell,
  classification,
  sampleTerm,
  targetedSampleTerm,
  assay,
  children,
}: {
  hasData: boolean;
  isBottomEdgeCell: boolean;
  classification: Classification;
  sampleTerm: string;
  targetedSampleTerm: string;
  assay: string;
  children: React.ReactNode;
}) {
  if (hasData) {
    const classificationQuery = `samples.classifications=${encodeUriElement(classification)}`;
    const sampleTermQuery = `samples.sample_terms.term_name=${encodeUriElement(sampleTerm)}`;
    const targetedSampleTermQuery = `samples.targeted_sample_term.term_name=${encodeUriElement(targetedSampleTerm)}`;
    const assayQuery = `preferred_assay_titles=${encodeUriElement(assay)}`;

    const dataCellClass =
      classification === "differentiated cell specimen"
        ? "bg-cell-fates-diff-matrix-data-cell row-hl-cell-fates-diff-matrix-data-cell-hl"
        : "bg-cell-fates-repr-matrix-data-cell row-hl-cell-fates-repr-matrix-data-cell-hl";

    return (
      <LinkedTableCell
        href={`/search/?type=AnalysisSet&samples.classifications!=multiplexed+sample&file_set_type=principal+analysis&${classificationQuery}&${sampleTermQuery}&${targetedSampleTermQuery}&${assayQuery}`}
        className={`[&>a]:py-1 ${dataCellClass} ${isBottomEdgeCell ? "border-b-0" : ""}`}
        data-highlight
      >
        {children}
      </LinkedTableCell>
    );
  }

  return (
    <td className="border-matrix-lines bg-table-data-cell border-r border-b">
      {children}
    </td>
  );
}

/**
 * Converts a matrix of results into a data table format.
 *
 * @param matrix - Matrix of results to convert
 * @returns Data table representation of the matrix
 */
function convertMatrixToDataGrid(matrix: MatrixResultsObject): DataTableFormat {
  // Get the group-by properties for the x-axis and the y-axis and ensure they exist. Even with no
  // data these group property names should still exist, so throw if we can't even get that.
  const [xGroupBy] = getMatrixAxisGroups(matrix.x);
  if (!xGroupBy) {
    throw new Error("No group-by property found for the X axis");
  }
  const [yGroupByClassification, yGroupByParent, yGroupByChild] =
    getMatrixAxisGroups(matrix.y);
  if (!yGroupByClassification || !yGroupByParent || !yGroupByChild) {
    throw new Error("No group-by properties found for the Y axis");
  }

  // Get the buckets for the x-axis based on the group-by property. With no data, the header row
  // will be empty, so we return an empty array to indicate no data grid can be generated.
  const headerBuckets = getMatrixBuckets(matrix.x, xGroupBy);
  if (headerBuckets.length === 0) {
    return [];
  }

  // Generate the cells for the header row.
  const headerCells = generateHeaderRow(headerBuckets);

  // Get the buckets for the y-axis sample classification. With no data, the classification row will
  // be empty, so we return an empty array to indicate no data grid can be generated.
  const classificationBuckets = getMatrixBuckets(
    matrix.y,
    yGroupByClassification
  );

  // Generate a mapping of column keys to their indices for quick lookup when determining the column
  // of a data cell.
  const columnMap = generateMatrixColumnMap(headerBuckets);

  // Determine if the reprogrammed classifications have any populated data. This will help determine
  // whether the differentiated section should render its bottom table line because the reprogrammed
  // section that follows has data.
  const isReprogrammedPopulated = isClassificationPopulated(
    classificationBuckets,
    "reprogrammed cell specimen"
  );

  // Generate the rows for the "differentiated cell specimen" classification.
  const differentiatedRows = convertBucketsToRows(
    classificationBuckets,
    "differentiated cell specimen",
    yGroupByParent,
    yGroupByChild,
    headerBuckets,
    columnMap,
    xGroupBy,
    !isReprogrammedPopulated
  );

  // Generate the rows for the "reprogrammed cell specimen" classification.
  const reprogrammedRows = convertBucketsToRows(
    classificationBuckets,
    "reprogrammed cell specimen",
    yGroupByParent,
    yGroupByChild,
    headerBuckets,
    columnMap,
    xGroupBy,
    true
  );

  return [
    {
      id: "header",
      cells: headerCells,
      isHeaderRow: true,
    },
    ...differentiatedRows,
    ...reprogrammedRows,
  ];
}

/**
 * Converts a set of sample classification buckets into rows for the data grid, including their
 * child rows and data cells.
 *
 * @param buckets - Classification buckets to convert
 * @param classification - Classification key to find within the buckets
 * @param yGroupByParent - Field name to group parent buckets by
 * @param yGroupByChild - Field name to group child buckets by
 * @param headerBuckets - Buckets for the x-axis header row
 * @param columnMap - Mapping of column keys to their indices
 * @param xGroupBy - Field name to group column buckets by
 * @param isLastOfClassification - Indicates if this is the last row of the classification
 * @returns Rows representing the classification, parent, and child data cells
 */
function convertBucketsToRows(
  buckets: MatrixBucket[],
  classification: Classification,
  yGroupByParent: string,
  yGroupByChild: string,
  headerBuckets: MatrixBucket[],
  columnMap: ColumnMap,
  xGroupBy: string,
  isLastOfClassification: boolean
): Row[] {
  const classificationBuckets = buckets.find(
    (bucket) => bucket.key === classification
  );
  if (!classificationBuckets) {
    return [];
  }

  const parentBucket = getMatrixBuckets(classificationBuckets, yGroupByParent);

  const sectionTitle: Row = {
    id: toShishkebabCase(classification),
    cells: [
      createCell({
        id: toShishkebabCase(classification),
        content: classification,
        component: MatrixClassificationTitleRow,
        colSpan: headerBuckets.length + 2,
        componentProps: {
          classification,
        },
      }),
    ],
    isHeaderRow: true,
  };

  const rows = generateRows(
    parentBucket,
    classification,
    headerBuckets,
    columnMap,
    yGroupByChild,
    xGroupBy,
    isLastOfClassification
  );

  return [sectionTitle, ...rows];
}

/**
 * Generates the rows for a given set of parent buckets, including their child rows and data cells.
 *
 * @param parentBuckets - Parent buckets to generate rows for
 * @param classification - Classification key to find within the buckets
 * @param headerBuckets - Buckets for the x-axis header row
 * @param columnMap - Mapping of column keys to their indices
 * @param yGroupByChild - Field name to group child buckets by
 * @param xGroupBy - Field name to group column buckets by
 * @param isLastOfClassification - Indicates if this is the last row of the classification
 * @returns Rows representing the parent and child data cells
 */
function generateRows(
  parentBuckets: MatrixBucket[],
  classification: Classification,
  headerBuckets: MatrixBucket[],
  columnMap: ColumnMap,
  yGroupByChild: string,
  xGroupBy: string,
  isLastOfClassification: boolean
): Row[] {
  const parentRows: Row[] = [];
  parentBuckets.forEach((parentBucket, index) => {
    const childBuckets = getMatrixBuckets(parentBucket, yGroupByChild);
    const childRows: Row[] = [];
    childBuckets.forEach((childBucket, subIndex) => {
      const columnBuckets = getMatrixBuckets(childBucket, xGroupBy);

      const dataRowCells = generateEmptyRowCells(
        headerBuckets.length,
        MatrixDataCell
      );

      columnBuckets.forEach((columnBucket) => {
        dataRowCells[columnMap[columnBucket.key]] = createCell({
          id: toShishkebabCase(columnBucket.key),
          content: "",
          component: MatrixDataCell,
          componentProps: {
            hasData: columnBucket.doc_count > 0,
            isBottomEdgeCell:
              subIndex === childBuckets.length - 1 &&
              index === parentBuckets.length - 1 &&
              isLastOfClassification,
            classification,
            sampleTerm: parentBucket.key,
            targetedSampleTerm: childBucket.key,
            assay: columnBucket.key,
          },
        });
      });

      // Insert the child row title before the data cells.
      const childCells = [
        createCell({
          id: toShishkebabCase(childBucket.key),
          content: childBucket.key,
          component: MatrixYAxisSubheaderCell,
          componentProps: {
            isBottomEdgeCell:
              subIndex === childBuckets.length - 1 &&
              index === parentBuckets.length - 1 &&
              isLastOfClassification,
            classification,
            sampleTerm: parentBucket.key,
            targetedSampleTerm: childBucket.key,
          },
        }),
        ...dataRowCells,
      ];

      // Add the completed child row to the array of child rows within one parent row
      childRows.push({
        id: toShishkebabCase(childBucket.key),
        cells: childCells,
      });
    });

    parentRows.push({
      id: toShishkebabCase(parentBucket.key),
      cells: [
        createCell({
          id: toShishkebabCase(parentBucket.key),
          content: parentBucket.key,
          component: MatrixYAxisHeaderCell,
          componentProps: {
            isBottomEdgeCell:
              index === parentBuckets.length - 1 && isLastOfClassification,
            classification,
            sampleTerm: parentBucket.key,
          },
          childRows,
        }),
      ],
    });
  });
  return parentRows;
}

/**
 * Generates the header row for the x-axis of the data grid. Include a blank cell at the beginning
 * of the row for the blank upper-left corner cell between the X and Y axis labels.
 *
 * @param headerBuckets - Buckets for the x-axis header row
 * @returns Array of cells representing the header row including the blank corner cell
 */
function generateHeaderRow(headerBuckets: MatrixBucket[]): Cell[] {
  const headerCells: Cell[] = headerBuckets.map((bucket) => ({
    id: toShishkebabCase(bucket.key),
    content: bucket.key,
    component: MatrixXAxisHeaderCell,
  }));

  return [
    {
      id: "blank-parent",
      content: "Starting Sample Terms",
      component: MatrixXAxisCornerCell,
    },
    {
      id: "blank-child",
      content: "Targeted Sample Terms",
      component: MatrixXAxisCornerCell,
    },
    ...headerCells,
  ];
}

/**
 * Checks if a specific classification is populated within the given classification buckets.
 *
 * @param classificationBuckets - Array of classification buckets to check
 * @param classificationKey - The classification key to look for in the buckets
 * @returns True if the classification key is present in the buckets, false otherwise
 */
function isClassificationPopulated(
  classificationBuckets: MatrixBucket[],
  classificationKey: Classification
): boolean {
  return classificationBuckets.some(
    (bucket) => bucket.key === classificationKey
  );
}

/**
 * Fetches the server-side props for the Cell Fates page, including the matrix data and page
 * context.
 *
 * @param req - Incoming HTTP request object containing headers and cookies.
 */
export async function getServerSideProps({
  req,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<DifferentiationSeriesProps>
> {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const results = (
    await request.getObject<MatrixResults>(
      "/matrix/?type=AnalysisSet&config=CellFates&samples.classifications!=multiplexed+sample&samples.classifications=differentiated+cell+specimen&samples.classifications=reprogrammed+cell+specimen&file_set_type=principal+analysis"
    )
  ).union();
  if (FetchRequest.isResponseSuccess(results)) {
    return {
      props: {
        matrix: results.matrix,
        pageContext: { title: "Cell Fates" },
        isJson: false,
      },
    };
  }

  return errorObjectToProps(results);
}
