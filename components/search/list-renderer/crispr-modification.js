import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
import { PropTypes } from "prop-types";

export default function CrisprModification({ item: modification }) {
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
          <span key="species">{modification.cas_species}</span>
          <span key="cas">{modification.cas}</span>
        </SearchListItemMeta>
      </SearchListItemMain>
    </SearchListItemContent>
  );
}

CrisprModification.propTypes = {
  item: PropTypes.object.isRequired,
};
