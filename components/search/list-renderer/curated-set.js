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

export default function CuratedSet({ item: curatedSet }) {
  const summary = curatedSet.summary;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={curatedSet} />
          {curatedSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>Curated set</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{curatedSet.lab.title}</div>
          {summary && <div key="summary">{summary}</div>}
          {curatedSet.alternate_accessions?.length > 0 && (
            <div key="alternate_accessions">
              Alternate Accessions: {curatedSet.alternate_accessions.join(", ")}
            </div>
          )}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={curatedSet} />
    </SearchListItemContent>
  );
}

CuratedSet.propTypes = {
  // Single curated set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
