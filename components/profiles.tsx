// node_modules
import {
  Bars4Icon,
  TableCellsIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import _ from "lodash";
import { Fragment } from "react";
// components
import { DataItemLabel, DataItemValue } from "./data-area";
import { AttachedButtons, ButtonLink, TextField } from "./form-elements";
import { useBrowserStateQuery } from "./presentation-status";
import SeparatedList from "./separated-list";
import { VersionNumber } from "./version-number";
// lib
import { isObjectArrayProperty, isStringArrayProperty } from "../lib/general";
import { schemaToPath, SEARCH_MODE_TITLE } from "../lib/profiles";
// root
import { Schema } from "../globals";

/**
 * List of schema types that do not have additional query-string parameters for list/report pages.
 * This is usually because they have a different form of statuses.
 */
const typesWithoutExtraQueries = ["Award", "Lab", "User"];

/**
 * Displays a search field for highlighting elements of a schema or list of schemas.
 *
 * @param searchTerm - Current search term the user has entered
 * @param setSearchTerm - Function to update the search term as the user types
 * @param searchMode - Current search mode (e.g., title or property)
 * @param className - Additional Tailwind CSS classes to apply to the wrapper div
 */
export function SchemaSearchField({
  searchTerm,
  setSearchTerm,
  searchMode,
  className = "",
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchMode: string;
  className?: string;
}) {
  return (
    <div className={`relative grow ${className}`}>
      <TextField
        name="schema-search"
        value={searchTerm}
        type="search"
        onChange={(e) => setSearchTerm(e.target.value)}
        className="[&>input]:pr-7"
        isSpellCheckDisabled
        isMessageAllowed={false}
      />
      <button
        onClick={() => setSearchTerm("")}
        className="absolute top-0 right-0 flex h-full w-8 cursor-pointer items-center justify-center"
        aria-label={
          searchMode === SEARCH_MODE_TITLE
            ? "Clear schema title search"
            : "Clear schema property search"
        }
      >
        <XCircleIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Displays links to the search-list and report pages for the given schema object type.
 *
 * @param type - schema object type (e.g., "Experiment")
 * @param title - Human-readable title for the schema (e.g., "Experiment")
 */
export function SearchAndReportType({
  type,
  title,
}: {
  type: string;
  title: string;
}) {
  // Extra query-string parameters for list/report pages
  let extraQueries = useBrowserStateQuery();
  if (typesWithoutExtraQueries.includes(type)) {
    extraQueries = "";
  }

  return (
    <AttachedButtons>
      <ButtonLink
        href={`/search/?type=${type}${extraQueries}`}
        label={`List view of all ${title} objects`}
        type="secondary"
        size="sm"
        hasIconOnly
      >
        <Bars4Icon />
      </ButtonLink>
      <ButtonLink
        href={`/multireport/?type=${type}${extraQueries}`}
        label={`Report view of all ${title} objects`}
        type="secondary"
        size="sm"
        hasIconOnly
      >
        <TableCellsIcon />
      </ButtonLink>
    </AttachedButtons>
  );
}

/**
 * Display a schema's version number.
 *
 * @param schema - Schema object containing the version number
 * @param isLinked - True to link to the changelog page, false to just display the version number
 */
export function SchemaVersion({
  schema,
  isLinked = false,
}: {
  schema: Schema;
  isLinked?: boolean;
}) {
  if (schema?.properties?.schema_version) {
    const version = schema.properties.schema_version.default;
    if (typeof version === "string" && version.length > 0) {
      const path = isLinked ? `${schemaToPath(schema)}/changelog` : "";
      return <VersionNumber version={version} path={path} />;
    }
  }
}

/**
 * Display the required fields for a given schema, if any. Handles both `required` at the top level
 * of the schema and `oneOf` with multiple `required` lists. I assume `required` and `oneOf` are
 * mutually exclusive. If we someday have a schema that uses both, this function will need updating
 * once we know what the desired behavior is for that case.
 *
 * @param schema - Schema object to display required fields for
 */
export function SchemaRequired({ schema }: { schema: Schema }) {
  // Take care of the simple case of `required` at the top level of the schema. Sorting the fields
  // case sensitively because I don't expect any properties to start with a capital letter.
  if (isStringArrayProperty(schema, "required")) {
    return (
      <>
        <DataItemLabel>Required</DataItemLabel>
        <DataItemValue>{schema.required.toSorted().join(", ")}</DataItemValue>
      </>
    );
  }

  // Handle the case of `oneOf` with multiple `required` lists. This is used in some schemas
  // that have different sets of required fields depending on other property values.
  if (isObjectArrayProperty(schema, "oneOf")) {
    // Make a list of all sets of required fields (array of arrays).
    const requiredValues = schema.oneOf.map((oneOfEntry) =>
      isStringArrayProperty(oneOfEntry, "required") ? oneOfEntry.required : []
    );

    // Make an array of all the common required fields and the ones that differ between
    // `required` lists.
    const commonRequired = _.intersection(...requiredValues);
    const differentRequired = _.difference(
      _.union(...requiredValues),
      commonRequired
    ).toSorted();

    // Display the two lists of required fields, with common fields comma separated, and
    // different fields separated by " or ".
    if (commonRequired.length > 0 || differentRequired.length > 0) {
      return (
        <>
          <DataItemLabel>Required</DataItemLabel>
          <DataItemValue>
            {commonRequired.length > 0 && (
              <span>
                {commonRequired.toSorted().join(", ")}
                {commonRequired.length > 0 &&
                  differentRequired.length > 0 &&
                  "; "}
              </span>
            )}
            {differentRequired.length > 0 && (
              <SeparatedList
                className="inline"
                separator={<span className="text-gray-500 italic"> or </span>}
              >
                {differentRequired.map((field) => (
                  <Fragment key={field}>{field}</Fragment>
                ))}
              </SeparatedList>
            )}
          </DataItemValue>
        </>
      );
    }
  }

  // Return null when no required fields are found. This probably indicates a schema error.
  console.warn(
    `No required fields found ${schema?.title ? `for ${schema.title}` : ""}`
  );
  return null;
}
