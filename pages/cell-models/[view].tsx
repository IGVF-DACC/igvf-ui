// node_modules
import _ from "lodash";
import { useRouter } from "next/router";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import DataGrid, {
  type Cell,
  type DataGridFormat,
  type Row,
} from "../../components/data-grid";
import Link from "../../components/link-no-prefetch";
import { LabelXAxis, LabelYAxis } from "../../components/matrix";
import PagePreamble from "../../components/page-preamble";
import { TabGroup, TabList, TabTitle } from "../../components/tabs";
// lib
import FetchRequest from "../../lib/fetch-request";
import { errorObjectToProps } from "../../lib/errors";
import { toShishkebabCase } from "../../lib/general";
import { type ColumnMap } from "../../lib/matrix";
import { encodeUriElement } from "../../lib/query-encoding";
// root
import type {
  MatrixBucket,
  MatrixResults,
  MatrixResultsObject,
} from "../../globals.d";

/**
 * Source data for cell renderers in the matrix.
 */
type CellSource = {
  /** Text to display in the cell, or at least that the cell represents */
  key: string;
  /** Path to the search containing the items that cell represents */
  href: string;
};

/**
 * Used to map a view string to data provider and UI page paths.
 */
type ViewMap = {
  /** Title of the tab to select this view */
  tabTitle: string;
  /** Path and query string for the data provider matrix query for the given taxa */
  dataProviderPath: string;
  /** Base path for cells to link to */
  cellLinkPath: string;
  /** Path for the UI page that displays the page for the given taxa */
  pagePath: string;
  /** Tailwind CSS class for the column header cells in the matrix */
  columnHeaderCellClass: string;
  /** Tailwind CSS class for the row header cells in the matrix */
  rowHeaderCellClass: string;
  /** Tailwind CSS class for the row subheader cells in the matrix */
  rowSubheaderCellClass: string;
  /** Tailwind CSS class for the data cells in the matrix */
  dataCellClass: string;
  /** Tailwind CSS class for data cells that the mouse hovers over */
  hoverCellClass: string;
};

/**
 * Identifies each type of cell-model data this page handles, and matches the last element of the
 * URL path for this page.
 */
type ViewIdentifier = "cell-lines" | "differentiated-specimens";

/**
 * Map a view to the corresponding paths to the data provider matrix query and the UI page.
 */
const viewQueries: Record<string, ViewMap> = {
  "cell-lines": {
    tabTitle: "Cell Lines",
    dataProviderPath:
      "/matrix/?type=Sample&classifications=cell+line&config=sample-cell-lines",
    cellLinkPath: "/search/?type=Sample",
    pagePath: "/cell-models/cell-lines/",
    columnHeaderCellClass: "bg-cell-model-matrix-column-header-cell-line",
    rowHeaderCellClass: "bg-cell-model-matrix-row-header-cell-line",
    rowSubheaderCellClass: "bg-cell-model-matrix-row-subheader-cell-line",
    dataCellClass: "bg-cell-model-matrix-data-cell-line",
    hoverCellClass: "group-hover:bg-cell-model-matrix-highlight-cell-line",
  },
  "differentiated-specimens": {
    tabTitle: "Differentiated Specimens",
    dataProviderPath:
      "/matrix/?type=Sample&classifications=differentiated+cell+specimen&classifications=reprogrammed+cell+specimen&config=sample-differentiated-specimens",
    cellLinkPath: "/search/?type=Sample",
    pagePath: "/cell-models/differentiated-specimens/",
    columnHeaderCellClass:
      "bg-cell-model-matrix-column-header-differentiated-specimens",
    rowHeaderCellClass:
      "bg-cell-model-matrix-row-header-differentiated-specimens",
    rowSubheaderCellClass:
      "bg-cell-model-matrix-row-subheader-differentiated-specimens",
    dataCellClass: "bg-cell-model-matrix-data-differentiated-specimens",
    hoverCellClass:
      "group-hover:bg-cell-model-matrix-highlight-differentiated-specimens",
  },
};

/**
 * List all accepted taxa.
 */
