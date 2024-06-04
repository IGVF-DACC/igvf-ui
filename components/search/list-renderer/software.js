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

export default function Software({ item: software }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={software} />
          {software.name}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{software.title}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{software.lab.title}</span>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={software} />
    </SearchListItemContent>
  );
}

Software.propTypes = {
  // Single software object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
