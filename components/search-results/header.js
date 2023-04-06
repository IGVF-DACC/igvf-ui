// node_modules
import PropTypes from "prop-types";
// components
import ItemsPerPageSelector from "./items-per-page-selector";
import { ColumnSelector } from "../report";
import useSearchLimits from "./search-limits";
import SearchPager from "./search-pager";
import ViewSwitch from "./view-switch";
import DownloadTSV from "./download-tsv";

/**
 * Displays controls for the search-result list and report views, including the controls to switch
 * between list and report views.
 */
export default function SearchResultsHeader({
  searchResults,
  columnSelectorConfig = null,
}) {
  const { totalPages } = useSearchLimits(searchResults);

  return (
    <>
      <div className="sm:mb-1 sm:flex sm:items-center sm:justify-between">
        <div className="mb-1 flex gap-1 sm:mb-0">
          <ViewSwitch searchResults={searchResults} />
          {columnSelectorConfig && (
            <>
              <ColumnSelector
                searchResults={searchResults}
                onChange={columnSelectorConfig.onColumnVisibilityChange}
                onChangeAll={columnSelectorConfig.onAllColumnsVisibilityChange}
              />
              <DownloadTSV />
            </>
          )}
        </div>

        <div className="mb-1 flex items-center gap-1 sm:mb-0">
          <ItemsPerPageSelector />
        </div>
      </div>
      <div>
        {totalPages > 1 && <SearchPager searchResults={searchResults} />}
      </div>
    </>
  );
}

SearchResultsHeader.propTypes = {
  // Search results for list or report
  searchResults: PropTypes.object.isRequired,
  // True to display the report column selector
  columnSelectorConfig: PropTypes.shape({
    onColumnVisibilityChange: PropTypes.func.isRequired,
    onAllColumnsVisibilityChange: PropTypes.func.isRequired,
  }),
};
