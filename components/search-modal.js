// node_modules
import { Dialog } from "@headlessui/react";
import { XCircleIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
// components
import { useSessionStorage } from "./browser-storage";
// lib
import { KC } from "../lib/constants";

// Maximum number of recent terms to keep track of.
const MAX_RECENT_TERMS = 5;

/**
 * Hook to process the array of recently searched terms stored in sessionStorage. The most recent
 * term gets stored first in the array. Initialize the hook with a unique ID to identify the
 * recent searches in sessionStorage.
 * @param {string} recentSearchId Unique ID for this list of recent searches
 * @returns {object} Properties to get the list of recent terms and to add a new term to the list
 */
function useRecentSearches(recentSearchId) {
  const [recentTermsJson, setRecentTermsJson] = useSessionStorage(
    recentSearchId,
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

export default function SearchModal({
  isInputOpen,
  closeModal,
  closeModalAndExecuteSearch,
  icon,
  searchBoxPlaceholder,
  recentSearchId,
  recentSearchLabel,
}) {
  // Holds the currently typed search term
  const [searchTerm, setSearchTerm] = useState("");
  // Recently searched terms from sessionStorage
  const { recentTerms, saveRecentTerm } = useRecentSearches(recentSearchId);
  const inputRef = useRef(null);

  // Once the search input modal opens, focus the input field so the user can start typing.
  useEffect(() => {
    if (isInputOpen) {
      setSearchTerm("");
      inputRef.current.focus();
    }
  }, [isInputOpen]);

  // Called to change the search text input value.
  function onChange(event) {
    setSearchTerm(event.target.value);
  }

  // Called when the user clicks the search button or presses RETURN while the search input is
  // open. This saves the search term to sessionStorage, closes the modal, and triggers the
  // search.
  function executeSearch() {
    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm) {
      saveRecentTerm(trimmedTerm);
      closeModalAndExecuteSearch(trimmedTerm);
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
      executeSearch();
    }
  }

  // Called when the user clicks on a recent search term. This overwrites any text in the search
  // input with the clicked term, and focuses the input so the user can continue typing.
  function onRecentSearch(recentTerm) {
    setSearchTerm(recentTerm);
    inputRef.current.focus();
  }

  return (
    <Dialog open={isInputOpen} onClose={closeModal} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/60"
        aria-hidden="true"
      />
      <div className="fixed inset-0 overflow-y-auto">
        <Dialog.Panel className="mx-auto w-4/5 max-w-4xl overflow-hidden rounded-lg border border-modal-border bg-white drop-shadow-lg dark:bg-gray-900 xl:my-20">
          <div className="flex items-center gap-2 px-2 py-1">
            <button
              onClick={executeSearch}
              aria-label={`Search for ${searchTerm}`}
            >
              {icon}
            </button>
            <input
              type="text"
              data-testid="search-input"
              ref={inputRef}
              placeholder={searchBoxPlaceholder}
              spellCheck="false"
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
                {recentSearchLabel}
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
  );
}

SearchModal.propTypes = {
  // True if the search modal should appear
  isInputOpen: PropTypes.bool.isRequired,
  // Function to call when the user clicks the close button of the modal
  closeModal: PropTypes.func.isRequired,
  // Function to call when the user clicks the execute-search button of the modal
  closeModalAndExecuteSearch: PropTypes.func.isRequired,
  // Icon component to use for the search button
  icon: PropTypes.element.isRequired,
  // Placeholder text to display in the search input
  searchBoxPlaceholder: PropTypes.string.isRequired,
  // Unique ID for this search modal, used to identify recent searches in sessionStorage
  recentSearchId: PropTypes.string.isRequired,
  // Label for the list of recent searches
  recentSearchLabel: PropTypes.string.isRequired,
};
