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

export default function Gene({ item: gene }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={gene} />
          {gene.geneid}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{gene.title}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="symbol">{gene.symbol}</div>
          {gene.synonyms?.length > 0 && (
            <div key="synonyms">{gene.synonyms.join(", ")}</div>
          )}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemStatus item={gene} />
    </SearchListItemContent>
  );
}

Gene.propTypes = {
  // Single gene search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
