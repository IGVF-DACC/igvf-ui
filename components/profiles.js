// node_modules
import {
  Bars4Icon,
  TableCellsIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { AttachedButtons, ButtonLink, TextField } from "./form-elements";
import { useBrowserStateQuery } from "./presentation-status";
// lib
import { schemaToPath, SEARCH_MODE_TITLE } from "../lib/profiles";

/**
 * List of schema types that do not have additional query-string parameters for list/report pages.
 * This is usually because they have a different form of statuses.
 */
const typesWithoutExtraQueries = ["Award", "Lab", "User"];

/**
 * Displays a search field for highlighting elements of a schema or list of schemas.
 */
export function SchemaSearchField({
  searchTerm,
  setSearchTerm,
  searchMode,
  className = "",
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
        className="absolute right-0 top-0 flex h-full w-8 cursor-pointer items-center justify-center"
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

SchemaSearchField.propTypes = {
  // The current search term
  searchTerm: PropTypes.string.isRequired,
  // Function to update the search term
  setSearchTerm: PropTypes.func.isRequired,
  // The current search mode
  searchMode: PropTypes.string.isRequired,
  // Additional Tailwind CSS classes to apply to the wrapper div
  className: PropTypes.string,
};

/**
 * Displays links to the search-list and report pages for the given schema object type.
 */
export function SearchAndReportType({ type, title, prefetch = true }) {
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
        prefetch={prefetch}
      >
        <Bars4Icon />
      </ButtonLink>
      <ButtonLink
        href={`/multireport/?type=${type}${extraQueries}`}
        label={`Report view of all ${title} objects`}
        type="secondary"
        size="sm"
        hasIconOnly
        prefetch={prefetch}
      >
        <TableCellsIcon />
      </ButtonLink>
    </AttachedButtons>
  );
}

SearchAndReportType.propTypes = {
  // @type to search for
  type: PropTypes.string.isRequired,
  // Human-readable title for the schema
  title: PropTypes.string.isRequired,
  // False to disable link prefetching
  prefetch: PropTypes.bool,
};

/**
 * Display a schema's version number.
 */
export function SchemaVersion({ schema, isLinked = false, prefetch = true }) {
  const version = schema.properties.schema_version.default;
  const path = schemaToPath(schema);
  const className =
    "border-schema-version inline-block border bg-schema-version px-1 text-xs font-semibold text-schema-version no-underline";
  if (isLinked) {
    return (
      <Link
        href={`${path}/changelog`}
        className={`${className} rounded-sm`}
        prefetch={prefetch}
      >{`v${version}`}</Link>
    );
  }
  return <div className={className}>{`v${version}`}</div>;
}

SchemaVersion.propTypes = {
  // The schema object
  schema: PropTypes.object.isRequired,
  // True to link to the changelog page, false to just display the version number
  isLinked: PropTypes.bool,
  // False to disable link prefetching
  prefetch: PropTypes.bool,
};
