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
      <SearchListItemQuality item={biosample} />
    </SearchListItemContent>
  );
}

Biosample.propTypes = {
  // Single biosample-derived search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
