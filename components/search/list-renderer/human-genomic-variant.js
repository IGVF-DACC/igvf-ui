import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemStatus,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
import { PropTypes } from "prop-types";

export function humanGenomicVariantTitle(variant) {
  const first =
    variant.chromosome || variant.refseq_id || variant.reference_sequence;
  const titleSeq = [first, variant.position, variant.ref, variant.alt];
  return titleSeq.join(":");
}

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
      <SearchListItemStatus item={variant} />
    </SearchListItemContent>
  );
}

HumanGenomicVariant.propTypes = {
  item: PropTypes.object.isRequired,
};
