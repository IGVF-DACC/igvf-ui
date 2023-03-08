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

export default function Lab({ item: lab }) {
  const awardNames = lab.awards ? lab.awards.map((award) => award.name) : [];

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
}

Lab.propTypes = {
  // Single lab search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
