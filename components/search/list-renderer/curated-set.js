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
  SearchListItemSupplement,
  SearchListItemSupplementSection,
  SearchListItemSupplementLabel,
  SearchListItemSupplementContent,
} from "./search-list-item";

export default function CuratedSet({ item: curatedSet, accessoryData }) {
  const lab = accessoryData?.[curatedSet.lab];
  const summary = curatedSet.summary;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={curatedSet} />
          {curatedSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>Curated set</SearchListItemTitle>
        {(summary || lab) && (
          <SearchListItemMeta>
            {lab && <div key="lab}">{lab.title}</div>}
            {summary && <div key="summary">{summary}</div>}
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={curatedSet} />
    </SearchListItemContent>
  );
}

CuratedSet.propTypes = {
  // Single curated set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

CuratedSet.getAccessoryDataPaths = (curatedSets) => {
  return curatedSets.map((curatedSet) => curatedSet.lab).filter(Boolean);
};
