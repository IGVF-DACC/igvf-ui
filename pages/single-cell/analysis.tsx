// node_modules
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
import { useContext } from "react";
// components
import { DataTable } from "../../components/data-table";
import MarkdownSection from "../../components/markdown-section";
import { LinkedTableCell } from "../../components/matrix";
import NoCollectionData from "../../components/no-collection-data";
import PagePreamble from "../../components/page-preamble";
import SessionContext from "../../components/session-context";
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
import { getPreferredAssayTitleDescriptionMap } from "../../lib/ontology-terms";
import { encodeUriElement } from "../../lib/query-encoding";

interface SingleCellAnalysisProps extends PageProps {
  matrix: MatrixResultsObject;
}

/**
 * Classifications for single cell analysis samples. These only include the base classes without
 * modifiers.
 */
type Classifications =
  | "cell culture"
  | "cell line"
  | "differentiated cell specimen"
  | "differentiated technical sample"
  | "embryoid"
  | "gastruloid"
  | "organoid"
  | "primary cell"
  | "reprogrammed cell specimen"
  | "reprogrammed technical sample"
  | "technical sample"
  | "tissue/organ"
  | "whole organism"
  | "fallback";

/**
 * Mapping of analysis-set `samples_class` base values to their corresponding CSS hue variables.
 * Base classifications with different modifiers all share the same hue. Update the list as needed
 * when classifications are added or modified in the `classifications` property of the in-vitro
 * systems schema. You must use these Tailwind CSS custom hue classes along with the classes in
 * `classificationRoleClasses` for the colors to appear.
 * https://github.com/IGVF-DACC/igvfd/blob/dev/src/igvfd/schemas/in_vitro_system.json
 */
const classificationHueClasses = {
  "cell culture": "[--classification-hue:335]",
  "cell line": "[--classification-hue:5]",
  "differentiated cell specimen": "[--classification-hue:275]",
  "differentiated technical sample": "[--classification-hue:305]",
  embryoid: "[--classification-hue:35]",
  gastruloid: "[--classification-hue:65]",
  organoid: "[--classification-hue:95]",
  "primary cell": "[--classification-hue:125]",
  "reprogrammed cell specimen": "[--classification-hue:155]",
  "reprogrammed technical sample": "[--classification-hue:179]",
  "technical sample": "[--classification-hue:203]",
  "tissue/organ": "[--classification-hue:227]",
  "whole organism": "[--classification-hue:251]",
  fallback: "[--classification-hue:0]",
} satisfies Record<Classifications, string>;

/**
 * CSS classes for the table-cell background lightness and chroma of different roles of single-cell
 * analysis classifications using the hues defined in `classificationHueClasses`. The roles
 * correspond to the different table cell headers:
 *
 * - title - Full-width section headers for the classification title
 * - starting - Left-column header for the starting sample terms
 * - targeted - Second-column header for the targeted classification column
 * - targetedHl - Highlighted state for the targeted classification column
 * - data - Standard state for the data cells
 * - dataHl - Highlighted state for the data cells
 *
 * The colors use oklch color lightness, chroma, and hue to define the background colors for
 * different roles. https://oklch.com/
 */
const classificationRoleClasses = {
  title:
    "bg-[oklch(0.84_0.09_var(--classification-hue))] " +
    "dark:bg-[oklch(0.38_0.09_var(--classification-hue))]",

  starting:
    "bg-[oklch(0.9_0.055_var(--classification-hue))] " +
    "dark:bg-[oklch(0.3_0.055_var(--classification-hue))]",

  targeted:
    "bg-[oklch(0.96_0.03_var(--classification-hue))] " +
    "dark:bg-[oklch(0.26_0.03_var(--classification-hue))]",

  targetedHl:
    "[--row-hl-color:oklch(0.86_0.03_var(--classification-hue))] " +
    "dark:[--row-hl-color:oklch(0.36_0.06_var(--classification-hue))]",

  data:
    "bg-[oklch(0.7279_0.124_var(--classification-hue))] " +
    "dark:bg-[oklch(0.4432_0.1203_var(--classification-hue))]",

  dataHl:
    "[--row-hl-color:oklch(0.6279_0.124_var(--classification-hue))] " +
    "dark:[--row-hl-color:oklch(0.5432_0.1203_var(--classification-hue))]",
} as const;

/**
 * Preferred assay titles used for single cell analysis request queries. This is a subset of the values in
 * the `preferred_assay_titles` field in the schema mixins:
 * https://github.com/IGVF-DACC/igvfd/blob/dev/src/igvfd/schemas/mixins.json
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

/**
 * Base search URL for links from cells to the corresponding search results page.
 */
const BASE_SEARCH_URL = `/search/?${BASE_QUERY}`;

/**
 * Matrix bucket key used for analysis sets without a targeted sample term.
 */
