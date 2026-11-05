// node_modules
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
// components
import { DataTable } from "../../components/data-table";
// lib
import {
  createCell,
  type Cell,
  type DataTableFormat,
  type Row,
} from "../../lib/data-table";
import { errorObjectToProps, generateErrorObject } from "../../lib/errors";
import FetchRequest, { HTTP_STATUS_CODE } from "../../lib/fetch-request";
import { toShishkebabCase } from "../../lib/general";
import {
  ColumnMap,
  generateEmptyRowCells,
  generateMatrixColumnMap,
  getMatrixAxisGroups,
  getMatrixBuckets,
  isMatrixResultsObject,
  MatrixBucket,
  type MatrixResults,
  type MatrixResultsObject,
} from "../../lib/matrix";
import { PageProps } from "../../lib/next-js";
import { encodeUriElement } from "../../lib/query-encoding";

interface SingleCellAnalysisProps extends PageProps {
  matrix: MatrixResultsObject;
}
/**
 * Preferred assay titles for single cell analysis request queries.
 */
const preferredAssayTitles = [
  "10x multiome",
  "10x multiome with MULTI-seq",
  "10x snATAC-seq with Scale pre-indexing",
  "mtscMultiome",
  "Parse SPLiT-seq",
  "scNT-seq2",
  "scRNA-seq",
  "SHARE-seq",
  "snATAC-seq",
  "snM3C-seq",
  "snMCT-seq",
];

/**
 * Base query for single cell analysis requests and links.
 */
const BASE_QUERY =
  "type=AnalysisSet&status=released&preferred_assay_slims=single+cell&file_set_type=principal+analysis&donors.taxa=Homo+sapiens";

/**
 * Query string for single cell analysis requests including preferred assay titles.
 */
const REQ_QUERY = `${BASE_QUERY}&${preferredAssayTitles.map((title) => `preferred_assay_titles=${encodeUriElement(title)}`).join("&")}`;

export default function Analysis({ matrix }: SingleCellAnalysisProps) {
  console.log("MATRIX", matrix);
  const dataGrid = convertMatrixToDataGrid(matrix);
  return (
    <DataTable
      className="table-row-hl border-collapse [--matrix-first-column-width:10rem]"
      scrollContainerClassName="max-w-full"
      data={dataGrid}
    />
  );
}

/**
 * Custom cell renderer for the two sample-term column headers. Freeze them horizontally only
 * when the table viewport has room for the labels and data columns.
 */
function MatrixXAxisCornerCell({ children }: { children: React.ReactNode }) {
  return <th className="border border-gray-500">{children}</th>;
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

  return (
    <th className="top-0 z-2 w-8 min-w-8 border border-gray-500 align-bottom [&>a]:pt-2">
      <div className="relative z-1 flex w-full justify-center pb-2">
        <div className="inline-flex rotate-180 text-start [writing-mode:vertical-lr]">
          {children}
        </div>
      </div>
    </th>
  );
}

/**
 * Renders a title row for a classification section of the matrix.
 *
 * @param classification - Classification of the matrix section
 * @param colSpan - Number of columns across the entire matrix
 */
function MatrixClassTitleRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <th className="border border-gray-500" colSpan={colSpan}>
      <div className="">{children}</div>
    </th>
  );
}

/**
 * Renders a sample-term header cell for the Y-axis of the matrix.
 */
function MatrixYAxisHeaderCell({
  rowSpan,
  children,
}: {
  rowSpan: number;
  children: React.ReactNode;
}) {
  return (
    <th className="border border-gray-500 py-1 font-semibold" rowSpan={rowSpan}>
      {children}
    </th>
  );
}

/**
 * Renders a subheader cell for the Y-axis of the matrix.
 */
function MatrixYAxisSubheaderCell({ children }: { children: React.ReactNode }) {
  return <th className="border border-gray-500">{children}</th>;
}

/**
 * Renders a data cell for the matrix.
 *
 * @param isBottomEdgeCell - Whether this cell is at the bottom edge of the matrix
 */
