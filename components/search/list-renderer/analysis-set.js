// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementSection,
  SearchListItemSupplementLabel,
  SearchListItemSupplementContent,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function AnalysisSet({ item: analysisSet, accessoryData }) {
  const summary = analysisSet.summary;
  const inputFileSetsKeys = analysisSet.input_file_sets;
  const inputFileSetsAccessions =
    inputFileSetsKeys && accessoryData
      ? inputFileSetsKeys.map((key) => accessoryData[key].accession)
      : null;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={analysisSet} />
          {analysisSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>Analysis</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{analysisSet.lab.title}</div>
          {summary && <div key="summary">{summary}</div>}
        </SearchListItemMeta>
        {inputFileSetsAccessions && (
          <SearchListItemSupplement>
            <SearchListItemSupplementSection>
              <SearchListItemSupplementLabel>
                Input file sets
              </SearchListItemSupplementLabel>
              <SearchListItemSupplementContent>
                {inputFileSetsAccessions.join(", ")}
              </SearchListItemSupplementContent>
            </SearchListItemSupplementSection>
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={analysisSet} />
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
  const fileSets = analysisSets
    .map((analysisSet) => analysisSet.input_file_sets)
    .filter(Boolean);
  return fileSets.flat();
};
