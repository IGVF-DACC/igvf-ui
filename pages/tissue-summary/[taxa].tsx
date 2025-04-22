// node_modules
import _ from "lodash";
import Link from "next/link";
import { useRouter } from "next/router";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import DataGrid, {
  type Cell,
  type DataGridFormat,
  type Row,
} from "../../components/data-grid";
import { LabelXAxis, LabelYAxis } from "../../components/matrix";
import NoCollectionData from "../../components/no-collection-data";
import PagePreamble from "../../components/page-preamble";
import {
  TabGroup,
  TabList,
  TabPanes,
  TabPane,
  TabTitle,
} from "../../components/tabs";
// lib
import FetchRequest from "../../lib/fetch-request";
import { errorObjectToProps } from "../../lib/errors";
import { toShishkebabCase } from "../../lib/general";
import { type ColumnMap, generateMatrixColumnMap } from "../../lib/matrix";
import { encodeUriElement } from "../../lib/query-encoding";
// root
import type {
  MatrixBucket,
  MatrixResults,
  MatrixResultsObject,
} from "../../globals";

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
 * Used to map a taxa string to data provider and UI page paths.
 */
type TaxaMap = {
  /** Path and query string for the data provider matrix query for the given taxa */
  dataProviderPath: string;
  /** Base path for cells to link to */
  cellLinkPath: string;
  /** Path for the UI page that displays the page for the given taxa */
  pagePath: string;
  /** `@type` of the matrix search result for the taxa query */
  queryAtType: string;
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
 * Map a taxa to the corresponding paths to the data provider matrix query and the UI page.
 */
const taxaQueries: Record<string, TaxaMap> = {
  "mus-musculus": {
    dataProviderPath:
      "/tissue-mus-musculus/?type=Tissue&taxa=Mus+musculus&virtual=false",
    cellLinkPath: "/search/?type=Tissue&taxa=Mus+musculus",
    pagePath: "/tissue-summary/mus-musculus",
    queryAtType: "TissueSummaryMusMusculus",
    columnHeaderCellClass: "bg-tissue-matrix-column-header-mus-musculus",
    rowHeaderCellClass: "bg-tissue-matrix-row-header-mus-musculus",
    rowSubheaderCellClass: "bg-tissue-matrix-row-subheader-mus-musculus",
    dataCellClass: "bg-tissue-matrix-data-mus-musculus",
    hoverCellClass: "group-hover:bg-tissue-matrix-highlight-mus-musculus",
  },
  "homo-sapiens": {
    dataProviderPath:
      "/tissue-homo-sapiens/?type=Tissue&taxa=Homo+sapiens&virtual=false",
    cellLinkPath: "/search/?type=Tissue&taxa=Homo+sapiens",
    pagePath: "/tissue-summary/homo-sapiens",
    queryAtType: "TissueSummaryHomoSapiens",
    columnHeaderCellClass: "bg-tissue-matrix-column-header-mus-musculus",
    rowHeaderCellClass: "bg-tissue-matrix-row-header-mus-musculus",
    rowSubheaderCellClass: "bg-tissue-matrix-row-subheader-mus-musculus",
    dataCellClass: "bg-tissue-matrix-data-mus-musculus",
    hoverCellClass: "group-hover:bg-tissue-matrix-highlight-mus-musculus",
  },
};

/**
 * List all accepted taxa.
 */
const acceptedTaxa = Object.keys(taxaQueries);

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
  meta: { taxa: string };
}) {
  const bgClass = taxaQueries[meta.taxa].rowHeaderCellClass;

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
  meta: { taxa: string };
}) {
  const bgClass = taxaQueries[meta.taxa].rowSubheaderCellClass;
  const hoverClass = taxaQueries[meta.taxa].hoverCellClass;

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
  meta: { taxa: string };
}) {
  const bgClass = taxaQueries[meta.taxa].columnHeaderCellClass;

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
  meta: { taxa: string };
}) {
  const bgClass = taxaQueries[meta.taxa].dataCellClass;
  const hoverClass = taxaQueries[meta.taxa].hoverCellClass;

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
 * @param taxa Taxa string for the matrix data: `homo-sapiens` or `mus-musculus`
 * @returns Data-grid row for one child row of the matrix
 */
function generateChildRow(
  childBucket: MatrixBucket,
  columnMap: ColumnMap,
  majorXProp: string,
  majorYQuery: string,
  minorYProp: string,
  taxa: string
): Row {
  // Create the cells for one child row, starting with the minor Y-axis category for the row.
  const href = `${
    taxaQueries[taxa].cellLinkPath
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
      taxaQueries[taxa].cellLinkPath
    }&${majorYQuery}&${minorYProp}=${encodeUriElement(
      childBucket.key
    )}&${majorXProp}=${encodeUriElement(columnBucket.key)}`;
  }

  return {
    id: toShishkebabCase(childBucket.key),
    cells: childCells,
  };
}

/**
 * Convert the matrix object from the data provider to a format that can be used by `<DataGrid>`.
 * This includes not only the data for the cells, but also the top and left header rows.
 * @param matrix Entire matrix object from the data provider
 * @param taxa Taxa string for the matrix data: `homo-sapiens` or `mus-musculus`
 * @returns Data from the matrix object formatted for the data grid
 */
