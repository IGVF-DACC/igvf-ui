// node_modules
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import { BatchDownloadActuator } from "../batch-download";
import SessionContext from "../session-context";
// components/search-results
import DownloadTSV from "./download-tsv";
import ItemsPerPageSelector from "./items-per-page-selector";
import { ColumnSelector } from "../report";
import ViewSwitch from "./view-switch";
// lib
import { SearchController } from "../../lib/batch-download";
import QueryString from "../../lib/query-string";
import { splitPathAndQueryString } from "../../lib/query-utils";

/**
 * Displays controls for the search-result list and report views, including the controls to switch
 * between list and report views.
 */
export default function SearchResultsHeader({
  searchResults,
  reportViewExtras = null,
}) {
  const { profiles } = useContext(SessionContext);

  // Generate a query based on the current URL for the batch-download controller.
  const { queryString } = splitPathAndQueryString(searchResults["@id"]);
  const query = new QueryString(queryString);

  // Create a batch-download controller in case the search query qualifies for batch download.
  const controller = new SearchController(query, profiles);

  return (
    <div className="@container relative z-10 w-full">
      <div className="@md:flex @md:items-center @md:justify-between">
        <div className="flex gap-1">
          <div className="mb-1 flex gap-1">
            <ViewSwitch searchResults={searchResults} />
          </div>
          {(reportViewExtras || controller.offerDownload) && (
            <div className="mb-1 flex gap-1">
              {reportViewExtras && (
                <>
                  <ColumnSelector
                    allColumnSpecs={reportViewExtras.allColumnSpecs}
                    auditColumnSpecs={reportViewExtras.auditColumnSpecs}
                    visibleColumnSpecs={reportViewExtras.visibleColumnSpecs}
                    visibleAuditColumnSpecs={
                      reportViewExtras.visibleAuditColumnSpecs
                    }
                    onChange={reportViewExtras.onColumnVisibilityChange}
                    onChangeAll={reportViewExtras.onAllColumnsVisibilityChange}
                  />
                  <DownloadTSV searchUri={searchResults["@id"]} />
                </>
              )}
              {controller.offerDownload && (
                <BatchDownloadActuator
                  controller={controller}
                  label="Download files associated with the selected filters."
                />
              )}
            </div>
          )}
        </div>

        <div className="mb-1">
          <ItemsPerPageSelector searchResults={searchResults} />
        </div>
      </div>
    </div>
  );
}

SearchResultsHeader.propTypes = {
  // Search results for list or report
  searchResults: PropTypes.object.isRequired,
  // Callback functions for when the search header is for the report view; null for the list view
  reportViewExtras: PropTypes.exact({
    // All regular column specs for the current report page
    allColumnSpecs: PropTypes.arrayOf(PropTypes.object).isRequired,
    // Audit column specs for the current report page
    auditColumnSpecs: PropTypes.arrayOf(PropTypes.object).isRequired,
    // Visible column specs for the current report page
    visibleColumnSpecs: PropTypes.arrayOf(PropTypes.object).isRequired,
    // Visible audit column specs for the current report page
    visibleAuditColumnSpecs: PropTypes.arrayOf(PropTypes.object).isRequired,
    // Callback when the user changes the visibility of a column
    onColumnVisibilityChange: PropTypes.func.isRequired,
    // Callback when the user changes the visibility of all columns
    onAllColumnsVisibilityChange: PropTypes.func.isRequired,
  }),
};
