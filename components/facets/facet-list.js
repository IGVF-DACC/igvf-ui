// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useState } from "react";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "../animation";
// components/facets
import Facet from "./facet";
import facetRegistry from "./facet-registry";
// lib
import { getVisibleFacets } from "../../lib/facets";
import { splitPathAndQueryString } from "../../lib/query-utils";

/**
 * Displays all the facets within a facet group. It also handles the user clicking on a facet
 * term to add or remove it from the search query, and navigates to the URL with the updated query
 * string.
 */
export function FacetList({ searchResults }) {
  const router = useRouter();
  const { path } = splitPathAndQueryString(searchResults["@id"]);
  const { isAuthenticated } = useAuth0();

  // Get all the facet objects from the search results that are in the facet group.
  const facets = getVisibleFacets(searchResults.facets, isAuthenticated);

  // Keep track of which facets are open and closed; closed by default.
  const [openedFacets, setOpenedFacets] = useState(() => {
    return facets.reduce((acc, facet) => ((acc[facet.field] = false), acc), {});
  });

  // Called when the user clicks on a facet group title with the facet ID `field` to open or close
  // it.
  function updateOpen(field) {
    if (event.altKey || event.metaKey) {
      // The user was holding down the alt or option key, so toggle all the facets at once.
      if (openedFacets[field]) {
        // Close all the facets.
        setOpenedFacets(() =>
          facets.reduce((acc, facet) => ((acc[facet.field] = false), acc), {})
        );
      } else {
        // Open all the facets.
        setOpenedFacets(() =>
          facets.reduce((acc, facet) => ((acc[facet.field] = true), acc), {})
        );
      }
    } else {
      // Toggle just the facet the user clicked.
      setOpenedFacets((prev) => ({
        ...prev,
        [field]: !prev[field],
      }));
    }
  }

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
      {facets.map((facet) => {
        const Terms = facetRegistry.terms.lookup(facet.field);

        // Find the facet object in the search results that matches the facet field in the facet
        // group.
        return (
          <Facet
            key={facet.field}
            facet={facet}
            searchResults={searchResults}
            updateQuery={updateQuery}
            updateOpen={() => updateOpen(facet.field)}
            isFacetOpen={openedFacets[facet.field]}
          >
            <AnimatePresence>
              {openedFacets[facet.field] && (
                <motion.div
                  data-testid={`facet-terms-${facet.field}`}
                  className="overflow-hidden md:hidden"
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  transition={standardAnimationTransition}
                  variants={standardAnimationVariants}
                >
                  <Terms
                    facet={facet}
                    searchResults={searchResults}
                    updateQuery={updateQuery}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Facet>
        );
      })}
    </div>
  );
}

FacetList.propTypes = {
  // Search results from data provider
  searchResults: PropTypes.object.isRequired,
};
