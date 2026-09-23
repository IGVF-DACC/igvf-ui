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
import { abbreviateNumber, toShishkebabCase } from "../lib/general";
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
 *
 * @property matrix - Matrix results object containing the x and y axes of the data to be displayed
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
 * Represents the content of a data cell, including counts for human and mouse samples.
 *
 * @property human - Count of human samples
 * @property mouse - Count of mouse samples
 */
type DataCellContent = {
  human: number;
  mouse: number;
};

/**
 * Represents a pair of matrix buckets for the same term, separated by taxa. Either bucket can be
 * absent when a term only has data for one taxon. The key uniquely identifies the matrix term based
 * on the term's key.
 *
 * @property key - Key identifying the matrix term
 * @property human - Human sample matrix bucket
 * @property mouse - Mouse sample matrix bucket
 */
type TaxaBucketPair = {
  key: string;
  human?: MatrixBucket;
  mouse?: MatrixBucket;
};

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
        This table displays processed data from differentiated and reprogrammed
        cell specimens. You can also explore a{" "}
        <Link href="/search/?type=AnalysisSet&status=released&samples.classifications=*&advancedQuery=samples.classifications:(%22multiplexed+sample%22+AND+%22differentiated+cell+specimen%22)+OR+samples.classifications:(%22multiplexed+sample%22+AND+%22reprogrammed+cell+specimen%22)">
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
            className="@container mb-8 grid min-w-0 flex-1 auto-rows-min text-sm"
          >
            <DataTable
              className="table-row-hl [--matrix-first-column-width:10rem]"
              scrollContainerClassName="max-w-full"
              data={dataGrid}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Custom cell renderer for the two sample-term column headers. Freeze them horizontally only
 * when the table viewport has room for the labels and data columns.
 */
function MatrixXAxisCornerCell({
  isFirstColumn = false,
  children,
}: {
  isFirstColumn?: boolean;
  children: React.ReactNode;
}) {
  return (
    <th
      className={`bg-table-data-cell border-matrix-lines sticky top-0 z-3 border-r border-b px-2 py-1 text-left align-bottom last:border-r-0 ${
        isFirstColumn
          ? "w-(--matrix-first-column-width) max-w-(--matrix-first-column-width) min-w-(--matrix-first-column-width) @min-3xl:left-0"
          : "@min-3xl:left-(--matrix-first-column-width)"
      }`}
    >
      <div className="whitespace-normal contain-[inline-size]">{children}</div>
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
  const href = `/search/?type=AnalysisSet&status=released&samples.classifications!=multiplexed+sample&file_set_type=principal+analysis&${assayQuery}`;

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
      href={`/search/?type=AnalysisSet&status=released&samples.classifications!=multiplexed+sample&file_set_type=principal+analysis&${classificationQuery}&${sampleTermQuery}`}
      rowSpan={rowSpan}
      className={`z-1 w-(--matrix-first-column-width) max-w-(--matrix-first-column-width) min-w-(--matrix-first-column-width) py-1 text-left align-top font-semibold @min-3xl:sticky @min-3xl:left-0 [&>a]:wrap-anywhere [&>a]:whitespace-normal [&>a]:contain-[inline-size] ${headerCellClass} ${isBottomEdgeCell ? "border-b-0" : ""}`}
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
  termCount,
  children,
}: {
  isBottomEdgeCell: boolean;
  classification: Classification;
  sampleTerm: string;
  targetedSampleTerm: string;
  termCount: number;
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
      href={`/search/?type=AnalysisSet&status=released&samples.classifications!=multiplexed+sample&file_set_type=principal+analysis&${classificationQuery}&${sampleTermQuery}&${targetedSampleTermQuery}`}
      className={`z-1 h-px font-normal @min-3xl:sticky @min-3xl:left-(--matrix-first-column-width) ${subheaderCellClass} ${isBottomEdgeCell ? "border-b-0" : ""}`}
      as="th"
      data-highlight
    >
      <div className="flex h-full items-center justify-between gap-2 py-1">
        <span>{children}</span>
        <CountBadge count={termCount} />
      </div>
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
  classificationCount,
  children,
}: {
  classification: Classification;
  colSpan: number;
  classificationCount: number;
  children: React.ReactNode;
}) {
  const classificationQuery = `samples.classifications=${encodeUriElement(classification)}`;

  const headerCellClass =
    classification === "differentiated cell specimen"
      ? "bg-cell-fates-diff-matrix-classification"
      : "bg-cell-fates-repr-matrix-classification";

  return (
    <LinkedTableCell
      href={`/search/?type=AnalysisSet&status=released&samples.classifications!=multiplexed+sample&file_set_type=principal+analysis&${classificationQuery}`}
      colSpan={colSpan}
      className={`[&>a]:[contain-[inline-size]] border-r-0 capitalize ${headerCellClass}`}
      as="th"
    >
      <div className="sticky left-2 flex w-[min(100%,calc(100cqw-1rem))] items-center justify-center gap-2 py-0.5">
        <span>{children}</span>
        <CountBadge count={classificationCount} />
      </div>
    </LinkedTableCell>
  );
}

