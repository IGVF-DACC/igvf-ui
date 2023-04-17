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

export default function OntologyTerm({ item: ontologyTerm }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={ontologyTerm} />
          {ontologyTerm.term_id}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{ontologyTerm.term_name}</SearchListItemTitle>
        {ontologyTerm.synonyms.length > 0 && (
          <SearchListItemMeta>
            <div key="synonyms">{ontologyTerm.synonyms.join(", ")}</div>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={ontologyTerm} />
    </SearchListItemContent>
  );
}

OntologyTerm.propTypes = {
  // Single assay term search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
