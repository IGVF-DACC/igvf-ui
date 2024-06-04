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
  SearchListItemSupplementContent,
  SearchListItemSupplementLabel,
  SearchListItemSupplementSection,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function ConstructLibrarySet({ item: constructLibrarySet }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={constructLibrarySet} />
          {constructLibrarySet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{constructLibrarySet.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{constructLibrarySet.lab.title}</span>
          <span key="scope">{constructLibrarySet.scope}</span>
        </SearchListItemMeta>
        <SearchListItemSupplement>
          <SearchListItemSupplementAlternateAccessions
            item={constructLibrarySet}
          />
          <SearchListItemSupplementSection>
            <SearchListItemSupplementLabel>
              Selection Criteria
            </SearchListItemSupplementLabel>
            <SearchListItemSupplementContent>
              {constructLibrarySet.selection_criteria.join(", ")}
            </SearchListItemSupplementContent>
          </SearchListItemSupplementSection>
        </SearchListItemSupplement>
      </SearchListItemMain>
      <SearchListItemQuality item={constructLibrarySet} />
    </SearchListItemContent>
  );
}

ConstructLibrarySet.propTypes = {
  // Single construct library search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