function MatrixDataCell({ children }: { children: number }) {
  if (children > 0) {
    return (
      <td className="text-center align-middle text-xs" data-highlight>
        {children}
      </td>
    );
  }

  return <MatrixEmptyDataCell />;
}

/**
 * Renders an empty matrix data cell with the same borders as populated matrix cells.
 */
function MatrixEmptyDataCell() {
  return (
    <td className="border-matrix-lines bg-table-data-cell border-r border-b" />
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
  const [yGroupByClass, yGroupByTerm, yGroupByTargetedTerm] =
    getMatrixAxisGroups(matrix.y);
  if (!yGroupByClass || !yGroupByTerm || !yGroupByTargetedTerm) {
    throw new Error("No group-by properties found for the Y axis");
  }

  // Get the buckets for the x-axis based on the group-by property. With no data, the header row
  // will be empty, so we return an empty array to indicate no data grid can be generated.
  const headerBuckets = getMatrixBuckets(matrix.x, xGroupBy);
  if (headerBuckets.length === 0) {
    return [];
  }

  // Get the buckets for the y-axis sample classes. Each bucket becomes one section of rows in the
  // data grid, in the order supplied by the backend.
  const sampleClassBuckets = getMatrixBuckets(matrix.y, yGroupByClass);

  // Generate a mapping of column keys to their indices for quick lookup when determining the column
  // of a data cell.
  const columnMap = generateMatrixColumnMap(headerBuckets);

  // Generate the header cells in the same order represented by the column map.
  const headerCells = generateHeaderRow(columnMap);

  // Generate one section of rows for every sample class represented in the matrix.
  const sampleClassRows = sampleClassBuckets.flatMap((bucket) =>
    convertBucketsToRows(
      sampleClassBuckets,
      bucket.key,
      yGroupByTerm,
      yGroupByTargetedTerm,
      headerBuckets,
      columnMap,
      xGroupBy
    )
  );

  return [
    {
      id: "header",
      cells: headerCells,
      isHeaderRow: true,
    },
    ...sampleClassRows,
  ];
}

/**
 * Converts one sample-class bucket into rows for the data grid, including its sample-term and
 * targeted-sample-term rows.
 *
 * @param buckets - Sample-class buckets to convert
 * @param sampleClass - Sample-class key to find within the buckets
 * @param yGroupByTerm - Field name to group sample-term buckets by
 * @param yGroupByTargetedTerm - Field name to group targeted-sample-term buckets by
 * @param headerBuckets - Buckets for the x-axis header row
 * @param columnMap - Mapping of column keys to their indices
 * @param xGroupBy - Field name to group column buckets by
 * @returns Rows representing the sample class, sample terms, and data cells
 */
function convertBucketsToRows(
  buckets: MatrixBucket[],
  sampleClass: string,
  yGroupByTerm: string,
  yGroupByTargetedTerm: string,
  headerBuckets: MatrixBucket[],
  columnMap: ColumnMap,
  xGroupBy: string
): Row[] {
  const sampleClassBucket = buckets.find(
    (bucket) => bucket.key === sampleClass
  );
  if (!sampleClassBucket) {
    return [];
  }

  const sampleTermBuckets = getMatrixBuckets(sampleClassBucket, yGroupByTerm);
  if (sampleTermBuckets.length === 0) {
    return [];
  }

  const sectionTitle: Row = {
    id: toShishkebabCase(sampleClass),
    cells: [
      createCell({
        id: toShishkebabCase(sampleClass),
        content: sampleClass,
        component: MatrixClassTitleRow,
        componentProps: {},
        colSpan: headerBuckets.length + 2,
      }),
    ],
    isHeaderRow: true,
  };

  const rows = generateRows(
    sampleTermBuckets,
    headerBuckets,
    columnMap,
    yGroupByTargetedTerm,
    xGroupBy
  );

  return [sectionTitle, ...rows];
}

/**
 * Generates rows for sample-term buckets, including targeted-sample-term rows and assay data
 * cells.
 *
 * @param sampleTermBuckets - Buckets for sample terms
 * @param headerBuckets - Buckets for the x-axis header row
 * @param columnMap - Mapping of column keys to their indices
 * @param yGroupByTargetedTerm - Field name to group targeted-sample-term buckets by
 * @param xGroupBy - Field name to group column buckets by
 * @returns Rows representing the sample terms, targeted sample terms, and assay data cells
 */
function generateRows(
  sampleTermBuckets: MatrixBucket[],
  headerBuckets: MatrixBucket[],
  columnMap: ColumnMap,
  yGroupByTargetedTerm: string,
  xGroupBy: string
): Row[] {
  return sampleTermBuckets.map((sampleTermBucket) => {
    const targetedSampleTermBuckets = getMatrixBuckets(
      sampleTermBucket,
      yGroupByTargetedTerm
    );

    const childRows: Row[] = targetedSampleTermBuckets.map(
      (targetedSampleTermBucket) => {
        const assayBuckets = getMatrixBuckets(
          targetedSampleTermBucket,
          xGroupBy
        );

        // Initialize the data row cells for the current child row with empty cells. We'll populate
        // them with the actual data from the column buckets next.
        const dataRowCells: Cell[] = generateEmptyRowCells(
          headerBuckets.length
        ).map((cell) => ({
          ...cell,
          component: MatrixEmptyDataCell,
        }));

        // Populate the data row cells with the actual data from the column buckets.
        assayBuckets.forEach((assayBucket) => {
          // Determine the column index for the current assay bucket. If the column is not found
          // in the column map, skip it.
          const columnIndex = columnMap[assayBucket.key];
          if (columnIndex === undefined) {
            return;
          }

          dataRowCells[columnIndex] = createCell({
            id: toShishkebabCase(assayBucket.key),
            content: assayBucket.doc_count,
            component: MatrixDataCell,
            componentProps: {},
          });
        });

        // Insert the child row title before the data cells.
        const childCells = [
          createCell({
            id: toShishkebabCase(targetedSampleTermBucket.key),
            content: targetedSampleTermBucket.key,
            component: MatrixYAxisSubheaderCell,
            componentProps: {},
          }),
          ...dataRowCells,
        ];

        return {
          id: toShishkebabCase(targetedSampleTermBucket.key),
          cells: childCells,
        };
      }
    );

    return {
      id: toShishkebabCase(sampleTermBucket.key),
      cells: [
        createCell({
          id: toShishkebabCase(sampleTermBucket.key),
          content: sampleTermBucket.key,
          component: MatrixYAxisHeaderCell,
          componentProps: {},
          childRows,
        }),
      ],
    };
  });
}

/**
 * Generates the header row for the x-axis of the data grid. Include a blank cell at the beginning
 * of the row for the blank upper-left corner cell between the X and Y axis labels.
 *
 * @param columnMap - Assay titles mapped to their displayed column indexes
 * @returns Array of cells representing the header row including the blank corner cell
 */
function generateHeaderRow(columnMap: ColumnMap): Cell[] {
  const headerCells: Cell[] = Object.keys(columnMap).map((assay) => ({
    id: toShishkebabCase(assay),
    content: assay,
    component: MatrixXAxisHeaderCell,
  }));

  return [
    {
      id: "blank-parent",
      content: "Starting Sample Terms",
      component: MatrixXAxisCornerCell,
      componentProps: { isFirstColumn: true },
    },
    {
      id: "blank-child",
      content: "Targeted Sample Terms",
      component: MatrixXAxisCornerCell,
    },
    ...headerCells,
  ];
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<SingleCellAnalysisProps>> {
  const { req } = context;
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const response = (
    await request.getObject<MatrixResults>(
      `/omnimatrix/?${REQ_QUERY}&config=SingleCell`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(response)) {
    if (isMatrixResultsObject(response)) {
      return {
        props: {
          matrix: response.matrix,
          pageContext: { title: "Single Cell Analysis" },
          isJson: false,
        },
      };
    }

    // No error response, but the response is not a valid matrix results object.
    return errorObjectToProps(
      generateErrorObject(
        HTTP_STATUS_CODE.BAD_GATEWAY,
        "Invalid server response",
        "The server returned invalid single-cell analysis data.",
        "Expected the response to contain matrix data."
      )
    );
  }

  // The response indicates a failure in the request.
  return errorObjectToProps(response);
}
