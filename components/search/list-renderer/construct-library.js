// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

/**
 * Generate a string describing the type of construct library based on its details properties.
 * @param {object} constructLibrary Construct library search-result object
 * @returns {string} Construct library type
 */
function getLibraryDetailsType(constructLibrary) {
  if (constructLibrary.reporter_library_details) {
    return "Reporter";
  }
  if (constructLibrary.guide_library_details) {
    return "Guide";
  }

  // Assume "Expression vector" at this stage because currently no other details properties exist.
  // The ConstructLibrary search config doesn't currently include
  // `expression_vector_library_details` anyway.
  return "Expression Vector";
}

/**
 * Generate a string describing the selection criteria of a construct library for the search-list
 * title.
 * @param {string[]} selectionCriteria Array of selection criteria strings
 * @returns {string} Construct library selection criteria title
 */
function composeSelectionCriteriaTitle(selectionCriteria) {
  if (selectionCriteria.length === 1) {
    return selectionCriteria[0];
  }

  // More than one selection criteria, so generate a title that lets the user know how many exist.
  const otherCount = selectionCriteria.length - 1;
  return `${selectionCriteria[0]} and ${otherCount} other selection ${
    otherCount > 1 ? "criteria" : "criterion"
  }`;
}

export default function ConstructLibrary({ item: constructLibrary }) {
  const libraryDetailsType = getLibraryDetailsType(constructLibrary);
  const selectionCriteriaTitle = composeSelectionCriteriaTitle(
    constructLibrary.selection_criteria
  );

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={constructLibrary} />
          {constructLibrary.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {`${libraryDetailsType} library of ${selectionCriteriaTitle}`}
        </SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{constructLibrary.lab.title}</div>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={constructLibrary} />
    </SearchListItemContent>
  );
}

ConstructLibrary.propTypes = {
  // Single construct library search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
