// node_modules
import PropTypes from "prop-types";
// components
import {
  SearchListItemContent,
  SearchListItemMeta,
  SearchListItemMain,
  SearchListItemStatus,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function Software({ item: software }) {
  const lab = software.lab;
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={software} />
          {software.name}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{software.title}</SearchListItemTitle>
        {lab && (
          <SearchListItemMeta>
            <div key="lab">{lab.title}</div>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={software} />
    </SearchListItemContent>
  );
}

Software.propTypes = {
  // Single software object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
