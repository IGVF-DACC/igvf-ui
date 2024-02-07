// node_modules
import { addMonths } from "date-fns/addMonths";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import _ from "lodash";
// types
import type { DatabaseObject } from "../globals.d";

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
    return format(date, outputFormat);
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
  let dateTypeForMonth = parse(firstMonth, "yyyy-MM", new Date());
  let month = firstMonth;
  while (month <= lastMonth) {
    allMonths.push(month);
    dateTypeForMonth = addMonths(dateTypeForMonth, 1);
    month = format(dateTypeForMonth, "yyyy-MM");
  }
  return allMonths;
}

/**
 * Collect all the given file sets' creation_timestamp values in YYYY-MM format without duplicates.
 * @param {DatabaseObject[]} fileSets FileSet objects to collect months for
 * @returns {string[]} Unique YYYY-MM values for the file sets
 */
export function collectFileSetMonths(fileSets: DatabaseObject[]): string[] {
  const uniqueMonths = fileSets.reduce((months: string[], fileSet) => {
    const month = format(fileSet.creation_timestamp as string, "yyyy-MM");
    return !months.includes(month) ? months.concat(month) : months;
  }, []);

  return uniqueMonths.sort();
}

/**
 * Filter the given file-set objects to those that were created in the given month. If the month is
 * "All," return all the given file sets.
 * @param {DatabaseObject[]} fileSets FileSet objects from the data provider
 * @param {string} month Month to filter the file sets by, or "All" to not filter
 * @returns {DatabaseObject[]} FileSet objects filtered by month, or all file sets if month is "All"
 */
export function filterFileSetsByMonth(
  fileSets: DatabaseObject[],
  month: string
): DatabaseObject[] {
  return month !== "All"
    ? fileSets.filter(
        (fileSet) =>
          format(fileSet.creation_timestamp as string, "yyyy-MM") === month
      )
    : fileSets;
}

/**
 * Represents each file set datum in the FileSet status bar chart.
 */
type FileSetStatusData = {
  title: string;
  initiated: number;
  withFiles: number;
  released: number;
};

/**
 * All data needed for the FileSet status bar chart.
 */
type FileSetStatusChartData = {
  fileSetData: FileSetStatusData[];
  maxCount: number;
};

/**
 * Convert an array of FileSet objects into status data in the form of an array of objects that the
 * Nivo bar chart can use. Each output array element handles a single bar in the chart, which is a
 * combination of lab and title. The output array is sorted by lab and then title.
 * @param {DatabaseObject[]} fileSets FileSet objects to convert to Nivo data
 * @returns {object} Nivo data for a bar chart and maximum count of file sets in a single bar
 * @returns {object[]} fileSetData Nivo data for a bar chart
 * @returns {number} maxCount Maximum number of file sets in a single bar
 */
export function convertFileSetsToStatusData(
  fileSets: DatabaseObject[]
): FileSetStatusChartData {
  // Group all the file sets by keys that concatenate each lab and title -- {lab}|{title}.
  const labSummaryGroups = _.groupBy(fileSets, (fileSet: DatabaseObject) => {
    // Get the `term_name` property of the `assay_term` object of the `fileSet` object.
    const assayTerm = fileSet.assay_term;
    const termName = (assayTerm as { term_name: string }).term_name;
    return `${(fileSet.lab as { title: string }).title}|${
      fileSet.preferred_assay_title || termName
    }`;
  });

  // Sort the group names effectively by lab and then title. The Nivo bar chart needs this list
  // in reverse order.
  const labSummaryGroupNames = Object.keys(labSummaryGroups)
    .sort()
    .toReversed();

  // Convert the grouped data into a flat array of objects that the Nivo bar chart can use. Each
  // object has the lab|title key, and the number of released, initiated, and with-files file
  // sets. Each output array element corresponds to a lab|title bar in the chart.
  let maxCount = 0;
  const fileSetData = labSummaryGroupNames.map((key) => {
    const labSummaryFileSets = labSummaryGroups[key];

    const released = labSummaryFileSets.filter((fileSet) => {
      return fileSet.status === "released";
    }).length;
    const initiated = labSummaryFileSets.filter((fileSet) => {
      return (
        fileSet.status !== "released" &&
        (!fileSet.files || (fileSet.files as string[]).length === 0)
      );
    }).length;
    const withFiles = labSummaryFileSets.filter((fileSet) => {
      return (
        fileSet.status !== "released" && (fileSet.files as string[])?.length > 0
      );
    }).length;
    maxCount = Math.max(maxCount, released + initiated + withFiles);

    return {
      title: key,
      initiated,
      withFiles,
      released,
    } as FileSetStatusData;
  });
  return { fileSetData, maxCount };
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
    if (fileSet.release_timestamp) {
      const month = format(fileSet.release_timestamp as string, "yyyy-MM");
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
  if (allMonthsWithData.length > 0) {
    const allMonths = generateEveryMonthBetween(
      allMonthsWithData.at(0) as string,
      allMonthsWithData.at(-1) as string
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
