// node_modules
import { XCircleIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { TextField } from "./form-elements";
import { SEARCH_MODE_TITLE } from "../lib/profiles";

/**
 * Displays a search field for highlighting elements of a schema or list of schemas.
 */
export function SchemaSearchField({
  searchTerm,
  setSearchTerm,
  searchMode,
  className = "",
}) {
  return (
    <div className={`relative grow ${className}`}>
      <TextField
        name="schema-search"
        value={searchTerm}
        type="search"
        onChange={(e) => setSearchTerm(e.target.value)}
        className="[&>input]:pr-7"
        isSpellCheckDisabled
        isMessageAllowed={false}
      />
      <button
        onClick={() => setSearchTerm("")}
        className="absolute right-0 top-0 flex h-full w-8 cursor-pointer items-center justify-center"
        aria-label={
          searchMode === SEARCH_MODE_TITLE
            ? "Clear schema title search"
            : "Clear schema property search"
        }
      >
        <XCircleIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

SchemaSearchField.propTypes = {
  // The current search term
  searchTerm: PropTypes.string.isRequired,
  // Function to update the search term
  setSearchTerm: PropTypes.func.isRequired,
  // The current search mode
  searchMode: PropTypes.string.isRequired,
  // Additional Tailwind CSS classes to apply to the wrapper div
  className: PropTypes.string,
};
