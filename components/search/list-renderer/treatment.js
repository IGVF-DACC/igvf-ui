// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemQuality,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
// lib
import { UC } from "../../../lib/constants";
import { truthyOrZero } from "../../../lib/general";

export default function Treatment({ item: treatment }) {
  if (treatment.amount && treatment.amount_units) {
    const amountAndUnits = `${treatment.amount} ${treatment.amount_units}${
      treatment.amount === 1 ? "" : "s"
    }`;
  }
  const durationAndUnits = `${treatment.duration} ${treatment.duration_units}${
    treatment.duration === 1 ? "" : "s"
  }`;
  const titleElements = [
    treatment.treatment_term_name,
    treatment.treatment_type,
    amountAndUnits,
    durationAndUnits,
    treatment.depletion,
  ].filter(Boolean);
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={treatment} />
          {treatment.treatment_term_id}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{titleElements.join(" - ")}</SearchListItemTitle>
      </SearchListItemMain>
      <SearchListItemQuality item={treatment} />
    </SearchListItemContent>
  );
}

Treatment.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
