// node_modules
import _ from "lodash";
import { ComponentType } from "react";
// lib
import QueryString from "./query-string";
import { splitPathAndQueryString } from "./query-utils";
// types
import type {
  DatabaseObject,
  Profiles,
  ProfilesGeneric,
  ProfilesProps,
  Schema,
  SchemaProperties,
  SearchResults,
  SearchResultsColumns,
} from "../globals.d";

/**
 * Maximum number of columns that can be selected at once. Base this on a maximum URL length of
 * (3700 - 40 for the protocol and domain - 500 for a long facet query) / 30 for a typical column
 * specifier length.
 */
export const MAXIMUM_VISIBLE_COLUMNS = 120;

/**
 * IDs of audits that the user can see while not logged in.
 */
const publicAuditColumnSpecIds = [
  "audit.ERROR",
  "audit.WARNING",
  "audit.NOT_COMPLIANT",
];

/**
 * Properties of the each audit level that we display the columns for. Modify this array to display
 * different audit properties as columns when clicking one of the audit checkboxes.
 */
export const auditProperties: readonly string[] = [
  "path",
  "detail",
  "category",
];

/**
 * ColumnSpec objects for the audit columns of a report. These aren't "real" in that their `id`
 * properties only specify a level of audits, not specific properties within those audits that
 * would appear in the report table. So these audits get used in the column selector modal to
 * select all the properties of a given audit level, while the actual audit properties get used in
 * the report table columns, and we sometimes need to convert between the two.
 */
const allAuditColumnSpecs: ColumnSpec[] = [
  {
    id: "audit.ERROR",
    title: "Error",
  },
  {
    id: "audit.WARNING",
    title: "Warning",
  },
  {
    id: "audit.NOT_COMPLIANT",
    title: "Not Compliant",
  },
  {
    id: "audit.INTERNAL_ACTION",
    title: "Internal Action",
  },
];

/**
 * The report code often references the `ColumnSpec` object that specifies the columns of a
 * report and only gets used internally to this file.
 */
