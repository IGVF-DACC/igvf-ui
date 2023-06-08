// node_modules
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
// components
import SearchModal from "./search-modal";
// lib
import { UC } from "../lib/constants";
import { encodeUriElement } from "../lib/query-encoding";

/**
 * Displays the search trigger for when the navigation is expanded.
 */
function SearchTriggerExpanded({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-full grow items-center gap-2 rounded border border-panel bg-form-element p-2 text-form-element"
      label="Search the site for a word or phrase"
    >
      <MagnifyingGlassIcon className="h-4 w-4" />
      <div className="text-sm text-gray-400">{`Search (${UC.cmd}K or ${UC.ctrl}K)`}</div>
    </button>
  );
}

SearchTriggerExpanded.propTypes = {
  // Function to call when the user clicks the search trigger
  onClick: PropTypes.func.isRequired,
};

/**
 * Displays the search trigger for when the navigation is collapsed.
 */
function SearchTriggerCollapsed({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="block"
      label="Search the site for a word or phrase"
    >
      <MagnifyingGlassIcon className="h-8 w-8 fill-black dark:fill-white" />
    </button>
  );
}

SearchTriggerCollapsed.propTypes = {
  // Function to call when the user clicks the search trigger
  onClick: PropTypes.func.isRequired,
};

/**
 * Displays the site-search modal as an overlay on whatever page the user viewed when they
 * triggered this box. This also displays the trigger for the box, which appears like a text edit
 * field though it's actually a button.
 */
export default function SiteSearchTrigger({ isExpanded }) {
  // True if the search input modal is open
  const [isInputOpen, setIsInputOpen] = useState(false);
  const router = useRouter();

  // Called to close the search input modal and clear its value for next time.
  function closeModal() {
    setIsInputOpen(false);
  }

  // Navigates to the site-search page with the current search term to show the results. The search
  // term gets saved to sessionStorage.
  function closeModalAndExecuteSearch(searchTerm) {
    closeModal();
    if (searchTerm) {
      router.push(`/site-search?term=${encodeUriElement(searchTerm)}`);
    }
  }

  // Set up the command-key equivalent for triggering the search modal regardless of the current
  // page.
  useEffect(() => {
    function onSearchKeypress(event) {
      if (
        (event.key === "k" || event.key === "K") &&
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey
      ) {
        event.preventDefault();
        event.stopPropagation();
        setIsInputOpen(true);
        return false;
      }
      return true;
    }

    document.addEventListener("keydown", onSearchKeypress);
    return () => {
      document.removeEventListener("keydown", onSearchKeypress);
    };
  });

  return (
    <>
      {isExpanded ? (
        <SearchTriggerExpanded onClick={() => setIsInputOpen(true)} />
      ) : (
        <SearchTriggerCollapsed onClick={() => setIsInputOpen(true)} />
      )}
      <SearchModal
        isInputOpen={isInputOpen}
        closeModal={closeModal}
        closeModalAndExecuteSearch={closeModalAndExecuteSearch}
        icon={
          <MagnifyingGlassIcon className="h-6 w-6 fill-black dark:fill-white" />
        }
        searchBoxPlaceholder="Search"
        recentSearchId="recent-site-search"
        recentSearchLabel="Recent Searches"
      />
    </>
  );
}

SiteSearchTrigger.propTypes = {
  // True if the navigation area is expanded
  isExpanded: PropTypes.bool,
};
