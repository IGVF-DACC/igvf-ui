// node_modules
import _ from "lodash";
// lib
import FetchRequest from "./fetch-request";

/**
 * Label to display for file sets that have no assay title.
 */
export const NO_ASSAY_TITLE_LABEL = "unspecified assay";

/**
 * Represents the file-set types that the Data Set Lab bar chart can represent.
 */
type FileSetType = "processed" | "predictions" | "raw";

/**
 * Specifies the configuration for each file-set type.
 */
type FileSetTypeConfig = {
  /** Query string to access the data for the chart */
  dataQuery: string;
  /** `type` element of the query string */
  typeQuery: string;
  /** Title to display for the file-set type */
  title: string;
  /** Term to use to filter searches linked to a bar on the chart */
  termProp: string;
  /** Foreground class to use for the file-set type */
  foreground: string;
  /** Background class to use for the file-set type */
  background: string;
};

/**
 * Maps a file-set type to its corresponding parameters for the chart and queries.
 */
export const typeConfig: { [key in FileSetType]: FileSetTypeConfig } = {
  processed: {
    dataQuery: "config=AssayTitlesSummary&status=released",
    typeQuery: "AnalysisSet",
    title: "Released Processed Datasets",
    termProp: "assay_titles",
    foreground: "fore-fileset-type-analysis",
    background: "back-fileset-type-analysis",
  },
  predictions: {
    dataQuery: "config=FileSetTypeSummary&status=released",
    typeQuery: "PredictionSet",
    title: "Released Predictions Datasets",
    termProp: "file_set_type",
    foreground: "fore-fileset-type-prediction",
    background: "back-fileset-type-prediction",
  },
  raw: {
    dataQuery: "config=PreferredAssayTitleSummary&status=released",
    typeQuery: "MeasurementSet",
    title: "Released Raw Datasets",
    termProp: "preferred_assay_title",
    foreground: "fore-fileset-type-measurement",
    background: "back-fileset-type-measurement",
  },
};

/**
 * Represents each file set datum in the file-set lab bar chart.
 */
type LabChartItem = {
  /** Encoded title to use for each bar in the graph; contains the lab title and sub property */
  title: string;
  /** Value for the length of the bar for the lab and sub property */
  value: number;
};

/**
 * All data needed for the file-set lab bar chart.
 */
type LabChartData = {
  /** Data for each bar in the chart */
  chartData: LabChartItem[];
  /** Maximum count of file sets among all the bars */
  maxCount: number;
};

/**
 * Represents the format of data within a single bucket. The index signature key name comes from an
 * entry in the `LabData.group_by` array.
 */
type BucketData = {
  /** Property the bucket represents */
  key: string;
  /** Number of items in the bucket */
  doc_count: number;
  /** Additional data for the bucket keyed by a group_by value */
  [prop: string]: AxisData | string | number;
};

/**
 * One level of data buckets within a `LabData` object. Multiple levels of buckets can exist within
 * a `LabData` object.
 */
type AxisData = {
  buckets?: BucketData[];
};

/**
 * The `group_by` array in the `LabData` object can contain a single string, an array of strings, or
 * an array of any combination of strings and arrays of strings.
 */
export type GroupByValue = string | Array<string | string[]>;

/**
 * Represents the matrix data used for lab charts, but only the object under the `y` axis data. The
 * index signature key name comes from an entry in the `LabData.group_by` array.
 */
export type LabData = {
  /** Names of properties the data is grouped by */
  group_by: GroupByValue;
  /** Title representing the data */
  label: string;
  /** Number of items in the data */
  doc_count: number;
} & Record<string, AxisData | GroupByValue | string | number>;

/**
 * Object returned by the dataset summary API route, containing the matrix data for the lab chart.
 */
export type DatasetSummary = {
  matrix: {
    y: LabData;
  };
};

/**
 * Get the configuration for the given file-set type. Unknown file-set types return a default
 * configuration object.
 * @param type File-set type to get the configuration for
 * @returns Configuration for the given file-set type
 */
