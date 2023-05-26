// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMeta,
  SearchListItemMain,
  SearchListItemQuality,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function Award({ item: award, accessoryData = null }) {
  const contactPi = accessoryData?.[award.contact_pi];
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={award} />
          {award.name}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{award.title}</SearchListItemTitle>
        {(award.component || contactPi) && (
          <SearchListItemMeta>
            {contactPi && <div key="contactPi">{contactPi.title}</div>}
            {award.component && <div key="component">{award.component}</div>}
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={award} />
    </SearchListItemContent>
  );
}

Award.propTypes = {
  // Single award search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

Award.getAccessoryDataPaths = (items) => {
  return items.map((item) => item.contact_pi).filter(Boolean);
};
