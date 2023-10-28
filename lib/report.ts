// node_modules
import _ from "lodash";
// lib
import QueryString from "./query-string";
import { splitPathAndQueryString } from "./query-utils";
// types
import type {
  Profiles,
  ProfilesGeneric,
  ProfilesProps,
  Schema,
  SchemaProperties,
  SchemaPropertiesGenerics,
  SchemaPropertiesProps,
  SearchResults,
  SearchResultsColumns,
} from "../globals.d";

/**
 * The report code often references the `ColumnSpec` object that specifies the columns of a
 * report and only gets used internally to this file.
 */
interface ColumnSpec {
  // Column ID, which is the property name of the column in the report data; e.g. `@id`
  id: string;
  // Column title, which is the human-readable name of the column; e.g. "ID"
  title: string;
}

/**
 * Get the schemas for the given types in `reportTypes`. Abstract types within `reportTypes` don't
 * have their own schemas, but all their subtypes' schemas get included in the result. If a type in
 * `reportType` doesn't have a schema nor subtypes, it gets ignored. If `profiles` isn't available,
 * null gets returned.
 * @param {string[]} reportTypes All `type` in the query string of the report
 * @param {Profiles|null} profiles All schemas for all types keyed by their `@type`
 * @returns {Schema[]} Schemas for the given `reportTypes`
 */
export function getSchemasForReportTypes(
  reportTypes: string[],
  profiles: Profiles | null
): Schema[] {
  if (profiles) {
    return reportTypes.reduce((schemaAcc: Schema[], reportType) => {
      const schema = (profiles as ProfilesGeneric)[reportType];
      if (schema) {
        // Matching schema found for the report type. Add it to the schema accumulator.
        return [...schemaAcc, schema];
      }

      // No matching schema for the report type. See if the report type is an abstract type with
      // subtypes.
      const subTypes = (profiles as ProfilesProps)._subtypes[reportType];
      if (subTypes) {
        // The report type is an abstract type with subtypes. Add all the subtypes' schemas to the
        // schema accumulator.
        return [
          ...schemaAcc,
          ...subTypes.map((subType) => (profiles as ProfilesGeneric)[subType]),
        ];
      }

      // No matching schema for the report type, and the report type isn't an abstract type with
      // subtypes. Ignore it.
      return schemaAcc;
    }, []);
  }
  return [];
}

/**
 * Given report search results, determine all the `type=@type` types in the query string.
 * @param {SearchResults} searchResults Search results for a report
 * @returns {string[]} Types in the query string
 */
function getTypes(searchResults: SearchResults): string[] {
  return searchResults.filters
    .filter((filter) => filter.field === "type")
    .map((filter) => filter.term);
}

/**
 * Get the selected config type for the report from the "config=" query-string parameter. An empty
 * string gets returned if no "config=" exists in the query string. If multiple "config=" exist in
 * the query string, only the first one gets returned -- multiple "config=" isn't valid.
 * @param {SearchResults} searchResults Search results for a report
 * @returns {string} Selected config type for the report; empty string if none
 */
function getConfigType(searchResults: SearchResults): string {
  const { queryString } = splitPathAndQueryString(searchResults["@id"]);
  const query = new QueryString(queryString);
  const configTypes = query.getKeyValues("config");
  return configTypes.length > 0 ? configTypes[0] : "";
}

/**
 * Get the selected object types based on the search query string and the "config=" query-string
 * parameter. The "config=" parameter, if used, takes precedence over the "type=" parameters.
 * @param {SearchResults} searchResults Search results for a report
 * @returns {string[]} All selected types for the report
 */
export function getSelectedTypes(searchResults: SearchResults): string[] {
  const reportTypes = getTypes(searchResults);
  const configType = getConfigType(searchResults);
  return configType ? [configType] : reportTypes;
}

/**
 * Merge the properties of all the given schemas into one object, forming one object that's the
 * union of all the given schema properties. Only the contents of the `properties` property of each
 * schema appears in the results. Other properties of schemas (e.g. `mixinProperties`) don't appear
 * in the results. If `schemas` is null, null gets returned.
 * @param {Schema[]} schemas Array of relevant schemas
 * @returns {SchemaProperties} All properties of the given `schemas` merged into a single object
 */
export function getMergedSchemaProperties(schemas: Schema[]): SchemaProperties {
  return schemas.reduce(
    (mergedSchemaProperties, schema) => ({
      ...mergedSchemaProperties,
      ...schema.properties,
    }),
    {}
  );
}

