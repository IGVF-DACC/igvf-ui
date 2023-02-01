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

const Treatment = ({ item: treatment }) => {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={treatment} />
          {treatment.treatment_term_id}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {treatment.treatment_term_name} {UC.mdash} {treatment.treatment_type}
        </SearchListItemTitle>
      </SearchListItemMain>
      <SearchListItemStatus item={treatment} />
    </SearchListItemContent>
  );
};

Treatment.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};

export default Treatment;
