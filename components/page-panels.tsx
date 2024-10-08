// node_modules
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import { ReactNode, useEffect, useRef, useState } from "react";

/**
 * Tracks the expanded/collapsed state of a panel on a page, with the panel ID as the key and its
 * expanded state as the value. The panel ID has to be unique among all panels on a page. This
 * object gets stored in session storage under a key unique to the page.
 */
type ExpandedPanelStates = Record<string, boolean>;

/**
 * Tracks the expanded/collapsed states of all panels on a page, as well as functions to set and get
 * the expanded state of a panel, and to register a panel when its page gets rendered on page load.
 * @property {string} pageId Unique ID of the page, often the `@id` of the page
 * @property {ExpandedPanelStates} expandedPanels Expanded/collapsed states of all panels on a page
 * @property {(panelId: string, expanded: boolean) => void} setExpanded Function to set the
 *     expanded state of a panel
 * @property {(panelId: string) => boolean} isExpanded Function to get the expanded state of a
 *     panel
 * @property {(panelId: string) => void} registerExpanded Function to register a panel by its ID
 *     when its page gets rendered on page load. This lets us know all the panels on a page without
 *     setting a React state during render. This also lets the user expand all of them at once if
 *     they want.
 */
type PagePanelStates = {
  expandedPanels: ExpandedPanelStates;
  setExpanded: (panelId: string, expanded: boolean) => void;
  setAllExpanded: (expanded: boolean) => void;
  isExpanded: (panelId: string) => boolean;
  registerExpanded: (panelId: string, isExpanded: boolean) => void;
};

/**
 * Custom hook to handle the expanded/collapsed states of panels on a page. Call this just once on
 * a page that has collapsible panels. This hook will manage the expanded/collapsed states of all
 * panels on the page.
 * @returns {PagePanelStates} Object with the expanded/collapsed states of all panels on the page,
 *    as well as functions to set and get the expanded state of a panel, and to register a panel
 *    when its page gets rendered on page load.
 */
export function usePagePanels() {
  // Collects all the panel IDs on the page when it first gets rendered so that the expanded panel
  // states exist for every collapsible panel on the page.
  const pagePanelIds = useRef<ExpandedPanelStates>({});

  // Get the stored panel states from session storage for the currently viewed page.
  const [panelStates, setPanelStates] = useState<ExpandedPanelStates>({});

  function setExpanded(panelId: string, expanded: boolean) {
    const newPagePanelStates: ExpandedPanelStates = {
      ...panelStates,
      [panelId]: expanded,
    };
    setPanelStates(newPagePanelStates);
  }

  function setAllExpanded(expanded: boolean) {
    const newPagePanelStates = { ...panelStates };
    Object.keys(panelStates).forEach((panelId) => {
      newPagePanelStates[panelId] = expanded;
    });
    setPanelStates(newPagePanelStates);
  }

  function isExpanded(panelId: string) {
    return panelStates[panelId] || false;
  }

  function registerExpanded(panelId: string, isExpanded = false) {
    // Check if the panel is already registered. If not, add it to the list of
    // panel IDs for this page.
    if (!pagePanelIds.current[panelId]) {
      pagePanelIds.current[panelId] = isExpanded;
    }
  }

  useEffect(() => {
    // Set the expanded panels states based on `pagePanelIds` when the page first gets rendered.
    const newPagePanelStates = { ...panelStates };
    Object.entries(pagePanelIds.current).forEach(([panelId, isExpanded]) => {
      if (!newPagePanelStates[panelId]) {
        newPagePanelStates[panelId] = isExpanded;
      }
    });
    pagePanelIds.current = {};
    setPanelStates(newPagePanelStates);
  }, []);

  return {
    expandedPanels: panelStates,
    setExpanded,
    setAllExpanded,
    isExpanded,
    registerExpanded,
  } as PagePanelStates;
}

/**
 * Button to expand/collapse a page panel. Use the title of the panel as the child of this
 * component.
 * @param {PagePanelStates} pagePanels The page panels controller
 * @param {string} pagePanelId The ID of the panel unique on the page
 * @param {string} label The accessible label for the button used by screen readers
 * @param {boolean} [isDefaultExpanded] Whether the panel is expanded by default
 * @param {ReactNode} children The title of the panel
 */
export function PagePanelButton({
  pagePanels,
  pagePanelId,
  label,
  isDefaultExpanded = false,
  children,
}: {
  pagePanels: PagePanelStates;
  pagePanelId: string;
  label: string;
  isDefaultExpanded?: boolean;
  children?: ReactNode;
}) {
  const isExpanded = pagePanels.isExpanded(pagePanelId);

  // Register the panel when the page gets rendered on page load so that the expanded panel states
  // exist for every collapsible panel on the page.
  pagePanels.registerExpanded(pagePanelId, isDefaultExpanded);

  // Handle a click in the button to expand/collapse the panel. If the user was holding down the
  // control or alt key, expand/collapse all panels on the page.
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (event.ctrlKey || event.altKey) {
      pagePanels.setAllExpanded(!isExpanded);
    } else {
      pagePanels.setExpanded(pagePanelId, !isExpanded);
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-expanded={pagePanels.expandedPanels[pagePanelId]}
      aria-controls={pagePanelId}
      aria-label={label}
      className="flex items-center gap-1"
    >
      {isExpanded ? (
        <MinusIcon className="h-6 w-6" />
      ) : (
        <PlusIcon className="h-6 w-6" />
      )}
      {children}
    </button>
  );
}
