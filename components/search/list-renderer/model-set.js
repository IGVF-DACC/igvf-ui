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

export default function ModelSet({ item: modelSet }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={modelSet} />
          {modelSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{modelSet.model_name}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{modelSet.lab.title}</div>
          {modelSet.summary && <div key="summary">{modelSet.summary}</div>}
          {modelSet.alternate_accessions?.length > 0 && (
            <AlternateAccessions
              alternateAccessions={modelSet.alternate_accessions}
            />
          )}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={modelSet} />
    </SearchListItemContent>
  );
}

ModelSet.propTypes = {
  // Single ModelSet search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
