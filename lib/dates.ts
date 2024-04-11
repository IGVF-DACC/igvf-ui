/**
 * Hopefully we can keep all date-related code in this file so that we can easily transition to the
 * Temporal API when enough browsers support it, or to a polyfill for the Temporal API if a good one
 * comes along.
 */

// node_modules
import * as dateFns from "date-fns";
// lib
import { UC } from "./constants";

/**
 * Convert an ISO 8601 date string to a human-readable form in the local time zone. The given date
 * can use an abbreviated time common in this system, such as YYYY-MM-DD.
 * @param date ISO 8601 date string
 * @returns Human-readable date string
 */
export function formatDate(date?: string): string {
  if (date) {
    const jsDate = new Date(date);
    const midnightDate = new Date(
      jsDate.valueOf() + jsDate.getTimezoneOffset() * 60 * 1000
    );
    return dateFns.format(midnightDate, "MMMM d, yyyy");
  }
  return "";
}

/**
 * Format a start and end date in YYYY-MM-DD format into a dash-separated string. If only one of
 * the dates is provided, this returns a single date.
 * @param startDate Start date in the format "YYYY-MM-DD"
 * @param endDate End date in the format "YYYY-MM-DD"
 * @returns Formatted date range
 */
export function formatDateRange(startDate?: string, endDate?: string): string {
  const dateRange = [startDate, endDate]
    .filter((date) => date)
    .map((date) => formatDate(date));
  return dateRange.join(` ${UC.ndash} `);
}

/**
 * Convert an ISO 8601 date string to the equivalent date in yyyy-MM format. Don't use npm date
 * utilities because they can use the local time zone, which could return a month that's off by
 * one.
 * @param iso8601 ISO 8601 date string
 * @returns Equivalent date in yyyy-MM format
 */
export function iso8601ToYearDate(iso8601: string): string {
  const basicDate = iso8601.split("T")[0];
  const dt = new Date(basicDate);
  const year = dt.getUTCFullYear();
  const month = dt.getUTCMonth() + 1;
  return `${year}-${month.toString().padStart(2, "0")}`;
}
