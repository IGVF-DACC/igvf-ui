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

export default function MultiplexedSample({ item: multiplexedSample }) {
  const isSupplementsVisible =
    multiplexedSample.alternate_accessions?.length > 0;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={multiplexedSample} />
          {multiplexedSample.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{multiplexedSample.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{multiplexedSample.lab.title}</span>
        </SearchListItemMeta>
        {isSupplementsVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions
              item={multiplexedSample}
            />
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={multiplexedSample} />
    </SearchListItemContent>
  );
}

MultiplexedSample.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
