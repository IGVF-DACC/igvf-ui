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
          {analysisStep.name}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{analysisStep.title}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{analysisStep.lab}</div>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={treatment} />
    </SearchListItemContent>
  );
}

AnalysisStep.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
