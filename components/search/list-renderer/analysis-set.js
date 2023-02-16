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
  const inputFileSetsKey = analysisSet.input_file_sets;
  let inputFileSetsAccessions = null;
  if (inputFileSetsKey) {
    inputFileSetsAccessions = [];
    inputFileSetsKey.forEach((key) => {
      inputFileSetsAccessions.push(accessoryData[key]["accession"]);
    });
  }
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={analysisSet} />
          {analysisSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>Analysis</SearchListItemTitle>
        {(summary || lab) && (
          <SearchListItemMeta>
            {lab && <div key="lab}">{lab.title}</div>}
            {summary && <div key="summary">{summary}</div>}
          </SearchListItemMeta>
        )}
        {inputFileSetsAccessions && (
          <SearchListItemSupplement>
            <SearchListItemSupplementSection>
              {inputFileSetsAccessions && (
                <>
                  <SearchListItemSupplementLabel>
                    Input file sets
                  </SearchListItemSupplementLabel>
                  <SearchListItemSupplementContent>
                    {inputFileSetsAccessions}
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
  const file_sets = analysisSets
    .map((analysisSet) => analysisSet.input_file_sets)
    .filter(Boolean);
  const labs = analysisSets
    .map((analysisSet) => analysisSet.lab)
    .filter(Boolean);
  return file_sets.concat(labs);
};