const acceptedViews = Object.keys(viewQueries) as ViewIdentifier[];

/**
 * Generate a map of column labels to their 0-based column index. Each label appears as a key in
 * the returned object, with the value being the index of the corresponding column in the matrix.
 * @param columnBuckets - Buckets for the x-axis of the matrix
 * @returns Map of column labels to their 0-based column index
 */
function generateMatrixColumnMap(
  columnBuckets: MatrixBucket[],
  rowBuckets: MatrixBucket[],
  majorXProp: string,
  minorYProp: string
): ColumnMap {
  // Descend into the rows to find out which columns get used.
  const usedColumns = new Set<string>();
  for (const rowBucket of rowBuckets) {
    for (const childBucket of rowBucket[minorYProp].buckets) {
      for (const columnBucket of childBucket[majorXProp].buckets) {
        usedColumns.add(columnBucket.key);
      }
    }
  }

  // Filter the column buckets to only the used ones, and sort them by their keys.
  const usedBuckets = columnBuckets.filter((bucket) =>
    usedColumns.has(bucket.key)
  );
  const sortedBuckets = _.sortBy(usedBuckets, (bucket) =>
    bucket.key.toLowerCase()
  );

  // Generate the column map from the used sorted buckets.
  return sortedBuckets.reduce((acc, bucket, i) => {
    const column = { [bucket.key]: i };
    return { ...acc, ...column };
  }, {});
}

/**
 * Renders the top-level header cells that covers potentially multiple rows in the matrix. It
 * includes a link to the corresponding list-view page.
 * @param source - Source of data to render the cell
 * @param meta - Metadata for the entire matrix to render the cell
 */
function RowHeaderCell({
  source,
  meta,
}: {
  source: CellSource;
  meta: { view: string };
}) {
  const bgClass = viewQueries[meta.view].rowHeaderCellClass;

  return (
    <Link
      href={source.href}
      className={`flex h-full items-center px-2 py-0.5 font-semibold no-underline ${bgClass}`}
      prefetch={false}
    >
      {source.key}
    </Link>
  );
}

/**
 * Renders the second-level header cells that covers a single row in the matrix.
 * @param source - Source of data to render the cell
 * @param meta - Metadata for the entire matrix to render the cell
 */
function RowSubheaderCell({
  source,
  meta,
}: {
  source: CellSource;
  meta: { view: string };
}) {
  const bgClass = viewQueries[meta.view].rowSubheaderCellClass;
  const hoverClass = viewQueries[meta.view].hoverCellClass;

  return (
    <div className="relative h-full w-full">
      <Link
        href={source.href}
        className={`flex h-full items-center px-2 py-0.5 text-gray-800 no-underline dark:text-gray-200 ${bgClass} ${hoverClass}`}
        prefetch={false}
      >
        {source.key}
      </Link>
    </div>
  );
}

/**
 * Renders the header cells for each column in the matrix.
 * @param source - Source of data to render the cell
 * @param meta - Metadata for the entire matrix to render the cell
 */
function ColumnHeaderCell({
  source,
  meta,
}: {
  source: CellSource;
  meta: { view: string };
}) {
  const bgClass = viewQueries[meta.view].columnHeaderCellClass;

  return (
    <Link
      href={source.href}
      className={`grid h-full w-full place-items-end no-underline ${bgClass}`}
      prefetch={false}
    >
      <div className="flex rotate-180 items-end whitespace-nowrap px-1 py-2 font-semibold [writing-mode:vertical-lr]">
        {source.key}
      </div>
    </Link>
  );
}

/**
 * Display a data cell as a block of color with non-zero data, or blank with zero data.
 * @param source - Source of data to render the cell
 * @param meta - Metadata for the entire matrix to render the cell
 */
