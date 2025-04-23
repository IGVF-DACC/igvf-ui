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
// components
import { ControlledAccessIndicator } from "../../controlled-access";
import { DataUseLimitationSummaries } from "../../data-use-limitation-status";

export default function AuxiliarySet({ item: auxiliarySet }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={auxiliarySet} />
          {auxiliarySet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{auxiliarySet.file_set_type}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{auxiliarySet.lab.title}</span>
        </SearchListItemMeta>
        <SearchListItemSupplement>
          <SearchListItemSupplementAlternateAccessions item={auxiliarySet} />
          <SearchListItemSupplementSummary item={auxiliarySet} />
        </SearchListItemSupplement>
      </SearchListItemMain>
      <SearchListItemQuality item={auxiliarySet}>
        <ControlledAccessIndicator item={auxiliarySet} />
        <DataUseLimitationSummaries
          summaries={auxiliarySet.data_use_limitation_summaries}
        />
      </SearchListItemQuality>
    </SearchListItemContent>
  );
}

AuxiliarySet.propTypes = {
  // Single auxiliary set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
