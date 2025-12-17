// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import {
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { useContext, useEffect, useState, type MouseEvent } from "react";
// components/facets
import { FacetList } from "./facet-list";
import { OptionalFacetsConfigModal } from "./optional-facets-config";
// components
import { DataPanel } from "../../components/data-area";
import { Button } from "../../components/form-elements";
import HelpTip from "../../components/help-tip";
import Icon from "../../components/icon";
import SessionContext from "../session-context";
import { Tooltip, TooltipRef, useTooltip } from "../../components/tooltip";
// lib
import {
  checkOptionalFacetsConfigurable,
  getFacetConfig,
  getFacetOrder,
  getOptionalFacetsConfigForType,
  getVisibleFacets,
  setFacetConfig,
  saveOptionalFacetsConfigForType,
  setFacetOrder,
  type OptionalFacetsConfigForType,
} from "../../lib/facets";
import FetchRequest from "../../lib/fetch-request";
import { isDatabaseObject } from "../../lib/general";
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
    void router.push(searchResults.clear_filters, "", { scroll: false });
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
        Expand all filters, or hold down the Alt key and expand one filter to
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
        Collapse all filters, or hold down the Alt key and collapse one filter
        to collapse all
      </Tooltip>
    </div>
  );
}

/**
 * Display controls for configuring optional facets and editing facet order.
 *
 * @param allFacets - All facets that would be displayed with no selected facet terms
 * @param onEditModeChange - Function called when the user clicks to change edit mode
 * @param showEditOrder - True to show the edit order button
 * @param optionalFacetsConfigForType - Current state of the optional facets configuration for the
 *   selected type
 * @param onOptionalFacetsConfigSave - Function called when the user saves the optional facets
 *   configuration from the modal
 * @param showOptionalFacetsControl - True to show the optional facets configuration button
 */
