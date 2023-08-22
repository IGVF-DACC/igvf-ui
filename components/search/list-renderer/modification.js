import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
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
          <div key="lab">{modification.lab.title}</div>
        </SearchListItemMeta>
      </SearchListItemMain>
    </SearchListItemContent>
  );
}

Modification.propTypes = {
  item: PropTypes.object.isRequired,
};
