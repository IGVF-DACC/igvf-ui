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

export default function CuratedSet({ item: curatedSet }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={curatedSet} />
          {curatedSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {curatedSet.description || curatedSet.file_set_type}
        </SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{curatedSet.lab.title}</span>
        </SearchListItemMeta>
        <SearchListItemSupplement>
          {curatedSet.alternate_accessions?.length > 0 && (
            <SearchListItemSupplementAlternateAccessions item={curatedSet} />
          )}
          <SearchListItemSupplementSummary item={curatedSet} />
        </SearchListItemSupplement>
      </SearchListItemMain>
      <SearchListItemQuality item={curatedSet}>
        <ControlledAccessIndicator item={curatedSet} />
        <DataUseLimitationSummaries
          summaries={curatedSet.data_use_limitation_summaries}
        />
      </SearchListItemQuality>
    </SearchListItemContent>
  );
}

CuratedSet.propTypes = {
  // Single curated set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
