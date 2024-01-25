// node_modules
import { XCircleIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
// components/facets
import FacetTerm from "../facet-term";
// components
import Icon from "../../icon";
// lib
import QueryString from "../../../lib/query-string";
import { splitPathAndQueryString } from "../../../lib/query-utils";

/**
 * Minimum number of facet terms to display the term filter.
 */
const MIN_FILTER_COUNT = 20;

/**
 * Minimum number of facet terms to display the expand/collapse button.
 */
const MIN_COLLAPSABLE_TERMS_COUNT = 15;

/**
 * Number of facet terms to display when the facet is collapsed.
 */
const COLLAPSED_TERMS_COUNT = 10;

/**
 * Button to select all or none of the facet terms.
 */
function TermsSelectorsButton({ onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      className="h-5 grow rounded border border-button-secondary bg-button-secondary fill-button-secondary text-xs text-button-secondary"
      aria-label={label}
      type="button"
    >
      {children}
    </button>
  );
}

TermsSelectorsButton.propTypes = {
  // Function to call when the user clicks on the button
  onClick: PropTypes.func.isRequired,
  // Accessible label for the button
  label: PropTypes.string.isRequired,
};

/**
 * Displays buttons to select all or none of the facet terms.
 */
function TermsSelectors({ facetTitle, onAllClick, onNoneClick }) {
  return (
    <div className="mb-0.5 flex gap-1">
      <TermsSelectorsButton
        label={`Select all ${facetTitle}`}
        onClick={onAllClick}
      >
        All
      </TermsSelectorsButton>
      <TermsSelectorsButton
        label={`Select no ${facetTitle}`}
        onClick={onNoneClick}
      >
        None
      </TermsSelectorsButton>
    </div>
  );
}

TermsSelectors.propTypes = {
  // Human-readable title of the facet this button controls
  facetTitle: PropTypes.string.isRequired,
  // Function to call when the user clicks on the "All" button
  onAllClick: PropTypes.func.isRequired,
  // Function to call when the user clicks on the "None" button
  onNoneClick: PropTypes.func.isRequired,
};

/**
 * Lets the user type a term to filter the facet terms. Just used for the standard terms facet.
 */
function TermFilter({ id, currentFilter, setCurrentFilter }) {
  const filterIconStyles = currentFilter
    ? "stroke-facet-filter-icon-set fill-facet-filter-icon-set"
    : "stroke-facet-filter-icon fill-facet-filter-icon";
  return (
    <div
      className="my-1.5 flex items-center gap-1"
      data-testid={`facet-term-filter-${id}`}
    >
      <Icon.Filter className={`h-5 w-5 ${filterIconStyles}`} />
      <input
        className="w-full border-b border-facet-filter bg-transparent px-1 py-0.5 text-sm text-facet-filter placeholder:text-xs placeholder:text-gray-300 focus:border-facet-filter-focus focus:text-facet-filter-focus dark:placeholder:text-gray-600"
        type="text"
        placeholder="Term filter"
        value={currentFilter}
        onChange={(event) => setCurrentFilter(event.target.value)}
      />
      <button
        type="button"
        onClick={() => setCurrentFilter("")}
        data-testid={`facet-term-clear-${id}`}
      >
        <XCircleIcon className="h-5 w-5 fill-facet-clear-filter-icon" />
        <div className="sr-only">Clear term filter</div>
      </button>
    </div>
  );
}

TermFilter.propTypes = {
  // Unique ID for the facet filter
  id: PropTypes.string.isRequired,
  // Current filter term
  currentFilter: PropTypes.string.isRequired,
  // Function to call when the user types into the filter input
  setCurrentFilter: PropTypes.func.isRequired,
};

/**
 * Button to expand or collapse the facets with a large number of terms, generally *after*
 * filtering.
 */
function CollapseControl({ id, totalTermCount, isExpanded, setIsExpanded }) {
  return (
    <button
      className="mx-2 text-xs font-bold uppercase text-gray-500"
      data-testid={`facet-term-collapse-${id}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {isExpanded ? "See fewer terms" : `See all ${totalTermCount} terms`}
    </button>
  );
}

CollapseControl.propTypes = {
  // Unique ID for the facet collapse control
  id: PropTypes.string.isRequired,
  // Total number of terms for the facet
  totalTermCount: PropTypes.number.isRequired,
  // True if the facet is currently expanded
  isExpanded: PropTypes.bool.isRequired,
  // Function to call when the user clicks the expand/collapse button
  setIsExpanded: PropTypes.func.isRequired,
};

export default function StandardTerms({ searchResults, facet, updateQuery }) {
  // User-typed term to filter the facet terms
  const [filterTerm, setFilterTerm] = useState("");
  // True if the facet has enough terms to expand/collapse, and it's currently expanded
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate a query based on the current URL to update once the user clicks a facet term.
  const { queryString } = splitPathAndQueryString(searchResults["@id"]);
  const query = new QueryString(queryString);

  // Filter the facet terms based on the user-typed term.
  const filteredTerms = facet.terms.filter((term) => {
    const termKey = term.key_as_string || term.key;
    return termKey.toLowerCase().includes(filterTerm.toLowerCase());
  });

  // Further limit the terms if the facet has enough terms to be expandable and is currently
  // collapsed.
  const displayedTerms =
    filteredTerms.length > MIN_COLLAPSABLE_TERMS_COUNT && !isExpanded
      ? filteredTerms.slice(0, COLLAPSED_TERMS_COUNT)
      : filteredTerms;

  // Get the terms that are currently selected for this facet.
  const selectionFilters = searchResults.filters.map((filter) => {
    const isNegative = filter.field.at(-1) === "!";
    const field = isNegative ? filter.field.slice(0, -1) : filter.field;
    return {
      field,
      term: filter.term,
      isNegative,
    };
  });

  /**
   * When the user clicks a facet term, add or remove it from the query string and navigate
   * to the new URL.
   * @param {string} field Field of the facet that the user clicked a term within
   * @param {object} term Term that the user clicked within a facet
   */
  function onTermClick(field, term, isNegative) {
    const matchingTerms = query.getKeyValues(field, "ANY");
    const key = term.key_as_string || term.key;
    if (matchingTerms.includes(key)) {
      query.deleteKeyValue(field, key);
    } else {
      const polarity = isNegative ? "NEGATIVE" : "POSITIVE";
      query.addKeyValue(field, key, polarity);
    }
    query.deleteKeyValue("from");
    query.deleteKeyValue(field, "*");
    updateQuery(query.format());
  }

  /**
   * When the user clicks the "All" button, add all terms for this facet to the query string.
   */
  function onAllClick() {
    query.deleteKeyValue(facet.field);
    facet.terms.forEach((term) => {
      const key = term.key_as_string || term.key;
      query.addKeyValue(facet.field, key);
    });
    updateQuery(query.format());
  }

  /**
   * When the user clicks the "None" button, remove all terms for this facet from the query string.
   */
  function onNoneClick() {
    query.deleteKeyValue(facet.field);
    updateQuery(query.format());
  }

  // Clear the term filter when the facet terms change.
  useEffect(() => {
    setFilterTerm("");
  }, [facet.terms.length]);

  return (
    <div>
      <TermsSelectors
        facetTitle={facet.title}
        onAllClick={onAllClick}
        onNoneClick={onNoneClick}
      />
      {facet.terms.length > MIN_FILTER_COUNT && (
        <TermFilter
          id={facet.field}
          currentFilter={filterTerm}
          setCurrentFilter={setFilterTerm}
        />
      )}
      {displayedTerms.length > 0 ? (
        <>
          <ul>
            {displayedTerms.map((term) => {
              const termKey = term.key_as_string || term.key;
              const checkedFilter = selectionFilters.find(
                (filter) =>
                  filter.field === facet.field && filter.term === termKey
              );
              const isChecked = Boolean(checkedFilter);
              const isNegative = isChecked && checkedFilter.isNegative;

              return (
                <FacetTerm
                  key={term.key}
                  field={facet.field}
                  term={term}
                  isChecked={isChecked}
                  isNegative={isNegative}
                  onClick={onTermClick}
                />
              );
            })}
          </ul>
          {filteredTerms.length > MIN_COLLAPSABLE_TERMS_COUNT && (
            <CollapseControl
              id={facet.field}
              totalTermCount={filteredTerms.length}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          )}
        </>
      ) : (
        <p className="text-center text-sm italic text-gray-500">
          Filter matches no terms.
        </p>
      )}
    </div>
  );
}

StandardTerms.propTypes = {
  // Search results from data provider
  searchResults: PropTypes.object.isRequired,
  // Facet object from search results
  facet: PropTypes.shape({
    // Object property the facet displays
    field: PropTypes.string.isRequired,
    // Facet title
    title: PropTypes.string.isRequired,
    // Relevant selectable terms for the facet
    terms: PropTypes.arrayOf(
      PropTypes.shape({
        // Label for the facet term
        key: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        // Number of results for the facet term
        doc_count: PropTypes.number,
        // Label for the facet term as a string when available
        key_as_string: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  // Called to return the updated query string from the facet user selection
  updateQuery: PropTypes.func.isRequired,
};
