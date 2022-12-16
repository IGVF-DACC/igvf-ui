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
} from "./search-list-item";

const OntologyTerm = ({ item: ontologyTerm }) => {
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
      <SearchListItemStatus item={ontologyTerm} />
    </SearchListItemContent>
  );
};

OntologyTerm.propTypes = {
  // Single assay term search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};

export default OntologyTerm;
