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

export default function User({ item: user, accessoryData }) {
  const lab = accessoryData?.[user.lab];

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={user} />
          {user.uuid}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{user.title}</SearchListItemTitle>
        {lab && (
          <SearchListItemMeta>
            <div key="lab">{lab.title}</div>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={user} />
    </SearchListItemContent>
  );
}

User.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

User.getAccessoryDataPaths = (items) => {
  return items.map((item) => item.lab).filter(Boolean);
};
