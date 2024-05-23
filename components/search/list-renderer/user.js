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

export default function User({ item: user, accessoryData = null }) {
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
            <span key="lab">{lab.title}</span>
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
  const labs = items.map((item) => item.lab).filter(Boolean);
  return [
    {
      type: "Lab",
      paths: labs,
      fields: ["title"],
    },
  ];
};
