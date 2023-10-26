// node_modules
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
// components/facets
import { FacetGroup, FacetGroupButton, getFacetsInGroup } from "./facet-groups";
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
    router.push(searchResults.clear_filters);
  }

  const isDisabled = uniqueSelectedFields.length === 0;
  return (
    <button
      className="h-5 w-full grow rounded border border-button-secondary bg-button-secondary fill-button-secondary text-xs text-button-secondary disabled:border-button-secondary-disabled disabled:text-button-secondary-disabled"
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
 * Display the facet area that contains the buttons for the facet groups. If the user clicks a
 * facet-group button, display the modal containing the facets for that group.
 */
export default function FacetSection({ searchResults }) {
  // Filter out facet groups that have no facets.
  const facetGroupsWithFacets = searchResults.facet_groups.filter(
    (facetGroup) => {
      const facetsInGroup = getFacetsInGroup(searchResults, facetGroup);
      return facetsInGroup.length > 0;
    }
  );

  // Facet group selected by the user clicking on its button, bringing up the facets for that group.
  const [selectedGroup, setSelectedGroup] = useState(facetGroupsWithFacets[0]);

  // Reset selected facet group if the facet groups change, so we can handle having the selected
  // group disappear if the user selects a term that removes all the facets in the selected group.
  const facetGroupTitles = facetGroupsWithFacets
    .map((group) => group.title)
    .join();
  useEffect(() => {
    setSelectedGroup(facetGroupsWithFacets[0]);
  }, [facetGroupTitles]);

  // Determine if we should show facets at all. This is the case when no facet groups exist, and
  // the search results have no displayable facets.
  const visibleFacets = getVisibleFacets(searchResults.facets);
  if (visibleFacets.length > 0 || facetGroupsWithFacets.length > 0) {
    return (
      <DataPanel className="mb-4 lg:mb-0 lg:w-72 lg:shrink-0 lg:grow-0 lg:overflow-y-auto">
        {facetGroupsWithFacets.length > 0 && (
          <div
            className="flex flex-wrap content-start gap-0.5 text-sm font-semibold"
            data-testid="facetgroup-buttons"
          >
            {facetGroupsWithFacets.map((facetGroup) => {
              return (
                <FacetGroupButton
                  key={facetGroup.title}
                  searchResults={searchResults}
                  group={facetGroup}
                  isSelected={facetGroup.title === selectedGroup?.title}
                  onClick={(group) => setSelectedGroup(group)}
                />
              );
            })}
          </div>
        )}
        <ClearAll searchResults={searchResults} />
        <HelpTip className="mt-4">
          Click and hold a term momentarily to select items <i>without</i> that
          term.
        </HelpTip>
        <FacetGroup searchResults={searchResults} group={selectedGroup} />
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
