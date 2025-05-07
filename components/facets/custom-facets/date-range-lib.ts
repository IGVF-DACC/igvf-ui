// lib
import { iso8601ToDateOnly, stringToDate } from "../../../lib/dates";
// root
import {
  SearchResultsFacet,
  SearchResultsFacetTerm,
  SearchResultsFilter,
} from "../../../globals";

/**
 * Extracts the date from a filter term string. The term should be in the format "gte:YYYY-MM-DD",
 * "lte:YYYY-MM-DD", "gt:YYYY-MM-DD", or "lt:YYYY-MM-DD". The function returns the date in the
 * format "YYYY-MM-DD". For the "gt:" case, the date gets adjusted one day later. For the "lt:"
 * case, the date gets adjusted one day earlier. If the term is invalid, the function returns an
 * empty string. Generally, this function gets called after we already know the term is in one of
 * the valid formats, not like a wildcard or a single date.
 * @param term - gte:, lte:, gt:, or lt: term to extract the date from
 * @returns date in the format YYYY-MM-DD; empty string if the term is invalid
 */
export function extractDateFromFilterTerm(term: string): string {
  // Check for "gte:YYYY-MM-DD" or "lte:YYYY-MM-DD" format.
  const matchOrEqual = term.match(/(?:gte|lte):(.+)/);
  if (matchOrEqual) {
    const iso8601Date = matchOrEqual[1];
    const date = stringToDate(iso8601Date);
    if (!isNaN(date.getTime())) {
      return iso8601ToDateOnly(iso8601Date);
    }
    return "";
  }

  // Check for "gt:YYYY-MM-DD" or "lt:YYYY-MM-DD" format. The UI doesn't make use of these
  // filters, but we need to handle them in case the user has added them manually.
  const match = term.match(/(?:gt|lt):(.+)/);
  if (match) {
    const iso8601Date = match[1];
    const date = stringToDate(iso8601Date);
    if (!isNaN(date.getTime())) {
      // For "gt" add one day to the date. For "lt" subtract one day.
      if (term.startsWith("gt:")) {
        date.setDate(date.getDate() + 1);
      } else if (term.startsWith("lt:")) {
        date.setDate(date.getDate() - 1);
      }
      return iso8601ToDateOnly(date.toISOString());
    }
    return "";
  }

  return "";
}

/**
 * Finds the earliest and latest dates from an array of consistently formatted date strings.
 * @param dates - Array of date strings in a consistent format, e.g. "YYYY-MM-DD"
 * @returns Two date strings: the earliest and latest dates in the array
 */
function findEarliestAndLatestDates(dates: string[]): string[] {
  const earliest = dates.reduce((earliest, date) => {
    return date < earliest ? date : earliest;
  }, dates[0]);
  const latest = dates.reduce((latest, date) => {
    return date > latest ? date : latest;
  }, dates[0]);

  return [earliest, latest];
}

/**
 * Extracts the earliest and latest dates from a date-range facet. The earliest date gets returned
 * as the first element of the array, and the latest date as the second element. If the facets have
 * no terms, the function returns null for both dates.
 * @param facet - The facet object containing date range terms
 * @returns Array of two Date objects representing the earliest and latest dates in the facet
 */
export function getFacetDateRange(facet: SearchResultsFacet): Date[] {
  const facetTerms = facet.terms as SearchResultsFacetTerm[];
  if (facetTerms.length > 0) {
    const allDates = facetTerms.map((term) =>
      iso8601ToDateOnly(term.key_as_string)
    );
    const [earliest, latest] = findEarliestAndLatestDates(allDates);
    return [stringToDate(earliest), stringToDate(latest)];
  }
  return [null, null];
}

/**
 * Extracts the earliest and latest dates from search-results filter terms from search results. The
 * earliest date gets returned as the first element of the array, and the latest date as the second
 * element.
 * @param field Field name to filter on
 * @param filters Filter objects from the search results
 * @returns Two Date objects representing the earliest and latest dates in the filters
 */
export function getFilterDateRange(
  field: string,
  filters: SearchResultsFilter[]
): Date[] {
  // Special case: if the filter is a single ISO 8601 date (e.g. "YYYY-MM-DD",
  // "YYYY-MM-DDT00:00:00Z") return this date for both earliest and latest.
  const singleDateFilter = filters.find((filter) => {
    const date = stringToDate(filter.term);
    return !isNaN(date.getTime());
  });
  if (singleDateFilter) {
    const date = stringToDate(singleDateFilter.term);
    return [date, date];
  }

  // Special case: if the filter is a wildcard (i.e. "*"), return null for both dates so that the
  // facet dates get used instead.
  const wildcardFilter = filters.find((filter) => filter.term === "*");
  if (wildcardFilter) {
    return [null, null];
  }

  // Get all the facet filters for the given field using gte:{date}, lte:{date}, gt:{date}, and
  // lt:{date}.
  const gteFilters = filters.filter(
    (filter) => filter.field === field && filter.term.startsWith("gte:")
  );
  const gtFilters = filters.filter(
    (filter) => filter.field === field && filter.term.startsWith("gt:")
  );
  const lteFilters = filters.filter(
    (filter) => filter.field === field && filter.term.startsWith("lte:")
  );
  const ltFilters = filters.filter(
    (filter) => filter.field === field && filter.term.startsWith("lt:")
  );

  // Combine the gteFilters and gtFilters dates into a single array of dates.
  const gteDates = gteFilters.map((filter) =>
    extractDateFromFilterTerm(filter.term)
  );
  const gtDates = gtFilters.map((filter) =>
    extractDateFromFilterTerm(filter.term)
  );
  const allGteAndGtDates = gteDates.concat(gtDates);

  // Combine the lteFilters and ltFilters dates into a single array of dates.
  const lteDates = lteFilters.map((filter) =>
    extractDateFromFilterTerm(filter.term)
  );
  const ltDates = ltFilters.map((filter) =>
    extractDateFromFilterTerm(filter.term)
  );
  const allLteAndLtDates = lteDates.concat(ltDates);

  // Find the latest date from the gte and gt filters (i.e. the most restrictive).
  let latestGreaterDate = null;
  if (allGteAndGtDates.length > 0) {
    latestGreaterDate = allGteAndGtDates.reduce((latest, date) => {
      return date > latest ? date : latest;
    }, allGteAndGtDates[0]);
  }

  // Find the earliest date from the lte and lt filters (i.e. the most restrictive).
  let earliestLessDate = null;
  if (allLteAndLtDates.length > 0) {
    earliestLessDate = allLteAndLtDates.reduce((earliest, date) => {
      return date < earliest ? date : earliest;
    }, allLteAndLtDates[0]);
  }

  return [
    latestGreaterDate ? stringToDate(latestGreaterDate) : null,
    earliestLessDate ? stringToDate(earliestLessDate) : null,
  ];
}
