// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementAlternateAccessions,
  SearchListItemSupplementSummary,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function AnalysisSet({ item: analysisSet }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={analysisSet} />
          {analysisSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{analysisSet.file_set_type}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{analysisSet.lab.title}</span>
        </SearchListItemMeta>
        <SearchListItemSupplement>
          <SearchListItemSupplementAlternateAccessions item={analysisSet} />
          <SearchListItemSupplementSummary item={analysisSet} />
        </SearchListItemSupplement>
      </SearchListItemMain>
      <SearchListItemQuality item={analysisSet} />
    </SearchListItemContent>
  );
}

AnalysisSet.propTypes = {
  // Single analysis set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
