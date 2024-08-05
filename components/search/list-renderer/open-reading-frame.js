// node_modules
import Link from "next/link";
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
// components
import SeparatedList from "../../separated-list";

export default function OpenReadingFrame({ item: openReadingFrame }) {
  const isMetaVisible = Boolean(openReadingFrame.protein_id);

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={openReadingFrame} />
        </SearchListItemUniqueId>
        <SearchListItemTitle>{openReadingFrame.orf_id}</SearchListItemTitle>
        {isMetaVisible && (
          <SearchListItemMeta>{openReadingFrame.protein_id}</SearchListItemMeta>
        )}
        <SearchListItemSupplement>
          <SearchListItemSupplementSection>
            <SearchListItemSupplementLabel>Genes</SearchListItemSupplementLabel>
            <SearchListItemSupplementContent>
              <SeparatedList isCollapsible>
                {openReadingFrame.genes.map((gene) => (
                  <Link
                    href={gene["@id"]}
                    key={gene["@id"]}
                    className="whitespace-nowrap"
                  >
                    {gene.geneid} ({gene.symbol})
                  </Link>
                ))}
              </SeparatedList>
            </SearchListItemSupplementContent>
          </SearchListItemSupplementSection>
        </SearchListItemSupplement>
      </SearchListItemMain>
      <SearchListItemQuality item={openReadingFrame} />
    </SearchListItemContent>
  );
}

OpenReadingFrame.propTypes = {
  // Single orf search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
