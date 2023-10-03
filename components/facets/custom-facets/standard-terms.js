// node_modules
import PropTypes from "prop-types";
// components/facets
import FacetTerm from "../facet-term";
// lib
import QueryString from "../../../lib/query-string";
import { splitPathAndQueryString } from "../../../lib/query-utils";

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

export default function StandardTerms({ searchResults, facet, updateQuery }) {
  // Generate a query based on the current URL to update once the user clicks a facet term.
  const { queryString } = splitPathAndQueryString(searchResults["@id"]);
  const query = new QueryString(queryString);

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

  return (
    <div>
      <TermsSelectors
        facetTitle={facet.title}
        onAllClick={onAllClick}
        onNoneClick={onNoneClick}
      />
      <ul>
        {facet.terms.map((term) => {
          const termKey = term.key_as_string || term.key;
          const checkedFilter = selectionFilters.find(
            (filter) => filter.field === facet.field && filter.term === termKey
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
        doc_count: PropTypes.number.isRequired,
        // Label for the facet term as a string when available
        key_as_string: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  // Called to return the updated query string from the facet user selection
  updateQuery: PropTypes.func.isRequired,
};
