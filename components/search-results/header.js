// node_modules
import PropTypes from "prop-types";
// components
import DownloadTSV from "./download-tsv";
import ItemsPerPageSelector from "./items-per-page-selector";
import { ColumnSelector } from "../report";
import ViewSwitch from "./view-switch";

/**
 * Displays controls for the search-result list and report views, including the controls to switch
 * between list and report views.
 */
export default function SearchResultsHeader({
  searchResults,
  reportViewExtras = null,
}) {
  return (
    <div className="relative z-10 w-full @container">
      <div className="@md:flex @md:items-center @md:justify-between">
        <div className="flex gap-1">
          <div className="mb-1 flex gap-1">
            <ViewSwitch searchResults={searchResults} />
          </div>
          {reportViewExtras && (
            <div className="mb-1 flex gap-1">
              <ColumnSelector
                allColumnSpecs={reportViewExtras.allColumnSpecs}
                visibleColumnSpecs={reportViewExtras.visibleColumnSpecs}
                onChange={reportViewExtras.onColumnVisibilityChange}
                onChangeAll={reportViewExtras.onAllColumnsVisibilityChange}
              />
              <DownloadTSV searchUri={searchResults["@id"]} />
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
    // All column specs for the current report page
    allColumnSpecs: PropTypes.arrayOf(PropTypes.object).isRequired,
    // Visible column specs for the current report page
    visibleColumnSpecs: PropTypes.arrayOf(PropTypes.object).isRequired,
    // Callback when the user changes the visibility of a column
    onColumnVisibilityChange: PropTypes.func.isRequired,
    // Callback when the user changes the visibility of all columns
    onAllColumnsVisibilityChange: PropTypes.func.isRequired,
  }),
};