function DataCell({
  source,
  meta,
}: {
  source: CellSource;
  meta: { view: string };
}) {
  const bgClass = viewQueries[meta.view].dataCellClass;
  const hoverClass = viewQueries[meta.view].hoverCellClass;

  if (source.href) {
    return (
      <div className="relative h-full w-full">
        <Link
          href={source.href}
          className={`block h-full w-full ${bgClass}`}
          prefetch={false}
        />
        <div
          className={`pointer-events-none absolute inset-0 group-hover:opacity-40 dark:group-hover:bg-opacity-30 ${hoverClass}`}
        />
      </div>
    );
  }
  return (
    <div className={`h-full w-full bg-white dark:bg-black ${hoverClass}`} />
  );
}

/**
 * Generate the data-grid row for one child row of the matrix, i.e. a row that might share a major
 * row with another child row. This child row starts with the minor Y-axis category for the row,
 * followed by the counts for each X-axis category in the matrix.
 * @param childBucket `buckets` array for one row of the grid
 * @param columnMap Map of column labels to their 0-based column indices
 * @param majorXProp Major X-axis property name
 * @param majorYQuery Major Y-axis query string
 * @param minorYProp Minor Y-axis property name
 * @param view View identifier for the matrix `cell-lines` or `differentiated-specimens`
 * @returns Data-grid row for one child row of the matrix
 */
function generateChildRow(
  childBucket: MatrixBucket,
  columnMap: ColumnMap,
  majorXProp: string,
  majorYQuery: string,
  minorYProp: string,
  view: ViewIdentifier
): Row {
  if (childBucket[majorXProp].buckets.length > 0) {
    // Create the cells for one child row, starting with the minor Y-axis category for the row.
    const href = `${
      viewQueries[view].cellLinkPath
    }&${majorYQuery}&${minorYProp}=${encodeUriElement(childBucket.key)}`;
    const childCells = [
      {
        id: `${minorYProp}-${toShishkebabCase(childBucket.key)}`,
        content: RowSubheaderCell,
        source: { key: childBucket.key, href },
        noWrapper: true,
        role: "rowheader",
      },
    ] as Cell[];

    // Now generate a cell for each X-axis category in the matrix with a zero count. Fill in
    // the actual counts later. Use the bucket keys to find the corresponding column index in
    // `columnMap`.
    for (const key in columnMap) {
      childCells[columnMap[key] + 1] = {
        id: key,
        content: DataCell,
        source: { key, href: "" },
        noWrapper: true,
      };
    }

    // Fill in the actual counts for the cells that have a non-zero count. The bucket keys match the
    // column labels in the matrix, so use `columnMap` to find the correct column index for each key.
    const childColumnBuckets = childBucket[majorXProp].buckets;
    for (const columnBucket of childColumnBuckets) {
      const columnIndex = columnMap[columnBucket.key] + 1;
      (childCells[columnIndex].source as CellSource).href = `${
        viewQueries[view].cellLinkPath
      }&${majorYQuery}&${minorYProp}=${encodeUriElement(
        childBucket.key
      )}&${majorXProp}=${encodeUriElement(columnBucket.key)}`;
    }

    return {
      id: toShishkebabCase(childBucket.key),
      cells: childCells,
    };
  }
  return null;
}

/**
 * Convert the matrix object from the data provider to a format that can be used by `<DataGrid>`.
 * This includes not only the data for the cells, but also the top and left header rows.
 * @param matrix Entire matrix object from the data provider
 * @param view View identifier for the matrix `cell-lines` or `differentiated-specimens`
 * @returns Data from the matrix object formatted for the data grid
 */
