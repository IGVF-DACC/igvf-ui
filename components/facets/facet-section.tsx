// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import {
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
// components/facets
import { FacetList } from "./facet-list";
// components
import { DataPanel } from "../../components/data-area";
import { Button } from "../../components/form-elements";
import HelpTip from "../../components/help-tip";
import Icon from "../../components/icon";
import SessionContext from "../session-context";
// lib
import {
  getFacetConfig,
  getVisibleFacets,
  setFacetConfig,
} from "../../lib/facets";
import FetchRequest from "../../lib/fetch-request";
import { getSpecificSearchTypes } from "../../lib/search-results";
import { Tooltip, TooltipRef, useTooltip } from "../../components/tooltip";
// root
import { SearchResults, SearchResultsFacet } from "../../globals";

/**
 * Timeout in milliseconds for saving the set of open and closed facets to the NextJS server redis
 * cache. This timeout reduces traffic to the NextJS server by buffering multiple updates to the
 * opened facets before saving them.
 */
const BUFFER_TIMEOUT = 3000;

/**
 * Set the open state of all facets.
 *
 * @param facets - The facets to update
 * @param openAll - True to open all facets, false to close all facets
 * @returns A record to map facet fields to their open state
 */
function setAllFacetOpenState(
  facets: SearchResultsFacet[],
  openAll: boolean
): Record<string, boolean> {
  return facets.reduce(
    (acc, facet) => ({ ...acc, [facet.field]: openAll }),
    {} as Record<string, boolean>
  );
}

/**
 * Called when the user clicks on a facet title to open or close it. This function updates the
 * React state variable storing the set of opened and closed facets. If the user holds down the alt
 * or option key while clicking, it toggles all the facets at once. This function is defined
 * outside of the component to avoid parsing a very long function every time the component
 * re-renders.
 *
 * @param e - Event from the user clicking a facet title
 * @param field - Field name of the facet title that was clicked
 * @param visibleFacets - Facets from search results currently visible
 * @param openedFacets - React state variable storing the set of opened and closed facets
 * @param setOpenedFacets - React state function to update the opened and closed facets
 */
function updateOpenFacets(
  e: MouseEvent,
  field: string,
  visibleFacets: SearchResultsFacet[],
  openedFacets: Record<string, boolean>
) {
  let updatedOpenedFacets = { ...openedFacets };

  if (e.altKey || e.metaKey) {
    // The user was holding down the alt or option key, so toggle all the facets at once.
    if (openedFacets[field]) {
      // Close all the facets.
      updatedOpenedFacets = setAllFacetOpenState(visibleFacets, false);
    } else {
      // Open all the facets.
      updatedOpenedFacets = setAllFacetOpenState(visibleFacets, true);
    }
  } else {
    // Toggle just the facet the user clicked.
    updatedOpenedFacets[field] = !openedFacets[field];
  }

  return updatedOpenedFacets;
}

/**
 * Display a button that clears all the currently selected facets.
 *
 * @param searchResults - Search results from the data provider
 */
function ClearAll({ searchResults }: { searchResults: SearchResults }) {
  const router = useRouter();

  // Get all the currently selected facet fields except for the "type" facet.
  const selectedFields = searchResults.filters
    .map((filter) => filter.field)
    .filter((field) => field !== "type");
  const uniqueSelectedFields = [...new Set(selectedFields)];

  function onClearAll() {
    router.push(searchResults.clear_filters, "", { scroll: false });
  }

  const isDisabled = uniqueSelectedFields.length === 0;
  return (
    <Button
      label="Clear all filters"
      onClick={onClearAll}
      type="secondary"
      size="sm"
      className="grow"
      isDisabled={isDisabled}
    >
      Clear All
    </Button>
  );
}

/**
 * Display controls for expanding and collapsing all facets.
 *
 * @param onAllFacets - Function called when the user clicks to open or close all facets
 */
