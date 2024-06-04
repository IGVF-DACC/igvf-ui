// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementSummary,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function Treatment({ item: treatment }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={treatment} />
          {treatment.treatment_term_id}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{treatment.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{treatment.lab.title}</span>
          <span key="treatment type">{treatment.treatment_type}</span>
          <span key="purpose">{treatment.purpose}</span>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemSupplement>
        <SearchListItemSupplementSummary item={treatment} />
      </SearchListItemSupplement>
      <SearchListItemQuality item={treatment} />
    </SearchListItemContent>
  );
}

Treatment.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