/**
 * Renders a data cell for the matrix.
 *
 * @param isBottomEdgeCell - Whether this cell is at the bottom edge of the matrix
 * @param classification - Classification of the cell specimen
 * @param sampleTerm - Sample term name associated with the cell specimen
 * @param targetedSampleTerm - Targeted sample term name associated with the cell specimen
 * @param assay - Assay associated with the cell specimen
 */
function MatrixDataCell({
  isBottomEdgeCell,
  classification,
  sampleTerm,
  targetedSampleTerm,
  assay,
  children,
}: {
  isBottomEdgeCell: boolean;
  classification: Classification;
  sampleTerm: string;
  targetedSampleTerm: string;
  assay: string;
  children: DataCellContent;
}) {
  if (children.human > 0 || children.mouse > 0) {
    const classificationQuery = `samples.classifications=${encodeUriElement(classification)}`;
    const sampleTermQuery = `samples.sample_terms.term_name=${encodeUriElement(sampleTerm)}`;
    const targetedSampleTermQuery = `samples.targeted_sample_term.term_name=${encodeUriElement(targetedSampleTerm)}`;
    const assayQuery = `preferred_assay_titles=${encodeUriElement(assay)}`;

    const { human, mouse } = children;

    let dataCellClass = "";
    let content: React.ReactNode = "";
    if (human > 0 && mouse === 0) {
      dataCellClass =
        "bg-cell-fates-human-matrix-data-cell row-hl-cell-fates-human-matrix-data-cell-hl";
      content = "Hs";
    } else if (mouse > 0 && human === 0) {
      dataCellClass =
        "bg-cell-fates-mouse-matrix-data-cell row-hl-cell-fates-mouse-matrix-data-cell-hl";
      content = "Mm";
    } else if (human > 0 && mouse > 0) {
      dataCellClass =
        "bg-cell-fates-mixed-matrix-data-cell row-hl-cell-fates-mixed-matrix-data-cell-hl";
      content = (
        <span className="flex flex-col leading-[0.65rem]">
          <span>Hs</span>
          <span>Mm</span>
        </span>
      );
    }

    return (
      <LinkedTableCell
        href={`/search/?type=AnalysisSet&status=released&samples.classifications!=multiplexed+sample&file_set_type=principal+analysis&${classificationQuery}&${sampleTermQuery}&${targetedSampleTermQuery}&${assayQuery}`}
        className={`text-center align-middle text-xs [&>a]:flex [&>a]:items-center [&>a]:justify-center [&>a]:px-0.5 [&>a]:py-1 ${dataCellClass} ${isBottomEdgeCell ? "border-b-0" : ""}`}
        data-highlight
      >
        {content}
      </LinkedTableCell>
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
 * Display a badge containing a count of items.
 *
 * @param count - Number of items to display in the badge
 */
function CountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-zinc-500 px-2 text-xs font-semibold text-white dark:bg-zinc-400 dark:text-black">
      {abbreviateNumber(count)}
    </span>
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
  const [yGroupByClassification, yGroupByTaxa, yGroupByParent, yGroupByChild] =
    getMatrixAxisGroups(matrix.y);
  if (
    !yGroupByClassification ||
    !yGroupByTaxa ||
    !yGroupByParent ||
    !yGroupByChild
  ) {
    throw new Error("No group-by properties found for the Y axis");
  }

  // Get the buckets for the x-axis based on the group-by property. With no data, the header row
  // will be empty, so we return an empty array to indicate no data grid can be generated.
  const headerBuckets = getMatrixBuckets(matrix.x, xGroupBy);
  if (headerBuckets.length === 0) {
    return [];
  }

  // Get the buckets for the y-axis sample classification. With no data, the classification row will
  // be empty, so we return an empty array to indicate no data grid can be generated.
  const classificationBuckets = getMatrixBuckets(
    matrix.y,
    yGroupByClassification
  );

  // Generate a mapping of column keys to their indices for quick lookup when determining the column
  // of a data cell.
  const columnMap = generateMatrixColumnMap(headerBuckets);

  // Generate the header cells in the same order represented by the column map.
  const headerCells = generateHeaderRow(columnMap);

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
    yGroupByTaxa,
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
    yGroupByTaxa,
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
  yGroupByTaxa: string,
  yGroupByParent: string,
  yGroupByChild: string,
  headerBuckets: MatrixBucket[],
  columnMap: ColumnMap,
  xGroupBy: string,
  isLastOfClassification: boolean
): Row[] {
  // Get the buckets containing the sample classifications.
  const classificationBucket = buckets.find(
    (bucket) => bucket.key === classification
  );
  if (!classificationBucket) {
    return [];
  }

  // Get the buckets containing the sample taxa.
  const taxaBuckets = getMatrixBuckets(classificationBucket, yGroupByTaxa);

  // Get the bucket containing human and mouse taxa.
  const humanBucket = taxaBuckets.find(
    (bucket) => bucket.key === "Homo sapiens"
  );
  const mouseBucket = taxaBuckets.find(
    (bucket) => bucket.key === "Mus musculus"
  );

  // Get the sample buckets for human and mouse taxa.
  const humanSampleBuckets = getMatrixBuckets(humanBucket, yGroupByParent);
  const mouseSampleBuckets = getMatrixBuckets(mouseBucket, yGroupByParent);

  // Create the section title row for the classification.
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
          classificationCount: classificationBucket.doc_count,
        },
      }),
    ],
    isHeaderRow: true,
  };

  // Generate the rows for the human and mouse samples.
  const rows = generateRows(
    humanSampleBuckets,
    mouseSampleBuckets,
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
 * @param humanSampleBuckets - Buckets for human samples
 * @param mouseSampleBuckets - Buckets for mouse samples
 * @param classification - Classification key to find within the buckets
 * @param headerBuckets - Buckets for the x-axis header row
 * @param columnMap - Mapping of column keys to their indices
 * @param yGroupByChild - Field name to group child buckets by
 * @param xGroupBy - Field name to group column buckets by
 * @param isLastOfClassification - Indicates if this is the last row of the classification
 * @returns Rows representing the parent and child data cells
 */
function generateRows(
  humanSampleBuckets: MatrixBucket[],
  mouseSampleBuckets: MatrixBucket[],
  classification: Classification,
  headerBuckets: MatrixBucket[],
  columnMap: ColumnMap,
  yGroupByChild: string,
  xGroupBy: string,
  isLastOfClassification: boolean
): Row[] {
  // Pair the human and mouse sample buckets by their starting sample term key. "Parent" refers to
  // the starting sample term.
  const parentRows: Row[] = [];
  const parentBucketPairs = pairTaxaBuckets(
    humanSampleBuckets,
    mouseSampleBuckets
  );

  // Iterate over each pair of parent buckets to generate the corresponding child rows and data
  // cells.
  parentBucketPairs.forEach((parentBucketPair, index) => {
    // Generate the child bucket pairs for the current parent bucket pair. "Child" refers to the
    // targeted sample term.
    const childBucketPairs = pairTaxaBuckets(
      getMatrixBuckets(parentBucketPair.human, yGroupByChild),
      getMatrixBuckets(parentBucketPair.mouse, yGroupByChild)
    );

    const childRows: Row[] = [];
    childBucketPairs.forEach((childBucketPair, subIndex) => {
      // Generate the column bucket pairs for the current child bucket pair. "Column" refers to the
      // preferred assay titles.
      const columnBucketPairs = pairTaxaBuckets(
        getMatrixBuckets(childBucketPair.human, xGroupBy),
        getMatrixBuckets(childBucketPair.mouse, xGroupBy)
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
      columnBucketPairs.forEach((columnBucketPair) => {
        // Determine the column index for the current column bucket pair. If the column is not found
        // in the column map, skip it.
        const columnIndex = columnMap[columnBucketPair.key];
        if (columnIndex === undefined) {
          return;
        }

        const content = {
          human: columnBucketPair.human?.doc_count ?? 0,
          mouse: columnBucketPair.mouse?.doc_count ?? 0,
        };
        dataRowCells[columnIndex] = createCell({
          id: toShishkebabCase(columnBucketPair.key),
          content,
          component: MatrixDataCell,
          componentProps: {
            isBottomEdgeCell:
              subIndex === childBucketPairs.length - 1 &&
              index === parentBucketPairs.length - 1 &&
              isLastOfClassification,
            classification,
            sampleTerm: parentBucketPair.key,
            targetedSampleTerm: childBucketPair.key,
            assay: columnBucketPair.key,
          },
        });
      });

      // Insert the child row title before the data cells.
      const childCells = [
        createCell({
          id: toShishkebabCase(childBucketPair.key),
          content: childBucketPair.key,
          component: MatrixYAxisSubheaderCell,
          componentProps: {
            isBottomEdgeCell:
              subIndex === childBucketPairs.length - 1 &&
              index === parentBucketPairs.length - 1 &&
              isLastOfClassification,
            classification,
            sampleTerm: parentBucketPair.key,
            targetedSampleTerm: childBucketPair.key,
            termCount:
              (childBucketPair.human?.doc_count ?? 0) +
              (childBucketPair.mouse?.doc_count ?? 0),
          },
        }),
        ...dataRowCells,
      ];

      // Add the completed child row to the array of child rows within one parent row
      childRows.push({
        id: toShishkebabCase(childBucketPair.key),
        cells: childCells,
      });
    });

    parentRows.push({
      id: toShishkebabCase(parentBucketPair.key),
      cells: [
        createCell({
          id: toShishkebabCase(parentBucketPair.key),
          content: parentBucketPair.key,
          component: MatrixYAxisHeaderCell,
          componentProps: {
            isBottomEdgeCell:
              index === parentBucketPairs.length - 1 && isLastOfClassification,
            classification,
            sampleTerm: parentBucketPair.key,
          },
          childRows,
        }),
      ],
    });
  });
  return parentRows;
}

/**
 * Pair human and mouse buckets that have the same keys. Preserve the human bucket order, then
 * append terms that only occur in the mouse buckets. The keys come from matrix data, and could be
 * starting sample keys, targeted sample keys, or preferred assay titles.
 *
 * @param humanBuckets - Human sample matrix buckets
 * @param mouseBuckets - Mouse sample matrix buckets
 * @returns Paired human and mouse buckets, preserving human bucket order and appending mouse-only
 *          buckets
 */
function pairTaxaBuckets(
  humanBuckets: MatrixBucket[],
  mouseBuckets: MatrixBucket[]
): TaxaBucketPair[] {
  // Initialize a map to store paired human and mouse buckets by their key.
  const pairs = new Map<string, TaxaBucketPair>();

  // Add all human buckets to the map according to their key.
  humanBuckets.forEach((bucket) => {
    pairs.set(bucket.key, { key: bucket.key, human: bucket });
  });

  // Add all mouse buckets to the map, keyed by their key. If a human bucket with the same key
  // already exists, pair it with the mouse bucket; otherwise, create a new entry for the mouse-only
  // bucket.
  mouseBuckets.forEach((bucket) => {
    const pair = pairs.get(bucket.key);
    if (pair) {
      pair.mouse = bucket;
    } else {
      pairs.set(bucket.key, { key: bucket.key, mouse: bucket });
    }
  });

  // Convert the map of paired buckets to an array and return it.
  return Array.from(pairs.values());
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
      "/matrix/?type=AnalysisSet&config=CellFates&status=released&samples.classifications!=multiplexed+sample&samples.classifications=differentiated+cell+specimen&samples.classifications=reprogrammed+cell+specimen&file_set_type=principal+analysis"
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
