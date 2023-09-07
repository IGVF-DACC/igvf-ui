// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import AlternateAccessions from "../../alternate-accessions";
import { ChromosomeLocation } from "../../chromosome-locations";
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
    otherCount === 1 ? "criterion" : "criteria"
  }`;
}

/**
 * Display the `loci` property of a construct library set, displaying the first one as a representative
 * location and the number of other loci if they exist.
 */
function LociSearchMeta({ loci }) {
  const otherLociCount = loci.length - 1;

  return (
    <div key="loci">
      <ChromosomeLocation location={loci[0]} className="inline-block" />
      {otherLociCount >= 1 && (
        <span className="ml-2">
          and {otherLociCount} other {otherLociCount === 1 ? "locus" : "loci"}
        </span>
      )}
    </div>
  );
}

LociSearchMeta.propTypes = {
  // Array of loci to display as defined in the schema
  loci: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default function ConstructLibrarySet({ item: constructLibrarySet }) {
  const selectionCriteriaTitle = composeSelectionCriteriaTitle(
    constructLibrarySet.selection_criteria
  );

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={constructLibrarySet} />
          {constructLibrarySet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{constructLibrarySet.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{constructLibrarySet.lab.title}</div>
          <div key="scope">{constructLibrarySet.scope}</div>
          <div key="selection-criteria">{selectionCriteriaTitle}</div>
          {constructLibrarySet.loci && (
            <div key="loci">
              <LociSearchMeta loci={constructLibrarySet.loci} />
            </div>
          )}
          {constructLibrarySet.alternate_accessions?.length > 0 && (
            <AlternateAccessions
              alternateAccessions={constructLibrarySet.alternate_accessions}
            />
          )}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={constructLibrarySet} />
    </SearchListItemContent>
  );
}

ConstructLibrarySet.propTypes = {
  // Single construct library search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
