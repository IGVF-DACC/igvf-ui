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
export const getSchemaForReportType = (reportType, profiles) => {
  let schemaName;
  if (profiles) {
    schemaName = Object.keys(profiles).find(
      (profileName) => profileName === reportType
    );
  }
  return profiles?.[schemaName] || null;
};

/**
 * Given report search results, determine the `@type` of the objects within it. It returns the
 * empty string if the type can't be determined. That should never happen because /report/ requires
 * a single "type=" in the query string.
 * @param {objects} searchResults Search results for a report
 * @returns {string} Type of objects in the report
 */
export const getReportType = (searchResults) => {
  const typeFilter = searchResults.filters.find(
    (filter) => filter.field === "type"
  );
  return typeFilter ? typeFilter.term : "";
};

/**
 * Get the columnSpecs for all possible columns for the given `reportType`. These get sorted by
 * title, except for the `@id` column that always sorts first. An empty array gets returned if we
 * could find no schema for the report type, or profiles wasn't available.
 * @param {string} reportType `@type` of the report
 * @param {object} profiles All schemas for all types keyed by their `@type`
 * @returns {array} Array of columnSpec objects
 */
export const getReportTypeColumnSpecs = (reportType, profiles) => {
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
};

/**
 * Get an array of columnSpecs for columns that are visible in the report. These come from either
 * the "field=" query-string parameters, or from the `columns` property of the search results if no
 * "field=" exists in the query string. The resulting columnSpecs get sorted by title, except for
 * the `@id` column that always sorts first. An empty array gets returned if we could find no
 * schema for the report type, or `profiles` wasn't available.
 * @param {object} searchResults Search results for a report
 * @returns {array} Array of columnSpecs that are visible in the report
 */
export const getVisibleReportColumnSpecs = (searchResults, profiles) => {
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
    }

    // Collect all properties from the schema. This represents all possible columns for the report.
    let columnSpecs = columnIds
      .map((propertyName) => {
        if (schema.properties[propertyName]) {
          return {
            id: propertyName,
            title: schema.properties[propertyName].title,
          };
        }

        // The specified column wasn't found in the schema, so ignore it.
        return null;
      })
      .filter((columnSpec) => columnSpec !== null);
    return sortColumnSpecs(columnSpecs);
  }
  return [];
};

/**
 * Gets the ID of the currently sorted column from the report query string. This includes the
 * leading dash for descending sort query strings. An empty string gets returned if the query
 * string doesn't have a "sort=" parameter.
 * @param {object} searchResults Search results for a report
 * @returns {string} ID of the currently sorted column; "" if none specified
 */
export const getSortColumn = (searchResults) => {
  // Have to extract the "sort=" term from the query string because this doesn't get included in
  // the search result filters.
  const { queryString } = splitPathAndQueryString(searchResults["@id"]);
  const query = new QueryString(queryString);
  const currentSortColumn = query.getKeyValues("sort");
  return currentSortColumn.length > 0 ? currentSortColumn[0] : "";
};

/**
 * Sort the array of table columns by their titles, except for the column for the @id property
 * that always sorts first.
 * @param {array} columnSpecs Array of table columns to sort in columnSpec format
 * @returns {array} Copy of `columns` sorted by title, but with @id always first
 */
export const sortColumnSpecs = (columnSpecs) => {
  return _.sortBy(columnSpecs, [
    (columnSpec) => columnSpec.id !== "@id",
    (columnSpec) => (columnSpec.id === "@id" ? 0 : columnSpec.title),
  ]);
};

/**
 * Converts the `columns` property of a schema or from search results into an array of columnSpec
 * objects. The array gets sorted by title, except for the column for the `@id` property that
 * always sorts first.
 * @param {object} schemaColumns `columns` property of a schema or search results
 * @returns {array} Sorted array of columnSpec objects
 */
export const schemaColumnsToColumnSpecs = (schemaColumns) => {
  const columnSpecs = Object.keys(schemaColumns).map((columnId) => ({
    id: columnId,
    title: schemaColumns[columnId].title,
  }));
  return sortColumnSpecs(columnSpecs);
};
