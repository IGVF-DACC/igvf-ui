// node_modules
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import { ReactNode, useEffect, useRef } from "react";
// components
import { useSessionStorage } from "./browser-storage";

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
 *     when its page gets rendered on page load. This lets us know all the panels on a page so that
 *     the user can expand all of them at once if they want.
 */
export type PagePanelStates = {
  expandedPanels: ExpandedPanelStates;
  setExpanded: (panelId: string, expanded: boolean) => void;
  setAllExpanded: (expanded: boolean) => void;
  isExpanded: (panelId: string) => boolean;
  registerExpanded: (panelId: string) => void;
};

/**
 * Custom hook to handle the expanded/collapsed states of panels on a page. Call this just once on
 * a page that has collapsible panels. This hook will manage the expanded/collapsed states of all
 * panels on the page. Use session storage to store the states of all collapsible panels on each
 * page the user visits.
 * @param {string} pageId Unique ID of the page, often the `@id` of object the page renders
 */
export function usePagePanels(pageId: string) {
  // Collects all the panel IDs on the page when it first gets rendered so that the expanded panel
  // states exist for every collapsible panel on the page.
  const pagePanelIds = useRef<string[]>([]);

  // Get the stored panel states from session storage for the currently viewed page.
  const [storedPanelStates, setStoredPanelStates] = useSessionStorage(
    `page-panel-expanded-${pageId}`,
    JSON.stringify({})
  );
  const expandedPanelStates: ExpandedPanelStates =
    JSON.parse(storedPanelStates);

  function setExpanded(panelId: string, expanded: boolean) {
    const newPagePanelStates = {
      ...expandedPanelStates,
      [panelId]: expanded,
    };
    setStoredPanelStates(JSON.stringify(newPagePanelStates));
  }

  function setAllExpanded(expanded: boolean) {
    const newPagePanelStates = { ...expandedPanelStates };
    pagePanelIds.current.forEach((panelId) => {
      newPagePanelStates[panelId] = expanded;
    });
    setStoredPanelStates(JSON.stringify(newPagePanelStates));
  }

  function isExpanded(panelId: string) {
    return expandedPanelStates[panelId] || false;
  }

  // `PagePanelButton` calls this function to register a panel when its page gets rendered on page
  // load. The component that renders the panel only has to call the `PagePanelButton` component
  // for this registration to happen, instead of calling this function directly.
  function registerExpanded(panelId: string) {
    if (!pagePanelIds.current.includes(panelId)) {
      pagePanelIds.current.push(panelId);
    }
  }

  useEffect(() => {
    if (Object.keys(expandedPanelStates).length !== 0) {
      // For each page panel ID that doesn't already have a state, set it to collapsed. Then save
      // the new state to session storage.
      const newPagePanelStates = { ...expandedPanelStates };
      pagePanelIds.current.forEach((panelId) => {
        if (!newPagePanelStates[panelId]) {
          newPagePanelStates[panelId] = false;
        }
      });
      setStoredPanelStates(JSON.stringify(newPagePanelStates));
    }
  }, [storedPanelStates]);

  return {
    expandedPanels: expandedPanelStates,
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
 * @param {ReactNode} children The title of the panel
 */
export function PagePanelButton({
  pagePanels,
  pagePanelId,
  label,
  children,
}: {
  pagePanels: PagePanelStates;
  pagePanelId: string;
  label: string;
  children?: ReactNode;
}) {
  const isExpanded = pagePanels.isExpanded(pagePanelId);

  // Register the panel when the page gets rendered on page load so that the expanded panel states
  // exist for every collapsible panel on the page.
  pagePanels.registerExpanded(pagePanelId);

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
