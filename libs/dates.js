/**
 * Hopefully we can keep all date-related code in this file so that we can easily transition to the
 * Temporal API when enough browsers support it, or to a polyfill for the Temporal API if a good one
 * comes along.
 */

// node_modules
import dayjs from "dayjs";
// libs
import { UC } from "./constants";

export const formatDate = (date) => {
  return dayjs(date).format("MMMM D, YYYY");
};

/**
 * Format a start and end date in YYYY-MM-DD format into a dash-separated string. If only one of
 * the dates is provided, this returns a single date.
 * @param {string} startDate Start date in the format "YYYY-MM-DD"
 * @param {string} endDate End date in the format "YYYY-MM-DD"
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  const dateRange = [startDate, endDate]
    .filter((date) => date)
    .map((date) => formatDate(date));
  return dateRange.join(` ${UC.ndash} `);
};
