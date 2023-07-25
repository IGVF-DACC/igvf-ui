// node_modules
import _ from "lodash";
// lib
import QueryString from "./query-string";
import { splitPathAndQueryString } from "./query-utils";

/**
 * ## `columnSpecs`
 * The report code often references the `columnSpecs` object that specifies the columns of a
 * report. This is an array of objects -- one object per column -- with the following properties:
 * - id: Column ID, which is the property name of the column in the report data; e.g. `@id`
 * - title: Column title, which is the human-readable name of the column; e.g. "ID"
 */

/**
 * Get the schema for the given `reportType`. If no schema exists for the report type or `profiles`
 * isn't available, null gets returned.
 * @param {string} reportType `@type` of the report
 * @param {object} profiles All schemas for all types keyed by their `@type`
 * @returns {object} Schema for the given `reportType`; null if not found
 */
export function getSchemaForReportType(reportType, profiles) {
  let schemaName;
  if (profiles) {
    schemaName = Object.keys(profiles).find(
      (profileName) => profileName === reportType,
    );
  }
  return profiles?.[schemaName] || null;
}

/**
 * Given report search results, determine the `@type` of the objects within it. It returns the
 * empty string if the type can't be determined. That should never happen because /report/ requires
 * a single "type=" in the query string.
 * @param {objects} searchResults Search results for a report
 * @returns {string} Type of objects in the report
 */
export function getReportType(searchResults) {
  const typeFilter = searchResults.filters.find(
    (filter) => filter.field === "type",
  );
  return typeFilter ? typeFilter.term : "";
}

/**
 * Get the columnSpecs for all possible columns for the given `reportType`. These get sorted by
 * title, except for the `@id` column that always sorts first. An empty array gets returned if we
 * could find no schema for the report type, or profiles wasn't available.
 * @param {string} reportType `@type` of the report
 * @param {object} profiles All schemas for all types keyed by their `@type`
 * @returns {array} Array of columnSpec objects
 */
export function getReportTypeColumnSpecs(reportType, profiles) {
  let columnSpecs = [];
  const schema = getSchemaForReportType(reportType, profiles);
  if (schema) {
    // Collect all properties from the schema. This represents all possible columns for the report.
    const schemaProperties = schema.properties;
    columnSpecs = Object.keys(schemaProperties).map((propertyName) => ({
      id: propertyName,
      title: schemaProperties[propertyName].title,
    }));
    columnSpecs = sortColumnSpecs(columnSpecs);
  }
  return columnSpecs;
}

/**
 * Get an array of columnSpecs for columns that are visible in the report. These come from either
 * the "field=" query-string parameters, or from the `columns` property of the search results if no
 * "field=" exists in the query string. The resulting columnSpecs get sorted by title, except for
 * the `@id` column that always sorts first. An empty array gets returned if we could find no
 * schema for the report type, or `profiles` wasn't available.
 * @param {object} searchResults Search results for a report
 * @returns {array} Array of columnSpecs that are visible in the report
 */
export function getVisibleReportColumnSpecs(searchResults, profiles) {
  let columnIds = [];
  const reportType = getReportType(searchResults);
  const schema = getSchemaForReportType(reportType, profiles);
  if (schema) {
    // Get all the "field=" values from the query string, if any.
    const { queryString } = splitPathAndQueryString(searchResults["@id"]);
    const query = new QueryString(queryString);
    columnIds = query.getKeyValues("field");
    if (columnIds.length === 0) {
      // No "field=" parameters exist in the query string, so all visible columns come from the search
      // result `columns` property.
      columnIds = Object.keys(searchResults.columns);

      // Filter the columnIDs to only those that exist in the schema, in case the search config columns
      // don't match the schema columns.
      columnIds = columnIds.filter((columnId) =>
        Object.keys(schema.properties).includes(columnId)
      );
    }

    // Collect all properties from the schema. This represents all possible columns for the report.
    const columnSpecs = columnIds
      .map((propertyName) => {
        return {
          id: propertyName,
          title: schema.properties[propertyName]?.title || propertyName,
        };
      })
      .filter((columnSpec) => columnSpec !== null);
    return sortColumnSpecs(columnSpecs);
  }
  return [];
}

/**
 * Gets the ID of the currently sorted column from the report query string. This includes the
 * leading dash for descending sort query strings. An empty string gets returned if the query
 * string doesn't have a "sort=" parameter.
 * @param {object} searchResults Search results for a report
 * @returns {string} ID of the currently sorted column; "" if none specified
 */
export function getSortColumn(searchResults) {
  // Have to extract the "sort=" term from the query string because this doesn't get included in
  // the search result filters.
  const { queryString } = splitPathAndQueryString(searchResults["@id"]);
  const query = new QueryString(queryString);
  const currentSortColumn = query.getKeyValues("sort");
  return currentSortColumn.length > 0 ? currentSortColumn[0] : "";
}

/**
 * Sort the array of table columns by their titles, except for the column for the @id property
 * that always sorts first. Use the column property name if no title exists.
 * @param {array} columnSpecs Array of table columns to sort in columnSpec format
 * @returns {array} Copy of `columns` sorted by title, but with @id always first
 */
function sortColumnSpecs(columnSpecs) {
  return _.sortBy(columnSpecs, [
    (columnSpec) => columnSpec.id !== "@id",
    (columnSpec) => {
      return columnSpec.id === "@id"
        ? 0
        : columnSpec.title?.toLowerCase() || columnSpec.id;
    },
  ]);
}

/**
 * Converts the `columns` property of a schema or from search results into an array of columnSpec
 * objects. The array gets sorted by title, except for the column for the `@id` property that
 * always sorts first.
 * @param {object} schemaColumns `columns` property of a schema or search results
 * @returns {array} Sorted array of columnSpec objects
 */
export function schemaColumnsToColumnSpecs(schemaColumns) {
  const columnSpecs = Object.keys(schemaColumns).map((columnId) => ({
    id: columnId,
    title: schemaColumns[columnId].title,
  }));
  return sortColumnSpecs(columnSpecs);
}

/**
 * Get the manually entered column IDs the user entered in the query string. These are the ones
 * that don't exist in the schema for the report type. An empty array gets returned if no manually
 * entered columns exist.
 * @param {array} visibleColumnIds Array of column IDs that are visible in the report
 * @param {array} columnSpecs Array of columnSpec objects for the report type
 * @returns {array} Array of manually entered column IDs
 */
export function getManuallyEnteredColumnIds(visibleColumnIds, columnSpecs) {
  return visibleColumnIds.filter(
    (columnId) => !columnSpecs.find((columnSpec) => columnSpec.id === columnId),
  );
}
