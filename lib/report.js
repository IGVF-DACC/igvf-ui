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
 * Get the schemas for the given types in `reportTypes`. Abstract types within `reportTypes` don't
 * have their own schemas, but all their subtypes' schemas get included in the result. If a type in
 * `reportType` doesn't have a schema nor subtypes, it gets ignored. If `profiles` isn't available,
 * null gets returned.
 * @param {Array<string>} reportTypes All `type` in the query string of the report
 * @param {object} profiles All schemas for all types keyed by their `@type`
 * @returns {Array<object>} Schema for the given `reportType`; null if not found
 */
export function getSchemasForReportTypes(reportTypes, profiles) {
  if (profiles) {
    return reportTypes.reduce((schemaAcc, reportType) => {
      const schema = profiles[reportType];
      if (schema) {
        // Matching schema found for the report type. Add it to the schema accumulator.
        return [...schemaAcc, schema];
      }

      // No matching schema for the report type. See if the report type is an abstract type with
      // subtypes.
      const subTypes = profiles._subtypes[reportType];
      if (subTypes) {
        // The report type is an abstract type with subtypes. Add all the subtypes' schemas to the
        // schema accumulator.
        return [...schemaAcc, ...subTypes.map((subType) => profiles[subType])];
      }

      // No matching schema for the report type, and the report type isn't an abstract type with
      // subtypes. Ignore it.
      return schemaAcc;
    }, []);
  }
  return null;
}

/**
 * Given report search results, determine all the `type=@type` types in the query string.
 * @param {objects} searchResults Search results for a report
 * @returns {Array<string>} Types in the query string
 */
function getTypes(searchResults) {
  return searchResults.filters
    .filter((filter) => filter.field === "type")
    .map((filter) => filter.term);
}

/**
 * Get the selected config type for the report from the "config=" query-string parameter. An empty
 * string gets returned if no "config=" exists in the query string. If multiple "config=" exist in
 * the query string, only the first one gets returned -- multiple "config=" isn't valid.
 * @param {object} searchResults Search results for a report
 * @returns {string} Selected config type for the report; empty string if none
 */
function getConfigType(searchResults) {
  const query = new QueryString(searchResults["@id"]);
  const configTypes = query.getKeyValues("config");
  return configTypes.length > 0 ? configTypes[0] : "";
}

/**
 * Get the selected object types based on the search query string and the "config=" query-string
 * parameter. The "config=" parameter, if used, takes precedence over the "type=" parameters.
 * @param {object} searchResults Search results for a report
 * @returns {Array<string>} All selected types for the report
 */
export function getSelectedTypes(searchResults) {
  const reportTypes = getTypes(searchResults);
  const configType = getConfigType(searchResults);
  return configType ? [configType] : reportTypes;
}

/**
 * Merge the properties of all the given schemas into one object, forming one object that's the
 * union of all the given schema properties. Only the contents of the `properties` property of each
 * schema appears in the results. Other properties of schemas (e.g. `mixinProperties`) don't appear
 * in the results. If `schemas` is null, null gets returned.
 * @param {Array<object>} schemas Array of relevant schemas
 * @returns {object} All properties of the given `schemas` merged into a single object
 */
export function getMergedSchemaProperties(schemas) {
  if (schemas) {
    return schemas.reduce(
      (mergedSchemaProperties, schema) => ({
        ...mergedSchemaProperties,
        ...schema.properties,
      }),
      {}
    );
  }
  return null;
}

/**
 * Get the columnSpecs for all possible columns for the given report types. These get sorted by
 * title, except for the `@id` column that always sorts first. An empty array gets returned if we
 * could find no schema for the report type, or profiles wasn't available. You can also pass a
 * config= type to get the columnSpecs for that config type. Unknown config types return an empty
 * array.
 * @param {Array<string>} reportTypes All the `@type` of the report
 * @param {object} profiles All schemas for all types keyed by their `@type`
 * @returns {array} Array of columnSpec objects
 */
export function getReportTypeColumnSpecs(reportTypes, profiles) {
  let columnSpecs = [];
  const schemas = getSchemasForReportTypes(reportTypes, profiles);
  if (schemas) {
    // Collect all properties from the schema. This represents all possible columns for the report.
    const schemaProperties = getMergedSchemaProperties(schemas);
    columnSpecs = Object.keys(schemaProperties).map((propertyName) => ({
      id: propertyName,
      title: schemaProperties[propertyName].title,
    }));
    columnSpecs = sortColumnSpecs(columnSpecs);
  }
  return columnSpecs;
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
 * Converts the columns of a schema or from search results into an array of columnSpec objects.
 * The array gets sorted by title, except for the column for the `@id` property that always sorts
 * first.
 * @param {object} schemaColumns columns from a schema or search results
 * @returns {array} Sorted array of columnSpec objects
 */
export function columnsToColumnSpecs(schemaColumns) {
  const columnSpecs = Object.keys(schemaColumns).map((columnId) => ({
    id: columnId,
    title: schemaColumns[columnId].title,
  }));
  return sortColumnSpecs(columnSpecs);
}