export interface ColumnSpec {
  // Column ID, which is the property name of the column in the report data; e.g. `@id`
  id: string;
  // Column title, which is the human-readable name of the column; e.g. "ID"
  title: string;
  // React component to render the column's cells; used for custom cell rendering
  display?: ComponentType;
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
 * in the results.
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
        title: schemaProperties[propertyName].title,
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
export function sortColumnSpecs(columnSpecs: ColumnSpec[]): ColumnSpec[] {
  return _.sortBy(columnSpecs, [
    (columnSpec) => columnSpec.id !== "@id",
    (columnSpec) => {
      if (columnSpec.id === "@id") {
        return 0;
      }
      if (!columnSpec.title) {
        return columnSpec.id;
      }
      return columnSpec.title.toLowerCase();
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
 * Get the columnSpecs for the audit columns of a report. If the user is authenticated, all audit
 * columns get returned. Otherwise, only the public audit columns get returned.
 * @param {boolean} isAuthenticated True if the user has authenticated
 * @returns {ColumnSpec[]} Array of audit columnSpec objects
 */
export function getAuditColumnSpecs(isAuthenticated: boolean): ColumnSpec[] {
  if (isAuthenticated) {
    return allAuditColumnSpecs;
  }
  return allAuditColumnSpecs.filter((auditColumnSpec) =>
    publicAuditColumnSpecIds.includes(auditColumnSpec.id)
  );
}

/**
 * Get all audit column IDs for the given audit columns specs, meaning the audit column spec IDs
 * (e.g. `audit.ERROR`) and all its properties (e.g. `audit.ERROR.path`, `audit.ERROR.detail`).
 * @param {ColumnSpec[]} columnSpecs Audit column specs at the user's authentication level
 * @returns {string[]} All audit column IDs for the given audit column specs
 */
export function getAllAuditColumnIds(auditColumnSpecs: ColumnSpec[]): string[] {
  return auditColumnSpecs.reduce((acc: string[], auditColumnSpec) => {
    const auditColumnProperties = auditProperties.map(
      (property) => `${auditColumnSpec.id}.${property}`
    );
    return [...acc, ...auditColumnProperties];
  }, []);
}

/**
 * From the search-results columns, separate the visible columns from the audit columns.
 * @param {SearchResultsColumns} columns Columns from the report query string
 * @returns {object} Has `visibleColumns` with normal columns and `visibleAuditColumns` with audit
 *     columns
 */
export function columnsToNormalAndAuditColumns(columns: SearchResultsColumns): {
  visibleColumns: SearchResultsColumns;
  visibleAuditColumns: SearchResultsColumns;
} {
  const visibleColumns: SearchResultsColumns = {};
  const visibleAuditColumns: SearchResultsColumns = {};
  Object.entries(columns).forEach(([key, value]) => {
    if (key.startsWith("audit.")) {
      visibleAuditColumns[key] = value;
    } else {
      visibleColumns[key] = value;
    }
  });
  return { visibleColumns, visibleAuditColumns };
}

/**
 * Convert the visible audit column specs (containing things like `audit.ERROR.path`) to ones for
 * the column-selector modal, like `audit.ERROR` so we can check this against the audit column
 * specs.
 * @param {ColumnSpec[]} visibleAuditColumnSpecs Column specs for the visible audit columns
 * @param {ColumnSpec[]} auditColumnSpecs Column specs for the audit selectors
 * @returns {ColumnSpec[]} Column specs for the selected audit selectors
 */
export function visibleAuditColumnSpecsToSelectorColumnSpecs(
  visibleAuditColumnSpecs: ColumnSpec[],
  auditColumnSpecs: ColumnSpec[]
): ColumnSpec[] {
  // Make an array of all the `id` of `visibleAuditColumnSpecs` with no duplicates.
  const auditColumnKeys = new Set(
    visibleAuditColumnSpecs.map((columnSpec) => columnSpec.id)
  );

  // Filter the audit column specs to only include ones that the query string includes all of the
  // properties in `auditProperties` for an audit level.
  return auditColumnSpecs.filter((auditColumnSpec) => {
    return auditProperties.every((property) =>
      auditColumnKeys.has(`${auditColumnSpec.id}.${property}`)
    );
  });
}

/**
 * Merge two arrays of ColumnSpec objects into one array. The resulting array contains only unique
 * ColumnSpec objects, and the columns get sorted by title, except for the column for the `@id`
 * property that always sorts first.
 * @param columnSpecs1 The first array of ColumnSpec objects
 * @param columnSpecs2 The array of ColumnSpec objects to merge with `columnSpecs1`
 * @returns Array of ColumnSpec objects that's the union of `columnSpecs1` and `columnSpecs2`
 */
export function mergeColumnSpecs(
  columnSpecs1: ColumnSpec[],
  columnSpecs2: ColumnSpec[]
): ColumnSpec[] {
  const mergedColumnSpecs = _.uniqBy(
    columnSpecs1.concat(columnSpecs2),
    (columnSpec) => columnSpec.id
  );
  return sortColumnSpecs(mergedColumnSpecs);
}

/**
 * Get the property specified by a field from the item a row of the report displays and return a
 * string from that. This includes dotted-notation properties and can descend arrays of properties.
 * @param {string} propertyName Dotted-notation property name in `item` to get the value of
 * @param {DatabaseObject} item Item displayed on a row of the report
 * @returns {string[]} Values of the extracted property in `item`
 */
export function getUnknownProperty(
  propertyName: string,
  item: DatabaseObject
): unknown[] {
  let output: unknown[] = [];
  let nodes = [item];
  const nameElements = propertyName.split(".");

  // Extract the objects at each level of the dotted-notation property name. The outer loop
  // iterates over the elements of the dotted-notation property name. If `propertyName` specifies
  // a property within an array of objects, `nodes` contains all the specified objects from each
  // array element.
  nodes = nameElements.reduce((currentNodes, nameElement) => {
    // Extract the value of the property at the current level of the dotted-notation property name.
    const nodeValues = currentNodes.map((node) => node[nameElement]);

    // Flatten the array of values, removing any undefined values.
    return nodeValues.reduce<unknown[]>((acc, value) => {
      return value !== undefined ? acc.concat(value) : acc;
    }, []) as DatabaseObject[];
  }, nodes);

  if (nodes.length > 0) {
    if (nodes[0]["@id"]) {
      // The property is an array of objects with an `@id` property; return the `@id` paths.
      output = nodes.map((node) => node["@id"]);
    } else {
      // The property is a simple value, so display that value; or an object without @ids, so
      // display the JSON representation of the object.
      output = nodes;
    }
  }

  return output;
}

/**
 * Update the given query string to show or hide a column.
 * @param queryString Current search query string
 * @param columnId Column ID to add or remove from the query string
 * @param isVisible True if the column for `columnId` is now visible
 * @param defaultColumnSpecs Column specs for the default columns of the report's schema
 * @returns `queryString` with the `columnId` column added or removed
 */
export function updateColumnVisibilityQuery(
  queryString: string,
  columnId: string,
  isVisible: boolean,
  defaultColumnSpecs: ColumnSpec[]
): string {
  const query = new QueryString(queryString);
  const hasSpecificFields = query.getKeyValues("field").length > 0;
  const defaultColumnIds = defaultColumnSpecs.map(
    (columnSpec) => columnSpec.id
  );
  const isAuditColumn = columnId.startsWith("audit.");

  // To prepare the query string for adding or removing a "field=" parameter, convert any query
  // string that doesn't have any "field=" parameters into one that has all the default columns as
  // "field=" parameters.
  if (!hasSpecificFields) {
    defaultColumnIds.forEach((columnId) => {
      query.addKeyValue("field", columnId);
    });
  }

  if (isAuditColumn) {
    // The user clicked an audit column checkbox. Remove all the associated audit column fields in
    // case the user entered a query string with an incomplete/incorrect set of audit column
    // properties.
    auditProperties.forEach((property) => {
      query.deleteKeyValue("field", `${columnId}.${property}`);
    });
    if (!isVisible) {
      auditProperties.forEach((property) => {
        query.addKeyValue("field", `${columnId}.${property}`);
      });
    }
  } else {
    // The user clicked a non-audit column checkbox. Add or remove the column from the query string.
    if (isVisible) {
      query.deleteKeyValue("field", columnId);
    } else {
      query.addKeyValue("field", columnId);
    }
  }

  // In case the user manually entered a query string with no "field=@id" parameter, add it.
  if (!query.getKeyValues("field").includes("@id")) {
    query.addKeyValue("field", "@id");
  }

  // Get all the resulting "field=" parameters and compare them to the default columns. If they
  // match, remove the "field=" parameters from the query string to display only the default
  // columns.
  const fieldValues = query.getKeyValues("field");
  const isFieldsMatchDefaultColumns = _.isEqual(
    _.sortBy(fieldValues),
    _.sortBy(defaultColumnIds)
  );
  if (isFieldsMatchDefaultColumns) {
    query.deleteKeyValue("field");
  }

  return query.format();
}

/**
 * Update the given query string to show or hide all columns. When hiding all columns, the `@id`
 * column remains visible. Do not include the audit columns.
 * @param queryString MultiReport query string to update
 * @param isAllVisible True to make all possible columns visible, false to hide all
 * @param allColumnSpecs All possible columns for the current report type
 * @param visibleColumnSpecs Currently visible columns
 * @param maxVisibleColumns Override for MAXIMUM_VISIBLE_COLUMNS; just for Jest tests
 * @returns `queryString` with all columns added or removed
 */
export function updateAllColumnsVisibilityQuery(
  queryString: string,
  isAllVisible: boolean,
  allColumnSpecs: ColumnSpec[],
  visibleColumnSpecs: ColumnSpec[],
  maxVisibleColumns = MAXIMUM_VISIBLE_COLUMNS
): string {
  const query = new QueryString(queryString);
  if (isAllVisible) {
    const allColumnIds = allColumnSpecs.map((column) => column.id);
    const visibleColumnIds = visibleColumnSpecs.map((column) => column.id);

    // Make `newColumnIds` the same as `visibleColumnIds` plus `allColumnIds` until
    // MAXIMUM_VISIBLE_COLUMNS columns are visible.
    const newColumnIds = _.uniq(visibleColumnIds.concat(allColumnIds)).slice(
      0,
      maxVisibleColumns
    );

    // Rebuild the "field=" parameter to include all columns up to the maximum number.
    query.deleteKeyValue("field");
    newColumnIds.forEach((columnId) => {
      query.addKeyValue("field", columnId);
    });
  } else {
    // Remove all fields except the `@id` column
    query.deleteKeyValue("field");
    query.addKeyValue("field", "@id");
  }
  return query.format();
}
