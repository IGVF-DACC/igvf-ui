// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "../animation";
import SessionContext from "../session-context";
// components/facets
import Facet from "./facet";
import facetRegistry from "./facet-registry";
// lib
import {
  getFacetConfig,
  getVisibleFacets,
  setFacetConfig,
} from "../../lib/facets";
import FetchRequest from "../../lib/fetch-request";
import { splitPathAndQueryString } from "../../lib/query-utils";
import { getSpecificSearchTypes } from "../../lib/search-results";

/**
 * Timeout in milliseconds for saving the set of open and closed facets to the NextJS server redis
 * cache. This timeout reduces traffic to the NextJS server by buffering multiple updates to the
 * opened facets before saving them.
 */
const BUFFER_TIMEOUT = 3000;

/**
 * Called when the user clicks on a facet title to open or close it. This function updates the
 * React state variable storing the set of opened and closed facets. If the user holds down the alt
 * or option key while clicking, it toggles all the facets at once. This function is defined
 * outside of the component to avoid parsing a very long function every time the component
 * re-renders.
 * @param {SyntheticEvent} e Event from the user clicking a facet title
 * @param {string} field Field name of the facet title that was clicked
 * @param {object[]} visibleFacets Facets from search results currently visible
 * @param {object} openedFacets React state variable storing the set of opened and closed facets
 * @param {function} setOpenedFacets React state function to update the opened and closed facets
 */
function updateOpenFacets(
  e,
  field,
  visibleFacets,
  openedFacets,
  setOpenedFacets
) {
  if (e.altKey || e.metaKey) {
    // The user was holding down the alt or option key, so toggle all the facets at once.
    if (openedFacets[field]) {
      // Close all the facets.
      setOpenedFacets(() =>
        visibleFacets.reduce(
          (acc, facet) => ((acc[facet.field] = false), acc),
          {}
        )
      );
    } else {
      // Open all the facets.
      setOpenedFacets(() =>
        visibleFacets.reduce(
          (acc, facet) => ((acc[facet.field] = true), acc),
          {}
        )
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
 * Displays all the facets within a facet group. It also handles the user clicking on a facet
 * term to add or remove it from the search query, and navigates to the URL with the updated query
 * string.
 */
export function FacetList({ searchResults }) {
  const router = useRouter();
  const { path } = splitPathAndQueryString(searchResults["@id"]);
  const { isAuthenticated } = useAuth0();
  const { sessionProperties } = useContext(SessionContext);
  const userUuid = sessionProperties?.user?.uuid || "";
  const types = getSpecificSearchTypes(searchResults);
  const selectedType = types.length === 1 ? types[0] : "";
  const request = new FetchRequest({ backend: true });

  // Get all the facet objects from the search results that are in the facet group.
  const facets = getVisibleFacets(searchResults.facets, isAuthenticated);

  // Keep track of which facets are open and closed; closed by default.
  const [openedFacets, setOpenedFacets] = useState(() => {
    return facets.reduce((acc, facet) => ((acc[facet.field] = false), acc), {});
  });

  // The opened facets get saved by a timer callback. Set up that timer as well as the current
  // value of the `openedFacets` state for the timer callback closure.
  const openedFacetsTimer = useRef(null);
  const openedFacetsUpdated = useRef({});
  openedFacetsUpdated.current = openedFacets;

  useEffect(() => {
    // After the page loads, if the user has logged in and they have selected a single search type
    // (e.g. "type=MeasurementSet"), attempt to load the saved set of open and closed facets from
    // the NextJS server redis cache.
    if (userUuid && selectedType) {
      getFacetConfig(userUuid, selectedType, request).then(
        (savedOpenFacets) => {
          if (savedOpenFacets) {
            setOpenedFacets(savedOpenFacets);
          }
        }
      );
    }
  }, [selectedType, userUuid]);

  // Called when the user clicks on a facet title with the facet ID `field` to open or close it.
  function updateOpen(e, field) {
    updateOpenFacets(e, field, facets, openedFacets, setOpenedFacets);

    // Restart the opened-facets timer now that the user has opened or closed facets. Once the
    // timer expires, save the current state of the opened facets to the NextJS server redis cache.
    if (userUuid && selectedType) {
      clearTimeout(openedFacetsTimer.current);
      openedFacetsTimer.current = setTimeout(() => {
        setFacetConfig(
          userUuid,
          selectedType,
          openedFacetsUpdated.current,
          request
        );
      }, BUFFER_TIMEOUT);
    }
  }

  // When a user selection in the facet terms changes, receive the updated query string and
  // navigate to the new URL.
  function updateQuery(queryString) {
    router.push(`${path}?${queryString}`, "", { scroll: false });
  }

  return (
    <>
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
            updateOpen={(e) => updateOpen(e, facet.field)}
            isFacetOpen={openedFacets[facet.field] || false}
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
    </>
  );
}

FacetList.propTypes = {
  // Search results from data provider
  searchResults: PropTypes.object.isRequired,
};
