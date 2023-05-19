// node_modules
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { Dialog } from "@headlessui/react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
// components
import { useSessionStorage } from "./browser-storage";
// lib
import { KC, UC } from "../lib/constants";
import { encodeUriElement } from "../lib/query-encoding";

// Maximum number of recent terms to keep track of.
const MAX_RECENT_TERMS = 5;

/**
 * Hook to process the array of recently searched terms stored in sessionStorage. The most recent
 * term gets stored first in the array.
 */
function useRecentSearches() {
  const [recentTermsJson, setRecentTermsJson] = useSessionStorage(
    "recent-site-search",
    JSON.stringify([])
  );
  const recentTerms = JSON.parse(recentTermsJson);

  function saveRecentTerm(recentTerm) {
    // If the new search term is already in the list, remove it so we can then move it to the
    // front of the list.
    const updatedRecentTerms = recentTerms.includes(recentTerm)
      ? recentTerms.filter((term) => term !== recentTerm)
      : recentTerms;

    // Add the new term to the front of the list, and limit the length of the list -- older items
    // fall off the bottom of the list.
    updatedRecentTerms.unshift(recentTerm);
    const limitedRecentTerms = JSON.stringify(
      updatedRecentTerms.slice(0, MAX_RECENT_TERMS)
    );

    // Save the new array of recent terms to sessionStorage.
    setRecentTermsJson(limitedRecentTerms);
  }

  return {
    // Array of recent terms, most recent first
    recentTerms,
    // Called to add a new term to the list of recent terms
    saveRecentTerm,
  };
}

/**
 * Displays the search trigger for when the navigation is expanded.
 */
function SearchTriggerExpanded({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-full items-center gap-2 rounded border border-panel bg-form-element p-2 text-form-element"
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
      <MagnifyingGlassIcon className="h-8 w-8" />
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
  // Holds the currently typed search term
  const [searchTerm, setSearchTerm] = useState("");
  // Recently searched terms from sessionStorage
  const { recentTerms, saveRecentTerm } = useRecentSearches();

  const inputRef = useRef(null);
  const router = useRouter();

  // Called to change the search text input value.
  function onChange(event) {
    setSearchTerm(event.target.value);
  }

  // Called to close the search input modal and clear its value for next time.
  function closeModal() {
    setSearchTerm("");
    setIsInputOpen(false);
  }

  // Navigates to the site-search page with the current search term to show the results. The search
  // term gets saved to sessionStorage.
  function closeModalAndExecuteSearch() {
    closeModal();
    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm) {
      saveRecentTerm(trimmedTerm);
      router.push(`/site-search?term=${encodeUriElement(trimmedTerm)}`);
    }
  }

  // Called when the user types a key while the search input is open, allowing ESC to close the
  // modal, or RETURN to close the modal and trigger the search.
  function onKeyDown(event) {
    if (event.keyCode === KC.ESC) {
      // ESC just closes the modal and forgets what the user typed.
      event.preventDefault();
      closeModal();
    } else if (event.keyCode === KC.RETURN) {
      // RETURN closes the modal and performs the search.
      event.preventDefault();
      closeModalAndExecuteSearch();
    }
  }

  // Called when the user clicks on a recent search term. This overwrites any text in the search
  // input with the clicked term, and focuses the input so the user can continue typing.
  function onRecentSearch(recentTerm) {
    setSearchTerm(recentTerm);
    inputRef.current.focus();
  }

  // Set up the command-key equivalent for triggering the search modal regardless of the current
  // page.
  useEffect(() => {
    function onSearchKeypress(event) {
      if (
        (event.key === "k" || event.key === "K") &&
        (event.metaKey || event.ctrlKey)
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

  // Once the search input modal opens, focus the input field so the user can start typing.
  useEffect(() => {
    if (isInputOpen) {
      inputRef.current.focus();
    }
  }, [isInputOpen]);

  return (
    <>
      {isExpanded ? (
        <SearchTriggerExpanded onClick={() => setIsInputOpen(true)} />
      ) : (
        <SearchTriggerCollapsed onClick={() => setIsInputOpen(true)} />
      )}

      <Dialog open={isInputOpen} onClose={closeModal} className="relative z-50">
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/60"
          aria-hidden="true"
        />
        <div className="fixed inset-0 overflow-y-auto">
          <Dialog.Panel className="mx-auto w-4/5 max-w-4xl overflow-hidden rounded-lg border border-modal-border bg-white drop-shadow-lg dark:bg-gray-900 xl:my-20">
            <div className="flex items-center gap-2 px-2 py-1">
              <button
                onClick={closeModalAndExecuteSearch}
                aria-label={`Search for ${searchTerm}`}
              >
                <MagnifyingGlassIcon className="h-6 w-6 fill-black dark:fill-white" />
              </button>
              <input
                type="text"
                ref={inputRef}
                placeholder="Search"
                value={searchTerm}
                onChange={onChange}
                onKeyDown={onKeyDown}
                className="block w-full border-none bg-transparent py-3 text-black outline-none dark:text-white"
              />
              <button
                onClick={closeModal}
                aria-label="Close search box without searching"
              >
                <XCircleIcon className="h-6 w-6 fill-gray-500" />
              </button>
            </div>

            {recentTerms.length > 0 && (
              <>
                <div className="border-t border-panel px-4 py-2 text-base font-semibold text-gray-500 dark:text-gray-300">
                  Recent Searches
                </div>
                {recentTerms.map((recentTerm) => {
                  return (
                    <button
                      className="block w-full border-t border-gray-100 px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                      key={recentTerm}
                      onClick={() => onRecentSearch(recentTerm)}
                      aria-label={`Enter the recent search, ${recentTerm}, into the search box`}
                    >
                      {recentTerm}
                    </button>
                  );
                })}
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}

SiteSearchTrigger.propTypes = {
  // True if the navigation area is expanded
  isExpanded: PropTypes.bool,
};
