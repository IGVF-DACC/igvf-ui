// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementAlternateAccessions,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function Workflow({ item: workflow }) {
  const isSupplementVisible = workflow.alternate_accessions?.length > 0;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={workflow} />
          {workflow.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{workflow.name}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{workflow.lab.title}</div>
        </SearchListItemMeta>
        {isSupplementVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions item={workflow} />
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={workflow} />
    </SearchListItemContent>
  );
}

Workflow.propTypes = {
  // Single workflow search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
