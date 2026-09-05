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
import { toShishkebabCase } from "../lib/general";
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

interface DifferentiationSeriesProps extends PageProps {
  matrix: MatrixResultsObject;
}

export default function DifferentiationSeries({
  matrix,
}: DifferentiationSeriesProps) {
  const dataGrid = convertMatrixToDataGrid(matrix);

  return (
    <div>
      <PagePreamble />
      <DataTable data={dataGrid} />
    </div>
  );
}

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

  const columnMap = generateMatrixColumnMap(headerBuckets);

  // Generate the rows for the "differentiated cell specimen" classification.
  const differentiatedRows = convertBucketsToRows(
    classificationBuckets,
    "differentiated cell specimen",
    yGroupByParent,
    yGroupByChild,
    headerBuckets,
    columnMap,
    xGroupBy
  );

  // Generate the rows for the "reprogrammed cell specimen" classification.
  const reprogrammedRows = convertBucketsToRows(
    classificationBuckets,
    "reprogrammed cell specimen",
    yGroupByParent,
    yGroupByChild,
    headerBuckets,
    columnMap,
    xGroupBy
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
 * @returns Rows representing the classification, parent, and child data cells
 */
function convertBucketsToRows(
  buckets: MatrixBucket[],
  classification: string,
  yGroupByParent: string,
  yGroupByChild: string,
  headerBuckets: MatrixBucket[],
  columnMap: ColumnMap,
  xGroupBy: string
): Row[] {
  const classificationBuckets = buckets.find(
    (bucket) => bucket.key === classification
  );
  const parentBucket = getMatrixBuckets(classificationBuckets, yGroupByParent);
  const rows = generateRows(
    parentBucket,
    headerBuckets,
    columnMap,
    yGroupByChild,
    xGroupBy
  );
  return rows;
}

/**
 * Generates the rows for a given set of parent buckets, including their child rows and data cells.
 *
 * @param parentBuckets - Parent buckets to generate rows for
 * @param headerBuckets - Buckets for the x-axis header row
 * @param columnMap - Mapping of column keys to their indices
 * @param yGroupByChild - Field name to group child buckets by
 * @param xGroupBy - Field name to group column buckets by
 * @returns Rows representing the parent and child data cells
 */
function generateRows(
  parentBuckets: MatrixBucket[],
  headerBuckets: MatrixBucket[],
  columnMap: ColumnMap,
  yGroupByChild: string,
  xGroupBy: string
): Row[] {
  const parentRows: Row[] = [];
  parentBuckets.forEach((parentBucket) => {
    const childBuckets = getMatrixBuckets(parentBucket, yGroupByChild);
    const childRows: Row[] = [];
    childBuckets.forEach((childBucket) => {
      const columnBuckets = getMatrixBuckets(childBucket, xGroupBy);

      const dataRowCells = generateEmptyRowCells(headerBuckets.length);
      columnBuckets.forEach((columnBucket) => {
        dataRowCells[columnMap[columnBucket.key]] = {
          id: toShishkebabCase(columnBucket.key),
          content: columnBucket.doc_count,
        };
      });

      // Insert the child row title before the data cells.
      const childCells = [
        {
          id: toShishkebabCase(childBucket.key),
          content: childBucket.key,
        },
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
        {
          id: toShishkebabCase(parentBucket.key),
          content: parentBucket.key,
          childRows,
        },
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
  const headerCells = headerBuckets.map((bucket) => ({
    id: toShishkebabCase(bucket.key),
    content: bucket.key,
  }));
  return [
    { id: "blank-parent", content: "" },
    { id: "blank-child", content: "" },
    ...headerCells,
  ];
}

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
