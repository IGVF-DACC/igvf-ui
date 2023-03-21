// node_modules
import PropTypes from "prop-types";
// components
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemStatus,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
// lib
import { UC } from "../../../lib/constants";

export default function Treatment({ item: treatment }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={treatment} />
          {treatment.treatment_term_id}
        </SearchListItemUniqueId>
        {treatment.duration ? (
          <SearchListItemTitle>
            {treatment.treatment_term_name} {UC.mdash}{" "}
            {treatment.treatment_type} {UC.mdash} {treatment.amount}{" "}
            {treatment.amount_units} {UC.mdash} {treatment.duration}{" "}
            {treatment.duration_units}
          </SearchListItemTitle>
        ) : (
          <SearchListItemTitle>
            {treatment.treatment_term_name} {UC.mdash}{" "}
            {treatment.treatment_type} {UC.mdash} {treatment.amount}{" "}
            {treatment.amount_units}
          </SearchListItemTitle>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={treatment} />
    </SearchListItemContent>
  );
}

Treatment.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
