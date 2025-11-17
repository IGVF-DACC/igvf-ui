// node_modules
import { AnimatePresence, motion, Reorder } from "motion/react";
import { useRouter } from "next/router";
import { Fragment, type ElementType, type MouseEvent } from "react";
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
 * @param facets - Facets to display in the list
 * @param openedFacets - Record of which facets are open
 * @param onFacetOpen - Callback when a facet is opened or closed
 * @param onReorder - Callback when the facet order is changed
 * @param isEditOrderMode - True when editing the facet order
 */
export function FacetList({
  searchResults,
  facets,
  openedFacets,
  onFacetOpen,
  onReorder,
  isEditOrderMode,
}: {
  searchResults: SearchResults;
  facets: SearchResultsFacet[];
  openedFacets: Record<string, boolean>;
  onFacetOpen: (e: MouseEvent, field: string) => void;
  onReorder?: (newOrder: SearchResultsFacet[]) => void;
  isEditOrderMode: boolean;
}) {
  const router = useRouter();
  const { path } = splitPathAndQueryString(searchResults["@id"]);

  // When a user selection in the facet terms changes, receive the updated query string and
  // navigate to the new URL.
  function updateQuery(queryString: string) {
    router.push(`${path}?${queryString}`, "", { scroll: false });
  }

  // Wrapper components that conditionally render Reorder or Fragment
  const ListWrapper: ElementType = isEditOrderMode ? Reorder.Group : "div";
  const ItemWrapper: ElementType = isEditOrderMode ? Reorder.Item : Fragment;

  const listProps = isEditOrderMode
    ? {
        axis: "y" as const,
        values: facets,
        onReorder,
        className: "isolate",
      }
    : {};

  return (
    <ListWrapper {...listProps}>
      {facets.map((facet) => {
        const Terms = facetRegistry.terms.lookup(facet.field);
        const itemProps = isEditOrderMode
          ? {
              value: facet,
              style: { boxShadow: "0 0 0 rgba(0,0,0,0)" },
              className: "relative",
              whileDrag: {
                zIndex: 200,
                scale: 1.02,
                boxShadow: "0px 4px 8px rgba(0,0,0,0.25)",
                borderBottom: "1px solid var(--color-panel-border)",
              },
            }
          : {};

        // Find the facet object in the search results that matches the facet field in the facet
        // group.
        return (
          <ItemWrapper key={facet.field} {...itemProps}>
            <Facet
              facet={facet}
              searchResults={searchResults}
              updateQuery={updateQuery}
              updateOpen={(e) => onFacetOpen(e, facet.field)}
              isFacetOpen={
                (!isEditOrderMode && openedFacets[facet.field]) || false
              }
              isEditOrderMode={isEditOrderMode}
            >
              <AnimatePresence>
                {!isEditOrderMode && openedFacets[facet.field] && (
                  <motion.div
                    data-testid={`facet-terms-${facet.field}`}
                    className="overflow-hidden"
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
          </ItemWrapper>
        );
      })}
    </ListWrapper>
  );
}
