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
      <SearchListItemQuality item={lab} />
    </SearchListItemContent>
  );
}

Lab.propTypes = {
  // Single lab search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