function convertMatrixToDataGrid(
  matrix: MatrixResultsObject,
  taxa: string
): DataGridFormat {
  const majorXProp = matrix.x.group_by as string;
  const majorYProp = matrix.y.group_by[0];
  const minorYProp = matrix.y.group_by[1];

  // Make a map of the x column labels to their index so we know what column to put each cell in.
  const columnMap = generateMatrixColumnMap(matrix.x[majorXProp].buckets);

  // Generate the data grid rows we can pass to `<DataGrid>`, excluding the header row that we'll
  // add later.
  const sortedBuckets = _.sortBy(matrix.y[majorYProp].buckets, (bucket) =>
    bucket.key.toLowerCase()
  );
  const dataGrid: DataGridFormat = sortedBuckets.map((bucket) => {
    const bucketId = toShishkebabCase(bucket.key);
    const childBuckets = bucket[minorYProp].buckets;
    const majorYQuery = `${majorYProp}=${encodeUriElement(bucket.key)}`;
    const childRows = childBuckets.map((childBucket) => {
      return generateChildRow(
        childBucket,
        columnMap,
        majorXProp,
        majorYQuery,
        minorYProp,
        taxa
      );
    }) as Row[];

    const href = `${taxaQueries[taxa].cellLinkPath}&${majorYQuery}`;
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
  });

  // Build the header row columns that have a label.
  const headerColumnCells = [];
  for (const key in columnMap) {
    const href = `${
      taxaQueries[taxa].cellLinkPath
    }&${majorXProp}=${encodeUriElement(key)}`;
    headerColumnCells[columnMap[key]] = {
      id: toShishkebabCase(key),
      content: ColumnHeaderCell,
      source: { key, href, taxa },
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
 * Display the table of data in the matrix. This handles both the human and rodent data.
 * @param tissueSummary - Data for the matrix to display
 * @param taxa - Taxa string for the matrix data: `homo-sapiens` or `mus-musculus`
 * @param xLabel - Label for the X-axis
 * @param yLabel - Label for the Y-axis
 */
function PanelContent({
  tissueSummary,
  taxa,
  xLabel,
  yLabel,
}: {
  tissueSummary: MatrixResults;
  taxa: string;
  xLabel: string;
  yLabel: string;
}) {
  if (tissueSummary.total > 0) {
    // Take the matrix data from the data provider and convert it to a format that can be used by
    // the `<DataGrid>` component.
    const dataGrid = convertMatrixToDataGrid(tissueSummary.matrix, taxa);

    return (
      <>
        <LabelXAxis label={xLabel} />
        <div className="flex">
          <LabelYAxis label={yLabel} />
          <div
            role="table"
            className="border-1 grid w-max auto-rows-min gap-px overflow-x-auto border border-panel bg-gray-400 text-sm dark:bg-gray-600 dark:outline-gray-700"
          >
            <DataGrid data={dataGrid} meta={{ taxa }} />
          </div>
        </div>
      </>
    );
  }

  return <NoCollectionData pageTitle="data available" />;
}

/**
 * Formats the overall Tissue Summary page, including the matrix of rodent data.
 * @param tissueSummary - Tissue summary data from the data provider
 */
export default function TissueSummary({
  tissueSummary,
}: {
  tissueSummary: MatrixResults;
}) {
  const router = useRouter();

  // Map `tissueSummary["@type"]` to the corresponding taxa string.
  const taxa = Object.keys(taxaQueries).find(
    (taxaQueriesKey) =>
      taxaQueries[taxaQueriesKey].queryAtType === tissueSummary["@type"][0]
  );

  // Switch to the new path for the tab the user clicked.
  function onTabChange(tabId: string) {
    router.push(taxaQueries[tabId].pagePath);
  }

  return (
    <>
      <Breadcrumbs item={tissueSummary} />
      <PagePreamble pageTitle={tissueSummary.title} />
      <TabGroup defaultId={taxa} onChange={onTabChange}>
        <TabList>
          <TabTitle
            id="homo-sapiens"
            className="items-center font-semibold italic"
          >
            Homo sapiens
          </TabTitle>
          <TabTitle
            id="mus-musculus"
            className="items-center font-semibold italic"
          >
            Mus musculus
          </TabTitle>
        </TabList>
        <TabPanes>
          <TabPane className="pt-4">
            {taxa === "homo-sapiens" && (
              <PanelContent
                tissueSummary={tissueSummary}
                taxa={taxa}
                xLabel={tissueSummary.matrix.x.label}
                yLabel="Tissue / Organ"
              />
            )}
          </TabPane>
          <TabPane className="pt-4">
            {taxa === "mus-musculus" && (
              <PanelContent
                tissueSummary={tissueSummary}
                taxa={taxa}
                xLabel={tissueSummary.matrix.x.label}
                yLabel="Tissue / Organ"
              />
            )}
          </TabPane>
        </TabPanes>
      </TabGroup>
    </>
  );
}

export async function getServerSideProps({ req, params }) {
  // Make sure the last path segment contains something we handle.
  const taxa = params.taxa;
  if (!acceptedTaxa.includes(taxa)) {
    return { notFound: true };
  }

  const request = new FetchRequest({ cookie: req.headers.cookie });
  const tissueSummary = (
    await request.getObject(taxaQueries[taxa].dataProviderPath)
  ).union();
  if (FetchRequest.isResponseSuccess(tissueSummary)) {
    return {
      props: {
        tissueSummary,
        pageContext: { title: "Tissue Summary" },
      },
    };
  }
  return errorObjectToProps(tissueSummary);
}
