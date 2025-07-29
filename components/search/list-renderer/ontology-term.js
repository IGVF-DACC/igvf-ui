// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementContent,
  SearchListItemSupplementLabel,
  SearchListItemSupplementSection,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function OntologyTerm({ item: ontologyTerm }) {
  const isSupplementsVisible = ontologyTerm.synonyms?.length > 0;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={ontologyTerm} />
          {ontologyTerm.term_id}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{ontologyTerm.term_name}</SearchListItemTitle>
        {isSupplementsVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementSection>
              <SearchListItemSupplementLabel>
                Synonyms
              </SearchListItemSupplementLabel>
              <SearchListItemSupplementContent>
                {ontologyTerm.synonyms.join(", ")}
              </SearchListItemSupplementContent>
            </SearchListItemSupplementSection>
          </SearchListItemSupplement>
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
