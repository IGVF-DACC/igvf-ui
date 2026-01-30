// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementContent,
  SearchListItemSupplementLabel,
  SearchListItemSupplementSection,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function Gene({ item: gene }) {
  const isSupplementVisible = gene.synonyms?.length > 0;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={gene} />
          {gene.geneid}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {gene.title}
          {gene.allele && ` ${gene.allele} allele`}
        </SearchListItemTitle>
        <SearchListItemMeta>
          <span key="symbol">{gene.symbol}</span>
        </SearchListItemMeta>
        {isSupplementVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementSection>
              <SearchListItemSupplementLabel>
                Synonyms
              </SearchListItemSupplementLabel>
              <SearchListItemSupplementContent>
                {gene.synonyms.join(", ")}
              </SearchListItemSupplementContent>
            </SearchListItemSupplementSection>
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={gene} />
    </SearchListItemContent>
  );
}

Gene.propTypes = {
  // Single gene search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
