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

export default function Award({ item: award, accessoryData }) {
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
            {contactPi && (
              <div key="contactPi">
                {contactPi.first_name} {contactPi.last_name}
              </div>
            )}
            {award.component && <div key="component">{award.component}</div>}
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={award} />
    </SearchListItemContent>
  );
}

Award.propTypes = {
  // Single award search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};

Award.getAccessoryDataPaths = (items) => {
  return items.map((item) => item.contact_pi).filter(Boolean);
};
