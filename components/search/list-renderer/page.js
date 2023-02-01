// node_modules
import PropTypes from "prop-types";
// components
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemStatus,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

const Page = ({ item: page }) => {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={page} />
          {page["@id"]}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{page.title}</SearchListItemTitle>
      </SearchListItemMain>
      <SearchListItemStatus item={page} />
    </SearchListItemContent>
  );
};

Page.propTypes = {
  // Single page search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};

export default Page;
