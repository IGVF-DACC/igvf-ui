// node_modules
import PropTypes from "prop-types";
// components
import {
  SearchListItemContent,
  SearchListItemMeta,
  SearchListItemMain,
  SearchListItemStatus,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
  SearchListItemSupplement,
  SearchListItemSupplementSection,
  SearchListItemSupplementLabel,
  SearchListItemSupplementContent,
} from "./search-list-item";

export default function MeasurementSet({
  item: measurementSet,
  accessoryData,
}) {
  const assayTerm = accessoryData?.[measurementSet.assay_term];
  const lab = accessoryData?.[measurementSet.lab];
  const summary = measurementSet.summary;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={measurementSet} />
          {measurementSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{assayTerm.term_name}</SearchListItemTitle>
        {summary && (
          <SearchListItemMeta>
            <div key="summary">{summary}</div>
          </SearchListItemMeta>
        )}
        <SearchListItemSupplement>
          <SearchListItemSupplementSection>
            {lab && (
              <>
                <SearchListItemSupplementLabel>
                  Lab
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {lab}
                </SearchListItemSupplementContent>
              </>
            )}
          </SearchListItemSupplementSection>
        </SearchListItemSupplement>
      </SearchListItemMain>
      <SearchListItemStatus item={measurementSet} />
    </SearchListItemContent>
  );
}

MeasurementSet.propTypes = {
  // Single measurement set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

MeasurementSet.getAccessoryDataPaths = (measurementSets) => {
  const assay_terms = measurementSets
    .map((measurementSet) => measurementSet.assay_term)
    .filter(Boolean);
  const labs = measurementSets
    .map((measurementSet) => measurementSet.lab)
    .filter(Boolean);
  return assay_terms.concat(labs);
};
