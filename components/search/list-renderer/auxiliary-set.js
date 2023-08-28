// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import AlternateAccessions from "../../alternate-accessions";
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function AuxiliarySet({ item: auxiliarySet }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={auxiliarySet} />
          {auxiliarySet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{auxiliarySet.auxiliary_type}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{auxiliarySet.lab.title}</div>
          {auxiliarySet.alternate_accessions?.length > 0 && (
            <AlternateAccessions
              alternateAccessions={auxiliarySet.alternate_accessions}
            />
          )}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={auxiliarySet} />
    </SearchListItemContent>
  );
}

AuxiliarySet.propTypes = {
  // Single auxiliary set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
