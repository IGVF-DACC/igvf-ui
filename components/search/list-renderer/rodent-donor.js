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

export default function RodentDonor({ item: rodentDonor, accessoryData }) {
  const lab = accessoryData?.[rodentDonor.lab];

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={rodentDonor} />
          {rodentDonor.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {rodentDonor.strain} {rodentDonor.sex}
        </SearchListItemTitle>
        {lab && (
          <SearchListItemMeta>
            <div key="lab">{lab.title}</div>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={rodentDonor} />
    </SearchListItemContent>
  );
}

RodentDonor.propTypes = {
  // Single rodent-donor search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

RodentDonor.getAccessoryDataPaths = (rodentDonors) => {
  return rodentDonors.map((rodentDonor) => rodentDonor.lab).filter(Boolean);
};
