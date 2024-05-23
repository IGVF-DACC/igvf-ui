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

export default function TechnicalSample({ item: technicalSample }) {
  const isSupplementVisible = technicalSample.alternate_accessions?.length > 0;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={technicalSample} />
          {technicalSample.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{technicalSample.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{technicalSample.lab.title}</span>
        </SearchListItemMeta>
        {isSupplementVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions
              item={technicalSample}
            />
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={technicalSample} />
    </SearchListItemContent>
  );
}

TechnicalSample.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
