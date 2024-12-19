// node_modules
import _ from "lodash";
// types
import type { DatabaseObject } from "../globals.d";

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
    title: "Processed Datasets",
    termProp: "assay_titles",
    foreground: "fore-fileset-type-analysis",
    background: "back-fileset-type-analysis",
  },
  predictions: {
    dataQuery: "config=FileSetTypeSummary&status=released",
    typeQuery: "PredictionSet",
    title: "Predictions Datasets",
    termProp: "file_set_type",
    foreground: "fore-fileset-type-prediction",
    background: "back-fileset-type-prediction",
  },
  raw: {
    dataQuery: "config=PreferredAssayTitleSummary&status=released",
    typeQuery: "MeasurementSet",
    title: "Raw Datasets",
    termProp: "preferred_assay_title",
    foreground: "fore-fileset-type-measurement",
    background: "back-fileset-type-measurement",
  },
};

/**
 * Represents the month format associated with each file set. The month might come from the
 * `creation_timestamp` of the file set, the `release_timestamp` of the file set, or the
 * `submitted_files_timestamp` of the file set, depending on each file set's type. This is an
 * object keyed by file set paths and the corresponding months in yyyy-MM format.
 */
export type FileSetMonths = {
  [fileSet: string]: string;
};

/**
 * Check if the given file set should be considered released.
 * @param fileSet Testing this object's status
 * @returns True if the file should be considered released
 */
export function isReleasedFileSet(fileSet: DatabaseObject): boolean {
  return (
    fileSet.status === "released" ||
    fileSet.status === "archived" ||
    fileSet.status === "revoked"
  );
}

/**
 * Check if the given file set should be considered not released.
 * @param fileSet Testing this object's status
 * @returns True if the file should be considered not released
 */
export function isNonReleasedFileSet(fileSet: DatabaseObject): boolean {
  return fileSet.status === "in progress";
}

/**
 * Get the configuration for the given file-set type.
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
  chartData: LabChartItem[];
  maxCount: number;
};

/**
 * Represents the format of data within a single bucket. The index signature key name comes from an
 * entry in the `LabData.group_by` array.
 */
type BucketData = {
  key: string;
  doc_count: number;
  [prop: string]: AxisData | string | number; // Allow additional properties
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
  group_by: GroupByValue;
  label: string;
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
 * Type guard to check of the GroupByValue is a string or an array of strings.
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
 * @param fileSets FileSet objects to convert to Nivo data
 * @param selectedMonth Month to filter the file sets as yyyy-MM, or "All" to not filter
 * @param shouldIncludeLinks True to add the `shouldIncludeLinks` property to the data
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

  const labChartData: LabChartData = {
    chartData,
    maxCount: labData.doc_count,
  };
  return labChartData;
}

/**
 * Represents each datum of the release data, containing the month on the x axis and the running
 * count of file sets on the y axis.
 */
export type FileSetReleaseData = {
  x: string;
  y: number;
};
