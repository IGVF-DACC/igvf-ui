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

export default function Source({ item: source }) {
  const description = source.description;
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={source} />
          {source.name}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{source.title}</SearchListItemTitle>
        {description && (
          <SearchListItemMeta>
            <div key="description">{description}</div>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={source} />
    </SearchListItemContent>
  );
}

Source.propTypes = {
  // Single source object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
