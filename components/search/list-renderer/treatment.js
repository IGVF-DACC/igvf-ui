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

export default function Treatment({ item: treatment }) {
  const amountAndUnits =
    treatment.amount !== undefined && treatment.amount_units !== undefined
      ? `${treatment.amount} ${treatment.amount_units}${
          treatment.amount === 1 ? "" : "s"
        }`
      : "";
  const durationAndUnits =
    treatment.duration !== undefined && treatment.duration_units !== undefined
      ? `${treatment.duration} ${treatment.duration_units}${
          treatment.duration === 1 ? "" : "s"
        }`
      : "";
  const depletion = treatment.depletion ? "depletion" : "";
  const titleElements = [
    treatment.treatment_term_name,
    treatment.treatment_type,
    amountAndUnits,
    durationAndUnits,
    depletion,
    treatment.purpose,
  ].filter(Boolean);
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={treatment} />
          {treatment.treatment_term_id}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{treatment.title}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{treatment.lab}</div>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={treatment} />
    </SearchListItemContent>
  );
}

Treatment.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
