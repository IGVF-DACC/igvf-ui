// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMeta,
  SearchListItemMain,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementSection,
  SearchListItemSupplementLabel,
  SearchListItemSupplementContent,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
// components
import { PublicationCitation } from "../../publication";
// lib
import { checkPublicationCitationVisible } from "../../../lib/publication";

export default function Publication({ item: publication }) {
  const isSupplementVisible =
    publication.authors || checkPublicationCitationVisible(publication);

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={publication} />
          {publication.publication_identifiers[0]}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{publication.title}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{publication.lab.title}</span>
        </SearchListItemMeta>
        {isSupplementVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementSection>
              <SearchListItemSupplementLabel>
                Citation
              </SearchListItemSupplementLabel>
              <SearchListItemSupplementContent>
                <PublicationCitation publication={publication} />
              </SearchListItemSupplementContent>
            </SearchListItemSupplementSection>
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={publication} />
    </SearchListItemContent>
  );
}

Publication.propTypes = {
  // Single publication search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
