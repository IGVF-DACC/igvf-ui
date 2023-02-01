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

const Lab = ({ item: lab, accessoryData }) => {
  const awards = (
    accessoryData && lab.awards?.length > 0
      ? lab.awards.map((award) => accessoryData[award])
      : []
  ).filter(Boolean);
  const awardNames = awards.map((award) => award.name);

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={lab} />
          {lab.name}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{lab.title}</SearchListItemTitle>
        {awardNames.length > 0 && (
          <SearchListItemMeta>
            <div key="awards">{awardNames.join(", ")}</div>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={lab} />
    </SearchListItemContent>
  );
};

Lab.propTypes = {
  // Single lab search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

Lab.getAccessoryDataPaths = (labs) => {
  return labs.reduce((awardAcc, lab) => awardAcc.concat(lab.awards), []);
};

export default Lab;
