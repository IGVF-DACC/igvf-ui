import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
import { PropTypes } from "prop-types";

export default function DegronModification({ item: modification }) {
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
          <span key="system">{modification.degron_system}</span>
        </SearchListItemMeta>
      </SearchListItemMain>
    </SearchListItemContent>
  );
}

DegronModification.propTypes = {
  item: PropTypes.object.isRequired,
};
