// node_modules
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { type MouseEvent } from "react";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "../animation";
// components/facets
import Facet from "./facet";
import facetRegistry from "./facet-registry";
// lib
import { splitPathAndQueryString } from "../../lib/query-utils";
// root
import type { SearchResults, SearchResultsFacet } from "../../globals";

/**
 * Displays all the facets within a facet group. It also handles the user clicking on a facet
 * term to add or remove it from the search query, and navigates to the URL with the updated query
 * string.
 *
 * @param searchResults - Search results from the data provider
 */
export function FacetList({
  searchResults,
  facets,
  openedFacets,
  onFacetOpen,
}: {
  searchResults: SearchResults;
  facets: SearchResultsFacet[];
  openedFacets: Record<string, boolean>;
  onFacetOpen: (e: MouseEvent, field: string) => void;
}) {
  const router = useRouter();
  const { path } = splitPathAndQueryString(searchResults["@id"]);

  // When a user selection in the facet terms changes, receive the updated query string and
  // navigate to the new URL.
  function updateQuery(queryString: string) {
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
            updateOpen={(e) => onFacetOpen(e, facet.field)}
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
