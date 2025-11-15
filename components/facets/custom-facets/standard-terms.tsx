// node_modules
import { motion, AnimatePresence } from "motion/react";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
// components/facet/custom-facets
import TriBooleanTerms from "./tri-boolean-terms";
// components/facets
import FacetTerm from "../facet-term";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "../../animation";
import Icon from "../../icon";
// lib
import { checkForBooleanFacet } from "../../../lib/facets";
import QueryString from "../../../lib/query-string";
import { splitPathAndQueryString } from "../../../lib/query-utils";
// root
import type {
  SearchResults,
  SearchResultsFacet,
  SearchResultsFacetTerm,
} from "../../../globals";

/**
 * Minimum number of facet terms to display the term filter.
 */
const MIN_FILTER_COUNT = 20;

/**
 * Number of facet terms to display when the facet is collapsed.
 */
const COLLAPSED_TERMS_COUNT = 15;

type InternalFilter = {
  field: string;
  term: string | number;
  isNegative: boolean;
};

/**
 * Lets the user type a term to filter the facet terms. Just used for the standard terms facet.
 *
 * @param id - Unique ID for the facet filter
 * @param currentFilter - Current filter term
 * @param setCurrentFilter - Function to call when the user types into the filter input
 */
function TermFilter({
  id,
  currentFilter,
  setCurrentFilter,
}: {
  id: string;
  currentFilter: string;
  setCurrentFilter: (filter: string) => void;
}) {
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
        className="border-facet-filter text-facet-filter focus:border-facet-filter-focus focus:text-facet-filter-focus w-full border-b bg-transparent px-1 py-0.5 text-sm placeholder:text-xs placeholder:text-gray-300 dark:placeholder:text-gray-600"
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
        <XCircleIcon className="fill-facet-clear-filter-icon h-5 w-5" />
        <div className="sr-only">Clear term filter</div>
      </button>
    </div>
  );
}

/**
 * Button to expand or collapse the facets with a large number of terms, generally *after*
 * filtering.
 *
 * @param id - Unique ID for the facet collapse control
 * @param totalTermCount - Total number of terms for the facet
 * @param isExpanded - True if the facet is currently expanded
 * @param setIsExpanded - Function to call when the user clicks the expand/collapse button
 */