function ConfigFacetsControl({
  allFacets,
  onEditModeChange,
  showEditOrder,
  optionalFacetsConfigForType,
  onOptionalFacetsConfigSave,
  showOptionalFacetsControl,
}: {
  allFacets: SearchResultsFacet[];
  onEditModeChange: (editMode: EditModeChange) => void;
  showEditOrder: boolean;
  optionalFacetsConfigForType: OptionalFacetsConfigForType;
  onOptionalFacetsConfigSave: (
    visibleOptionalFacets: OptionalFacetsConfigForType
  ) => void;
  showOptionalFacetsControl: boolean;
}) {
  const editOrderTooltipAttr = useTooltip("edit-order");
  const optionalFacetsTooltipAttr = useTooltip("optional-facets");

  // Tracks whether the optional facets configuration modal is open.
  const [isOptionalFacetsConfigOpen, setIsOptionalFacetsConfigOpen] =
    useState(false);

  // Called when the user saves the optional facets configuration from the modal.
  function onSaveOptionalFacetsConfigForType(
    newConfig: OptionalFacetsConfigForType
  ) {
    onOptionalFacetsConfigSave(newConfig);
    setIsOptionalFacetsConfigOpen(false);
  }

  return (
    <div className="flex gap-1">
      {showEditOrder && (
        <div className="grow">
          <TooltipRef tooltipAttr={editOrderTooltipAttr} className="block">
            <Button
              label="Edit facet order"
              onClick={() => onEditModeChange("ENTER")}
              type="secondary"
              size="sm"
              className="flex w-full gap-1"
              id="edit-order-button"
            >
              <ArrowsUpDownIcon className="h-4 w-4" />
              Filter Order
            </Button>
          </TooltipRef>
          <Tooltip tooltipAttr={editOrderTooltipAttr}>
            Enter a mode to change the order of the filters. While in this mode
            you can drag and drop the filters to any order convenient for you.
          </Tooltip>
        </div>
      )}
      {showOptionalFacetsControl && (
        <div className="grow">
          <TooltipRef tooltipAttr={optionalFacetsTooltipAttr} className="block">
            <Button
              label="Configure optional filters"
              onClick={() => setIsOptionalFacetsConfigOpen(true)}
              type="secondary"
              size="sm"
              className="flex w-full gap-1"
              id="optional-facets-button"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              Optional Filters
            </Button>
          </TooltipRef>
          <Tooltip tooltipAttr={optionalFacetsTooltipAttr}>
            Choose which optional filters to display. Optional filters do not
            appear by default but you can show specific ones here.
          </Tooltip>
        </div>
      )}
      {isOptionalFacetsConfigOpen && (
        <OptionalFacetsConfigModal
          visibleOptionalFacets={optionalFacetsConfigForType}
          allFacets={allFacets}
          onSave={onSaveOptionalFacetsConfigForType}
          onClose={() => setIsOptionalFacetsConfigOpen(false)}
        />
      )}
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
 * @param types - All `type=` from the search query
 * @param allFacets - All facets that would be displayed with no selected facet terms
 */
export default function FacetSection({
  searchResults,
  types,
  allFacets,
}: {
  searchResults: SearchResults;
  types: string[];
  allFacets: SearchResultsFacet[];
}) {
  const { isAuthenticated } = useAuth0();
  const { sessionProperties } = useContext(SessionContext);
  const userUuid = sessionProperties?.user?.uuid || "";
  const request = new FetchRequest({ backend: true });
  const selectedType = types.length === 1 ? types[0] : "";
  const [isEditOrderMode, setIsEditOrderMode] = useState(false);

  // Current state of the optional facets configuration for the selected type.
  const [optionalFacetsConfigForType, setOptionalFacetsConfigForType] =
    useState<OptionalFacetsConfigForType>([]);

  // Get all the facet objects from the search results that are visible to the current user.
  // Generate a map from facet field to facet object for O(1) lookup when converting the field
  // arrays to facet objects.
  const facets = getVisibleFacets(
    searchResults.facets,
    optionalFacetsConfigForType,
    selectedType,
    isAuthenticated
  );
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
    let isMounted = true;

    // Only load optional facets configuration if a single type is selected
    if (selectedType) {
      void getOptionalFacetsConfigForType(
        selectedType,
        request,
        isAuthenticated
      ).then((config) => {
        if (isMounted) {
          setOptionalFacetsConfigForType(config);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, selectedType]);

  useEffect(() => {
    // After the page loads, if the user has logged in and they have selected a single search type
    // (e.g. "type=MeasurementSet"), attempt to load the saved set of open and closed facets as
    // well as the facet order from the NextJS server redis cache. Use a semaphore to prevent state
    // changes if the component unmounts before the async calls complete.
    let isMounted = true;
    if (userUuid && selectedType) {
      void Promise.all([
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

            // If savedOrder has fields that aren't in allFacets (usually because facets were
            // removed from the search config), ignore those fields
            const filteredSavedOrder = savedOrder.filter((field) =>
              allFacets.some((facet) => facet.field === field)
            );

            // Update the ordered facet fields state for editing and ordered facet display.
            setOrderedFacetFields([...filteredSavedOrder, ...missingFields]);
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
        void saveOpen(updatedOpenedFacets);
        return updatedOpenedFacets;
      });
    }
  }

  // Called when the user wants to open or close all facets at once.
  function onAllFacets(openAll: boolean) {
    const updatedFacets = setAllFacetOpenState(facets, openAll);
    setOpenedFacets(updatedFacets);
    void saveOpen(updatedFacets);
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
      void saveOrder(editedOrderedFacetFields);
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

  // Called when the user saves the optional facets configuration from the modal. Takes an array of
  // optional facet property names to be visible for the currently selected search `@type`.
  function onOptionalFacetsConfigSave(
    visibleOptionalFacets: OptionalFacetsConfigForType
  ) {
    setOptionalFacetsConfigForType(visibleOptionalFacets);
    void saveOptionalFacetsConfigForType(
      selectedType,
      visibleOptionalFacets,
      request,
      isAuthenticated
    );
  }

  // Called when the user wants to hide a specific optional facet via the quick-hide button. It
  // takes the property name for the facet to hide.
  function onOptionalFacetQuickHideChange(propertyToHide: string) {
    const newConfig = optionalFacetsConfigForType.filter(
      (property) => property !== propertyToHide
    );
    setOptionalFacetsConfigForType(newConfig);
    void saveOptionalFacetsConfigForType(
      selectedType,
      newConfig,
      request,
      isAuthenticated
    );
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
      optionalFacetsConfigForType,
      selectedType,
      isAuthenticated
    );

    return (
      <DataPanel
        className="mb-4 lg:mb-0 lg:w-74 lg:shrink-0 lg:grow-0 lg:overflow-y-auto"
        isPaddingSuppressed
      >
        <div className="p-4">
          <div className="flex flex-col gap-1">
            {!isEditOrderMode && (
              <>
                <div className="flex gap-1">
                  <ClearAll searchResults={searchResults} />
                  <AllFacetsControls onAllFacets={onAllFacets} />
                </div>
                <ConfigFacetsControl
                  allFacets={allFacets}
                  onEditModeChange={onEditModeChange}
                  showEditOrder={isAuthenticated && selectedType !== ""}
                  optionalFacetsConfigForType={optionalFacetsConfigForType}
                  onOptionalFacetsConfigSave={onOptionalFacetsConfigSave}
                  showOptionalFacetsControl={checkOptionalFacetsConfigurable(
                    selectedType
                  )}
                />
              </>
            )}
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
          optionalFacetsConfigForType={optionalFacetsConfigForType}
          onOptionalFacetQuickHideChange={onOptionalFacetQuickHideChange}
        />
      </DataPanel>
    );
  }

  // No displayable facets.
  return null;
}