const NO_TARGETED_SAMPLE_TERM = "no_samples_targeted_sample_term";

/**
 * Main page rendering component for single-cell analysis sets.
 *
 * @param matrix - Single-cell analysis matrix data to be displayed
 */
export default function Analysis({ matrix }: SingleCellAnalysisProps) {
  const dataGrid = convertMatrixToDataGrid(matrix);

  if (dataGrid.length === 0) {
    return (
      <>
        <PagePreamble />
        <NoCollectionData pageTitle="single-cell analysis" />
      </>
    );
  }

  return (
    <DataTable
      className="table-row-hl [--matrix-first-column-width:10rem] [&_td]:border-r [&_td]:border-b [&_td]:border-gray-500 [&_th]:border-r [&_th]:border-b [&_th]:border-gray-500 [&_thead:first-of-type_tr:first-child>th]:sticky [&_thead:first-of-type_tr:first-child>th]:top-0 [&_thead:first-of-type_tr:first-child>th]:z-10 [&_tr>*:last-child]:border-r-0! [&>:last-child>tr:last-child>*]:border-b-0!"
      scrollContainerClassName="max-w-full border-gray-300 dark:border-gray-600"
      data={dataGrid}
    />
  );
}

/**
 * Custom cell renderer for the two sample-term column headers that contain only static titles, not
 * data.
 *
 * @param isFirstColumn - Indicates if the cell is in the first (left-most) column
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
      className={`bg-table-data-cell px-2 py-1 text-left align-bottom text-sm ${
        isFirstColumn
          ? "w-(--matrix-first-column-width) max-w-(--matrix-first-column-width) min-w-(--matrix-first-column-width)"
          : "w-[calc(var(--matrix-first-column-width)*1.6)] max-w-[calc(var(--matrix-first-column-width)*1.6)] min-w-[calc(var(--matrix-first-column-width)*1.6)]"
      }`}
    >
      {children}
    </th>
  );
}

/**
 * Displays the X-axis header cells for the data columns, using sideways text.
 */
function MatrixXAxisHeaderCell({
  children,
}: {
  children: string | number | React.ReactNode;
}) {
  if (typeof children !== "string") {
    throw new TypeError("Matrix X-axis header content must be a string");
  }

  const { profiles } = useContext(SessionContext);
  const preferredAssayTitleDescriptionMap =
    getPreferredAssayTitleDescriptionMap(profiles);
  const assayDescription = preferredAssayTitleDescriptionMap[children] || "";

  const query = generateMatrixCellQuery({ assay: children });

  return (
    <LinkedTableCell
      href={`${BASE_SEARCH_URL}&${query}`}
      as="th"
      className="bg-single-cell-analysis-header w-8 min-w-8 px-1 py-2 align-bottom"
      linkClassName="px-0 whitespace-normal"
      tooltipContent={
        assayDescription ? (
          <MarkdownSection className="text-xs text-white dark:text-black">
            {assayDescription}
          </MarkdownSection>
        ) : undefined
      }
    >
      <div className="relative z-1 flex w-full justify-center py-1">
        <div className="inline-flex max-h-40 rotate-180 text-start text-sm leading-[1.1] [writing-mode:vertical-rl]">
          <span
            className={
              assayDescription
                ? "border-help-underline border-l border-dotted"
                : undefined
            }
          >
            {children}
          </span>
        </div>
      </div>
    </LinkedTableCell>
  );
}

/**
 * Renders a title row for a classification section of the matrix.
 *
 * @param colSpan - Number of columns across the entire matrix
 * @param children - Classification text to display inside the cell
 */
function MatrixClassTitleRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: string;
}) {
  const baseClassification = getBaseClassification(children);
  const hueClass = isClassification(baseClassification)
    ? classificationHueClasses[baseClassification]
    : classificationHueClasses.fallback;

  const query = generateMatrixCellQuery({ classification: children });

  return (
    <LinkedTableCell
      href={`${BASE_SEARCH_URL}&${query}`}
      className={`${hueClass} ${classificationRoleClasses.title}`}
      linkClassName="px-0 whitespace-normal"
      as="th"
      colSpan={colSpan}
    >
      <div className="sticky left-0 w-[min(100%,100cqw)] text-center text-sm font-semibold capitalize">
        {children}
      </div>
    </LinkedTableCell>
  );
}

/**
 * Renders a sample-term header cell for the Y-axis of the matrix. This is the left-most column in
 * the table.
 *
 * @param classification - Sample classification section this cell belongs to
 * @param rowSpan - Number of rows across the entire table
 * @param children - Sample term to display in the cell
 */
