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

export default function OpenReadingFrame({ item: openReadingFrame }) {
  const geneId = openReadingFrame.gene.map((gene) => gene.geneid).join(", ");
  const geneSymbol = openReadingFrame.gene
    ?.map((gene) => gene.symbol)
    .join(", ");
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={openReadingFrame} />
        </SearchListItemUniqueId>
        <SearchListItemTitle>{openReadingFrame.orf_id}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="geneid">{geneId}</div>
          <div key="genesymbpl">{geneSymbol}</div>
          {openReadingFrame.protein_id && (
            <div key="protein">{openReadingFrame.protein_id}</div>
          )}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={openReadingFrame} />
    </SearchListItemContent>
  );
}

OpenReadingFrame.propTypes = {
  // Single orf search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