function AllFacetsControls({
  onAllFacets,
}: {
  onAllFacets: (openAll: boolean) => void;
}) {
  const collapseTooltipAttr = useTooltip("collapse-all");
  const expandTooltipAttr = useTooltip("expand-all");

  return (
    <div className="flex gap-1">
      <TooltipRef tooltipAttr={expandTooltipAttr}>
        <Button
          label="Open all facets"
          onClick={() => onAllFacets(true)}
          type="secondary"
          size="sm"
          className="h-full"
          hasIconCircleOnly
        >
          <Icon.Expand />
        </Button>
      </TooltipRef>
      <Tooltip tooltipAttr={expandTooltipAttr}>
        Expand all facets, or hold down the Alt key and expand one facet to
        expand all
      </Tooltip>
      <TooltipRef tooltipAttr={collapseTooltipAttr}>
        <Button
          label="Close all facets"
          onClick={() => onAllFacets(false)}
          type="secondary"
          size="sm"
          className="h-full"
          hasIconCircleOnly
        >
          <Icon.Collapse />
        </Button>
      </TooltipRef>
      <Tooltip tooltipAttr={collapseTooltipAttr}>
        Collapse all facets, or hold down the Alt key and collapse one facet to
        collapse all
      </Tooltip>
    </div>
  );
}

/**
 * Display the facet area including the Clear All button and the facets themselves.
 *
 * @param searchResults - Search results from the data provider
 */
export default function FacetSection({
  searchResults,
}: {
  searchResults: SearchResults;
}) {
  const { isAuthenticated } = useAuth0();
  const { sessionProperties } = useContext(SessionContext);
  const userUuid = sessionProperties?.user?.uuid || "";
  const types = getSpecificSearchTypes(searchResults);
  const request = new FetchRequest({ backend: true });
  const selectedType = types.length === 1 ? types[0] : "";

  // Get all the facet objects from the search results that are in the facet group.
  const facets = getVisibleFacets(searchResults.facets, isAuthenticated);

  // Keep track of which facets are open and closed; closed by default.
  const [openedFacets, setOpenedFacets] = useState<Record<string, boolean>>(
    () => {
      return facets.reduce(
        (acc, facet) => ((acc[facet.field] = false), acc),
        {}
      );
    }
  );

  // The opened facets get saved by a timer callback. Set up that timer as well as the current
  // value of the `openedFacets` state for the timer callback closure.
  const openedFacetsTimer = useRef<NodeJS.Timeout | null>(null);
  const openedFacetsUpdated = useRef<Record<string, boolean>>({});
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

  // Restart the opened-facets timer now that the user has opened or closed facets. Once the timer
  // expires, save the current state of the opened facets to the NextJS server redis cache.
  function saveOpen() {
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

  // Called when the user clicks on a facet title with the facet ID `field` to open or close it.
  function onFacetOpen(e: MouseEvent, field: string) {
    setOpenedFacets((prev) => updateOpenFacets(e, field, visibleFacets, prev));
    saveOpen();
  }

  function onAllFacets(openAll: boolean) {
    setOpenedFacets(() => setAllFacetOpenState(facets, openAll));
    saveOpen();
  }

  // Determine if we should show facets at all. This is the case when no facet groups exist, and
  // the search results have no displayable facets.
  const visibleFacets = getVisibleFacets(searchResults.facets, isAuthenticated);
  if (visibleFacets.length > 0) {
    return (
      <DataPanel
        className="mb-4 lg:mb-0 lg:w-72 lg:shrink-0 lg:grow-0 lg:overflow-y-auto"
        isPaddingSuppressed
      >
        <div className="p-4">
          <div className="flex gap-1">
            <ClearAll searchResults={searchResults} />
            <AllFacetsControls onAllFacets={onAllFacets} />
          </div>
          <HelpTip className="mt-4">
            Click and hold a term momentarily to select items <i>without</i>{" "}
            that term.
          </HelpTip>
        </div>
        <FacetList
          searchResults={searchResults}
          facets={facets}
          openedFacets={openedFacets}
          onFacetOpen={onFacetOpen}
        />
      </DataPanel>
    );
  }

  // No displayable facets.
  return null;
}