export function getFileSetTypeConfig(type: FileSetType): FileSetTypeConfig {
  return (
    typeConfig[type] || {
      dataQuery: "",
      typeQuery: "",
      title: "No Data Available",
      termProp: "",
      foreground: "",
      background: "",
    }
  );
}

/**
 * Get an array of all file-set types in the `typeConfig` global object.
 * @returns Array of all file-set types
 */
export function getAllFileSetTypes(): FileSetType[] {
  return Object.keys(typeConfig) as FileSetType[];
}

/**
 * Request the dataset summary for the given file set type. This request goes to the NextJS server
 * which, in turn, queries the data provider and caches the results on the NextJS server.
 * @param type Type of file set to request the summary for
 * @returns Promise that resolves to the dataset summary for the given file set type
 */
export async function requestSummary(
  type: FileSetType
): Promise<DatasetSummary | null> {
  const { dataQuery, typeQuery } = getFileSetTypeConfig(type);
  const request = new FetchRequest({ backend: true });
  return (
    await request.getObject(
      `/api/dataset-summary/?type=${typeQuery}&${dataQuery}`
    )
  ).optional() as DatasetSummary | null;
}

/**
 * Type guard to check if the GroupByValue is a string or an array of strings.
 * @param groupBy GroupByValue to check
 * @returns True if `groupBy` is an array of strings
 */
export function isGroupByValueAnArrayOfStrings(
  groupBy: GroupByValue
): groupBy is string[] {
  return (
    Array.isArray(groupBy) &&
    groupBy.every((value) => typeof value === "string")
  );
}

/**
 * Convert an array of FileSet objects into file-set type data in the form of an array of objects
 * that the Nivo bar chart can use. Each output array element handles a single bar in the chart,
 * which is a combination of lab and title. The output array is sorted by lab and then title.
 * @param labData Data from the dataset summary API route
 * @returns Nivo data for a bar chart and maximum count of file sets in a single bar
 */
export function convertLabDataToChartData(labData: LabData): LabChartData {
  const labGroup = labData.group_by[0] as string;

  // The subgroup can be an array or a string. If it's an array, the second element is the null
  // subgroup, and the first element is the subgroup.
  const subGroupBy = labData.group_by[1];
  let subGroup = "";
  let nullSubGroup = "";
  if (isGroupByValueAnArrayOfStrings(subGroupBy)) {
    // The subgroup is an array of strings, usually including the group property and another
    // property for those matching objects that lack that property (`nullSubGroup`).
    subGroup = subGroupBy[0];
    nullSubGroup = subGroupBy[1];
  } else {
    // The subgroup is just a string, indicating the group property, and no null subgroup.
    subGroup = subGroupBy as string;
    nullSubGroup = "";
  }
  const labBuckets = (labData[labGroup] as AxisData).buckets;

  // Extract the chart data from the dataset summary data.
  const chartData = labBuckets.reduce((acc, labBucket) => {
    const labTitle = labBucket.key;
    const subBuckets = (labBucket[subGroup] as AxisData).buckets;
    const labItems: LabChartItem[] = subBuckets.map((subBucket) => ({
      title: `${labTitle}|${
        subBucket.key === nullSubGroup ? NO_ASSAY_TITLE_LABEL : subBucket.key
      }`,
      value: subBucket.doc_count,
    }));
    return acc.concat(labItems);
  }, [] as LabChartItem[]);

  // Sort the chart data by value (least to greatest) and then by assay title (last to first) case-
  // insensitive. The nivo bar chart displays the bars in reverse order, resulting in value
  // greatest to least, and assay title first to last.
  const sortedChartData = _.orderBy(
    chartData,
    [(item) => item.value, (item) => item.title.split("|")[1].toLowerCase()],
    ["asc", "desc"]
  );

  return {
    chartData: sortedChartData,
    maxCount: labData.doc_count,
  };
}
