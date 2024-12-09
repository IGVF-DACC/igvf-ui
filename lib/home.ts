// node_modules
import * as dateFns from "date-fns";
import _ from "lodash";
// lib
import { iso8601ToYearDate } from "./dates";
// types
import type { DatabaseObject } from "../globals.d";

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
 * The three file-set types that the Data Set Lab bar chart can represent.
 */
export type FileSetType = "released" | "withFiles" | "initiated";

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
 * Convert a month in YYYY-MM format to MMMM yyyy format. For example, "2022-01" becomes
 * "January 2022".
 * @param {string} month Month in YYYY-MM format
 * @param {string} outputFormat Format to output the month in, e.g. "MMMM yyyy"
 * @returns {string} Month in MMMM yyyy format, e.g. "January 2022"
 */
export function formatMonth(month: string, outputFormat: string): string {
  if (month !== "All") {
    const [year, monthNumber] = month.split("-");
    const date = new Date(Number(year), Number(monthNumber) - 1);
    return dateFns.format(date, outputFormat);
  }
  return month;
}

/**
 * Generate an array of numbers from 0 to `maxValue`, containing `maxCount` elements or fewer. The
 * generated array includes 0 and `maxValue` at either end, and the other elements evenly spaced
 * between them. Use this for the X axis scale.
 * @param {number} maxValue Maximum value for the number array
 * @param {number} maxCount Maximum number of array items to generate
 * @returns {number[]} Array of numbers from 0 to `maxValue`, with `maxCount` elements or fewer
 */
export function generateNumberArray(
  maxValue: number,
  maxCount: number
): number[] {
  const count = Math.min(maxCount, maxValue + 1);
  const increment = maxValue / (count - 1);

  // Generate an array with length `count`, then use the callback to fill it with evenly spaced
  // numbers using the increment we calculated before.
  return Array.from({ length: count }, (v, i) => Math.round(i * increment));
}

/**
 * Generate an array of every month between the first and last months, inclusive, in yyyy-MM format.
 * @param {string} firstMonth Month to start with in YYYY-MM format
 * @param {string} lastMonth Month to end with in YYYY-MM format
 * @returns {string[]} Array of months between the first and last months, inclusive
 */
export function generateEveryMonthBetween(
  firstMonth: string,
  lastMonth: string
): string[] {
  const allMonths: string[] = [];
  let dateTypeForMonth = dateFns.parse(firstMonth, "yyyy-MM", new Date());
  let month = firstMonth;
  while (month <= lastMonth) {
    allMonths.push(month);
    dateTypeForMonth = dateFns.addMonths(dateTypeForMonth, 1);
    month = dateFns.format(dateTypeForMonth, "yyyy-MM");
  }
  return allMonths;
}

/**
 * Generate an object with file set paths as keys and the corresponding months in YYYY-MM format.
 * Released file sets use their `release_timestamp` if available. Non released file sets with files
 * use the earliest `creation_timestamp` of all the files in the file set. Non released file sets
 * without files use their `creation_timestamp`.
 * @param fileSets File set objects whose months are to be generated
 * @returns Map of file set paths to the corresponding months in yyyy-MM format
 */
export function collectFileSetMonths(
  fileSets: DatabaseObject[]
): FileSetMonths {
  // Make an easily searched object of file paths and their associated file set objects.
  return fileSets.reduce((acc: FileSetMonths, fileSet) => {
    let fileSetTime: string = "";
    const fileSetFiles = fileSet.files as DatabaseObject[];

    if (isReleasedFileSet(fileSet)) {
      // Released file sets use their `release_timestamp` if available.
      fileSetTime = fileSet.release_timestamp || "";
    } else if (isNonReleasedFileSet(fileSet)) {
      if (fileSetFiles?.length > 0) {
        // Unreleased file sets with files use the earliest `creation_timestamp` of all the files in
        // the file set.
        fileSetTime = fileSet.submitted_files_timestamp as string;
      } else {
        // Unreleased file sets without files use their `creation_timestamp`.
        fileSetTime = fileSet.creation_timestamp;
      }
    }

    // Add the timestamp to the result with the file set path as the key.
    if (fileSetTime) {
      return {
        ...acc,
        [fileSet["@id"]]: iso8601ToYearDate(fileSetTime),
      } as FileSetMonths;
    }
    return acc;
  }, {});
}

/**
 * Collect all the given file sets' timestamps in YYYY-MM format without duplicates and sorted
 * chronologically.
 * @param fileSetMonths All file set paths and their corresponding timestamps
 * @returns Unique sorted yyyy-MM values for the file sets
 */
export function generateFileSetMonthList(
  fileSetMonths: FileSetMonths
): string[] {
  const uniqueMonths = [...new Set(Object.values(fileSetMonths))];
  return uniqueMonths.toSorted().toReversed();
}

/**
 * Filter the given file-set objects to those that were created in the given month. If the month is
 * "All," return all the given file sets.
 * @param fileSets FileSet objects from the data provider
 * @param fileSetMonths FileSet months keyed by file set path
 * @param month Month to filter the file sets as yyyy-MM, or "All" to not filter
 * @returns FileSet objects filtered by month, or all file sets if month is "All"
 */
export function filterFileSetsByMonth(
  fileSets: DatabaseObject[],
  fileSetMonths: FileSetMonths,
  month: string
): DatabaseObject[] {
  return month !== "All"
    ? fileSets.filter((fileSet) => fileSetMonths[fileSet["@id"]] === month)
    : fileSets;
}

