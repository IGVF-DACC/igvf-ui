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

export default function Biosample({ item: biosample }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={biosample} />
          {biosample.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {biosample.taxa} {biosample.biosample_term.term_name}
        </SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{biosample.lab.title}</div>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemStatus item={biosample} />
    </SearchListItemContent>
  );
}

Biosample.propTypes = {
  // Single biosample-derived search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
