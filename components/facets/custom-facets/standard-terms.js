// node_modules
import PropTypes from "prop-types";
// components/facets
import FacetTerm from "../facet-term";
// lib
import QueryString from "../../../lib/query-string";
import { splitPathAndQueryString } from "../../../lib/query-utils";

export default function StandardTerms({ searchResults, facet, updateQuery }) {
  // Generate a query based on the current URL to update once the user clicks a facet term.
  const { queryString } = splitPathAndQueryString(searchResults["@id"]);
  const query = new QueryString(queryString);

  // Get the terms that are currently selected for this facet.
  const fieldTerms = query.getKeyValues(facet.field);

  /**
   * When the user clicks a facet term, add or remove it from the query string and navigate
   * to the new URL.
   * @param {string} field Field of the facet that the user clicked a term within
   * @param {string} term Term that the user clicked within a facet
   */
  function onTermClick(field, term) {
    const matchingTerms = query.getKeyValues(field);
    if (matchingTerms.includes(term.key)) {
      query.deleteKeyValue(field, term.key);
    } else {
      query.addKeyValue(field, term.key);
    }
    updateQuery(query.format());
  }

  return (
    <ul>
      {facet.terms.map((term) => {
        const isChecked = fieldTerms.includes(term.key);
        return (
          <FacetTerm
            key={term.key}
            field={facet.field}
            term={term}
            isChecked={isChecked}
            onClick={onTermClick}
          />
        );
      })}
    </ul>
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
        key: PropTypes.string.isRequired,
        // Number of results for the facet term
        doc_count: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  // Called to return the updated query string from the facet user selection
  updateQuery: PropTypes.func.isRequired,
};
