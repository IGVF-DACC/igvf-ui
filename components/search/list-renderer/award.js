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

const Award = ({ item: award }) => {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={award} />
          {award.name}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{award.title}</SearchListItemTitle>
        {award.component && (
          <SearchListItemMeta>
            <div key="component">{award.component}</div>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={award} />
    </SearchListItemContent>
  );
};

Award.propTypes = {
  // Single award search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};

export default Award;
