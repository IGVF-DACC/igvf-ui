// node_modules
import { useRouter } from "next/router";
import PropTypes from "prop-types";
// components/facets
import Facet from "./facet";
// components
import Icon from "../icon";
// components/facets
import facetRegistry from "./facet-registry";
// lib
import { getVisibleFacets } from "../../lib/facets";
import { splitPathAndQueryString } from "../../lib/query-utils";

/**
 * Get the currently selected facet terms that exist in the given facet group. The "type" facet
 * gets excluded because because it always has at least one term selected, and we don't want it to
 * cause the facet group button to appear to contain a selected term.
 * @param {object} searchResults Search results from data provider
 * @param {object} facetGroup Facet group to check filters against
 * @returns {array} Array of facet fields that have selected terms
 */
function getSelectedFacetTermsInGroup(searchResults, facetGroup) {
  return facetGroup.facet_fields.filter((facetField) =>
    searchResults.filters.find(
      (filter) => filter.field !== "type" && filter.field === facetField
    )
  );
}

/**
 * Get all facets in the search results that are in the given facet group. If no facet group is
 * specified, return all facets except for the "type" facet.
 * @param {object} searchResults Search results from data provider
 * @param {object} facetGroup Single facet group from search results facet_groups
 * @returns {array} Facet objects in the group that exist in the search results
 */
export function getFacetsInGroup(searchResults, facetGroup) {
  if (facetGroup) {
    return facetGroup.facet_fields
      .map((facetField) =>
        searchResults.facets.find((facet) => facet.field === facetField)
      )
      .filter((facet) => facet);
  }

  // No groups, so return all visible facets.
  return getVisibleFacets(searchResults.facets);
}

/**
 * Display the filtering icon for facet group buttons. The icon appears filled if
 * `areFacetTermsSelected` evaluates true, and empty if false.
 */
function FacetGroupButtonIcon({ areFacetTermsSelected }) {
  const className = areFacetTermsSelected
    ? "[&>g>circle]:fill-black [&>g>g]:stroke-white"
    : "[&>g>circle]:fill-none [&>g>circle]:stroke-black [&>g>g]:stroke-black";

  return <Icon.Filter className={`h-4 w-4 ${className}`} />;
}

FacetGroupButtonIcon.propTypes = {
  // True if selected facets exist in the group
  areFacetTermsSelected: PropTypes.bool.isRequired,
};

const facetGroupButtonClasses = {
  selected:
    "border-facet-group-button-selected bg-facet-group-button-selected text-facet-group-button-selected",
  unselected:
    "border-facet-group-button bg-facet-group-button text-facet-group-button",
};

/**
 * Displays the button for the specified facet group, and calls the parent when the user clicks
 * this button. The specified group might be the conjured "All" group, which contains all facets
 * in the search results for objects that have no defined facet groups in its config.
 */
export function FacetGroupButton({
  searchResults,
  group,
  isSelected,
  onClick,
}) {
  const facetsInGroup = getSelectedFacetTermsInGroup(searchResults, group);
  const buttonClasses = isSelected
    ? facetGroupButtonClasses.selected
    : facetGroupButtonClasses.unselected;

  return (
    <button
      onClick={() => onClick(group)}
      className={`${buttonClasses} flex grow basis-[calc(50%-0.125rem)] items-center justify-between self-start rounded border px-2 py-1 text-left`}
      aria-label={`${group.title}${isSelected ? " selected" : ""} filter group`}
    >
      {group.title}
      <FacetGroupButtonIcon areFacetTermsSelected={facetsInGroup.length > 0} />
    </button>
  );
}

FacetGroupButton.propTypes = {
  // Search results from the data provider
  searchResults: PropTypes.object.isRequired,
  // facet_group object from the config for this button
  group: PropTypes.object.isRequired,
  // True if the group is selected
  isSelected: PropTypes.bool.isRequired,
  // Tells the parent component to select this group and show its child facets
  onClick: PropTypes.func.isRequired,
};

/**
 * Displays all the facets within a facet group. It also handles the user clicking on a facet
 * term to add or remove it from the search query, and navigates to the URL with the updated query
 * string.
 */
export function FacetGroup({ searchResults, group = null }) {
  const router = useRouter();
  const { path } = splitPathAndQueryString(searchResults["@id"]);

  // Get all the facet objects from the search results that are in the facet group.
  const facetsInGroup = getFacetsInGroup(searchResults, group);

  /**
   * When a user selection in the facet terms changes, receive the updated query string and
   * navigate to the new URL.
   * @param {string} queryString Updated query string from the facet terms
   */
  function updateQuery(queryString) {
    router.push(`${path}?${queryString}`, "", { scroll: false });
  }

  return (
    <div>
      {facetsInGroup.map((facet) => {
        const Terms = facetRegistry.terms.lookup(facet.field);

        // Find the facet object in the search results that matches the facet field in the facet
        // group.
        return (
          <Facet
            key={facet.field}
            facet={facet}
            searchResults={searchResults}
            updateQuery={updateQuery}
          >
            <Terms
              facet={facet}
              searchResults={searchResults}
              updateQuery={updateQuery}
            />
          </Facet>
        );
      })}
    </div>
  );
}

FacetGroup.propTypes = {
  // Search results from data provider
  searchResults: PropTypes.object.isRequired,
  // Facet group to display because the user selected it; from search results facet_groups
  group: PropTypes.exact({
    // Object type the facet group applies to
    name: PropTypes.string.isRequired,
    // Title of the facet group
    title: PropTypes.string.isRequired,
    // Facet fields in this group
    facet_fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
};
