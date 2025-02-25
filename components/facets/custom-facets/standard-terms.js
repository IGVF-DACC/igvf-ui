// node_modules
import _ from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import { XCircleIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
// components/facets
import FacetTerm from "../facet-term";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "../../animation";
import Icon from "../../icon";
// lib
import QueryString from "../../../lib/query-string";
import { splitPathAndQueryString } from "../../../lib/query-utils";

/**
 * Minimum number of facet terms to display the term filter.
 */
const MIN_FILTER_COUNT = 20;

/**
 * Number of facet terms to display when the facet is collapsed.
 */
const COLLAPSED_TERMS_COUNT = 15;

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
      className="my-1.5 flex items-center gap-1 px-4"
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

/**
 * Display a segment of terms for a facet. Usually all terms in a facet get displayed, but facets
 * with lots of terms can show a subset of terms along with a button to expand the list to show all
 * terms.
 *
 * Use this component to display one segment of terms for a facet, so usually the always-displayed
 * terms regardless of whether the user has expanded the list of terms or not, and the segment of
 * terms that are only displayed when the user has expanded the list.
 */
function TermSegment({
  termSegment,
  field,
  selectionFilters,
  parent,
  onTermClick,
}) {
  return (
    <div className="pl-2">
      {termSegment.map((term) => {
        const termKey = term.key_as_string || term.key;
        const checkedFilter = selectionFilters.find(
          (filter) => filter.field === field && filter.term === termKey
        );
        const isChecked = Boolean(checkedFilter);
        const isNegative = isChecked && checkedFilter.isNegative;

        return (
          <div key={term.key} className={`${term.subfacet ? "my-2" : ""}`}>
            <FacetTerm
              key={term.key}
              field={field}
              term={term}
              parent={parent}
              isChecked={isChecked}
              isNegative={isNegative}
              onClick={onTermClick}
            />
            {term.subfacet && (
              <div className="pl-3">
                <TermSegment
                  termSegment={term.subfacet.terms}
                  field={term.subfacet.field}
                  selectionFilters={selectionFilters}
                  parent={{ field, term }}
                  onTermClick={onTermClick}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

TermSegment.propTypes = {
  // Array of terms to display
  termSegment: PropTypes.arrayOf(
    PropTypes.shape({
      // Label for the facet term
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      // Number of results for the facet term
      doc_count: PropTypes.number,
      // Label for the facet term as a string when available
      key_as_string: PropTypes.string,
    })
  ).isRequired,
  // Field of the facet that the terms belong to
  field: PropTypes.string.isRequired,
  // Array of selected filters for this facet
  selectionFilters: PropTypes.arrayOf(
    PropTypes.shape({
      // Field of the selected filter
      field: PropTypes.string.isRequired,
      // Term of the selected filter
      term: PropTypes.string.isRequired,
      // True if the selected filter is a negative filter
      isNegative: PropTypes.bool.isRequired,
    })
  ).isRequired,
  // Field name and key of the parent term if these terms are child terms
  parent: PropTypes.exact({
    // Field of the parent term
    field: PropTypes.string,
    // Parent term object including key and subfacet
    term: PropTypes.object,
  }),
  // Function to call when the user clicks a term
  onTermClick: PropTypes.func.isRequired,
};

/**
 * Process the user's click on a facet term. Add or remove the term from the query string and
 * navigate to the new URL.
 * @param {string} field Field of the facet that the user clicked a term within
 * @param {object} term Term that the user clicked within a facet
 * @param {boolean} isNegative True if the term is negated
 * @param {object} parent Parent term of the term the user clicked, if it's a child term
 * @param {QueryString} query Query string object to update
 * @param {function} updateQuery Function to call to update the query string
 */
function processTermClick(field, term, isNegative, parent, query, updateQuery) {
  const matchingTerms = query.getKeyValues(field, "ANY");
  const key = term.key_as_string || term.key;
  if (matchingTerms.includes(key)) {
    // Remove the term from the query because it's already selected.
    query.deleteKeyValue(field, key);

    // If the term has a parent, also remove the parent term
    if (parent) {
      query.deleteKeyValue(parent.field, parent.term.key);
    } else if (term.subfacet) {
      // Term has child terms; automatically deselect them all
      term.subfacet.terms.forEach((subterm) => {
        query.deleteKeyValue(term.subfacet.field, subterm.key);
      });
    }
  } else {
    // Add the term to the query because it's not already selected.
    const polarity = isNegative ? "NEGATIVE" : "POSITIVE";
    query.addKeyValue(field, key, polarity);

    // Process parent or child terms when subfacets are involved.
    if (term.subfacet) {
      // Term has child terms; automatically select them all
      term.subfacet.terms.forEach((subterm) => {
        query.addKeyValue(term.subfacet.field, subterm.key, polarity);
      });
    } else if (parent) {
      // `term` is part of a subfacet. If all its peers are selected, also select the parent term.
      const allSubfacetTerms = parent.term.subfacet.terms.map(
        (subterm) => subterm.key
      );
      const selectedSubfacetTerms = query.getKeyValues(field, "ANY");
      const allSubfacetTermsSelected = _.isEqual(
        _.sortBy(allSubfacetTerms),
        _.sortBy(selectedSubfacetTerms)
      );
      if (allSubfacetTermsSelected) {
        query.addKeyValue(parent.field, parent.term.key, polarity);
      }
    }
  }
  query.deleteKeyValue("from");
  query.deleteKeyValue(field, "*");
  updateQuery(query.format());
}

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
  const alwaysDisplayedTerms = filteredTerms.slice(0, COLLAPSED_TERMS_COUNT);
  const expandedDisplayedTerms = filteredTerms.slice(COLLAPSED_TERMS_COUNT);

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
   * @param {boolean} isNegative True if the term is negated
   * @param {boolean} parentTerm Parent term of the term the user clicked, if it's a child term
   */
  function onTermClick(field, term, isNegative, parent) {
    processTermClick(field, term, isNegative, parent, query, updateQuery);
  }

  // Clear the term filter when the facet terms change.
  useEffect(() => {
    setFilterTerm("");
  }, [facet.terms.length]);

  return (
    <div className="mt-2">
      {facet.terms.length > MIN_FILTER_COUNT && (
        <TermFilter
          id={facet.field}
          currentFilter={filterTerm}
          setCurrentFilter={setFilterTerm}
        />
      )}
      {alwaysDisplayedTerms.length > 0 ? (
        <>
          <ul>
            <TermSegment
              termSegment={alwaysDisplayedTerms}
              field={facet.field}
              selectionFilters={selectionFilters}
              onTermClick={onTermClick}
            />
          </ul>
          <AnimatePresence>
            {expandedDisplayedTerms.length > 0 && isExpanded && (
              <motion.ul
                initial="collapsed"
                animate="open"
                exit="collapsed"
                transition={standardAnimationTransition}
                variants={standardAnimationVariants}
              >
                <TermSegment
                  termSegment={expandedDisplayedTerms}
                  field={facet.field}
                  selectionFilters={selectionFilters}
                  onTermClick={onTermClick}
                />
              </motion.ul>
            )}
          </AnimatePresence>
          {filteredTerms.length > COLLAPSED_TERMS_COUNT && (
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
