// node_modules
import { PropTypes } from "prop-types";
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
// lib
import humanGenomicVariantTitle from "../../../lib/human-genomic-variant-title";

export default function HumanGenomicVariant({ item: variant }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={variant} />
          {variant.uuid}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {humanGenomicVariantTitle(variant)}
        </SearchListItemTitle>
        {variant.rsid && (
          <SearchListItemMeta>
            <div>{variant.rsid}</div>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={variant} />
    </SearchListItemContent>
  );
}

HumanGenomicVariant.propTypes = {
  item: PropTypes.object.isRequired,
};