/**
 * Take a month in yyyy-MM format and convert it into a range query element for Elasticsearch. The
 * range query element is a string that represents a range of dates in the format `[start TO end]`.
 * The start date is the first day of the given month, and the end date is the last day of the
 * given month, both in yyyy-MM-dd format. The month "All" returns an empty string.
 * @param month Month in yyyy-MM format to convert into a range query element
 * @returns Range query element `[yyyy-MM-dd%20TO%20yyyy-MM-dd]` for the given `month`
 */
export function composeMonthRangeQueryElement(month: string): string {
  if (month !== "All") {
    // Determine the first day of the given month in yyyy-MM-dd format.
    const dateTimeOfMonth = dateFns.parse(month, "yyyy-MM", new Date());
    const firstDateTime = dateFns.format(dateTimeOfMonth, "yyyy-MM-dd");

    // Determine the last day of the given month in yyyy-MM-dd format.
    const daysInMonth = dateFns.getDaysInMonth(dateTimeOfMonth);
    const lastDateTime = dateFns.format(
      dateFns.addDays(dateTimeOfMonth, daysInMonth - 1),
      "yyyy-MM-dd"
    );

    return `[${firstDateTime}%20TO%20${lastDateTime}]`;
  }
  return "";
}

/**
 * Compose a set of query-string elements for the given file-set type and month to filter file sets.
 * This includes status and date-range query elements.
 * @param fileSetType File-set type to represent in the query
 * @param selectedMonth Month in yyyy-MM format, or "All" to not filter by date
 * @returns Query element for the given status, term, and month
 */
export function composeFileSetQueryElements(
  fileSetType: FileSetType,
  selectedMonth: string
): string {
  const dateRange = composeMonthRangeQueryElement(selectedMonth);

  // Determine the status, file, and month-range query elements.
  let statusAndFileQuery = "";
  let monthQuery = "";
  if (fileSetType === "released") {
    statusAndFileQuery = "&status=released&status=archived&status=revoked";
    monthQuery = dateRange
      ? `&advancedQuery=release_timestamp:${dateRange}`
      : "";
  } else {
    if (fileSetType === "withFiles") {
      statusAndFileQuery = "&status=in+progress&files=*";
      monthQuery = dateRange
        ? `&advancedQuery=submitted_files_timestamp:${dateRange}`
        : "";
    } else {
      statusAndFileQuery = "&status=in+progress&files!=*";
      monthQuery = dateRange
        ? `&advancedQuery=creation_timestamp:${dateRange}`
        : "";
    }
  }

  return `${statusAndFileQuery}${monthQuery}`;
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
} & {
  [key: string]: AxisData;
};

/**
 * One level of data buckets within a `LabData` object. Multiple levels of buckets can exist within
 * a `LabData` object.
 */
type AxisData = {
  buckets: BucketData[];
};

/**
 * Represents the matrix data used for lab charts, but only the object under the `y` axis data. The
 * index signature key name comes from an entry in the `LabData.group_by` array.
 */
type LabData = {
  group_by: string[];
  label: string;
  doc_count: number;
} & {
  [key: string]: AxisData;
};

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
  const labGroup = labData.group_by[0];
  const subGroup = labData.group_by[1];
  const labBuckets = labData[labGroup].buckets;

  const chartData = labBuckets.reduce((acc, labBucket) => {
    const labTitle = labBucket.key;
    const subBuckets = labBucket[subGroup].buckets;
    const labItems: LabChartItem[] = subBuckets.map((subBucket) => ({
      title: `${labTitle}|${subBucket.key}`,
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

/**
 * Intermediate type that tracks the number of file sets released in each month. Each key is the
 * month in YYYY-MM format, and each value is the number of file sets released in that month.
 */
type ReleasesByMonth = {
  [month: string]: number;
};

/**
 * Convert an array of FileSet objects into release data in the form of an array of objects that the
 * Nivo line chart can use. Each output array element represents a point on the line chart, with the
 * x property as the month in yyyy-MM format and the y property as the running count of file sets.
 * @param fileSets FileSet objects to convert to Nivo line-chart data
 * @returns Objects with x and y properties for the Nivo line chart
 */
export function convertFileSetsToReleaseData(
  fileSets: DatabaseObject[]
): FileSetReleaseData[] {
  // Get the number of file sets released in each month.
  const releasesByMonth = fileSets.reduce((acc: ReleasesByMonth, fileSet) => {
    if (isReleasedFileSet(fileSet) && fileSet.release_timestamp) {
      const month = dateFns.format(
        fileSet.release_timestamp as string,
        "yyyy-MM"
      );
      if (month in acc) {
        acc[month] += 1;
      } else {
        acc[month] = 1;
      }
    }
    return acc;
  }, {});

  // Generate the release data for the Nivo line chart.
  let releaseData: FileSetReleaseData[] = [];
  const allMonthsWithData = Object.keys(releasesByMonth).sort();
  const currentMonth = dateFns.format(new Date(), "yyyy-MM");
  if (allMonthsWithData.length > 0) {
    const allMonths = generateEveryMonthBetween(
      allMonthsWithData.at(0) as string,
      currentMonth
    );

    // Use the sorted array of all months to generate the running count of file sets released.
    let runningCount = 0;
    releaseData = allMonths.map((month) => {
      const monthlyCount = releasesByMonth[month] || 0;
      runningCount += monthlyCount;
      // Return the month in MMM yyyy format and the running count of file sets released.
      return {
        x: formatMonth(month, "MMM yyyy"),
        y: runningCount,
      };
    });
  }
  return releaseData;
}
