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

export default function Workflow({ item: workflow }) {
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
          {workflow.alternate_accessions.length > 0 && (
            <AlternateAccessions
              alternateAccessions={workflow.alternate_accessions}
            />
          )}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={workflow} />
    </SearchListItemContent>
  );
}

Workflow.propTypes = {
  // Single workflow search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
