import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemSupplement,
  SearchListItemSupplementSummary,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
import { PropTypes } from "prop-types";

export default function Modification({ item: modification }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={modification} />
          {modification.uuid}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{modification.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{modification.lab.title}</span>
        </SearchListItemMeta>
        <SearchListItemSupplement>
          <SearchListItemSupplementSummary item={modification} />
        </SearchListItemSupplement>
      </SearchListItemMain>
    </SearchListItemContent>
  );
}

Modification.propTypes = {
  item: PropTypes.object.isRequired,
};