function MatrixYAxisHeaderCell({
  classification,
  rowSpan,
  children,
}: {
  classification: string;
  rowSpan: number;
  children: string;
}) {
  const baseClassification = getBaseClassification(classification);
  const hueClass = isClassification(baseClassification)
    ? classificationHueClasses[baseClassification]
    : classificationHueClasses.fallback;

  const query = generateMatrixCellQuery({
    classification,
    startingTerm: children,
  });

  return (
    <LinkedTableCell
      href={`${BASE_SEARCH_URL}&${query}`}
      as="th"
      className={`w-(--matrix-first-column-width) max-w-(--matrix-first-column-width) min-w-(--matrix-first-column-width) px-2 py-1 text-left text-sm leading-[1.1] font-semibold ${hueClass} ${classificationRoleClasses.starting}`}
      linkClassName="px-0 whitespace-normal"
      rowSpan={rowSpan}
    >
      {children}
    </LinkedTableCell>
  );
}

/**
 * Renders a subheader cell for the Y-axis of the matrix.
 *
 * @param startingTerm - Starting sample term for this subheader cell
 * @param targetedTerm - Targeted sample term for this subheader cell
 * @param classification - Sample classification section this cell belongs to
 * @param children - Content to be displayed inside the cell
 */
function MatrixYAxisSubheaderCell({
  startingTerm,
  targetedTerm,
  classification,
  children,
}: {
  startingTerm: string;
  targetedTerm: string;
  classification: string;
  children: string;
}) {
  const baseClassification = getBaseClassification(classification);
  const hueClass = isClassification(baseClassification)
    ? classificationHueClasses[baseClassification]
    : classificationHueClasses.fallback;

  const query = generateMatrixCellQuery({
    classification,
    startingTerm,
    targetedTerm,
  });

  return (
    <LinkedTableCell
      href={`${BASE_SEARCH_URL}&${query}`}
      as="th"
      className={`w-[calc(var(--matrix-first-column-width)*1.6)] max-w-[calc(var(--matrix-first-column-width)*1.6)] min-w-[calc(var(--matrix-first-column-width)*1.6)] px-2 py-1 text-left text-sm font-normal wrap-anywhere whitespace-normal ${hueClass} ${classificationRoleClasses.targeted} ${classificationRoleClasses.targetedHl}`}
      linkClassName="px-0 whitespace-normal"
      data-highlight
    >
      {children === NO_TARGETED_SAMPLE_TERM ? (
        <span className="italic">none</span>
      ) : (
        children
      )}
    </LinkedTableCell>
  );
}

/**
 * Renders a data cell for the matrix. This either displays an empty cell if there are no results or
 * a linked cell if there are results. This cell never displays the actual number of results.
 *
 * @param preferredAssayTitle - Preferred assay title for this data cell
 * @param startingTerm - Starting sample term for this data cell
 * @param targetedTerm - Targeted sample term for this data cell
 * @param classification - Sample classification section this cell belongs to
 * @param children - Number of results represented (though not rendered) in the data cell
 */
function MatrixDataCell({
  preferredAssayTitle,
  startingTerm,
  targetedTerm,
  classification,
  children,
}: {
  preferredAssayTitle: string;
  startingTerm: string;
  targetedTerm: string;
  classification: string;
  children: number;
}) {
  if (children === 0) {
    return <MatrixEmptyDataCell />;
  }

  // Determine the base classification and corresponding hue class for styling the data cell.
  const baseClassification = getBaseClassification(classification);
  const hueClass = isClassification(baseClassification)
    ? classificationHueClasses[baseClassification]
    : classificationHueClasses.fallback;

  const query = generateMatrixCellQuery({
    classification,
    startingTerm,
    targetedTerm,
    assay: preferredAssayTitle,
  });

  const targetedTermLabel =
    targetedTerm !== NO_TARGETED_SAMPLE_TERM
      ? `targeted term ${targetedTerm}, `
      : "";

  return (
    <LinkedTableCell
      href={`${BASE_SEARCH_URL}&${query}`}
      label={`Cell for assay ${preferredAssayTitle}, starting term ${startingTerm}, ${targetedTermLabel}sample classification ${classification}`}
      className={`cursor-pointer text-center align-middle text-xs ${hueClass} ${classificationRoleClasses.data} ${classificationRoleClasses.dataHl}`}
      linkClassName="px-0 whitespace-normal"
      data-highlight
    >
      {""}
    </LinkedTableCell>
  );
}

/**
 * Renders an empty matrix data cell.
 */
function MatrixEmptyDataCell() {
  return <td className="bg-table-data-cell" />;
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

  // If no rows were generated for any sample class, return an empty array so that we display no
  // data grid.
  if (sampleClassRows.length === 0) {
    return [];
  }

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
    startsNewSegment: true,
  };

  const rows = generateRows(
    sampleTermBuckets,
    sampleClass,
    headerBuckets,
    columnMap,
    yGroupByTargetedTerm,
    xGroupBy
  );

  // A sample-class bucket can contain sample-term buckets without any targeted-term leaf buckets.
  // Don't render a classification title unless the classification has at least one complete row.
  if (rows.length === 0) {
    return [];
  }

  return [sectionTitle, ...rows];
}

