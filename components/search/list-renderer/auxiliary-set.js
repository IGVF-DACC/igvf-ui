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
      <SearchListItemQuality item={auxiliarySet} />
    </SearchListItemContent>
  );
}

AuxiliarySet.propTypes = {
  // Single auxiliary set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
