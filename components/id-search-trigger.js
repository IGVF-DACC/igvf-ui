// node_modules
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
// components
import SearchModal from "./search-modal";
// lib
import { UC } from "../lib/constants";
import { encodeUriElement } from "../lib/query-encoding";

/**
 * Display the ID search icon.
 */
function IdSearchIcon({ className = null }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid="icon-id-search"
    >
      <path
        className="fill-gray-500"
        d="M18.1,1C18.6,1,19,1.4,19,1.9v16.2c0,0.5-0.4,0.9-0.9,0.9H1.9C1.4,19,1,18.6,1,18.1V1.9C1,1.4,1.4,1,1.9,1
		H18.1 M18.1,0H1.9C0.9,0,0,0.9,0,1.9v16.2C0,19.1,0.9,20,1.9,20h16.2c1.1,0,1.9-0.9,1.9-1.9V1.9C20,0.9,19.1,0,18.1,0L18.1,0z"
      />
      <g className="fill-[#85abd6]">
        <path
          d="M12.1,7.8c-0.3-0.2-0.7-0.3-1.2-0.3H9.8v5h1.1c0.5,0,0.9-0.1,1.2-0.3s0.6-0.5,0.7-0.9
			c0.2-0.4,0.3-0.8,0.3-1.4v0c0-0.5-0.1-1-0.3-1.4C12.7,8.2,12.4,8,12.1,7.8z"
        />
        <path
          d="M17.2,2.4H2.8c-0.2,0-0.4,0.2-0.4,0.4v14.3c0,0.2,0.2,0.4,0.4,0.4h14.3c0.2,0,0.4-0.2,0.4-0.4V2.8
			C17.6,2.6,17.4,2.4,17.2,2.4z M6.9,13.8H5.3V6.2h1.6V13.8z M14.7,10c0,0.8-0.1,1.5-0.4,2.1c-0.3,0.6-0.7,1-1.3,1.3
			c-0.5,0.3-1.2,0.5-2,0.5H8.1V6.2h2.9c0.8,0,1.4,0.1,2,0.4c0.5,0.3,1,0.7,1.3,1.3C14.6,8.5,14.7,9.1,14.7,10L14.7,10z"
        />
      </g>
    </svg>
  );
}

IdSearchIcon.propTypes = {
  // CSS class to apply to the SVG element
  className: PropTypes.string,
};

/**
 * Displays the ID search button, and display the ID search modal when the user clicks it.
 */
export default function IdSearchTrigger() {
  // True if the search input modal is open
  const [isInputOpen, setIsInputOpen] = useState(false);

  const router = useRouter();

  // Called when the user clicks the ID search trigger button.
  function onTriggerClick() {
    setIsInputOpen(true);
  }

  // Called to close the ID search modal.
  function closeModal() {
    setIsInputOpen(false);
  }

  // Called to close the ID search modal and execute the search by passing the entered ID to the
  // /id-search endpoint.
  function closeModalAndExecuteSearch(searchTerm) {
    closeModal();
    if (searchTerm) {
      router.push(`/id-search?id=${encodeUriElement(searchTerm)}`);
    }
  }

  // Set up the command-key equivalent for triggering the ID modal.
  useEffect(() => {
    function onSearchKeypress(event) {
      if ((event.key === "k" || event.key === "K") && event.shiftKey) {
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
      <button
        onClick={onTriggerClick}
        className="grow-0 rounded"
        title={`Go to an item${UC.rsquo}s page from its identifier (${UC.cmd}${UC.shift}K or ${UC.ctrl}${UC.shift}K)`}
      >
        <IdSearchIcon className="h-8 w-8 fill-gray-500" />
      </button>
      <SearchModal
        isInputOpen={isInputOpen}
        closeModal={closeModal}
        closeModalAndExecuteSearch={closeModalAndExecuteSearch}
        icon={<IdSearchIcon className="h-6 w-6" />}
        searchBoxPlaceholder="Enter the exact identifier of an item (e.g. accession, uuid, alias)"
        recentSearchId="recent-id-search"
        recentSearchLabel="Recent Identifiers"
      />
    </>
  );
}
