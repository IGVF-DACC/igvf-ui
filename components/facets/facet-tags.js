// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components/facets
import facetRegistry from "./facet-registry";
// components
import Link from "../link-no-prefetch";
// lib
import {
  collectAllChildFacets,
  filterOutChildFacets,
  getVisibleFilters,
} from "../../lib/facets";

/**
 * Facet tags show a list of the currently selected facet terms. Clicking each tag clears that facet
 * term from the query string. This acts as a shortcut to removing the facet terms using the facet
 * modals.
 */

/**
 * Display a single facet tag specified by the `filter` object of the relevant facet term copied
 * from the search-results object.
 */
function FacetTag({ filter, facets }) {
  const filteredFacets = filterOutChildFacets(facets);
  const allChildFacets = collectAllChildFacets(filteredFacets);
  const allFacets = filteredFacets.concat(allChildFacets);

  // Get the title for the tag from the given filter's `field` property. If the field ends with a
  // `!`, remove it before looking up the human-readable title. If we can't find a title for the
  // field, use the field name as the title.
  const isNegative = filter.field.at(-1) === "!";
  const filterField = isNegative ? filter.field.slice(0, -1) : filter.field;
  const facetForFilter = allFacets.find((facet) => facet.field === filterField);
  const title = facetForFilter ? facetForFilter.title : filter.field;

  // Look for any custom tag label renderer components.
  const TagLabel = facetRegistry.tagLabel.lookup(filterField);

  const tagClassName = isNegative
    ? "bg-facet-tag-neg border-facet-tag-neg"
    : "bg-facet-tag border-facet-tag";

  return (
    <Link
      href={filter.remove}
      className={`text-facet-tag flex items-center rounded-sm border py-0.5 pr-0 pl-1 no-underline ${tagClassName}`}
      aria-label={`Clear ${title} filter for ${filter.term}`}
      key={filter.field}
    >
      <div>
        <div className="text-xs leading-4">{title}</div>
        <div className="text-sm leading-4 font-semibold">
          <TagLabel filter={filter} />
        </div>
      </div>
      <XMarkIcon className="ml-2 block h-4 w-4" />
    </Link>
  );
}

FacetTag.propTypes = {
  // Filter object from search results
  filter: PropTypes.shape({
    // Object property the filter represents
    field: PropTypes.string.isRequired,
    // Value of the object property
    term: PropTypes.string.isRequired,
    // URI to remove this filter from the query string
    remove: PropTypes.string.isRequired,
  }).isRequired,
  // `facets` property from search results
  facets: PropTypes.arrayOf(PropTypes.shape({ field: PropTypes.string }))
    .isRequired,
};

/**
 * Displays a list of tags showing the currently selected facets. Clicking each tag clears that
 * facet term from the query string. This acts as a shortcut to removing the facet terms using the
 * facet modals.
 */
export default function FacetTags({ searchResults }) {
  const { isAuthenticated } = useAuth0();
  const removableFilters = getVisibleFilters(
    searchResults.filters,
    isAuthenticated
  );

  // All selected facet terms appear in the `filters` property of the search results except for the
  // hidden facet fields.
  if (removableFilters.length > 0) {
    return (
      <div className="mb-2 flex flex-wrap gap-1" data-testid="facettags">
        {removableFilters.map((filter) => (
          <FacetTag
            filter={filter}
            facets={searchResults.facets}
            key={`${filter.field}-${filter.term}`}
          />
        ))}
      </div>
    );
  }

  // No selected facet terms, so display no facet tags.
  return null;
}

FacetTags.propTypes = {
  // Search results from data provider
  searchResults: PropTypes.object.isRequired,
};
