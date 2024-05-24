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

export default function AnalysisStep({ item: analysisStep }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={analysisStep} />
          {analysisStep.uuid}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{analysisStep.title}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{analysisStep.lab.title}</span>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={analysisStep} />
    </SearchListItemContent>
  );
}

AnalysisStep.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