/**
 * Generates rows for sample-term buckets, including targeted-sample-term rows and assay data
 * cells.
 *
 * @param sampleTermBuckets - Buckets for sample terms
 * @param sampleClass - Analysis-set samples class
 * @param headerBuckets - Buckets for the x-axis header row
 * @param columnMap - Mapping of column keys to their indices
 * @param yGroupByTargetedTerm - Field name to group targeted-sample-term buckets by
 * @param xGroupBy - Field name to group column buckets by
 * @returns Rows representing the sample terms, targeted sample terms, and assay data cells
 */
function generateRows(
  sampleTermBuckets: MatrixBucket[],
  sampleClass: string,
  headerBuckets: MatrixBucket[],
  columnMap: ColumnMap,
  yGroupByTargetedTerm: string,
  xGroupBy: string
): Row[] {
  return sampleTermBuckets.flatMap((sampleTermBucket) => {
    const targetedSampleTermBuckets = getMatrixBuckets(
      sampleTermBucket,
      yGroupByTargetedTerm
    );

    // A sample term needs at least one targeted-term bucket to produce a complete table row.
    if (targetedSampleTermBuckets.length === 0) {
      return [];
    }

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
            componentProps: {
              preferredAssayTitle: assayBucket.key,
              startingTerm: sampleTermBucket.key,
              targetedTerm: targetedSampleTermBucket.key,
              classification: sampleClass,
            },
          });
        });

        // Insert the child row title before the data cells.
        const childCells = [
          createCell({
            id: toShishkebabCase(targetedSampleTermBucket.key),
            content: targetedSampleTermBucket.key,
            component: MatrixYAxisSubheaderCell,
            componentProps: {
              startingTerm: sampleTermBucket.key,
              targetedTerm: targetedSampleTermBucket.key,
              classification: sampleClass,
            },
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
          componentProps: {
            classification: sampleClass,
          },
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

/**
 * Each analysis-set `samples_class` has a classification that might start with one of the following
 * modifiers:
 *
 * - no modifier
 * - multiplexed
 * - pooled
 * - multiplexed pooled
 *
 * This function takes the classification string and returns its base classification without the
 * modifier. If the classification has no modifier, it is returned as is.
 *
 * @param classification - Classification analysis set `samples_class`
 * @returns base classification string without the modifier, if any
 */
function getBaseClassification(classification: string): Classifications | "" {
  const baseClassification = classification.replace(
    /^(?:multiplexed pooled|multiplexed|pooled)\s+/,
    ""
  );

  return isClassification(baseClassification) ? baseClassification : "";
}

/**
 * Generates the query string for a matrix cell link based on the provided parameters. Because all
 * parameters are optional, provide them in an object with named properties.
 *
 * @param classification - Sample classification for this matrix cell
 * @param startingTerm - Starting sample term for this matrix cell
 * @param targetedTerm - Targeted sample term for this matrix cell
 * @param assay - Preferred assay title for this matrix cell
 */
function generateMatrixCellQuery({
  classification,
  startingTerm,
  targetedTerm,
  assay,
}: {
  classification?: string;
  startingTerm?: string;
  targetedTerm?: string;
  assay?: string;
}): string {
  const href = classification
    ? [`samples_class=${encodeUriElement(classification)}`]
    : [];

  if (startingTerm) {
    href.push(
      `samples.sample_terms.term_name=${encodeUriElement(startingTerm)}`
    );
  }

  if (assay) {
    href.push(`preferred_assay_titles=${encodeUriElement(assay)}`);
  }

  // Targeted sample terms can indicate their absence using the special NO_TARGETED_SAMPLE_TERM
  // constant. Generate a negative query for this case.
  if (targetedTerm) {
    if (targetedTerm === NO_TARGETED_SAMPLE_TERM) {
      href.push("samples.targeted_sample_term.term_name!=*");
    } else {
      href.push(
        `samples.targeted_sample_term.term_name=${encodeUriElement(targetedTerm)}`
      );
    }
  }

  return href.join("&");
}

/**
 * Type guard to check if a string value is a valid classification.
 *
 * @param value - The string value to check if it is a valid classification.
 * @returns True if the value is a valid classification, false otherwise.
 */
function isClassification(value: string): value is Classifications {
  return Object.hasOwn(classificationHueClasses, value);
}

/**
 * Get server-side props for the single-cell analysis page.
 *
 * @param context - The server-side context containing the request and other information
 * @returns Props for the single-cell analysis page, including matrix data or error information
 */
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