function convertMatrixToDataGrid(
  matrix: MatrixResultsObject,
  view: ViewIdentifier
): DataGridFormat {
  const majorXProp = matrix.x.group_by as string;
  const majorYProp = matrix.y.group_by[0];
  const minorYProp = matrix.y.group_by[1];

  // Make a map of the x column labels to their index so we know what column to put each cell in.
  const columnMap = generateMatrixColumnMap(
    matrix.x[majorXProp].buckets,
    matrix.y[majorYProp].buckets,
    majorXProp,
    minorYProp
  );

  // Generate the data grid rows we can pass to `<DataGrid>`, excluding the header row that we'll
  // add later.
  const sortedBuckets = _.sortBy(matrix.y[majorYProp].buckets, (bucket) =>
    bucket.key.toLowerCase()
  );
  let dataGrid: DataGridFormat = sortedBuckets.map((bucket) => {
    const childBuckets = bucket[minorYProp].buckets;
    const majorYQuery = `${majorYProp}=${encodeUriElement(bucket.key)}`;
    let childRows = childBuckets.map((childBucket) => {
      return generateChildRow(
        childBucket,
        columnMap,
        majorXProp,
        majorYQuery,
        minorYProp,
        view
      );
    }) as Row[];

    // Generate the child row grid data after removing any null child rows.
    childRows = childRows.filter((row) => row !== null);
    if (childRows.length > 0) {
      const bucketId = toShishkebabCase(bucket.key);
      const href = `${viewQueries[view].cellLinkPath}&${majorYQuery}`;
      return {
        id: bucketId,
        cells: [
          {
            id: `${bucketId}-header`,
            content: RowHeaderCell,
            source: { key: bucket.key, href },
            noWrapper: true,
            role: "rowheader",
          } as Cell,
        ],
        children: childRows,
      } as Row;
    }
    return null;
  });

  // Remove any null entries from dataGrid.
  dataGrid = dataGrid.filter((row) => row !== null);

  // Build the header row columns that have a label.
  const headerColumnCells = [];
  for (const key in columnMap) {
    const href = `${
      viewQueries[view].cellLinkPath
    }&${majorXProp}=${encodeUriElement(key)}`;
    headerColumnCells[columnMap[key]] = {
      id: toShishkebabCase(key),
      content: ColumnHeaderCell,
      source: { key, href, view },
      noWrapper: true,
      role: "columnheader",
    };
  }

  // Build the header row with empty cells for the major and minor Y-axis categories. Add the data
  // rows we generated earlier to complete the entire data grid.
  const headerRow = [
    {
      id: "header",
      cells: [{ id: "header", content: "", columns: 2 }, ...headerColumnCells],
    },
  ];
  return headerRow.concat(dataGrid);
}

/**
 * Formats the overall Cell Model page, including the matrix of assay data.
 * @param cellModel - Cell model data from the data provider
 */
export default function TissueSummary({
  cellModel,
  view,
}: {
  cellModel: MatrixResults;
  view: ViewIdentifier;
}) {
  const router = useRouter();

  // Take the matrix data from the data provider and convert it to a format that can be used by
  // the `<DataGrid>` component.
  const dataGrid = convertMatrixToDataGrid(cellModel.matrix, view);

  function handleTabClick(tabId) {
    router.push(viewQueries[tabId].pagePath);
  }

  return (
    <>
      <Breadcrumbs item={cellModel} />
      <PagePreamble pageTitle="Cell Models" />
      <TabGroup onChange={handleTabClick} defaultId={view}>
        <TabList>
          {acceptedViews.map((viewName) => (
            <TabTitle id={viewName} key={viewName}>
              {viewQueries[viewName].tabTitle}
            </TabTitle>
          ))}
        </TabList>
        <div className="mt-4">
          <LabelXAxis label={cellModel.matrix.x.label} />
          <div className="flex">
            <LabelYAxis label={cellModel.matrix.y.label} />
            <div
              role="table"
              className="border grid w-max auto-rows-min gap-px overflow-x-auto border border-panel bg-gray-400 text-sm dark:bg-gray-600 dark:outline-gray-700"
            >
              <DataGrid data={dataGrid} meta={{ view }} />
            </div>
          </div>
        </div>
      </TabGroup>
    </>
  );
}

export async function getServerSideProps({ req, params }) {
  // Make sure the last path segment contains something we handle.
  const view = params.view;
  if (!acceptedViews.includes(view)) {
    return { notFound: true };
  }

  const request = new FetchRequest({ cookie: req.headers.cookie });
  const cellModel = (
    await request.getObject(viewQueries[view].dataProviderPath)
  ).union();
  if (FetchRequest.isResponseSuccess(cellModel)) {
    return {
      props: {
        cellModel,
        view,
        pageContext: { title: "Cell Model" },
      },
    };
  }
  return errorObjectToProps(cellModel);
}
