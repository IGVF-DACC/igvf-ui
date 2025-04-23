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
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
// components
import { ControlledAccessIndicator } from "../../controlled-access";
import { DataUseLimitationSummaries } from "../../data-use-limitation-status";

export default function PredictionSet({ item: predictionSet }) {
  const isSupplementsVisible = predictionSet.alternate_accessions?.length > 0;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={predictionSet} />
          {predictionSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {predictionSet.file_set_type} prediction
        </SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{predictionSet.lab.title}</span>
          {predictionSet.scope && (
            <span key="scope">{predictionSet.scope}</span>
          )}
        </SearchListItemMeta>
        {isSupplementsVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions item={predictionSet} />
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={predictionSet}>
        <ControlledAccessIndicator item={predictionSet} />
        <DataUseLimitationSummaries
          summaries={predictionSet.data_use_limitation_summaries}
        />
      </SearchListItemQuality>
    </SearchListItemContent>
  );
}

PredictionSet.propTypes = {
  // Single prediction set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
