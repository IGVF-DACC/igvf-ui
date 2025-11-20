// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { ArrowsUpDownIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { useContext, useEffect, useState, type MouseEvent } from "react";
// components/facets
import { FacetList } from "./facet-list";
// components
import { DataPanel } from "../../components/data-area";
import { Button } from "../../components/form-elements";
import HelpTip from "../../components/help-tip";
import Icon from "../../components/icon";
import SessionContext from "../session-context";
import { Tooltip, TooltipRef, useTooltip } from "../../components/tooltip";
// lib
import {
  getFacetConfig,
  getFacetOrder,
  getVisibleFacets,
  setFacetConfig,
  setFacetOrder,
} from "../../lib/facets";
import FetchRequest from "../../lib/fetch-request";
import { isDatabaseObject } from "../../lib/general";
import { getSpecificSearchTypes } from "../../lib/search-results";
// root
import { SearchResults, SearchResultsFacet } from "../../globals";

/**
 * Possible edit mode changes when editing the order of facets.
 */
type EditModeChange = "ENTER" | "SAVE" | "CANCEL" | "RESET";

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
      Clear Filters
    </Button>
  );
}

/**
 * Display controls for expanding and collapsing all facets.
 *
 * @param onAllFacets - Function called when the user clicks to open or close all facets
 * @param onEditModeChange - Function called when the user clicks to change edit mode
 * @param showEditOrder - True to show the edit-order button
 */
