// node_modules
import { format } from "date-fns"
// libs
import { UC } from "./constants"

/**
 * Format a start and end date in YYYY-MM-DD format into a dash-separated string.
 * @param {string} startDate Start date in the format "YYYY-MM-DD"
 * @param {string} endDate End date in the format "YYYY-MM-DD"
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  const dateRange = []
  if (startDate) {
    dateRange.push(format(new Date(startDate), "MMMM d, yyyy"))
  }
  if (endDate) {
    dateRange.push(format(new Date(endDate), "MMMM d, yyyy"))
  }
  return dateRange.join(` ${UC.ndash} `)
}
