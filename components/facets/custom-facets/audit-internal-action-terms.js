// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import PropTypes from "prop-types";
// components/facets/custom-facets
import StandardTerms from "./standard-terms";

/**
 * Display facet terms for internal action audit events but only for authenticated users.
 */
export default function InternalActionAuditTerms({
  searchResults,
  facet,
  updateQuery,
}) {
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return (
      <StandardTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );
  }
  return null;
}

InternalActionAuditTerms.propTypes = {
  // Search results object
  searchResults: PropTypes.object.isRequired,
  // Facet object
  facet: PropTypes.object.isRequired,
  // Function to call when the user clicks a facet term
  updateQuery: PropTypes.func.isRequired,
};
