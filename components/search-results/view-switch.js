// node_modules
import { Bars4Icon, TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { AttachedButtons, ButtonLink } from "../form-elements";
// lib
import QueryString from "../../lib/query-string";
import { splitPathAndQueryString } from "../../lib/query-utils";

/**
 * Search result view options.
 */
const SEARCH_TYPE_LIST = "Search";
const SEARCH_TYPE_REPORT = "Report";

/**
 * Display the buttons to view the collection as a table or list.
 */
export default function ViewSwitch({ searchResults, className = null }) {
  // Determine whether the list or report view is selected
  const isListSelected = searchResults["@type"][0] === SEARCH_TYPE_LIST;
  const isReportSelected = searchResults["@type"][0] === SEARCH_TYPE_REPORT;

  let listViewLink;
  let reportViewLink;
  if (isListSelected) {
    // Compose links for the list and report views if the current view is the list view. Only
    // display a report-view link if exactly one "type=" exists in the query string.
    const { path, queryString } = splitPathAndQueryString(searchResults["@id"]);
    const query = new QueryString(queryString);
    const types = query.getKeyValues("type", QueryString.ANY);
    const reportPath = path.replace(/\/search(\/){0,1}/, "/multireport$1");

    // Report view query string always copies the list view query string unless it has multiple or
    // no "type=" query string parameters, in which case no Report view button appears.
    listViewLink = searchResults["@id"];
    reportViewLink =
      types.length === 1 ? `${reportPath}?${query.format()}` : "";
  } else {
    // Compose links for the list and report views if the current view is the report view. Remove
    // any "field=" query string parameters from the list-view link.
    const { path, queryString } = splitPathAndQueryString(searchResults["@id"]);
    const query = new QueryString(queryString);
    query.deleteKeyValue("field");
    query.deleteKeyValue("sort");
    query.deleteKeyValue("config");
    const listPath = path.replace(/\/multireport(\/){0,1}/, "/search$1");

    listViewLink = `${listPath}?${query.format()}`;
    reportViewLink = searchResults["@id"];
  }

  return (
    <AttachedButtons className={className} testid="search-results-view-switch">
      <ButtonLink
        href={listViewLink}
        type={isListSelected ? "selected" : "secondary"}
        label={`Select list view${isListSelected ? " (selected)" : ""}`}
      >
        <Bars4Icon className="h-4 w-4" />
      </ButtonLink>
      {reportViewLink && (
        <ButtonLink
          href={reportViewLink}
          type={isReportSelected ? "selected" : "secondary"}
          label={`Select report view${isReportSelected ? " (selected)" : ""}`}
        >
          <TableCellsIcon className="h-4 w-4" />
        </ButtonLink>
      )}
    </AttachedButtons>
  );
}

ViewSwitch.propTypes = {
  // The current list or report search results from igvfd
  searchResults: PropTypes.object.isRequired,
  // Tailwind CSS classes for the button
  className: PropTypes.string,
};
