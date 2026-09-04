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
  type MatrixBucket,
  type MatrixResults,
  type MatrixResultsObject,
} from "../lib/matrix";
import { type PageProps } from "../lib/next-js";

interface DifferentiationSeriesProps extends PageProps {
  differentiatedMatrix: MatrixResultsObject;
  reprogrammedMatrix: MatrixResultsObject;
}

export default function DifferentiationSeries({
  differentiatedMatrix,
  reprogrammedMatrix,
}: DifferentiationSeriesProps) {
  console.log("************* DIFF", differentiatedMatrix);
  console.log("************* REPROG", reprogrammedMatrix);

  const differentiatedDataGrid = convertMatrixToDataGrid(differentiatedMatrix);
  const reprogrammedDataGrid = convertMatrixToDataGrid(reprogrammedMatrix);

  return (
    <div>
      <PagePreamble />
      <DataTable data={differentiatedDataGrid} />
      <DataTable data={reprogrammedDataGrid} />
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
  const [yGroupByParent, yGroupByChild] = getMatrixAxisGroups(matrix.y);
  if (!yGroupByParent || !yGroupByChild) {
    throw new Error("No group-by properties found for the Y axis");
  }

  // Get the buckets for the x-axis based on the group-by property. With no data, the header row
  // will be empty, so we return an empty array to indicate no data grid can be generated.
  const headerBuckets = getMatrixBuckets(matrix.x, xGroupBy);
  if (headerBuckets.length === 0) {
    return [];
  }

  // Generate an empty row to copy for each data row, ensuring it has the same number of columns as
  // the header row.

  // Generate the map of column titles to their zero-based column indices.
  const columnMap = generateMatrixColumnMap(headerBuckets);

  // Generate the cells for the header row.
  const headerCells = generateHeaderRow(headerBuckets);

  const parentBuckets = getMatrixBuckets(matrix.y, yGroupByParent);
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

  return [
    {
      id: "header",
      cells: headerCells,
      isHeaderRow: true,
    },
    ...parentRows,
  ];
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
  const differentiatedResults = (
    await request.getObject<MatrixResults>(
      "/matrix/?type=AnalysisSet&config=DifferentiationSeries&samples.classifications!=multiplexed+sample&samples.classifications=differentiated+cell+specimen&file_set_type=principal+analysis"
    )
  ).union();
  if (FetchRequest.isResponseSuccess(differentiatedResults)) {
    const reprogrammedResults = (
      await request.getObject<MatrixResults>(
        "/matrix/?type=AnalysisSet&config=DifferentiationSeries&samples.classifications!=multiplexed+sample&samples.classifications=reprogrammed+cell+specimen&file_set_type=principal+analysis"
      )
    ).union();
    if (FetchRequest.isResponseSuccess(reprogrammedResults)) {
      return {
        props: {
          differentiatedMatrix: differentiatedResults.matrix,
          reprogrammedMatrix: reprogrammedResults.matrix,
          pageContext: { title: "Cell Fates" },
          isJson: false,
        },
      };
    }
    return errorObjectToProps(reprogrammedResults);
  }

  return errorObjectToProps(differentiatedResults);
}
