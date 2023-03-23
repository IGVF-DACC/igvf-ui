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

export default function HumanGenomicVariant({ item: variant }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={variant} />
          {variant.uuid}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {variant.refseq_id ? variant.refseq_id : variant.reference_sequence}
        </SearchListItemTitle>
        {variant.rsid && (
          <SearchListItemMeta>
            <div key={variant.rsid}>{variant.rsid}</div>
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
