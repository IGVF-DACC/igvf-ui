// node_modules
import PropTypes from "prop-types";
import { useState } from "react";
// components/facets
import { FacetGroup, FacetGroupButton, getFacetsInGroup } from "./facet-groups";
// components
import { DataPanel } from "../../components/data-area";
// lib
import { getVisibleFacets } from "../../lib/facets";

/**
 * Display the facet area that contains the buttons for the facet groups. If the user clicks a
 * facet-group button, display the modal containing the facets for that group.
 */
export default function FacetSection({ searchResults }) {
  // Get the facet groups, or build a fake one containing all the facets if the search results
  // have no facet groups.
  const facetGroups =
    searchResults.facet_groups.length > 0 ? searchResults.facet_groups : [];

  // Filter out facet groups that have no facets.
  const facetGroupsWithFacets = facetGroups.filter((facetGroup) => {
    const facetsInGroup = getFacetsInGroup(searchResults, facetGroup);
    return facetsInGroup.length > 0;
  });

  // Facet group selected by the user clicking on its button, bringing up the facets for that group.
  const [selectedGroup, setSelectedGroup] = useState(facetGroupsWithFacets[0]);

  // Determine if we shouldn't show the facet groups at all. This is the case when there are no
  // facet groups, and the search results have no displayable facets.
  const visibleFacets = getVisibleFacets(searchResults.facets);
  if (visibleFacets.length > 0) {
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
