// node_modules
import { XMarkIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import PropTypes from "prop-types";
// lib
import { getVisibleFacets } from "../../lib/facets";

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
  const facetForFilter = facets.find((facet) => facet.field === filter.field);
  const title = facetForFilter ? facetForFilter.title : filter.field;

  return (
    <Link
      href={filter.remove}
      className="flex items-center rounded border border-emerald-400 bg-emerald-200 py-0.5 pl-1 pr-0 text-gray-700 no-underline dark:border-emerald-600 dark:bg-emerald-900 dark:text-gray-200"
      aria-label={`Clear ${title} filter for ${filter.term}`}
      key={filter.field}
    >
      <div>
        <div className="text-xs leading-4">{title}</div>
        <div className="text-sm font-semibold leading-4">{filter.term}</div>
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
  // All selected facet terms appear in the `filters` property of the search results except for the
  // hidden facet fields.
  const removableFilters = getVisibleFacets(searchResults.filters);
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
