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
// lib
import { pathToId } from "../../../lib/general";

export default function Source({ item: source }) {
  const description = source.description;
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={source} />
          {pathToId(source["@id"])}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{source.title}</SearchListItemTitle>
        {description && (
          <SearchListItemMeta>
            <span key="description">{description}</span>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={source} />
    </SearchListItemContent>
  );
}

Source.propTypes = {
  // Single source object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
