// node_modules
import { useRouter } from "next/router";
import PropTypes from "prop-types";
// components/facets
import { FacetList } from "./facet-list";
// components
import { DataPanel } from "../../components/data-area";
import HelpTip from "../../components/help-tip";
// lib
import { getVisibleFacets } from "../../lib/facets";

/**
 * Display a button that clears all the currently selected facets.
 */
function ClearAll({ searchResults }) {
  const router = useRouter();

  // Get all the currently selected facet fields except for the "type" facet.
  const selectedFields = searchResults.filters
    .map((filter) => filter.field)
    .filter((field) => field !== "type");
  const uniqueSelectedFields = [...new Set(selectedFields)];

  function onClearAll() {
    router.push(searchResults.clear_filters, "", { scroll: false });
  }

  const isDisabled = uniqueSelectedFields.length === 0;
  return (
    <button
      className="border-button-secondary bg-button-secondary fill-button-secondary text-button-secondary disabled:border-button-secondary-disabled disabled:text-button-secondary-disabled h-5 w-full grow rounded-sm border text-xs"
      aria-label="Clear all filters"
      onClick={onClearAll}
      disabled={isDisabled}
    >
      Clear All
    </button>
  );
}

ClearAll.propTypes = {
  // Search results from the data provider
  searchResults: PropTypes.object.isRequired,
};

/**
 * Display the facet area including the Clear All button and the facets themselves.
 */
export default function FacetSection({ searchResults }) {
  // Determine if we should show facets at all. This is the case when no facet groups exist, and
  // the search results have no displayable facets.
  const visibleFacets = getVisibleFacets(searchResults.facets);
  if (visibleFacets.length > 0) {
    return (
      <DataPanel
        className="mb-4 lg:mb-0 lg:w-72 lg:shrink-0 lg:grow-0 lg:overflow-y-auto"
        isPaddingSuppressed
      >
        <div className="p-4">
          <ClearAll searchResults={searchResults} />
          <HelpTip className="mt-4">
            Click and hold a term momentarily to select items <i>without</i>{" "}
            that term.
          </HelpTip>
        </div>
        <FacetList searchResults={searchResults} />
      </DataPanel>
    );
  }

  // No displayable facets.
  return null;
}

FacetSection.propTypes = {
  // Search results from data provider
  searchResults: PropTypes.object.isRequired,
};