function CollapseControl({
  id,
  totalTermCount,
  isExpanded,
  setIsExpanded,
}: {
  id: string;
  totalTermCount: number;
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}) {
  return (
    <button
      className="mx-2 text-xs font-bold text-gray-500 uppercase"
      data-testid={`facet-term-collapse-${id}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {isExpanded ? "See fewer terms" : `See all ${totalTermCount} terms`}
    </button>
  );
}

/**
 * Display a segment of terms for a facet. Usually all terms in a facet get displayed, but facets
 * with lots of terms can show a subset of terms along with a button to expand the list to show all
 * terms.
 *
 * Use this component to display one segment of terms for a facet, so usually the always-displayed
 * terms regardless of whether the user has expanded the list of terms or not, and the segment of
 * terms that are only displayed when the user has expanded the list.
 *
 * @param termSegment - Array of terms to display in this segment
 * @param field - Field of the facet that the terms belong to
 * @param selectionFilters - Array of selected filters for this facet
 * @param parent - Field name and key of the parent term if these terms are child terms
 * @param onTermClick - Function to call when the user clicks a term
 */
function TermSegment({
  termSegment,
  field,
  selectionFilters,
  parentField,
  parent,
  onTermClick,
}: {
  termSegment: SearchResultsFacetTerm[];
  field: string;
  selectionFilters: InternalFilter[];
  parentField?: string;
  parent?: SearchResultsFacetTerm;
  onTermClick: (
    field: string,
    term: SearchResultsFacetTerm,
    isNegative: boolean,
    parentField: string,
    parent: SearchResultsFacetTerm | null
  ) => void;
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
              parentField={parentField}
              parent={parent}
              isChecked={isChecked}
              isNegative={isNegative}
              onClick={onTermClick}
            />
            {term.subfacet && (
              <div className="pl-3">
                <TermSegment
                  termSegment={term.subfacet.terms as SearchResultsFacetTerm[]}
                  field={term.subfacet.field}
                  selectionFilters={selectionFilters}
                  parentField={field}
                  parent={term}
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

/**
 * Process the user's click on a facet term. Add or remove the term from the query string and
 * navigate to the new URL.
 *
 * @param field - Field of the facet that the user clicked a term within
 * @param term - Term that the user clicked within a facet
 * @param isNegative - True if the term is negated
 * @param parent - Parent term of the term the user clicked, if it's a child term
 * @param query - Query string object to update
 * @param updateQuery - Function to call to update the query string
 */
function processTermClick(
  field: string,
  term: SearchResultsFacetTerm,
  isNegative: boolean,
  parentField: string,
  parent: SearchResultsFacetTerm | null,
  query: QueryString,
  updateQuery: (query: string) => void
) {
  const matchingTerms = query.getKeyValues(field, "ANY");
  const key = term.key_as_string || String(term.key);
  if (matchingTerms.includes(key)) {
    // Remove the term from the query because it's already selected.
    query.deleteKeyValue(field, key);
    if (term.subfacet) {
      // Term has child terms; automatically deselect them all
      const subfacetTerms = term.subfacet.terms as SearchResultsFacetTerm[];
      subfacetTerms.forEach((subterm) => {
        query.deleteKeyValue(term.subfacet.field, subterm.key);
      });
    } else if (parent) {
      // If the deselected term is the last selected child term, deselect the parent term. Start by
      // getting all subfacet keys for the parent term.
      const subfacetTerms = parent.subfacet.terms as SearchResultsFacetTerm[];
      const parentSubfacetKeys = subfacetTerms.map((subterm) => subterm.key);

      // Get all selected subfacet keys in the query string. Some could belong to other parent terms.
      const allSelectedSubfacetKeys = query.getKeyValues(field, "ANY");

      // Filter down to only those selected subfacet keys that belong to the parent term.
      const parentSelectedSubfacetKeys = allSelectedSubfacetKeys.filter((key) =>
        parentSubfacetKeys.includes(key)
      );

      // If no selected terms exist for the parent term, deselect the parent term.
      if (parentSelectedSubfacetKeys.length === 0) {
        query.deleteKeyValue(parentField, parent.key);
      }
    }
  } else {
    // Add the term to the query because it's not already selected.
    const polarity = isNegative ? "NEGATIVE" : "POSITIVE";
    query.addKeyValue(field, key, polarity);

    // Process parent or child terms when subfacets are involved.
    if (term.subfacet) {
      // Term has child terms; automatically select them all
      const subfacetTerms = term.subfacet.terms as SearchResultsFacetTerm[];
      subfacetTerms.forEach((subterm) => {
        query.deleteKeyValue(term.subfacet.field, subterm.key);
        query.addKeyValue(term.subfacet.field, subterm.key, polarity);
      });
    }
  }
  query.deleteKeyValue("from");
  query.deleteKeyValue(field, "*");
  updateQuery(query.format());
}

/**
 * Core component to display standard facet terms. Handles filtering, expanding/collapsing, and
 * term selection.
 *
 * @param searchResults - Search results that include the given facet
 * @param facet - Facet to display
 * @param updateQuery - Function to update the query string on user selection
 */
function StandardTermsCore({
  searchResults,
  facet,
  updateQuery,
}: {
  searchResults: SearchResults;
  facet: SearchResultsFacet;
  updateQuery: (queryString: string) => void;
}) {
  // User-typed term to filter the facet terms
  const [filterTerm, setFilterTerm] = useState("");
  // True if the facet has enough terms to expand/collapse, and it's currently expanded
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate a query based on the current URL to update once the user clicks a facet term.
  const { queryString } = splitPathAndQueryString(searchResults["@id"]);
  const query = new QueryString(queryString);

  // Filter the facet terms based on the user-typed term.
  const facetTerms = facet.terms as SearchResultsFacetTerm[];
  const filteredTerms = facetTerms.filter((term) => {
    const termKey = term.key_as_string || term.key;
    const termKeyNormalized =
      typeof termKey === "string" ? termKey.toLowerCase() : String(termKey);
    const filterTermNormalized = filterTerm.toLowerCase();
    return termKeyNormalized.includes(filterTermNormalized);
  });

  // Further limit the terms if the facet has enough terms to be expandable and is currently
  // collapsed.
  const alwaysDisplayedTerms = filteredTerms.slice(0, COLLAPSED_TERMS_COUNT);
  const expandedDisplayedTerms = filteredTerms.slice(COLLAPSED_TERMS_COUNT);

  // Get the terms that are currently selected for this facet.
  const selectionFilters: InternalFilter[] = searchResults.filters.map(
    (filter) => {
      const isNegative = filter.field.at(-1) === "!";
      const field = isNegative ? filter.field.slice(0, -1) : filter.field;
      return {
        field,
        term: filter.term,
        isNegative,
      };
    }
  );

  /**
   * When the user clicks a facet term, add or remove it from the query string and navigate
   * to the new URL.
   *
   * @param field - Field of the facet that the user clicked a term within
   * @param term - Term that the user clicked within a facet
   * @param isNegative - True if the term is negated
   * @param parentTerm - Parent term of the term the user clicked, if it's a child term
   */
  function onTermClick(
    field: string,
    term: SearchResultsFacetTerm,
    isNegative: boolean,
    parentField?: string,
    parentTerm?: SearchResultsFacetTerm
  ) {
    processTermClick(
      field,
      term,
      isNegative,
      parentField,
      parentTerm,
      query,
      updateQuery
    );
  }

  // Clear the term filter when the facet terms change.
  useEffect(() => {
    setFilterTerm("");
  }, [facetTerms.length]);

  return (
    <div className="mt-2">
      {facetTerms.length > MIN_FILTER_COUNT && (
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
        <p className="text-center text-sm text-gray-500 italic">
          Filter matches no terms.
        </p>
      )}
    </div>
  );
}

/**
 * Wrapper component for the standard terms facet. It handles boolean facets by using the
 * TriBooleanTerms component, and otherwise uses the StandardTermsCore component to display the
 * terms.
 *
 * @param searchResults - Search results that include the given facet
 * @param facet - Facet to display
 * @param updateQuery - Function to update the query string on user selection
 */
export default function StandardTerms({
  searchResults,
  facet,
  updateQuery,
}: {
  searchResults: SearchResults;
  facet: SearchResultsFacet;
  updateQuery: (queryString: string) => void;
}) {
  // Facets that appear to be boolean facets should use the TriBooleanTerms component.
  if (checkForBooleanFacet(facet)) {
    return (
      <TriBooleanTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );
  }

  return (
    <StandardTermsCore
      searchResults={searchResults}
      facet={facet}
      updateQuery={updateQuery}
    />
  );
}
