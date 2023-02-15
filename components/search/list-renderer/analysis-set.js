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

export default function AnalysisSet({ item: analysisSet, accessoryData }) {
  const lab = accessoryData?.[analysisSet.lab];
  const summary = analysisSet.summary;
  const inputFileSets = analysisSet.input_file_sets;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={analysisSet} />
          {analysisSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>Analysis</SearchListItemTitle>
        {summary && (
          <SearchListItemMeta>
            <div key="summary">{summary}</div>
          </SearchListItemMeta>
        )}
        {(lab || inputFileSets) && (
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
              {inputFileSets && (
                <>
                  <SearchListItemSupplementLabel>
                    Input file sets
                  </SearchListItemSupplementLabel>
                  <SearchListItemSupplementContent>
                    {inputFileSets}
                  </SearchListItemSupplementContent>
                </>
              )}
            </SearchListItemSupplementSection>
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={analysisSet} />
    </SearchListItemContent>
  );
}

AnalysisSet.propTypes = {
  // Single analysis set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

AnalysisSet.getAccessoryDataPaths = (analysisSets) => {
  return analysisSets.map((analysisSet) => analysisSet.lab).filter(Boolean);
};
