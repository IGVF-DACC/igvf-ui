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

export default function Biosample({ item: biosample }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={biosample} />
          {biosample.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{biosample.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{biosample.lab.title}</span>
        </SearchListItemMeta>
        <SearchListItemSupplement>
          <SearchListItemSupplementAlternateAccessions item={biosample} />
          <SearchListItemSupplementSummary item={biosample} />
        </SearchListItemSupplement>
      </SearchListItemMain>
      <SearchListItemQuality item={biosample} />
    </SearchListItemContent>
  );
}

Biosample.propTypes = {
  // Single biosample-derived search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