/**
 * Get the columnSpecs for all possible columns for the given report types. These get sorted by
 * title, except for the `@id` column that always sorts first. An empty array gets returned if we
 * could find no schema for the report type, or profiles wasn't available. You can also pass a
 * config= type to get the columnSpecs for that config type. Unknown config types return an empty
 * array.
 * @param {string[]} reportTypes All the `@type` of the report
 * @param {Profiles} profiles All schemas for all types keyed by their `@type`
 * @returns {ColumnSpec[]} Array of columnSpec objects
 */
export function getReportTypeColumnSpecs(
  reportTypes: string[],
  profiles: Profiles
): ColumnSpec[] {
  let columnSpecs: ColumnSpec[] = [];
  const schemas = getSchemasForReportTypes(reportTypes, profiles);
  if (schemas.length > 0) {
    // Collect all properties from the schema. This represents all possible columns for the report.
    const schemaProperties = getMergedSchemaProperties(schemas);
    columnSpecs = Object.keys(schemaProperties).map((propertyName) => {
      const columnSpec: ColumnSpec = {
        id: propertyName,
        title: (
          (schemaProperties as SchemaPropertiesGenerics)[
            propertyName
          ] as SchemaPropertiesProps
        ).title,
      };
      return columnSpec;
    });
    columnSpecs = sortColumnSpecs(columnSpecs);
  }
  return columnSpecs;
}

/**
 * Gets the ID of the currently sorted column from the report query string. This includes the
 * leading dash for descending sort query strings. An empty string gets returned if the query
 * string doesn't have a "sort=" parameter.
 * @param {SearchResults} searchResults Search results for a report
 * @returns {string} ID of the currently sorted column; "" if none specified
 */
export function getSortColumn(searchResults: SearchResults): string {
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
 * @param {ColumnSpec[]} columnSpecs Array of table columns to sort in columnSpec format
 * @returns {ColumnSpec[]} Copy of `columns` sorted by title, but with @id always first
 */
function sortColumnSpecs(columnSpecs: ColumnSpec[]): ColumnSpec[] {
  return _.sortBy(columnSpecs, [
    (columnSpec) => columnSpec.id !== "@id",
    (columnSpec) => {
      return columnSpec.id === "@id" ? 0 : columnSpec.title.toLowerCase();
    },
  ]);
}

/**
 * Converts the columns of a schema or from search results into an array of columnSpec objects.
 * The array gets sorted by title, except for the column for the `@id` property that always sorts
 * first.
 * @param {SearchResultsColumns} schemaColumns `columns` from a schema or search results
 * @returns {ColumnSpec[]} Sorted array of columnSpec objects
 */
export function columnsToColumnSpecs(
  schemaColumns: SearchResultsColumns
): ColumnSpec[] {
  const columnSpecs: ColumnSpec[] = Object.keys(schemaColumns).map(
    (columnId) => {
      const columnSpec: ColumnSpec = {
        id: columnId,
        title: schemaColumns[columnId].title,
      };
      return columnSpec;
    }
  );
  return sortColumnSpecs(columnSpecs);
}

/**
 * Extract a property from an object using a dotted-notation path to the property. For example,
 * `getUnknownProperty("term.name", { term: { name: "brain" } })` returns "brain". If the property
 * doesn't exist, undefined gets returned. If the property is an array, the array gets flattened and
 * returned.
 * @param {string} id Dotted-notation path to the desired property
 * @param {{[key:string]:unknown}} source Object to search for the property
 * @returns {string|number|boolean|object|undefined} Value of the embedded property; undefined if
 *   not found
 */
export function getUnknownProperty(
  id: string,
  source: { [key: string]: unknown }
): string | number | boolean | object | undefined {
  const idSegments = id ? id.split(".") : [];

  let embeddedProp = source as { [key: string]: unknown };
  let embeddedPropArray = [] as { [key: string]: unknown }[];
  for (let i = 0; i < idSegments.length; i += 1) {
    embeddedProp = embeddedProp[idSegments[i]] as { [key: string]: unknown };

    // Bail if the specified property doesn't exist within the object.
    if (embeddedProp === undefined) {
      return undefined;
    }

    // If we come across an array as we descend through the object along the id, recursively
    // descend into each element of the array and then return the resulting array of values.
    // This handles the rest of the dotted-notation id, so break out of the loop after this.
    if (Array.isArray(embeddedProp)) {
      embeddedPropArray = embeddedProp.map((element) => {
        if (typeof element === "object") {
          const nextIdSegments = idSegments.slice(i + 1).join(".");
          return getUnknownProperty(nextIdSegments, element);
        }
        return element;
      });
      break;
    }
  }

  return embeddedPropArray.length > 0 ? embeddedPropArray.flat() : embeddedProp;
}
