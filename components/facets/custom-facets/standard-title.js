// node_modules
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components/facets
import { FacetTermCount } from "../facet-term-count";

/**
 * Alternate facet title renderers can use this to display the standard title collapse/expand
 * button. That way you can keep the standard functionality and only change something about the
 * title itself.
 */
export function StandardTitleElement({ field, isFacetOpen, children }) {
  return (
    <h2
      className={`flex items-center justify-between text-base font-normal text-facet-title ${
        isFacetOpen ? "text-white dark:text-black" : ""
      }`}
      data-testid={`facettitle-${field}`}
    >
      <div className="text-left">{children}</div>
      <div className="basis-4">
        {isFacetOpen ? (
          <MinusIcon className="h-4 w-4" />
        ) : (
          <PlusIcon className="h-4 w-4" />
        )}
      </div>
    </h2>
  );
}

StandardTitleElement.propTypes = {
  // Facet property name
  field: PropTypes.string.isRequired,
  // True if the facet displays all its terms
  isFacetOpen: PropTypes.bool.isRequired,
};

/**
 * Displays the standard facet title, using the `title` property of the displayed facet.
 */
export default function StandardTitle({ facet, searchResults, isFacetOpen }) {
  return (
    <>
      <StandardTitleElement field={facet.field} isFacetOpen={isFacetOpen}>
        {facet.title}
      </StandardTitleElement>
      <FacetTermCount
        facet={facet}
        searchResults={searchResults}
        isFacetOpen={isFacetOpen}
      />
    </>
  );
}

StandardTitle.propTypes = {
  // Facet object to display the title for
  facet: PropTypes.shape({
    // Facet property name
    field: PropTypes.string.isRequired,
    // Facet title
    title: PropTypes.string.isRequired,
    // List of facet terms
    terms: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.object),
      PropTypes.object,
    ]),
  }).isRequired,
  // Entire search results object from the data provider
  searchResults: PropTypes.object.isRequired,
  // True if the facet displays all its terms
  isFacetOpen: PropTypes.bool.isRequired,
};