function AllFacetsControls({
  onAllFacets,
  onEditModeChange,
  showEditOrder,
}: {
  onAllFacets: (openAll: boolean) => void;
  onEditModeChange: (editMode: EditModeChange) => void;
  showEditOrder: boolean;
}) {
  const collapseTooltipAttr = useTooltip("collapse-all");
  const expandTooltipAttr = useTooltip("expand-all");
  const editOrderTooltipAttr = useTooltip("edit-order");

  return (
    <div className="flex gap-1">
      {showEditOrder && (
        <>
          <TooltipRef tooltipAttr={editOrderTooltipAttr}>
            <Button
              label="Edit facet order"
              onClick={() => onEditModeChange("ENTER")}
              type="secondary"
              size="sm"
              className="h-full"
              hasIconCircleOnly
            >
              <ArrowsUpDownIcon />
            </Button>
          </TooltipRef>
          <Tooltip tooltipAttr={editOrderTooltipAttr}>
            Enter a mode to change the order of the filters. While in this mode
            you can drag and drop the filters to any order convenient for you.
          </Tooltip>
        </>
      )}
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
 * Display a button for editing the order of facets, or saving/canceling the edits.
 *
 * @param isEditOrderMode - True if the facet order is being edited
 * @param onEditModeChange - Function called when the user clicks to change edit mode
 */
function EditOrderButton({
  isEditOrderMode,
  onEditModeChange,
}: {
  isEditOrderMode: boolean;
  onEditModeChange: (editMode: EditModeChange) => void;
}) {
  if (isEditOrderMode) {
    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          type="primary"
          onClick={() => onEditModeChange("SAVE")}
          className="flex-1 basis-0"
        >
          Done
        </Button>
        <Button
          size="sm"
          type="secondary"
          onClick={() => onEditModeChange("CANCEL")}
          className="flex-1 basis-0"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          type="warning"
          onClick={() => onEditModeChange("RESET")}
          className="flex-1 basis-0"
        >
          Reset
        </Button>
      </div>
    );
  }
  return null;
}

/**
 * Display the facet area including the Clear All button and the facets themselves.
 *
 * @param searchResults - Search results from the data provider
 */
export default function FacetSection({
  searchResults,
  allFacets,
}: {
  searchResults: SearchResults;
  allFacets: SearchResultsFacet[];
}) {
  const { isAuthenticated } = useAuth0();
  const { sessionProperties } = useContext(SessionContext);
  const userUuid = sessionProperties?.user?.uuid || "";
  const types = getSpecificSearchTypes(searchResults);
  const request = new FetchRequest({ backend: true });
  const selectedType = types.length === 1 ? types[0] : "";
  const [isEditOrderMode, setIsEditOrderMode] = useState(false);

  // Get all the facet objects from the search results that are visible to the current user.
  // Generate a map from facet field to facet object for O(1) lookup when converting the field
  // arrays to facet objects.
  const facets = getVisibleFacets(searchResults.facets, isAuthenticated);
  const facetFields = facets.map((facet) => facet.field);
  const consideredFacets = isEditOrderMode ? allFacets : facets;
  const facetMap = new Map(
    consideredFacets.map((facet) => [facet.field, facet])
  );

  // Keep track of which facets are open and closed; closed by default.
  const [openedFacets, setOpenedFacets] = useState<Record<string, boolean>>(
    () => {
      return facets.reduce(
        (acc, facet) => {
          acc[facet.field] = false;
          return acc;
        },
        {} as Record<string, boolean>
      );
    }
  );

  // States to track the current facet order and the edited facet order which only gets used while
  // the user edits the facet order so that they can cancel editing, returning to the previous
  // order.
  const [orderedFacetFields, setOrderedFacetFields] = useState<string[]>(() =>
    allFacets.map((facet) => facet.field)
  );
  const [editedOrderedFacetFields, setEditedOrderedFacetFields] = useState<
    string[]
  >([]);

  useEffect(() => {
    // After the page loads, if the user has logged in and they have selected a single search type
    // (e.g. "type=MeasurementSet"), attempt to load the saved set of open and closed facets as
    // well as the facet order from the NextJS server redis cache. Use a semaphore to prevent state
    // changes if the component unmounts before the async calls complete.
    let isMounted = true;
    if (userUuid && selectedType) {
      Promise.all([
        getFacetConfig(userUuid, selectedType, request),
        getFacetOrder(userUuid, selectedType, request),
      ]).then(([savedOpenFacets, savedOrder]) => {
        // Prevent state updates if the component has unmounted.
        if (isMounted) {
          if (savedOpenFacets) {
            // Validate that savedOpenFacets is actually an object (not an array)
            if (
              !Array.isArray(savedOpenFacets) &&
              typeof savedOpenFacets === "object"
            ) {
              setOpenedFacets(savedOpenFacets);
            }
          }
          if (savedOrder && savedOrder.length > 0) {
            // If allFacets contains fields that aren't in savedOrder, add those missing fields to
            // the end.
            const missingFields = allFacets
              .filter((facet) => !savedOrder.includes(facet.field))
              .map((facet) => facet.field);
            setOrderedFacetFields([...savedOrder, ...missingFields]);
          }
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedType, userUuid]);

  // Save the current state of the opened facets to the NextJS server redis cache.
  async function saveOpen(facetsToSave: Record<string, boolean>) {
    if (userUuid && selectedType) {
      const response = await setFacetConfig(
        userUuid,
        selectedType,
        facetsToSave,
        request
      );
      if (isDatabaseObject(response) && response["@type"].includes("Error")) {
        console.error("Failed to save facet configuration:", response);
      }
    }
  }

  // Save the current edited facet order to the NextJS server redis cache.
  async function saveOrder(orderedFacetFields: string[]) {
    if (userUuid && selectedType) {
      const response = await setFacetOrder(
        userUuid,
        selectedType,
        orderedFacetFields,
        request
      );
      if (isDatabaseObject(response) && response["@type"].includes("Error")) {
        console.error("Failed to save facet order:", response);
      }
    }
  }

  // Called when the user clicks on a facet title with the facet ID `field` to open or close it.
  function onFacetOpen(e: MouseEvent, field: string) {
    if (!isEditOrderMode) {
      setOpenedFacets((prev) => {
        const updatedOpenedFacets = updateOpenFacets(e, field, facets, prev);
        saveOpen(updatedOpenedFacets);
        return updatedOpenedFacets;
      });
    }
  }

  // Called when the user wants to open or close all facets at once.
  function onAllFacets(openAll: boolean) {
    const updatedFacets = setAllFacetOpenState(facets, openAll);
    setOpenedFacets(updatedFacets);
    saveOpen(updatedFacets);
  }

  // Called by the `Reorder` component when the user drags facets to reorder them.
  function onReorder(newOrder: SearchResultsFacet[]) {
    setEditedOrderedFacetFields(newOrder.map((facet) => facet.field));
  }

  // Called when the user enters, saves, cancels edit mode for facet ordering, or resets the order.
  function onEditModeChange(editMode: EditModeChange) {
    if (editMode === "ENTER") {
      setIsEditOrderMode(true);
      setEditedOrderedFacetFields(orderedFacetFields);
    } else if (editMode === "SAVE") {
      setIsEditOrderMode(false);
      setOrderedFacetFields(editedOrderedFacetFields);
      saveOrder(editedOrderedFacetFields);
      setEditedOrderedFacetFields([]);
    } else if (editMode === "CANCEL") {
      // Cancel edit mode; discard changes.
      setIsEditOrderMode(false);
      setEditedOrderedFacetFields([]);
    } else if (editMode === "RESET") {
      const defaultOrder = facets.map((facet) => facet.field);
      setEditedOrderedFacetFields(defaultOrder);
    }
  }

  // Determine if we should show facets at all. This is the case when no facet groups exist, and
  // the search results have no displayable facets.
  if (facets.length > 0) {
    // Use the current or edited facet order to generate the ordered list of facet objects using
    // the facet map for O(1) lookup.
    const orderedFacets = orderedFacetFields
      .filter((field) => facetFields.includes(field))
      .map((field) => facetMap.get(field))
      .filter((facet) => facet !== undefined);
    const editedOrderedFacets = getVisibleFacets(
      editedOrderedFacetFields.map((field) => facetMap.get(field)),
      isAuthenticated
    );

    return (
      <DataPanel
        className="mb-4 lg:mb-0 lg:w-72 lg:shrink-0 lg:grow-0 lg:overflow-y-auto"
        isPaddingSuppressed
      >
        <div className="p-4">
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              {!isEditOrderMode && (
                <>
                  <ClearAll searchResults={searchResults} />
                  <AllFacetsControls
                    onAllFacets={onAllFacets}
                    onEditModeChange={onEditModeChange}
                    showEditOrder={isAuthenticated && selectedType !== ""}
                  />
                </>
              )}
            </div>
          </div>
          <EditOrderButton
            isEditOrderMode={isEditOrderMode}
            onEditModeChange={onEditModeChange}
          />
          <HelpTip className="mt-4">
            {!isEditOrderMode ? (
              <span>
                Click and hold a term momentarily to select items <i>without</i>{" "}
                that term.
              </span>
            ) : (
              <span>
                Drag and drop filters to change their order. Click <b>Done</b>{" "}
                when finished, or <b>Cancel</b> to revert your latest changes.
                Click <b>Reset</b> to restore the default filter order.
              </span>
            )}
          </HelpTip>
        </div>
        <FacetList
          searchResults={searchResults}
          facets={isEditOrderMode ? editedOrderedFacets : orderedFacets}
          openedFacets={openedFacets}
          onFacetOpen={onFacetOpen}
          onReorder={onReorder}
          isEditOrderMode={isEditOrderMode}
        />
      </DataPanel>
    );
  }

  // No displayable facets.
  return null;
}
